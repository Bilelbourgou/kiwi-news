import { createClient } from "@/lib/supabase/server";
import type { ArticleWithAnalysis, Source, Article } from "@/lib/supabase/types";

// ─────────────────────────────────────────────────────────────────────────────
// Home page
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Fetch analyzed articles for the home page grid.
 *
 * Returns articles that have a matching `article_analyses` row, joined with
 * their source. Ordered by `published_at DESC`.
 */
export async function getArticlesWithAnalysis(
  limit = 50
): Promise<ArticleWithAnalysis[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("articles")
    .select(
      `
      *,
      source:sources ( id, name, logo_url, listing_url ),
      analysis:article_analyses (*)
      `
    )
    .not("analyzed_at", "is", null)
    .order("published_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("[queries] getArticlesWithAnalysis error:", error.message);
    return [];
  }

  // Keep only articles that actually have an analysis row
  // (the join returns null when no row matches).
  const withAnalysis = (data ?? []).filter(
    (row) => row.analysis !== null
  ) as ArticleWithAnalysis[];

  return withAnalysis;
}

// ─────────────────────────────────────────────────────────────────────────────
// News details page
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Fetch a single article with its analysis and source.
 * Returns null when the article does not exist.
 */
export async function getArticleById(
  id: string
): Promise<ArticleWithAnalysis | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("articles")
    .select(
      `
      *,
      source:sources ( id, name, logo_url, listing_url ),
      analysis:article_analyses (*)
      `
    )
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("[queries] getArticleById error:", error.message);
    return null;
  }

  return (data as ArticleWithAnalysis | null) ?? null;
}

/**
 * Fetch related articles for the details page sidebar.
 *
 * Strategy: same source first, then same bias label — excluding the current
 * article. Returns up to `limit` articles that have been analyzed.
 */
export async function getRelatedArticles(
  articleId: string,
  sourceId: string,
  biasLabel: string | null,
  limit = 6
): Promise<ArticleWithAnalysis[]> {
  const supabase = await createClient();

  // Same source, analyzed, excluding current
  const { data: sameSource } = await supabase
    .from("articles")
    .select(
      `
      *,
      source:sources ( id, name, logo_url, listing_url ),
      analysis:article_analyses (*)
      `
    )
    .eq("source_id", sourceId)
    .not("analyzed_at", "is", null)
    .neq("id", articleId)
    .order("published_at", { ascending: false })
    .limit(limit);

  const results: ArticleWithAnalysis[] = (
    (sameSource ?? []).filter((r) => r.analysis !== null) as ArticleWithAnalysis[]
  );

  // If we still need more, pull from same bias label
  if (results.length < limit && biasLabel) {
    const needed = limit - results.length;
    const excludeIds = [articleId, ...results.map((r) => r.id)];

    const { data: sameBias } = await supabase
      .from("articles")
      .select(
        `
        *,
        source:sources ( id, name, logo_url, listing_url ),
        analysis:article_analyses!inner (*)
        `
      )
      .eq("article_analyses.bias_label", biasLabel)
      .not("analyzed_at", "is", null)
      .not("id", "in", `(${excludeIds.join(",")})`)
      .order("published_at", { ascending: false })
      .limit(needed);

    if (sameBias) {
      results.push(
        ...(sameBias.filter((r) => r.analysis !== null) as ArticleWithAnalysis[])
      );
    }
  }

  return results.slice(0, limit);
}

// ─────────────────────────────────────────────────────────────────────────────
// Sources
// ─────────────────────────────────────────────────────────────────────────────

/** List all sources (admin use). */
export async function getSources(): Promise<Source[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("sources")
    .select("*")
    .order("name");

  if (error) {
    console.error("[queries] getSources error:", error.message);
    return [];
  }
  return (data ?? []) as Source[];
}

/** List only active sources (used by the scraping pipeline). */
export async function getActiveSources(): Promise<Source[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("sources")
    .select("*")
    .eq("active", true)
    .order("name");

  if (error) {
    console.error("[queries] getActiveSources error:", error.message);
    return [];
  }
  return (data ?? []) as Source[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Analysis pipeline
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Fetch articles that are pending analysis.
 *
 * Uses a LEFT JOIN to detect articles with no `article_analyses` row,
 * per AGENTS.md §19 — do NOT rely on `analyzed_at IS NULL` alone.
 */
export async function getUnanalyzedArticles(
  limit = 100
): Promise<Article[]> {
  const supabase = await createClient();

  // LEFT JOIN via PostgREST: select articles where no analysis row exists
  const { data, error } = await supabase
    .from("articles")
    .select(
      `
      *,
      analysis:article_analyses ( id )
      `
    )
    .is("article_analyses.id", null) // LEFT JOIN — no matching analysis row
    .order("scraped_at", { ascending: true })
    .limit(limit);

  if (error) {
    console.error("[queries] getUnanalyzedArticles error:", error.message);
    return [];
  }

  return (data ?? []) as Article[];
}

/**
 * Fetch articles by their IDs (used for batch processing).
 * Chunks of up to 15 IDs to stay within PostgREST limits.
 */
export async function getArticlesByIds(ids: string[]): Promise<Article[]> {
  if (ids.length === 0) return [];

  const supabase = await createClient();
  const CHUNK_SIZE = 15;
  const results: Article[] = [];

  for (let i = 0; i < ids.length; i += CHUNK_SIZE) {
    const chunk = ids.slice(i, i + CHUNK_SIZE);
    const { data, error } = await supabase
      .from("articles")
      .select("*")
      .in("id", chunk);

    if (error) {
      console.error("[queries] getArticlesByIds error:", error.message);
      continue;
    }
    results.push(...((data ?? []) as Article[]));
  }

  return results;
}

// ─────────────────────────────────────────────────────────────────────────────
// Logs
// ─────────────────────────────────────────────────────────────────────────────

/** Fetch recent pipeline logs (admin logs page). */
export async function getLogs(limit = 200) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("[queries] getLogs error:", error.message);
    return [];
  }
  return data ?? [];
}
