# pgvector Support & Related Articles — Implementation Prompt

## Goal

Enable pgvector on the Supabase project, add an `embedding vector(1536)` column to
`article_analyses`, update the AI analysis pipeline to generate and save OpenAI-compatible
embeddings (via the Groq/OpenAI-compatible endpoint), and replace the existing
keyword/bias-based `getRelatedArticles` query with a pgvector cosine-similarity search.
This is AGENTS.md §20.

---

## Skills Read

- `.agents/skills/supabase` — schema change workflow, RLS, imperative migrations, MCP `execute_sql`
- `.agents/skills/ai-sdk` — `embed` function, embedding models, AI SDK 7.x bundled docs (verified)

---

## Existing Code Inspected

| File | Relevance |
|---|---|
| `supabase/schema.sql` | Source of truth for DB schema; `article_analyses` table definition |
| `lib/supabase/types.ts` | `ArticleAnalysis`, `ArticleWithAnalysis` interfaces |
| `lib/supabase/queries.ts` | `getRelatedArticles` (source/bias fallback strategy) |
| `lib/ai/analysis.ts` | `analyzeArticle`, `ArticleAnalysisData` — where embedding must be added |
| `lib/ai/pipeline.ts` | `runAnalysisPipeline` — orchestrates insert into `article_analyses` |
| `lib/ai/client.ts` | `getAIModel` — uses Groq OpenAI-compatible endpoint; must add `getEmbeddingModel` |
| `app/news/[id]/page.tsx` | News details page — calls `getRelatedArticles`, renders `<RelatedStories>` |
| `components/news-details/related-stories.tsx` | Existing UI component — no changes needed |
| `.env.local` | `GROQ_API_KEY` is set, `OPENAI_API_KEY` is absent |

---

## Decisions & Assumptions

1. **Embedding model**: Use OpenAI `text-embedding-3-small` (1536 dimensions) via direct
   OpenAI API. Groq does NOT support standard embedding models.
   - Add `embedding vector(1536)` as a **nullable** column.
   - Generate embeddings only when `OPENAI_API_KEY` is set.
   - If only `GROQ_API_KEY` is set (current state), skip embedding with a console warning.
   - Similarity search falls back to the existing source/bias strategy when no embedding exists.

2. **pgvector extension**: May already be enabled on Supabase. The ALTER SQL must be run
   manually in the Supabase SQL Editor. Exact SQL is provided below.

3. **Similarity search**: Use the `<=>` cosine distance operator via a Supabase RPC function
   `match_articles_by_embedding`. PostgREST `.select()` does not support vector operators
   directly.

4. **RPC function**: Accepts `query_embedding vector(1536)`, `match_threshold float`,
   `match_count int`, and `exclude_id uuid`. Returns `(article_id uuid, similarity float)`.

5. **`getRelatedArticles`**: Updated to accept an optional `embedding: number[] | null`.
   Uses pgvector RPC when available; falls back to existing source/bias strategy.

6. **News details page**: Passes `article.analysis?.embedding ?? null` to `getRelatedArticles`.

7. **Performance**: Home page query (`getArticlesWithAnalysis`) must NOT select the `embedding`
   column. Only the details page `getArticleById` selects it.

8. **Schema column**: `nullable`, so existing rows are unaffected. The `pct_sum_100` constraint
   is unchanged. The IVFFlat index is documented but commented out (add only after >= 100 rows
   with embeddings).

---

## Files Likely To Change

| File | Change |
|---|---|
| `supabase/schema.sql` | Add pgvector extension + `embedding vector(1536)` column + RPC function |
| `lib/supabase/types.ts` | Add `embedding?: number[] \| null` to `ArticleAnalysis` |
| `lib/ai/client.ts` | Add `getEmbeddingModel()` function |
| `lib/ai/analysis.ts` | Add `generateEmbedding()` helper; add `embedding` field to `ArticleAnalysisData` |
| `lib/ai/pipeline.ts` | Call `generateEmbedding` after analysis; include in insert payload |
| `lib/supabase/queries.ts` | Update `getRelatedArticles` and `getArticleById` for embedding |
| `app/news/[id]/page.tsx` | Pass embedding to `getRelatedArticles` |

