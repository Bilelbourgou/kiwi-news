import type { NextRequest } from "next/server";

import { syncOxylabsSchedulesForSources } from "@/lib/oxylabs/scheduler";
import { getActiveSources } from "@/lib/supabase/queries";
import { createServiceClient } from "@/lib/supabase/service";

function rejectUnauthorized(request: NextRequest): Response | null {
  const secret = request.headers.get("x-KIWI-admin-secret");
  const expected = process.env.KIWI_ADMIN_SECRET;

  if (!expected || !secret || secret !== expected) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  return null;
}

export async function GET(): Promise<Response> {
  const client = createServiceClient();
  const { data, error } = await client
    .from("oxylabs_schedules")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json(data ?? [], { status: 200 });
}

export async function POST(request: NextRequest): Promise<Response> {
  const unauthorized = rejectUnauthorized(request);
  if (unauthorized) {
    return unauthorized;
  }

  const sources = await getActiveSources();
  const result = await syncOxylabsSchedulesForSources(sources);

  return Response.json({
    ok: true,
    ...result,
  });
}
