import type { NextRequest } from "next/server";

import { processScheduledResultsForSources } from "@/lib/oxylabs/scheduler";
import { getActiveSources } from "@/lib/supabase/queries";

function rejectUnauthorized(request: NextRequest): Response | null {
  const secret = request.headers.get("x-KIWI-admin-secret");
  const expected = process.env.KIWI_ADMIN_SECRET;

  if (!expected || !secret || secret !== expected) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  return null;
}

export async function POST(request: NextRequest): Promise<Response> {
  const unauthorized = rejectUnauthorized(request);
  if (unauthorized) {
    return unauthorized;
  }

  const sources = await getActiveSources();
  const result = await processScheduledResultsForSources(sources);

  return Response.json({ ok: true, ...result }, { status: 200 });
}
