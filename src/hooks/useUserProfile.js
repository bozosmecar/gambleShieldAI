"use client";

import { useEffect, useState } from "react";
import { getSupabaseClient } from "@/lib/supabaseClient";

/**
 * Returns the current auth user and their public.users profile (including role).
 * @returns {{ user: object | null, profile: { role: string } | null, loading: boolean, isAdmin: boolean }}
 */
export function useUserProfile() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = getSupabaseClient();
    if (!supabase) {
      setLoading(false);
      return;
    }

    async function fetchProfile(userId) {
      if (!userId) {
        setProfile(null);
        return;
      }
      // Try the full schema first (with xp/level/tier). If those columns don't
      // exist yet (migration not run), fall back to the minimal column set so
      // the app keeps working.
      let { data, error } = await supabase
        .from("users")
        .select(
          "id, username, email, role, experience, level, tier, shield_tokens, created_at",
        )
        .eq("id", userId)
        .single();

      if (error) {
        const fallback = await supabase
          .from("users")
          .select("id, username, email, role, created_at")
          .eq("id", userId)
          .single();
        data = fallback.data;
      }
      setProfile(data || null);
    }

    let cancelled = false;

    async function init() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (cancelled) return;
        const authUser = session?.user ?? null;
        setUser(authUser);
        await fetchProfile(authUser?.id || null);
      } catch (err) {
        // Benign: another tab / hot reload stole the auth-token lock. Supabase
        // already retries internally; the next onAuthStateChange will repopulate.
        const msg = err?.message || "";
        if (
          err?.name === "AbortError" ||
          msg.includes("aborted") ||
          msg.includes("Lock") ||
          msg.includes("lock")
        ) {
          return;
        }
        console.error("useUserProfile init error:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    init();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (cancelled) return;
      const authUser = session?.user ?? null;
      setUser(authUser);
      fetchProfile(authUser?.id || null).catch(() => {});
    });

    return () => {
      cancelled = true;
      authListener?.unsubscribe?.();
    };
  }, []);

  const isAdmin = profile?.role === "admin";
  return { user, profile, loading, isAdmin };
}
