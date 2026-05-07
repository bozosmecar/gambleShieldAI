import { getSupabaseClient } from "./supabaseClient";

const ITEMS_BUCKET = "items";
const FALLBACK_IMAGE = "/avatar/level1.png";

/**
 * Resolve an `items.image_path` value to a URL the <Image> component can load.
 *
 * Accepts three shapes so admins can pick whatever's most convenient when
 * inserting a row:
 *   1. Static public file:    "/avatar/sword.png"
 *   2. Full URL:              "https://xxx.supabase.co/storage/v1/object/public/items/sword.png"
 *   3. Bucket-relative path:  "items/sword.png"  or  "sword.png"
 *
 * Cases (1) and (2) are returned unchanged; case (3) is resolved to a public
 * URL via the Supabase Storage API.
 *
 * @param {string | null | undefined} imagePath
 * @returns {string}
 */
export function resolveItemImage(imagePath) {
  if (!imagePath) return FALLBACK_IMAGE;
  const trimmed = String(imagePath).trim();
  if (!trimmed) return FALLBACK_IMAGE;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (trimmed.startsWith("/")) return trimmed;

  const supabase = getSupabaseClient();
  if (!supabase) return trimmed;

  // "items/sword.png" → bucket="items", path="sword.png"
  // "sword.png"        → bucket="items", path="sword.png"
  let bucket = ITEMS_BUCKET;
  let path = trimmed;
  const slash = trimmed.indexOf("/");
  if (slash > 0) {
    bucket = trimmed.slice(0, slash);
    path = trimmed.slice(slash + 1);
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data?.publicUrl || trimmed;
}

/**
 * @typedef {Object} Item
 * @property {string}  id
 * @property {string}  name
 * @property {string|null} description
 * @property {string}  image_path     e.g. '/avatar/sword.png'
 * @property {number}  cost           Shield-token price
 * @property {number}  slot_row       0..2
 * @property {number}  slot_col       0..2
 * @property {boolean} active
 * @property {string}  created_at
 */

/**
 * @typedef {Object} UserItem
 * @property {string}  item_id
 * @property {boolean} is_equipped
 * @property {string}  acquired_at
 * @property {Item}    item
 */

/**
 * Catalogue of every active item (i.e. anything the shop can show).
 * Returns [] if the table doesn't exist yet (migration not run).
 * @returns {Promise<Item[]>}
 */
export async function fetchItems() {
  const supabase = getSupabaseClient();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("items")
    .select(
      "id, name, description, image_path, cost, slot_row, slot_col, active, created_at",
    )
    .eq("active", true)
    .order("cost", { ascending: true });
  if (error) {
    console.warn("fetchItems error:", error.message);
    return [];
  }
  return data || [];
}

/**
 * Items owned by `userId`, joined with the items catalogue. Each row carries
 * an `item` sub-object with the catalogue fields.
 * @param {string} userId
 * @returns {Promise<UserItem[]>}
 */
export async function fetchUserItems(userId) {
  const supabase = getSupabaseClient();
  if (!supabase || !userId) return [];
  const { data, error } = await supabase
    .from("user_items")
    .select(
      `
        item_id,
        is_equipped,
        acquired_at,
        item:items (
          id, name, description, image_path, cost, slot_row, slot_col, active
        )
      `,
    )
    .eq("user_id", userId)
    .order("acquired_at", { ascending: false });
  if (error) {
    console.warn("fetchUserItems error:", error.message);
    return [];
  }
  return (data || []).filter((row) => row.item);
}

/**
 * Buy an item with the current user's Shield tokens. The RPC is atomic:
 * tokens are deducted and the row inserted in a single transaction.
 *
 * @param {string} itemId
 * @returns {Promise<{ ok: boolean, balance: number | null, error: string | null }>}
 */
export async function purchaseItem(itemId) {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return { ok: false, balance: null, error: "Supabase client unavailable." };
  }
  if (!itemId) {
    return { ok: false, balance: null, error: "No item id." };
  }
  try {
    const { data, error } = await supabase.rpc("purchase_item", {
      p_item_id: itemId,
    });
    if (error) {
      console.warn("purchaseItem RPC error:", error);
      return {
        ok: false,
        balance: null,
        error:
          error.message ||
          error.details ||
          error.hint ||
          (error.code ? `Postgres error ${error.code}` : "Purchase failed."),
      };
    }
    // RPC returns a single integer = new shield_tokens balance.
    const balance =
      typeof data === "number"
        ? data
        : Array.isArray(data) && typeof data[0] === "number"
          ? data[0]
          : null;
    return { ok: true, balance, error: null };
  } catch (err) {
    console.warn("purchaseItem threw:", err);
    return { ok: false, balance: null, error: err?.message || String(err) };
  }
}

/**
 * Equip an owned item. The DB-side RPC auto-unequips whichever item was
 * already on the same (slot_row, slot_col).
 *
 * @param {string} itemId
 * @returns {Promise<{ ok: boolean, error: string | null }>}
 */
export async function equipItem(itemId) {
  const supabase = getSupabaseClient();
  if (!supabase) return { ok: false, error: "Supabase client unavailable." };
  if (!itemId) return { ok: false, error: "No item id." };
  try {
    const { error } = await supabase.rpc("equip_item", { p_item_id: itemId });
    if (error) {
      console.warn("equipItem RPC error:", error);
      return {
        ok: false,
        error: error.message || error.details || "Could not equip item.",
      };
    }
    return { ok: true, error: null };
  } catch (err) {
    console.warn("equipItem threw:", err);
    return { ok: false, error: err?.message || String(err) };
  }
}

/**
 * Unequip an owned item.
 * @param {string} itemId
 * @returns {Promise<{ ok: boolean, error: string | null }>}
 */
export async function unequipItem(itemId) {
  const supabase = getSupabaseClient();
  if (!supabase) return { ok: false, error: "Supabase client unavailable." };
  if (!itemId) return { ok: false, error: "No item id." };
  try {
    const { error } = await supabase.rpc("unequip_item", { p_item_id: itemId });
    if (error) {
      console.warn("unequipItem RPC error:", error);
      return {
        ok: false,
        error: error.message || error.details || "Could not unequip item.",
      };
    }
    return { ok: true, error: null };
  } catch (err) {
    console.warn("unequipItem threw:", err);
    return { ok: false, error: err?.message || String(err) };
  }
}
