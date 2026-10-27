# AI Article Analysis Pipeline

**Goal**: Implement the KIWI AI article analysis pipeline end-to-end using Vercel AI SDK, OpenAI provider, Zod, and Supabase service-role client. The pipeline processes pending unanalyzed articles, analyzes their sentiment and political framing with strict constraints (percentages summing to 100, AI-estimated bias label, neutral summary, confidence, framing notes, loaded terms, disclaimer), persists the results to `article_analyses`, marks `analyzed_at` on the `articles` table, provides the `POST /api/analyze` administrative endpoint, and connects step two into the automatic cron pipeline (`GET /api/cron/pipeline`).

---

## Skills read
- `.agents/skills/supabase/SKILL.md`
- `.agents/skills/ai-sdk/SKILL.md`
- `AGENTS.md` (Sections 1, 2, 5, 6, 7, 14, 15, 17, 18, 19, 21)

## Existing code inspected
- `package.json` — verified current dependencies; need to install `ai` and `@ai-sdk/openai`.
- `supabase/schema.sql` — verified table schema for `articles` and `article_analyses`, check constraints (`pct_sum_100`, sentiment and bias labels, numeric ranges), indexes, and RLS policies.
- `lib/supabase/types.ts` — verified `ArticleAnalysis`, `Article`, `SentimentLabel`, and `BiasLabel` type definitions.
- `lib/supabase/queries.ts` — inspected pending article retrieval (`getUnanalyzedArticles`, `getArticlesByIds`) and query patterns.
- `lib/supabase/service.ts` — verified `createServiceClient()` for server-side elevated mutations bypassing RLS.
- `app/api/scrape/route.ts` — verified admin authentication header (`x-KIWI-admin-secret`) pattern and error response formats.
- `app/api/cron/pipeline/route.ts` — inspected existing cron pipeline execution (currently only runs scheduled scraping, needs to chain AI analysis as step two).
- `.env.example` — verified required environment variables: `OPENAI_API_KEY`, `ANALYSIS_BATCH_SIZE`, `KIWI_ADMIN_SECRET`, `SUPABASE_SERVICE_ROLE_KEY`.

## Decisions / assumptions
1. **Model Selection**: Use `gpt-4o-mini` via `@ai-sdk/openai` (`openai("gpt-4o-mini")`). It provides fast, cost-efficient, high-precision structured JSON outputs.
2. **Package Installation**: Install `ai` and `@ai-sdk/openai` using `npm install ai @ai-sdk/openai`.
3. **Pending-Analysis Detection**: Strictly adhere to AGENTS.md §19 by identifying pending articles using a LEFT JOIN check against `article_analyses` (articles with no matching `article_analyses` row), rather than relying on `analyzed_at IS NULL` alone.
4. **Structured Output & Schema Validation**: Use `generateObject` from `ai` with a strict Zod schema enforcing:
   - `summary`: concise, neutral summary of the article body.
   - `sentimentScore`: number between -1 and 1.
   - `sentimentLabel`: "positive" | "neutral" | "negative".
   - `leftPercentage`: integer between 0 and 100.
   - `centerPercentage`: integer between 0 and 100.
   - `rightPercentage`: integer between 0 and 100.
   - `politicalFramingLabel`: "left" | "center" | "right" | "mixed" | "unclear".
   - `confidence`: number between 0 and 1.
   - `framingNotes`: notes on how issues/facts are framed.
   - `loadedTerms`: array of emotionally charged or loaded words/phrases found in the text.
   - `disclaimer`: standard AI estimation disclaimer (e.g., "Framing and sentiment metrics are AI-estimated and intended for media literacy analysis, not objective truth.").
5. **Percentage Normalization & Derived Bias**:
   - Verify `leftPercentage + centerPercentage + rightPercentage === 100`. If LLM returns slight rounding drift (e.g. 99 or 101), normalize deterministically so they sum to 100 to satisfy the Supabase `pct_sum_100` database constraint.
   - Compute `bias_score = (right_percentage - left_percentage) / 100` as defined in AGENTS.md §7 & §19.
6. **Error Handling & Retry**: If model output fails validation, retry once. If it fails again, log the error and record the article as failed without saving corrupted analysis.
7. **Batching & Execution Flow**:
   - Process pending articles in configurable batches (default from `ANALYSIS_BATCH_SIZE` or 5).
   - If specific `articleIds` or a `limit` are passed in `POST /api/analyze`, respect them.
   - If no IDs/limit are provided, continue processing in batches until no pending unanalyzed articles remain.
8. **Append-Only & Transaction Order**:
   - Insert analysis row into `article_analyses`.
   - Update `articles.analyzed_at = now()` ONLY after the analysis row is successfully persisted.
9. **Route Methods & Protection**:
   - `POST /api/analyze` requires `x-KIWI-admin-secret` matching `process.env.KIWI_ADMIN_SECRET`.
   - Update `GET /api/cron/pipeline` to run step one (process scheduled scrape results) and step two (run pending AI analysis) sequentially. If step one fails or produces no articles, step two still runs to handle any existing unanalyzed articles.

