# Supabase Database & Data Access

**Goal**: Add full Supabase persistence layer to KIWI News — clients, types, schema SQL, data access functions — and wire the home page and news details page to real data.

---

## Skills read
- `.agents/skills/supabase/SKILL.md`
- `.agents/skills/supabase-postgres-best-practices/SKILL.md`

## Existing code inspected
- `lib/mock-news-data.ts` — interface shapes and data patterns
- `app/page.tsx` — home page using mock data
- `app/news/[id]/page.tsx` — details page using mock data
- `components/ui/grid-news-card.tsx` — prop interface `NewsArticleItem`
- `components/news-details/related-stories.tsx` — prop interface `RelatedStoryItem`
- `.env.local` — Supabase URL + keys present
- `package.json` — no `@supabase/ssr` yet

## Decisions
1. `@supabase/ssr` + `@supabase/supabase-js` installed (10 packages, no audit issues).
2. No Supabase CLI (no local `supabase/` setup) — schema applied manually via Dashboard SQL Editor.
3. No pgvector yet — that's section 20, a separate step.
4. `NewsArticleItem` and `RelatedStoryItem` interfaces moved into their respective component files to break the `mock-news-data` coupling.
5. Server client uses `await cookies()` per Next.js 15+ pattern.

## Files created / modified
| File | Action |
|------|--------|
| `lib/supabase/types.ts` | NEW |
| `lib/supabase/client.ts` | NEW |
| `lib/supabase/server.ts` | NEW |
| `lib/supabase/service.ts` | NEW |
| `lib/supabase/queries.ts` | NEW |
| `supabase/schema.sql` | NEW |
| `components/ui/grid-news-card.tsx` | MODIFIED - removed mock-news-data import |
| `components/news-details/related-stories.tsx` | MODIFIED - removed mock-news-data import, fixed href |
| `app/page.tsx` | MODIFIED - reads from Supabase |
| `app/news/[id]/page.tsx` | MODIFIED - reads from Supabase, notFound() |

## TypeScript check
`npx tsc --noEmit` -> exit code 0, zero errors.

## Manual test steps

1. **Apply the schema** - open Supabase Dashboard -> SQL Editor -> paste `supabase/schema.sql` -> Run.

2. **Check empty state** - visit `http://localhost:3000`. You should see the "No articles yet" empty state.

3. **Check 404** - visit `http://localhost:3000/news/does-not-exist`. You should see the not-found page.

4. After the scraping + analysis pipeline inserts rows, the home page will display real article cards and the details page will load full articles.