---

## Implementation Requirements

### 1. Database SQL (run manually in Supabase Dashboard -> SQL Editor)

```sql
-- 1a. Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- 1b. Add nullable embedding column to article_analyses
ALTER TABLE article_analyses
  ADD COLUMN IF NOT EXISTS embedding vector(1536);

-- 1c. Create cosine similarity RPC function
CREATE OR REPLACE FUNCTION match_articles_by_embedding(
  query_embedding  vector(1536),
  match_threshold  float,
  match_count      int,
  exclude_id       uuid
)
RETURNS TABLE (
  article_id uuid,
  similarity float
)
LANGUAGE sql STABLE
AS $$
  SELECT
    aa.article_id,
    1 - (aa.embedding <=> query_embedding) AS similarity
  FROM article_analyses aa
  WHERE
    aa.embedding IS NOT NULL
    AND aa.article_id <> exclude_id
    AND 1 - (aa.embedding <=> query_embedding) > match_threshold
  ORDER BY aa.embedding <=> query_embedding
  LIMIT match_count;
$$;

-- 1d. Optional IVFFlat index (add only after >= 100 rows with embeddings)
-- CREATE INDEX ON article_analyses USING ivfflat (embedding vector_cosine_ops)
--   WITH (lists = 100);
```

### 2. `supabase/schema.sql`

- Add `CREATE EXTENSION IF NOT EXISTS vector;` to the Extensions section (section 1).
- Add `embedding  vector(1536)` (nullable) to `article_analyses`.
- Add the `match_articles_by_embedding` function definition.
- Add commented-out IVFFlat index with an explanatory comment.

### 3. `lib/supabase/types.ts`

Add `embedding?: number[] | null;` to `ArticleAnalysis`.

### 4. `lib/ai/client.ts` — add `getEmbeddingModel()`

```ts
import { createOpenAI } from '@ai-sdk/openai';

export function getEmbeddingModel() {
  const openaiApiKey = process.env.OPENAI_API_KEY?.trim();
  if (!openaiApiKey) return null;
  const openai = createOpenAI({ apiKey: openaiApiKey });
  return openai.embedding('text-embedding-3-small');
}
```

Returns `null` if `OPENAI_API_KEY` is not set.

### 5. `lib/ai/analysis.ts` — add `generateEmbedding()` and update `ArticleAnalysisData`

```ts
import { embed } from 'ai';
import { getEmbeddingModel } from './client';

export async function generateEmbedding(text: string): Promise<number[] | null> {
  const model = getEmbeddingModel();
  if (!model) {
    console.warn('[ai-analysis] No embedding model available (OPENAI_API_KEY not set). Skipping embedding.');
    return null;
  }
  try {
    const { embedding } = await embed({ model, value: text.slice(0, 8000) });
    return embedding;
  } catch (err) {
    console.warn('[ai-analysis] Embedding generation failed:', err instanceof Error ? err.message : String(err));
    return null;
  }
}
```

Add `embedding?: number[] | null;` to `ArticleAnalysisData`.

### 6. `lib/ai/pipeline.ts` — generate and save embedding

After `analyzeArticle` succeeds and before the insert:

```ts
const embedding = await generateEmbedding(
  article.title + ' ' + article.raw_text.slice(0, 7900)
);
if (embedding) {
  console.log(`[ai-pipeline] Embedding generated for [${article.id}]`);
} else {
  console.warn(`[ai-pipeline] No embedding for [${article.id}] (key absent or generation failed)`);
}

const { error: insertError } = await supabase
  .from('article_analyses')
  .insert({ ...analysisData, embedding });
```

### 7. `lib/supabase/queries.ts`

**`getArticleById`**: Modify to explicitly select `embedding` from `article_analyses`.
Use `analysis:article_analyses ( *, embedding )` — but since `*` already includes all
columns, just ensure `embedding` is included. Since PostgREST returns all columns with `*`,
the embedding will be included automatically once the column exists. No change needed here
except ensuring we don't accidentally exclude it.

