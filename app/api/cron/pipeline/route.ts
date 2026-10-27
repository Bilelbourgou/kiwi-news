import type { NextRequest } from "next/server";

import { processScheduledResultsForSources } from "@/lib/oxylabs/scheduler";
import { getActiveSources } from "@/lib/supabase/queries";
import { runAnalysisPipeline, type AnalysisSummary } from "@/lib/ai/pipeline";

function isCronAuthorized(request: NextRequest): boolean {
  if (process.env.NODE_ENV === "development") {
    return true;
  }

  const expected = process.env.CRON_SECRET;
  const provided =
    request.headers.get("x-cron-secret") ??
    request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ??
    request.nextUrl.searchParams.get("secret") ??
    "";

  return Boolean(expected && provided && provided === expected);
}

export async function GET(request: NextRequest): Promise<Response> {
  if (!isCronAuthorized(request)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  console.log("[cron-pipeline] Starting automatic hourly pipeline...");

  // Step 1: Process scheduled Oxylabs results
  let scrapingResult: Record<string, unknown> | null = null;
  let scrapingError: string | null = null;

  try {
    console.log("[cron-pipeline] Step 1: Processing scheduled scraping results...");
    const sources = await getActiveSources();
    scrapingResult = await processScheduledResultsForSources(sources);
    console.log("[cron-pipeline] Step 1 completed successfully.");
  } catch (error) {
    scrapingError = error instanceof Error ? error.message : String(error);
    console.error("[cron-pipeline] Step 1 failed:", scrapingError);
  }

  // Step 2: Run AI analysis on newly inserted and pending articles
  // Note: Per AGENTS.md §18, step 2 must run even if step 1 fails
  let analysisResult: AnalysisSummary | null = null;
  let analysisError: string | null = null;

  try {
    console.log("[cron-pipeline] Step 2: Running AI analysis on pending articles...");
    analysisResult = await runAnalysisPipeline();
    console.log("[cron-pipeline] Step 2 completed.");
  } catch (error) {
    analysisError = error instanceof Error ? error.message : String(error);
    console.error("[cron-pipeline] Step 2 failed:", analysisError);
  }

  const hasErrors = Boolean(scrapingError || analysisError);

  return Response.json(
    {
      ok: !hasErrors,
      status: hasErrors ? "partial" : "success",
      stepOneScraping: {
        success: !scrapingError,
        error: scrapingError,
        data: scrapingResult,
      },
      stepTwoAnalysis: {
        success: !analysisError,
        error: analysisError,
        data: analysisResult,
      },
    },
    { status: 200 }
  );
}

