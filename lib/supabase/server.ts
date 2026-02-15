import { createClient } from "@supabase/supabase-js";

/**
 * Server-side Supabase client factory.
 * Creates a fresh client per request for API route handlers.
 * Uses the public anon key (RLS enforced).
 */
export function createServerSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
