import { getSources } from "@/lib/supabase/queries";

export async function GET(): Promise<Response> {
  const sources = await getSources();
  return Response.json(sources, { status: 200 });
}
