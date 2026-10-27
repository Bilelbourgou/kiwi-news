import { createServiceClient } from "@/lib/supabase/service";
import type { Article } from "@/lib/supabase/types";
import { analyzeArticle } from "./analysis";

export interface AnalysisPipelineOptions {
  articleIds?: string[];
  limit?: number;
  batchSize?: number;
  modelName?: string;
}

export interface AnalysisSummary {
  status: "success" | "partial" | "failed" | "idle";
  totalPending: number;
  articlesAnalyzed: number;
  articlesFailed: number;
  articlesSkipped: number;
  durationMs: number;
  batchesProcessed: number;
  errors: Array<{ articleId: string; title: string; error: string }>;
}

/**
 * Fetches articles that are pending analysis.
 *
 * Per AGENTS.md §19:
 * "Pending-analysis check — detect pending articles by LEFT JOINing articles to article_analyses.
 * Never rely on analyzed_at IS NULL alone — analyzed_at can be set while the article_analyses
 * row is absent (e.g. after manual deletion). An article is pending when no article_analyses row exists for it."
 */
export async function getPendingArticles(options?: {
  articleIds?: string[];
  limit?: number;
  excludeIds?: Set<string>;
}): Promise<Article[]> {
  const supabase = createServiceClient();
  const excludeIds = options?.excludeIds ?? new Set<string>();

  // If specific article IDs are specified, chunk query in <= 15 chunks
  if (options?.articleIds && options.articleIds.length > 0) {
    const CHUNK_SIZE = 15;
    const targetIds = options.articleIds.filter((id) => !excludeIds.has(id));
    const pendingArticles: Article[] = [];

    for (let i = 0; i < targetIds.length; i += CHUNK_SIZE) {
      const chunk = targetIds.slice(i, i + CHUNK_SIZE);
      const { data, error } = await supabase
        .from("articles")
        .select(`
          id,
          source_id,
          url,
          canonical_url,
          title,
          image_url,
          published_at,
          raw_text,
          scraped_at,
          analyzed_at,
          analysis:article_analyses ( id )
        `)
        .in("id", chunk);

      if (error) {
        console.error("[ai-pipeline] Error fetching articles by IDs:", error.message);
        continue;
      }

      for (const row of data ?? []) {
        const hasAnalysis = Boolean(
          row.analysis && (!Array.isArray(row.analysis) || row.analysis.length > 0)
        );
        if (!hasAnalysis && !excludeIds.has(row.id)) {
          pendingArticles.push({
            id: row.id,
            source_id: row.source_id,
            url: row.url,
            canonical_url: row.canonical_url,
            title: row.title,
            image_url: row.image_url,
            published_at: row.published_at,
            raw_text: row.raw_text,
            scraped_at: row.scraped_at,
            analyzed_at: row.analyzed_at,
          });
        }
      }
    }

    if (options?.limit && options.limit > 0) {
      return pendingArticles.slice(0, options.limit);
    }
    return pendingArticles;
  }

  // Fetch pending articles via left-join
  const queryLimit = Math.min(options?.limit ?? 50, 100);
  const { data, error } = await supabase
    .from("articles")
    .select(`
      id,
      source_id,
      url,
      canonical_url,
      title,
      image_url,
      published_at,
      raw_text,
      scraped_at,
      analyzed_at,
      analysis:article_analyses ( id )
    `)
    .order("scraped_at", { ascending: true })
    .limit(queryLimit * 2);

  if (error) {
    console.error("[ai-pipeline] Error querying pending articles:", error.message);
    return [];
  }

  const pending: Article[] = [];
  for (const row of data ?? []) {
    if (excludeIds.has(row.id)) continue;

    const hasAnalysis = Boolean(
      row.analysis && (!Array.isArray(row.analysis) || row.analysis.length > 0)
    );
    if (!hasAnalysis) {
      pending.push({
        id: row.id,
        source_id: row.source_id,
        url: row.url,
        canonical_url: row.canonical_url,
        title: row.title,
        image_url: row.image_url,
        published_at: row.published_at,
        raw_text: row.raw_text,
        scraped_at: row.scraped_at,
        analyzed_at: row.analyzed_at,
      });
      if (options?.limit && pending.length >= options.limit) {
        break;
      }
    }
  }

  return pending;
}

/**
 * Runs the AI article analysis pipeline.
 */
