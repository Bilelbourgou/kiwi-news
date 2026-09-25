import { createClient } from "@supabase/supabase-js";

/**
 * Service-role Supabase client — bypasses RLS.
 *
 * Use ONLY in API Route Handlers (`app/api/**`).
 * Never import this in Server Components or Client Components — it carries the
 * service-role secret key which must not be sent to the browser.
 *
 * The SUPABASE_SERVICE_ROLE_KEY env var must be set server-side only
 * (no NEXT_PUBLIC_ prefix).
 */
export function createServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars. " +
        "Ensure they are set server-side and not prefixed with NEXT_PUBLIC_."
    );
  }

  return createClient(url, key, {
    auth: {
      // Service clients don't use Supabase Auth sessions
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
