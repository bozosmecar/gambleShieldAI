import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

let adminInstance = null;

/**
 * Server-side only. Uses service role for admin operations (e.g. storage upload).
 * Never expose this client to the browser.
 */
export function getSupabaseAdmin() {
  if (!supabaseUrl || !serviceRoleKey) return null;
  if (!adminInstance) {
    adminInstance = createClient(supabaseUrl, serviceRoleKey);
  }
  return adminInstance;
}
