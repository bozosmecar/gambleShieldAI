import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Browser-side singleton. Creating multiple clients in the same tab causes
// them to fight over the auth-token lock in localStorage, which surfaces as
// "Lock ... was released because another request stole it" warnings and
// aborted requests (empty blog pages, half-loaded profiles, etc.).
let _client = null;

/**
 * Returns the (singleton) Supabase browser client. Stores the session in
 * cookies so the middleware can read it server-side.
 *
 * @returns {import('@supabase/supabase-js').SupabaseClient | null}
 */
export function getSupabaseClient() {
  if (!supabaseUrl || !supabaseAnonKey) return null;
  if (_client) return _client;

  // On the server, never cache: each request gets its own client. Server-side
  // code in this app uses `lib/supabaseAdmin.js` or the cookie-aware helper in
  // `lib/supabase-server.js`, so this branch should rarely be hit, but guard
  // anyway in case a "use client" import is rendered during SSR.
  if (typeof window === "undefined") {
    return createBrowserClient(supabaseUrl, supabaseAnonKey);
  }

  _client = createBrowserClient(supabaseUrl, supabaseAnonKey);
  return _client;
}
