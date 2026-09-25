# Oxylabs Scraping Pipeline

**Goal**: Implement the KIWI Oxylabs scraping pipeline end-to-end using the project’s existing Supabase schema and server-only architecture. This covers live homepage scraping, candidate URL filtering, article validation and insertion, scheduling sync, and the admin-only route layer that starts pipeline work.

---

## Skills read
- `.agents/skills/web-scraper-api/SKILL.md`
- `.agents/skills/supabase/SKILL.md`
- `AGENTS.md`

## Existing code inspected
- `package.json` — Next.js app dependencies, no scraper or AI package yet
- `.env.example` — env vars and required server-only keys
- `supabase/schema.sql` — existing source/article/log tables and data model
- `lib/supabase/types.ts` — TypeScript source/article/log types
- `lib/supabase/queries.ts` — Supabase queries and pending-analysis logic
- `app/page.tsx` — UI currently uses mock or empty-state pattern
- `app/news/[id]/page.tsx` — details page shape and SSR expectations
- `README.md` — any repo-specific operational instructions

## Decisions / assumptions
1. Use the active `sources` table as the canonical source registry; do not hardcode URLs in the scraper.
2. All act-on-work routes are `POST` and require the shared `x-KIWI-admin-secret` header with a server-side `KIWI_ADMIN_SECRET` value.
3. Oxylabs requests are server-only and run in Next.js route handlers or dedicated server modules; no browser-side scraping or model calls.
4. Use Supabase service-role access only inside server modules, never in client components.
5. Preserve the project’s minimal architecture: thin API routes + server utilities + Supabase data access.
6. The pipeline should be reusable for both manual scrape calls and scheduled result processing.
7. Keep parsing strict to avoid bad article inserts; prefer fewer good articles over more low-quality ones.

## Files likely to change
- `lib/oxylabs/*.ts` — new server-only Oxylabs utilities
- `lib/scraping/*.ts` — new parsing, validation, URL filtering, and dedupe utilities
- `lib/supabase/service.ts` — service-role client, inserts, logs, and source access helpers
- `lib/supabase/queries.ts` — add source/article query helpers for scrape flow
- `app/api/scrape/route.ts` — manual scrape route
- `app/api/oxylabs/schedules/route.ts` — sync/list schedule route(s)
- `app/api/oxylabs/scheduled-results/process/route.ts` — scheduled-result processing route
- `app/api/cron/pipeline/route.ts` — cron pipeline chain
- `app/api/sources/route.ts` and/or `app/api/logs/route.ts` — if needed for admin visibility
- `supabase/schema.sql` — only if additional pipeline support fields are required
- `.env.example` — keep env variables aligned

## Implementation requirements
- Create a server-side Oxylabs client that authenticates with `OXY_WSA_USERNAME` and `OXY_WSA_PASSWORD` via HTTP Basic Auth.
- Fetch each active source’s homepage HTML from the source’s stored `listing_url` for manual runs.
- Support scheduled processing from completed Oxylabs schedule runs using `result_status === "done"` and raw HTML results, never from `jobs` endpoints.
- Extract only visible homepage story/article card links, not category/topic/navigation pages.
- Reject page candidates that match the project’s non-article reject list before detail scraping.
- Normalize + dedupe URLs before detail fetches.
- Skip already-seen URLs using a chunked Supabase existence check (do not exceed 15 IDs per `.in()` chunk).
- Scrape only detail pages that pass source-specific candidate filtering.
- Validate scraped detail pages before insert: article-specific URL + title + meaningful body + image + published_at.
- Clean parsed text before storing `raw_text`, removing navigation, scripts, CSS dumps, ads, share blocks, and related content noise.
- Insert only valid articles via append-only logic; never replace or reset article rows during a scrape.
- Log progress and summary objects in the server terminal for each run.
- Expose route responses with a summary object including counts for sources checked, candidates found, rejected, duplicates, detail pages scraped, inserted, rejected, failed, total duration, and grouped rejection reasons.
- Use `GET` only for read routes. Use `POST` for pipeline actions. The Vercel cron route is the lone `GET` exception and is protected by `CRON_SECRET` during production.
- Include admin secret enforcement on all action endpoints via `x-KIWI-admin-secret`.

## Security requirements
- Do not expose any server secret to browser code.
- Keep Oxylabs credentials, Supabase service-role key, OpenAI key, and scheduling secrets server-only.
- Do not call Oxylabs or AI services from browser code.
- Keep `CRON_SECRET` out of `.env.local` and treat it as Vercel-injected only.
- Local cron development may bypass secret enforcement only when explicitly running locally.

## Acceptance criteria
- The app can fetch active sources from Supabase and select them for manual scraping.
- Manual scraping works via `POST /api/scrape` with the required admin secret header.
- The scraper inserts only valid article rows, skips duplicates, and logs a summary object.
- The pipeline reuses the same validation path for scheduled result processing.
- Scheduler sync route can create per-source schedule entries and deactivate stale Oxylabs schedules that no longer exist in the DB.
- Cron route chains scheduled result processing and downstream AI analysis when applicable.
- TypeScript and lint checks pass after implementation.

## Checks to run
- `npm run typecheck` (if available) or `npx tsc --noEmit`
- `npm run lint`
- `npm run build` if server routes/configuration changed

## Exact manual test steps expected after implementation
1. Ensure the local Next.js app starts with `npm run dev`.
2. Create or confirm active sources exist in Supabase (`sources` table with `active = true`).
3. Test manual scraping:
   ```bash
   curl -X POST http://localhost:3000/api/scrape \
     -H 'Content-Type: application/json' \
     -H 'x-KIWI-admin-secret: test-secret' \
     -d '{"sourceIds": [], "limitPerSource": 3}'
   ```
4. Watch the terminal logs for scraper progress and summary output.
5. Confirm valid inserted articles appear in the `articles` table and that invalid pages are skipped.
6. Test scheduler sync route:
   ```bash
   curl -X POST http://localhost:3000/api/oxylabs/schedules \
     -H 'Content-Type: application/json' \
     -H 'x-KIWI-admin-secret: test-secret'
   ```
7. Test scheduled-result processing route:
   ```bash
   curl -X POST http://localhost:3000/api/oxylabs/scheduled-results/process \
     -H 'Content-Type: application/json' \
     -H 'x-KIWI-admin-secret: test-secret'
   ```
8. Test cron route locally (development only):
   ```bash
   curl -X GET 'http://localhost:3000/api/cron/pipeline'
   ```
   This should run the same pipeline chain without a browser context.

## Notes
- This task is intentionally limited to the Oxylabs scraping pipeline and its server-side route orchestration.
- We are not broadening scope into unrelated UI features unless required by the scrape flow.
- The final implementation should keep the project’s existing conventions and remain safe for production-style use.
