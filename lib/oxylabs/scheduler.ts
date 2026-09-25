import { createServiceClient } from "@/lib/supabase/service";
import { getActiveSources } from "@/lib/supabase/queries";
import {
  createOxylabsSchedule,
  deactivateOxylabsSchedule,
  getJobResultHtml,
  getScheduleRuns,
  listOxylabsSchedules,
} from "@/lib/oxylabs/client";
import { type Source } from "@/lib/supabase/types";
import { processHomepageHtmlForSource } from "@/lib/scraping/pipeline";

export async function syncOxylabsSchedulesForSources(sources: Source[] = []): Promise<{
  created: number;
  activated: number;
  deactivated: number;
  total: number;
}> {
  const client = createServiceClient();
  const remoteScheduleIds = await listOxylabsSchedules();
  const activeSources = sources.length > 0 ? sources : await getActiveSources();
  const { data: existingRows, error } = await client
    .from("oxylabs_schedules")
    .select("id, source_id, oxylabs_schedule_id, active");

  if (error) {
    throw new Error(error.message);
  }

  const storedIds = new Set((existingRows ?? []).map((row) => String(row.oxylabs_schedule_id)));
  let created = 0;
  let activated = 0;

  for (const source of activeSources) {
    const existing = (existingRows ?? []).find((row) => row.source_id === source.id);

    if (existing) {
      storedIds.add(String(existing.oxylabs_schedule_id));
      activated += 1;
      continue;
    }

    const endTime = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 19)
      .replace("T", " ");

    const schedule = await createOxylabsSchedule({
      url: source.listing_url,
      cron: "0 * * * *",
      endTime,
    });

    const scheduleId = String(schedule.schedule_id ?? "");
    if (!scheduleId) {
      continue;
    }

    storedIds.add(scheduleId);
    created += 1;

    await client.from("oxylabs_schedules").insert({
      source_id: source.id,
      oxylabs_schedule_id: scheduleId,
      active: true,
    });
  }

  const deactivated = await deactivateMissingSchedules(remoteScheduleIds, storedIds);

  return {
    created,
    activated,
    deactivated,
    total: activeSources.length,
  };
}

async function deactivateMissingSchedules(
  remoteScheduleIds: string[],
  storedIds: Set<string>
): Promise<number> {
  const missing = remoteScheduleIds.filter((scheduleId) => !storedIds.has(scheduleId));

  let deactivated = 0;
  for (const scheduleId of missing) {
    try {
      await deactivateOxylabsSchedule(scheduleId);
      deactivated += 1;
    } catch (error) {
      console.error("[scheduler] deactivateMissingSchedules failed:", error);
    }
  }

  return deactivated;
}

export async function processScheduledResultsForSources(sources: Source[] = []): Promise<{
  processedJobs: number;
  insertedArticles: number;
  processedSources: number;
}> {
  const client = createServiceClient();
  const activeSources = sources.length > 0 ? sources : await getActiveSources();
  const { data: scheduleRows, error } = await client
    .from("oxylabs_schedules")
    .select("id, source_id, oxylabs_schedule_id");

  if (error) {
    throw new Error(error.message);
  }

  let processedJobs = 0;
  let insertedArticles = 0;

  for (const row of scheduleRows ?? []) {
    const source = activeSources.find((entry) => entry.id === row.source_id);
    if (!source) {
      continue;
    }

    const runs = await getScheduleRuns(String(row.oxylabs_schedule_id));

    for (const run of runs) {
      for (const job of run.jobs ?? []) {
        if (job.result_status !== "done") {
          continue;
        }

        const jobId = String(job.id ?? "");
        if (!jobId) {
          continue;
        }

        processedJobs += 1;
        const html = await getJobResultHtml(jobId);
        if (!html) {
          continue;
        }

        const summary = await processHomepageHtmlForSource(source, html, 5);
        insertedArticles += summary.articlesInserted;
      }
    }
  }

  return {
    processedJobs,
    insertedArticles,
    processedSources: activeSources.length,
  };
}
