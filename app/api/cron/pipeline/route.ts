import type { NextRequest } from "next/server";

import { processScheduledResultsForSources } from "@/lib/oxylabs/scheduler";
import { getActiveSources } from "@/lib/supabase/queries";

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

  const sources = await getActiveSources();
  const result = await processScheduledResultsForSources(sources);

  return Response.json({
    ok: true,
    step: "scheduled-results-processing",
    ...result,
  });
}
