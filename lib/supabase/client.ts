import { createBrowserClient } from "@supabase/ssr";

/**
 * Returns a Supabase client for use in Client Components.
 *
 * Uses the public anon key — never contains the service-role key.
 * Call this inside a component (or a custom hook) so each render gets a fresh
 * singleton managed by @supabase/ssr.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