## Files likely to change
- `package.json` — add `ai` and `@ai-sdk/openai` dependencies.
- `lib/ai/client.ts` — OpenAI model provider configuration and client setup.
- `lib/ai/analysis.ts` — Core analysis engine, prompt construction, Zod schema validation, percentage normalization, retry logic, and single article analysis.
- `lib/ai/pipeline.ts` — Orchestration pipeline: pending query fetching via service client, batching loop, DB persistence to `article_analyses`, updating `analyzed_at`, run logging, and summary reporting.
- `lib/supabase/queries.ts` — Ensure pending-analysis query (`getUnanalyzedArticles`) and ID lookups are robust and use service client where appropriate.
- `app/api/analyze/route.ts` — Action endpoint `POST /api/analyze` with admin secret authorization.
- `app/api/cron/pipeline/route.ts` — Chain AI analysis as step two following scheduled scraping.

## Implementation requirements
- Implement robust pending article selection using `createServiceClient()`:
  - Query articles left-joined to `article_analyses` where `article_analyses.id` is null.
  - Support filtering by explicit `articleIds` or capped by `limit`.
- Build the AI analysis prompt instructing the model to:
  - Base analysis strictly on the supplied article text and headline, never inferring bias from source name alone.
  - Remain objective and detect nuanced rhetoric, omissions, and tone.
  - Produce valid percentages for left, center, right that sum to 100.
  - Assign `bias_label` among `left`, `center`, `right`, `mixed`, or `unclear`. If evidence is weak or balanced, assign `unclear` or `mixed` and set confidence accordingly.
- Build resilient output normalization:
  - Round percentages to integers.
  - Adjust any rounding delta (+/- 1) to the largest category so the sum is guaranteed to be 100.
  - Derive `bias_score = (right_percentage - left_percentage) / 100`.
- Persist analysis results:
  - Insert row into `article_analyses` using `createServiceClient()`.
  - Update `articles` table setting `analyzed_at = new Date().toISOString()`.
- Add comprehensive console logging:
  - Log start of analysis run, total pending articles detected, and batch sizes.
  - Log per-article status (analyzed / skipped / failed) with title and scores.
  - Log batch completion and final summary object (status, totalPending, analyzed, failed, durationMs).
- Secure the API endpoint:
  - `POST /api/analyze` checks `headers.get("x-KIWI-admin-secret") === process.env.KIWI_ADMIN_SECRET`, returns 401 if invalid.
- Integrate into Cron pipeline:
  - In `app/api/cron/pipeline/route.ts`, execute `runAnalysisPipeline()` immediately after scraping results processing, wrapping each step in try/catch so analysis still runs if scraping faults.

## Security requirements
- Never expose `OPENAI_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, or `KIWI_ADMIN_SECRET` to the client.
- Do not run OpenAI or Supabase service mutations from browser components.
- Enforce `x-KIWI-admin-secret` on `POST /api/analyze`.
- Keep `CRON_SECRET` internal to Vercel/cron requests, bypassed only during local development.

## Acceptance criteria
- `POST /api/analyze` processes unanalyzed articles in the database when authenticated with `x-KIWI-admin-secret`.
- Unanalyzed articles are accurately detected via missing `article_analyses` records (not `analyzed_at` alone).
- Analysis records are saved with valid sentiment, bias, framing notes, loaded terms, disclaimer, and model name.
- Percentage constraints (`left + center + right = 100`) and derived `bias_score` are strictly met and satisfy Supabase constraints.
- `articles.analyzed_at` is set only after analysis is persisted.
- `GET /api/cron/pipeline` runs both scraping and analysis steps sequentially.
- Final summary object is returned by `POST /api/analyze` and logged cleanly to server console.
- `npm run typecheck` and `npm run lint` pass without errors.

## Checks to run
- `npm install ai @ai-sdk/openai`
- `npm run typecheck`
- `npm run lint`
- Server route testing with `curl`

## Exact manual test steps expected after implementation
1. Start the Next.js development server:
   ```bash
   npm run dev
   ```
2. Verify existing scraped articles are in the database (or scrape new articles using `POST /api/scrape`).
3. Run the analysis pipeline manually with admin secret:
   ```bash
   curl -X POST http://localhost:3000/api/analyze \
     -H "Content-Type: application/json" \
     -H "x-KIWI-admin-secret: your_admin_secret_here" \
     -d '{"limit": 2}'
   ```
4. Observe server terminal console logs showing batch progress, article analysis details, and the completion summary.
5. Verify in Supabase (or home page) that the analyzed articles now have entries in `article_analyses` and non-null `analyzed_at`.
6. Test cron route chaining:
   ```bash
   curl -X GET http://localhost:3000/api/cron/pipeline
   ```
