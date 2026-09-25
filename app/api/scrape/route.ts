import type { NextRequest } from "next/server";

import { runScrapePipeline } from "@/lib/scraping/pipeline";

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

  let payload: { sourceIds?: string[]; limitPerSource?: number } = {};

  try {
    payload = (await request.json()) as { sourceIds?: string[]; limitPerSource?: number };
  } catch {
    payload = {};
  }

  const summary = await runScrapePipeline({
    sourceIds: Array.isArray(payload.sourceIds) ? payload.sourceIds : undefined,
    limitPerSource: typeof payload.limitPerSource === "number" ? payload.limitPerSource : 5,
  });

  return Response.json(summary, { status: 200 });
}
