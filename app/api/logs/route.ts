import { getLogs } from "@/lib/supabase/queries";

export async function GET(): Promise<Response> {
  const logs = await getLogs();
  return Response.json(logs, { status: 200 });
}
