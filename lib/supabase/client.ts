import { createClient } from "@supabase/supabase-js";

/**
 * Browser-side Supabase client (singleton).
 * Uses the public anon key — safe to expose to the browser.
 */
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
