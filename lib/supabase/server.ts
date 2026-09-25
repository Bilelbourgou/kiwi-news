import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Returns a Supabase client for use in Server Components and Route Handlers.
 *
 * Uses the public anon key and respects Supabase RLS via the user's session
 * cookie. Always await `cookies()` before calling this in Next.js 15+.
 *
 * For mutations that need to bypass RLS (scraping, analysis pipeline) use the
 * service-role client from `lib/supabase/service.ts` instead.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // setAll is called from Server Components where cookies can't be set.
            // This is safe to ignore — the middleware handles session refresh.
          }
        },
      },
    }
  );
}
