import { createBrowserClient } from "@supabase/ssr";

// Supabase client for browser (client component) use, e.g. the Google sign-in
// button. Only the public anon key is exposed here.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
