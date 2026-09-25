// ─────────────────────────────────────────────────────────────────────────────
// KIWI News — Supabase TypeScript types
// Keep in sync with supabase/schema.sql and AGENTS.md §7
// ─────────────────────────────────────────────────────────────────────────────

export type SentimentLabel = "positive" | "neutral" | "negative";
export type BiasLabel = "left" | "center" | "right" | "mixed" | "unclear";

// ─── sources ─────────────────────────────────────────────────────────────────

export interface Source {
  id: string;
  name: string;
  listing_url: string;
  parser_strategy: string | null;
  active: boolean;
  logo_url: string | null;
  created_at: string;
}

// ─── articles ────────────────────────────────────────────────────────────────

export interface Article {
  id: string;
  source_id: string;
  url: string;
  canonical_url: string | null;
  title: string;
  image_url: string;
  published_at: string;
  raw_text: string;
  scraped_at: string;
  analyzed_at: string | null;
}

// ─── article_analyses ────────────────────────────────────────────────────────

export interface ArticleAnalysis {
  id: string;
  article_id: string;
  summary: string;
  sentiment_score: number; // -1 to 1
  sentiment_label: SentimentLabel;
  bias_score: number; // (right_pct - left_pct) / 100
  bias_label: BiasLabel;
  left_percentage: number;  // 0-100
  center_percentage: number; // 0-100
  right_percentage: number; // 0-100
  confidence: number; // 0-1
  framing_notes: string | null;
  loaded_terms: string[] | null;
  disclaimer: string | null;
  model: string;
  created_at: string;
}

// ─── logs ────────────────────────────────────────────────────────────────────

export type LogLevel = "info" | "warn" | "error";

export interface Log {
  id: string;
  level: LogLevel;
  message: string;
  context: Record<string, unknown> | null;
  created_at: string;
}

// ─── oxylabs_schedules ───────────────────────────────────────────────────────

export interface OxylabsSchedule {
  id: string;
  source_id: string;
  /** Stored as string to preserve 64-bit precision (see AGENTS.md §18) */
  oxylabs_schedule_id: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

// ─── oxylabs_schedule_runs ───────────────────────────────────────────────────

export type ScheduleRunStatus = "pending" | "done" | "faulted" | "processed";

export interface OxylabsScheduleRun {
  id: string;
  schedule_id: string;
  /** Stored as string to preserve 64-bit precision (see AGENTS.md §18) */
  oxylabs_run_id: string;
  status: ScheduleRunStatus;
  processed_at: string | null;
  created_at: string;
}

// ─── Join / UI types ─────────────────────────────────────────────────────────

/**
 * Article joined with its analysis and source — used by home page cards
 * and the news details page. The `analysis` field is null when the article
 * has not been analyzed yet.
 */
export interface ArticleWithAnalysis {
  // Article fields
  id: string;
  source_id: string;
  url: string;
  canonical_url: string | null;
  title: string;
  image_url: string;
  published_at: string;
  raw_text: string;
  scraped_at: string;
  analyzed_at: string | null;

  // Joined source
  source: Pick<Source, "id" | "name" | "logo_url" | "listing_url">;

  // Joined analysis (null if not yet analyzed)
  analysis: ArticleAnalysis | null;
}
