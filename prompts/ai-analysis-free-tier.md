# Switch AI Analysis to Groq Free Tier

**Goal**: Configure the KIWI news analysis pipeline to support Groq's free OpenAI-compatible inference API (`https://api.groq.com/openai/v1`) using `llama-3.3-70b-versatile` or `llama-3.1-8b-instant`. This eliminates the need for paid OpenAI account credits while keeping the entire AI SDK structured output pipeline, Zod schema validation, Supabase persistence, and cron workflows completely intact.

---

## Skills read
- `.agents/skills/ai-sdk/SKILL.md`
- `.agents/skills/supabase/SKILL.md`
- `AGENTS.md` (Sections 1, 2, 5, 6, 7, 14, 15, 17, 18, 19, 21)

## Existing code inspected
- `lib/ai/client.ts` — currently hardcoded to direct OpenAI API with `gpt-4o-mini`.
- `lib/ai/analysis.ts` — structured output with `generateText`, `Output.object`, retry logic, and normalization.
- `lib/ai/pipeline.ts` — pending unanalyzed articles detection, batching, DB persistence to `article_analyses`.
- `.env.example` & `.env.local` — environment variable definitions.
- `app/api/analyze/route.ts` & `app/api/cron/pipeline/route.ts` — API route layer.

## Decisions / assumptions
1. **OpenAI-Compatible Architecture**: Use `@ai-sdk/openai`'s `createOpenAI` configured with `baseURL: "https://api.groq.com/openai/v1"` and `apiKey: process.env.GROQ_API_KEY`.
2. **Model Selection**: Default to `llama-3.3-70b-versatile` (or `llama-3.1-8b-instant` if faster throughput is desired). Both provide high performance and precision for structured JSON output on Groq.
3. **Graceful Fallback**: If `GROQ_API_KEY` is set, the pipeline uses Groq; if only `OPENAI_API_KEY` is present, it uses OpenAI. This ensures backwards compatibility without breaking any existing setups.
4. **Environment Variables**: Add `GROQ_API_KEY` and optional `AI_MODEL` to `.env.example`.
5. **Preserve Schema & Constraints**:
   - `left_percentage + center_percentage + right_percentage = 100` normalization remains strictly enforced.
   - All database columns and check constraints in `article_analyses` are preserved.
   - The `model` field in `article_analyses` records the exact Groq model name used (e.g. `llama-3.3-70b-versatile`).

## Files likely to change
- `lib/ai/client.ts` — update model provider factory to support Groq baseURL and `GROQ_API_KEY`.
- `lib/ai/analysis.ts` — update default model parameter and system prompt if needed.
- `lib/ai/pipeline.ts` — pass configured model name and update logging.
- `.env.example` — document `GROQ_API_KEY` and `AI_MODEL`.

## Implementation requirements
- Update `lib/ai/client.ts` to detect `GROQ_API_KEY` and initialize `@ai-sdk/openai` with Groq's endpoint `https://api.groq.com/openai/v1`.
- Allow model customization via `AI_MODEL` env var or request payload (defaulting to `llama-3.3-70b-versatile`).
- Preserve the existing Zod schema (`aiRawAnalysisSchema`), output normalization, and 1-attempt retry logic.
- Ensure the model name stored in the `article_analyses.model` column reflects the actual model executed.
- Ensure `npm run typecheck` and `npm run lint` pass cleanly with 0 errors.

## Security requirements
- Never expose `GROQ_API_KEY` to browser or client components.
- Keep `GROQ_API_KEY` strictly server-side in `.env.local`.

## Acceptance criteria
- `lib/ai/client.ts` connects to Groq's free endpoint when `GROQ_API_KEY` is configured.
- `POST /api/analyze` successfully evaluates unanalyzed articles using Groq free tier.
- Sentiment, framing percentages (summing to 100), bias score, and summary are correctly computed and saved into Supabase `article_analyses`.
- `articles.analyzed_at` is updated upon successful analysis.
- `npm run typecheck` and `npm run lint` succeed without errors.

## Checks to run
- `npm run typecheck`
- `npm run lint`
- Test `POST /api/analyze` with `limit: 1`

## Exact manual test steps expected after implementation
1. Obtain a free Groq API key from [https://console.groq.com/keys](https://console.groq.com/keys).
2. Add `GROQ_API_KEY=gsk_...` to `.env.local`.
3. Trigger article analysis:
   ```bash
   curl -X POST http://localhost:3000/api/analyze \
     -H "Content-Type: application/json" \
     -H "x-KIWI-admin-secret: your_admin_secret" \
     -d '{"limit": 1}'
   ```
4. Verify in dev server console logs and Supabase that the article was analyzed using Groq and saved into `article_analyses`.
