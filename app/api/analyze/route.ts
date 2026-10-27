import type { NextRequest } from "next/server";

import { runAnalysisPipeline } from "@/lib/ai/pipeline";

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

  let payload: {
    articleIds?: string[];
    limit?: number;
    batchSize?: number;
    modelName?: string;
  } = {};

  try {
    payload = (await request.json()) as typeof payload;
  } catch {
    payload = {};
  }

  const summary = await runAnalysisPipeline({
    articleIds: Array.isArray(payload.articleIds) ? payload.articleIds : undefined,
    limit: typeof payload.limit === "number" ? payload.limit : undefined,
    batchSize: typeof payload.batchSize === "number" ? payload.batchSize : undefined,
    modelName: typeof payload.modelName === "string" ? payload.modelName : undefined,
  });

  return Response.json(summary, { status: 200 });
}