export async function runAnalysisPipeline(
  options: AnalysisPipelineOptions = {}
): Promise<AnalysisSummary> {
  const startedAt = Date.now();
  const envBatchSize = process.env.ANALYSIS_BATCH_SIZE
    ? parseInt(process.env.ANALYSIS_BATCH_SIZE, 10)
    : 5;
  const batchSize = Math.max(1, options.batchSize ?? (isNaN(envBatchSize) ? 5 : envBatchSize));
  const modelName = options.modelName ?? process.env.AI_MODEL;
  const requestedLimit = options.limit && options.limit > 0 ? options.limit : undefined;

  console.log(
    `[ai-pipeline] Starting AI analysis pipeline (batchSize: ${batchSize}${
      modelName ? `, model: ${modelName}` : ""
    }${requestedLimit ? `, limit: ${requestedLimit}` : ""}${
      options.articleIds ? `, specificIds: ${options.articleIds.length}` : ""
    })`
  );

  const supabase = createServiceClient();
  const summary: AnalysisSummary = {
    status: "idle",
    totalPending: 0,
    articlesAnalyzed: 0,
    articlesFailed: 0,
    articlesSkipped: 0,
    durationMs: 0,
    batchesProcessed: 0,
    errors: [],
  };

  const failedArticleIds = new Set<string>();
  let totalProcessed = 0;

  // Determine initial total pending count for accurate logging
  const initialPending = await getPendingArticles({
    articleIds: options.articleIds,
    limit: requestedLimit,
  });
  summary.totalPending = initialPending.length;

  if (summary.totalPending === 0) {
    console.log("[ai-pipeline] No pending unanalyzed articles found. Pipeline complete.");
    summary.status = "idle";
    summary.durationMs = Date.now() - startedAt;
    return summary;
  }

  console.log(`[ai-pipeline] Found ${summary.totalPending} pending unanalyzed articles.`);

  // Process in configurable batches until no pending articles remain or requestedLimit is reached
  while (true) {
    if (requestedLimit && totalProcessed >= requestedLimit) {
      break;
    }

    const remainingToFetch = requestedLimit
      ? Math.min(batchSize, requestedLimit - totalProcessed)
      : batchSize;

    const currentBatch = await getPendingArticles({
      articleIds: options.articleIds,
      limit: remainingToFetch,
      excludeIds: failedArticleIds,
    });

    if (currentBatch.length === 0) {
      break;
    }

    summary.batchesProcessed += 1;
    console.log(
      `[ai-pipeline] Processing batch #${summary.batchesProcessed} (${currentBatch.length} articles)...`
    );

    for (const article of currentBatch) {
      // Content check gate
      if (!article.raw_text || article.raw_text.trim().length < 50) {
        console.warn(`[ai-pipeline] Article ${article.id} skipped: insufficient body text.`);
        summary.articlesSkipped += 1;
        failedArticleIds.add(article.id);
        totalProcessed += 1;
        continue;
      }

      console.log(`[ai-pipeline] Analyzing [${article.id}]: "${article.title.slice(0, 60)}..."`);

      try {
        // 1. Analyze with LLM + Zod schema + normalization + retry
        const analysisData = await analyzeArticle(article, modelName);

        // 2. Persist to article_analyses table
        const { error: insertError } = await supabase
          .from("article_analyses")
          .insert(analysisData);

        if (insertError) {
          throw new Error(`Failed to insert analysis row: ${insertError.message}`);
        }

        // 3. Mark analyzed_at only AFTER valid analysis is persisted (AGENTS.md §19)
        const nowIso = new Date().toISOString();
        const { error: updateError } = await supabase
          .from("articles")
          .update({ analyzed_at: nowIso })
          .eq("id", article.id);

        if (updateError) {
          console.warn(
            `[ai-pipeline] Warning: failed to update analyzed_at for ${article.id}:`,
            updateError.message
          );
        }

        summary.articlesAnalyzed += 1;
        console.log(
          `[ai-pipeline] Successfully analyzed [${article.id}] — Framing: ${analysisData.bias_label} (L:${analysisData.left_percentage}% C:${analysisData.center_percentage}% R:${analysisData.right_percentage}%), Sentiment: ${analysisData.sentiment_label}`
        );
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        console.error(`[ai-pipeline] Failed analysis for [${article.id}]:`, errorMsg);
        summary.articlesFailed += 1;
        failedArticleIds.add(article.id);
        summary.errors.push({
          articleId: article.id,
          title: article.title,
          error: errorMsg,
        });
      }

      totalProcessed += 1;
      if (requestedLimit && totalProcessed >= requestedLimit) {
        break;
      }
    }
  }

  summary.durationMs = Date.now() - startedAt;

  if (summary.articlesAnalyzed > 0 && summary.articlesFailed === 0) {
    summary.status = "success";
  } else if (summary.articlesAnalyzed > 0 && summary.articlesFailed > 0) {
    summary.status = "partial";
  } else if (summary.articlesAnalyzed === 0 && summary.articlesFailed > 0) {
    summary.status = "failed";
  } else {
    summary.status = "idle";
  }

  console.log("[ai-pipeline] Analysis completed. Final Summary:", {
    status: summary.status,
    totalPending: summary.totalPending,
    analyzed: summary.articlesAnalyzed,
    failed: summary.articlesFailed,
    skipped: summary.articlesSkipped,
    batches: summary.batchesProcessed,
    durationMs: summary.durationMs,
  });

  return summary;
}