**`getRelatedArticles`**: Add `embedding?: number[] | null` parameter (5th param, after `limit`).

```ts
export async function getRelatedArticles(
  articleId: string,
  sourceId: string,
  biasLabel: string | null,
  limit = 6,
  embedding?: number[] | null
): Promise<ArticleWithAnalysis[]> {
  const supabase = await createClient();

  // Attempt pgvector similarity search if embedding is available
  if (embedding && embedding.length > 0) {
    const { data: rpcData, error: rpcError } = await supabase.rpc(
      'match_articles_by_embedding',
      {
        query_embedding: embedding,
        match_threshold: 0.7,
        match_count: limit,
        exclude_id: articleId,
      }
    );

    if (!rpcError && rpcData && rpcData.length > 0) {
      const ids = rpcData.map((r: { article_id: string }) => r.article_id);
      // Chunk fetch for the matched article IDs
      const CHUNK = 15;
      const rows: ArticleWithAnalysis[] = [];
      for (let i = 0; i < ids.length; i += CHUNK) {
        const chunk = ids.slice(i, i + CHUNK);
        const { data } = await supabase
          .from('articles')
          .select(`*, source:sources ( id, name, logo_url, listing_url ), analysis:article_analyses ( * )`)
          .in('id', chunk);
        if (data) rows.push(...(data.filter((r) => r.analysis !== null) as ArticleWithAnalysis[]));
      }
      if (rows.length > 0) return rows.slice(0, limit);
    }
    // Fall through to fallback if RPC returned nothing or errored
    if (rpcError) {
      console.warn('[queries] match_articles_by_embedding RPC error:', rpcError.message);
    }
  }

  // Fallback: same source first, then same bias label (existing strategy)
  // ... (keep existing code unchanged)
}
```

### 8. `app/news/[id]/page.tsx`

```ts
const relatedRows = await getRelatedArticles(
  id,
  article.source_id,
  biasLabel,
  6,
  article.analysis?.embedding ?? null
);
```

---

## Security Requirements

- `match_articles_by_embedding` runs as `SECURITY INVOKER` (default), so RLS on
  `article_analyses` applies. Public can read (existing policy).
- No new public API routes.
- Embedding column only fetched on the details page.

---

## Acceptance Criteria

- [ ] pgvector extension enabled in Supabase.
- [ ] `embedding vector(1536)` nullable column added to `article_analyses`.
- [ ] `match_articles_by_embedding` RPC function created.
- [ ] `supabase/schema.sql` updated.
- [ ] `ArticleAnalysis` type has `embedding?: number[] | null`.
- [ ] `POST /api/analyze` with `OPENAI_API_KEY` set generates and stores embeddings.
- [ ] `POST /api/analyze` without `OPENAI_API_KEY` skips embedding with a warning and still saves analysis.
- [ ] News details page shows related articles using similarity search (when embedding available) or fallback.
- [ ] Home page queries do NOT include embedding arrays.
- [ ] `npx tsc --noEmit` passes.

---

## Checks To Run

```powershell
npx tsc --noEmit
```

---

## Manual Test Steps

1. Run the SQL block from §1 in **Supabase Dashboard → SQL Editor → New Query**.
   Confirm no errors.

2. (Optional) Add `OPENAI_API_KEY=<your-key>` to `.env.local` and restart dev server.

3. Trigger analysis:
   ```
   curl -X POST http://localhost:3000/api/analyze ^
     -H "Content-Type: application/json" ^
     -H "x-kiwi-admin-secret: geirgb12noegr@" ^
     -d "{}"
   ```
   Watch terminal for `[ai-pipeline] Embedding generated for [<id>]` (if OPENAI_API_KEY set)
   or `[ai-pipeline] No embedding for [<id>]` (if not set).

4. Visit any article details page. Confirm "Related Stories" renders without errors.

5. In Supabase SQL Editor, verify:
   ```sql
   SELECT id, embedding IS NOT NULL as has_embedding FROM article_analyses LIMIT 10;
   ```
