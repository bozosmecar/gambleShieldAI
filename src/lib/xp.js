import { getSupabaseClient } from "./supabaseClient";

// Mirror of the SQL CASE in 20260430000002_xp_level_5x100.sql:
// 5 levels aligned with the existing tier thresholds (1000 / 3000 / 7000 / 15000).
//   L1: 0–999  L2: 1000–2999  L3: 3000–6999  L4: 7000–14999  L5: 15000+
export const MAX_LEVEL = 5;
const LEVEL_THRESHOLDS = [0, 1000, 3000, 7000, 15000];

// Display name for each level (1:1 with the tier_type enum in the DB).
export const LEVEL_NAMES = ["Bronze", "Silver", "Gold", "Platinum", "Diamond"];

/**
 * Compute level from total XP (mirror of DB generated column).
 * @param {number} xp
 * @returns {number} level (1..5)
 */
export function levelFromXp(xp) {
  const safe = Math.max(0, Math.floor(Number(xp) || 0));
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (safe >= LEVEL_THRESHOLDS[i]) return i + 1;
  }
  return 1;
}

/**
 * Display name for a level (Bronze, Silver, Gold, Platinum, Diamond).
 * @param {number} level
 * @returns {string}
 */
export function levelName(level) {
  const idx = Math.max(1, Math.min(MAX_LEVEL, Math.floor(Number(level) || 1))) - 1;
  return LEVEL_NAMES[idx];
}

/**
 * Progress info for the current level.
 * At MAX_LEVEL, percent=100 and nextLevelXp is null.
 * @param {number} xp
 * @returns {{ level: number, currentLevelXp: number, nextLevelXp: number | null,
 *            xpIntoLevel: number, xpForLevel: number, percent: number }}
 */
export function levelProgress(xp) {
  const safe = Math.max(0, Math.floor(Number(xp) || 0));
  const level = levelFromXp(safe);
  const currentLevelXp = LEVEL_THRESHOLDS[level - 1] ?? 0;
  const nextLevelXp = level >= MAX_LEVEL ? null : LEVEL_THRESHOLDS[level];

  if (nextLevelXp == null) {
    return {
      level,
      currentLevelXp,
      nextLevelXp: null,
      xpIntoLevel: 0,
      xpForLevel: 0,
      percent: 100,
    };
  }

  const xpIntoLevel = safe - currentLevelXp;
  const xpForLevel = nextLevelXp - currentLevelXp;
  const percent = Math.max(0, Math.min(100, Math.round((100 * xpIntoLevel) / xpForLevel)));
  return { level, currentLevelXp, nextLevelXp, xpIntoLevel, xpForLevel, percent };
}

/**
 * Path to the character image for a given level. Just maps level N → /avatar/levelN.png.
 * Drop a new levelN.png into /public/avatar and it'll be picked up automatically.
 * @param {number} level
 * @returns {string}
 */
export function avatarForLevel(level) {
  const safe = Math.max(1, Math.floor(Number(level) || 1));
  return `/avatar/level${safe}.png`;
}

/**
 * Award XP to the currently authenticated user via the SECURITY DEFINER RPC.
 * Best-effort: never throws; returns updated stats on success or null on failure.
 *
 * @param {number} amount
 * @param {string} reason
 * @param {object} [metadata]
 * @returns {Promise<{ experience: number, level: number, tier: string } | null>}
 */
export async function awardXp(amount, reason, metadata = null) {
  const supabase = getSupabaseClient();
  if (!supabase) return null;
  try {
    const { data, error } = await supabase.rpc("award_xp", {
      p_amount: amount,
      p_reason: reason,
      p_metadata: metadata,
    });
    if (error) {
      console.warn("awardXp RPC error:", error.message);
      return null;
    }
    if (Array.isArray(data) && data.length > 0) return data[0];
    return data ?? null;
  } catch (err) {
    console.warn("awardXp threw:", err?.message || err);
    return null;
  }
}

/**
 * Admin-only: adjust a user's XP by a positive or negative amount.
 * Calls the SECURITY DEFINER `admin_award_xp` RPC, which clamps total XP at 0
 * and only writes an xp_events row when the amount is positive.
 *
 * @param {string} userId
 * @param {number} amount  positive to grant, negative to deduct
 * @param {string} reason
 * @param {object} [metadata]
 * @returns {Promise<{
 *   ok: boolean,
 *   data: { experience: number, level: number, tier: string } | null,
 *   error: string | null
 * }>}
 */
export async function adminAdjustXp(userId, amount, reason, metadata = null) {
  const supabase = getSupabaseClient();
  if (!supabase) return { ok: false, data: null, error: "Supabase client unavailable." };
  if (!userId) return { ok: false, data: null, error: "No user id." };
  if (!amount) return { ok: false, data: null, error: "Amount must be non-zero." };

  try {
    const { data, error } = await supabase.rpc("admin_award_xp", {
      p_user_id: userId,
      p_amount: amount,
      p_reason: reason,
      p_metadata: metadata,
    });
    if (error) {
      console.warn("adminAdjustXp RPC error:", error);
      const detail =
        error.message ||
        error.details ||
        error.hint ||
        (error.code ? `Postgres error ${error.code}` : "Unknown RPC error");
      return { ok: false, data: null, error: detail };
    }
    const row = Array.isArray(data) ? data[0] : data;
    return { ok: true, data: row ?? null, error: null };
  } catch (err) {
    console.warn("adminAdjustXp threw:", err);
    return { ok: false, data: null, error: err?.message || String(err) };
  }
}

/**
 * Fetch recent XP events for the current user.
 * @param {string} userId
 * @param {number} [limit=10]
 * @returns {Promise<Array<{ id: string, amount: number, reason: string, created_at: string, metadata: any }>>}
 */
export async function getRecentXpEvents(userId, limit = 10) {
  const supabase = getSupabaseClient();
  if (!supabase || !userId) return [];
  const { data, error } = await supabase
    .from("xp_events")
    .select("id, amount, reason, metadata, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) {
    // Table may not exist yet (migration not run) — silent fallback.
    return [];
  }
  return data || [];
}
