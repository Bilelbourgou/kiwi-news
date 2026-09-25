/**
 * KIWI News — Supabase schema
 *
 * Run this once in Supabase Dashboard → SQL Editor.
 * The script is idempotent (CREATE IF NOT EXISTS / DO blocks) — safe to re-run.
 *
 * Tables: sources, articles, article_analyses, logs,
 *         oxylabs_schedules, oxylabs_schedule_runs
 *
 * Sections:
 *   1. Extensions
 *   2. Table definitions
 *   3. Indexes
 *   4. Row-Level Security (RLS)
 */

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. Extensions
-- ─────────────────────────────────────────────────────────────────────────────

create extension if not exists "uuid-ossp";

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. Tables
-- ─────────────────────────────────────────────────────────────────────────────

-- sources: news publisher registry
create table if not exists sources (
  id               uuid primary key default uuid_generate_v4(),
  name             text not null,
  listing_url      text not null unique,
  parser_strategy  text,
  active           boolean not null default true,
  logo_url         text,
  created_at       timestamptz not null default now()
);

-- articles: scraped and validated news articles
create table if not exists articles (
  id            uuid primary key default uuid_generate_v4(),
  source_id     uuid not null references sources(id) on delete cascade,
  url           text not null unique,
  canonical_url text,
  title         text not null,
  image_url     text not null,
  published_at  timestamptz not null,
  raw_text      text not null,
  scraped_at    timestamptz not null default now(),
  analyzed_at   timestamptz
);

-- article_analyses: AI analysis results for each article
create table if not exists article_analyses (
  id                uuid primary key default uuid_generate_v4(),
  article_id        uuid not null unique references articles(id) on delete cascade,
  summary           text not null,
  sentiment_score   numeric(4,3) not null check (sentiment_score between -1 and 1),
  sentiment_label   text not null check (sentiment_label in ('positive', 'neutral', 'negative')),
  bias_score        numeric(4,3) not null check (bias_score between -1 and 1),
  bias_label        text not null check (bias_label in ('left', 'center', 'right', 'mixed', 'unclear')),
  left_percentage   integer not null check (left_percentage between 0 and 100),
  center_percentage integer not null check (center_percentage between 0 and 100),
  right_percentage  integer not null check (right_percentage between 0 and 100),
  confidence        numeric(4,3) not null check (confidence between 0 and 1),
  framing_notes     text,
  loaded_terms      text[],
  disclaimer        text,
  model             text not null,
  created_at        timestamptz not null default now(),
  -- Percentages must sum to 100
  constraint pct_sum_100 check (left_percentage + center_percentage + right_percentage = 100)
);

-- logs: pipeline run logs for scraping, analysis, and scheduler events
create table if not exists logs (
  id         uuid primary key default uuid_generate_v4(),
  level      text not null check (level in ('info', 'warn', 'error')),
  message    text not null,
  context    jsonb,
  created_at timestamptz not null default now()
);

-- oxylabs_schedules: one row per active source with an Oxylabs Scheduler job
create table if not exists oxylabs_schedules (
  id                   uuid primary key default uuid_generate_v4(),
  source_id            uuid not null references sources(id) on delete cascade,
  -- Stored as text to preserve 64-bit integer precision (AGENTS.md §18)
  oxylabs_schedule_id  text not null unique,
  active               boolean not null default true,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

-- oxylabs_schedule_runs: individual Oxylabs scheduler run records
create table if not exists oxylabs_schedule_runs (
  id             uuid primary key default uuid_generate_v4(),
  schedule_id    uuid not null references oxylabs_schedules(id) on delete cascade,
  -- Stored as text to preserve 64-bit integer precision (AGENTS.md §18)
  oxylabs_run_id text not null unique,
  status         text not null default 'pending'
                   check (status in ('pending', 'done', 'faulted', 'processed')),
  processed_at   timestamptz,
  created_at     timestamptz not null default now()
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. Indexes
-- ─────────────────────────────────────────────────────────────────────────────

-- articles
create index if not exists idx_articles_url          on articles(url);
create index if not exists idx_articles_analyzed_at  on articles(analyzed_at);
create index if not exists idx_articles_source_id    on articles(source_id);
create index if not exists idx_articles_published_at on articles(published_at desc);

-- article_analyses
create index if not exists idx_article_analyses_article_id on article_analyses(article_id);

-- logs
create index if not exists idx_logs_created_at on logs(created_at desc);

-- oxylabs_schedules
create index if not exists idx_oxylabs_schedules_source_id on oxylabs_schedules(source_id);

-- oxylabs_schedule_runs
create index if not exists idx_oxylabs_runs_schedule_id on oxylabs_schedule_runs(schedule_id);
create index if not exists idx_oxylabs_runs_status      on oxylabs_schedule_runs(status);

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. Row-Level Security (RLS)
-- ─────────────────────────────────────────────────────────────────────────────
-- Public tables (sources, articles, article_analyses):
--   anon/authenticated roles can SELECT.
--   All inserts/updates/deletes go through the service-role client in API routes.
--
-- Private tables (logs, oxylabs_schedules, oxylabs_schedule_runs):
--   No public access — only the service-role client (bypasses RLS) writes here.
-- ─────────────────────────────────────────────────────────────────────────────

-- sources
alter table sources enable row level security;

create policy "Public can read sources"
  on sources
  for select
  to anon, authenticated
  using (true);

-- articles
alter table articles enable row level security;

create policy "Public can read articles"
  on articles
  for select
  to anon, authenticated
  using (true);

-- article_analyses
alter table article_analyses enable row level security;

create policy "Public can read article_analyses"
  on article_analyses
  for select
  to anon, authenticated
  using (true);

-- logs (private — no public policies)
alter table logs enable row level security;

-- oxylabs_schedules (private — no public policies)
alter table oxylabs_schedules enable row level security;

-- oxylabs_schedule_runs (private — no public policies)
alter table oxylabs_schedule_runs enable row level security;
