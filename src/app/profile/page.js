"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useUserProfile } from "@/hooks/useUserProfile";
import { getSupabaseClient } from "@/lib/supabaseClient";
import {
  levelFromXp,
  levelProgress,
  avatarForLevel,
  adminAdjustXp,
  getRecentXpEvents,
  levelName,
  MAX_LEVEL,
} from "@/lib/xp";
import {
  fetchItems,
  fetchUserItems,
  purchaseItem,
  equipItem,
  unequipItem,
  resolveItemImage,
} from "@/lib/items";

// Fixed equipment grid. Items in /public/avatar/* land on slots (row, col) ∈ 0..2.
const GRID_SIZE = 3;
// How many slots show in the bottom Inventory grid (owned items + empty placeholders).
const INVENTORY_VISIBLE_SLOTS = 8;

export default function Profile() {
  const router = useRouter();
  const { user, profile, loading, isAdmin } = useUserProfile();

  const [stats, setStats] = useState({ pollsVoted: 0, casinosRegistered: 0 });
  const [statsLoading, setStatsLoading] = useState(true);
  const [events, setEvents] = useState([]);

  // Local override so admin XP adjustments reflect instantly in the UI
  // without waiting for the next profile fetch.
  const [xpOverride, setXpOverride] = useState(null);
  const [xpAdjusting, setXpAdjusting] = useState(false);
  const [xpMessage, setXpMessage] = useState({ type: "", text: "" });

  // Inventory + shop state, all DB-backed.
  const [catalogue, setCatalogue] = useState([]);
  const [userItems, setUserItems] = useState([]);
  const [inventoryLoading, setInventoryLoading] = useState(true);
  const [pendingItemId, setPendingItemId] = useState(null);
  const [shopOpen, setShopOpen] = useState(false);
  const [tokenOverride, setTokenOverride] = useState(null);
  const [shopMessage, setShopMessage] = useState({ type: "", text: "" });

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwLoading, setPwLoading] = useState(false);
  const [pwMessage, setPwMessage] = useState({ type: "", text: "" });

  // Stats + activity
  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!user?.id) {
        setStatsLoading(false);
        return;
      }
      const supabase = getSupabaseClient();
      if (!supabase) {
        setStatsLoading(false);
        return;
      }

      const [pollsRes, casinosRes, evts] = await Promise.all([
        supabase
          .from("poll_votes")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user.id),
        supabase
          .from("user_casino_registrations")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user.id),
        getRecentXpEvents(user.id, 10),
      ]);
      if (cancelled) return;
      setStats({
        pollsVoted: pollsRes.count ?? 0,
        casinosRegistered: casinosRes.count ?? 0,
      });
      setEvents(evts);
      setStatsLoading(false);
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  // Items catalogue + ownership
  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!user?.id) {
        setInventoryLoading(false);
        return;
      }
      setInventoryLoading(true);
      const [allItems, owned] = await Promise.all([
        fetchItems(),
        fetchUserItems(user.id),
      ]);
      if (cancelled) return;
      setCatalogue(allItems);
      setUserItems(owned);
      setInventoryLoading(false);
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  const xp = xpOverride ?? Number(profile?.experience ?? 0);
  const level =
    xpOverride !== null
      ? levelFromXp(xpOverride)
      : Number(profile?.level ?? levelFromXp(xp));
  const progress = useMemo(() => levelProgress(xp), [xp]);
  const isMaxLevel = level >= MAX_LEVEL;
  const avatarSrc = avatarForLevel(level);

  const tokens = tokenOverride ?? Number(profile?.shield_tokens ?? 0);

  const equippedItems = useMemo(
    () =>
      userItems.filter((ui) => ui.is_equipped && ui.item).map((ui) => ui.item),
    [userItems],
  );
  const ownedItemIds = useMemo(
    () => new Set(userItems.map((ui) => ui.item_id)),
    [userItems],
  );

  const memberSince = profile?.created_at ? new Date(profile.created_at) : null;
  const daysAsMember = memberSince
    ? Math.max(
        1,
        Math.floor(
          (Date.now() - memberSince.getTime()) / (1000 * 60 * 60 * 24),
        ),
      )
    : 0;

  // ---------------------------------------------------------------------------
  // Inventory actions
  // ---------------------------------------------------------------------------
  const handleEquipToggle = async (item) => {
    if (!item || pendingItemId) return;
    const ownerRow = userItems.find((ui) => ui.item_id === item.id);
    if (!ownerRow) return;

    const wasEquipped = !!ownerRow.is_equipped;
    setPendingItemId(item.id);

    // Optimistic update: flip this row, and if equipping, also unequip any
    // other item the user has on the same slot (mirroring the SQL RPC).
    const previous = userItems;
    setUserItems((prev) =>
      prev.map((ui) => {
        if (ui.item_id === item.id) return { ...ui, is_equipped: !wasEquipped };
        if (
          !wasEquipped &&
          ui.is_equipped &&
          ui.item &&
          ui.item.slot_row === item.slot_row &&
          ui.item.slot_col === item.slot_col
        ) {
          return { ...ui, is_equipped: false };
        }
        return ui;
      }),
    );

    const result = wasEquipped
      ? await unequipItem(item.id)
      : await equipItem(item.id);

    if (!result.ok) {
      setUserItems(previous);
      setShopMessage({
        type: "error",
        text: result.error || "Could not update equipped state.",
      });
    } else {
      setShopMessage({ type: "", text: "" });
    }
    setPendingItemId(null);
  };

  const handleBuy = async (item) => {
    if (!item || pendingItemId) return;
    if (ownedItemIds.has(item.id)) return;
    if (tokens < item.cost) {
      setShopMessage({
        type: "error",
        text: `You need ${item.cost - tokens} more Shield tokens.`,
      });
      return;
    }

    setPendingItemId(item.id);
    setShopMessage({ type: "", text: "" });

    const result = await purchaseItem(item.id);
    if (!result.ok) {
      setShopMessage({
        type: "error",
        text: result.error || "Could not purchase item.",
      });
      setPendingItemId(null);
      return;
    }

    if (typeof result.balance === "number") {
      setTokenOverride(result.balance);
    }

    // Refetch ownership so the new row (with all joined item fields) appears.
    if (user?.id) {
      const fresh = await fetchUserItems(user.id);
      setUserItems(fresh);
    }
    setShopMessage({ type: "success", text: `Purchased ${item.name}.` });
    setPendingItemId(null);
  };

  const handleAdjustXp = async (delta) => {
    if (!user?.id || xpAdjusting) return;
    setXpAdjusting(true);
    setXpMessage({ type: "", text: "" });

    const prevLevel = level;
    const reason =
      delta > 0 ? `Admin +${delta} XP test` : `Admin ${delta} XP test`;
    const { ok, data, error } = await adminAdjustXp(user.id, delta, reason);

    if (!ok || !data) {
      setXpAdjusting(false);
      setXpMessage({
        type: "error",
        text: error
          ? `Could not adjust XP: ${error}`
          : "Could not adjust XP. Make sure you're an admin and the migration is applied.",
      });
      return;
    }

    const newXp = Number(data.experience ?? 0);
    const newLevel = Number(data.level ?? levelFromXp(newXp));
    setXpOverride(newXp);

    let msg = delta > 0 ? `+${delta} XP awarded.` : `${delta} XP applied.`;
    if (newLevel > prevLevel) msg += ` Level up: ${prevLevel} → ${newLevel}!`;
    else if (newLevel < prevLevel)
      msg += ` Level down: ${prevLevel} → ${newLevel}.`;
    setXpMessage({ type: "success", text: msg });

    // Refresh activity feed so the new event appears (only positive grants log).
    if (delta > 0) {
      const fresh = await getRecentXpEvents(user.id, 10);
      setEvents(fresh);
    }
    setXpAdjusting(false);
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwMessage({ type: "", text: "" });

    if (newPassword.length < 6) {
      setPwMessage({
        type: "error",
        text: "Password must be at least 6 characters.",
      });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwMessage({ type: "error", text: "Passwords do not match." });
      return;
    }

    const supabase = getSupabaseClient();
    if (!supabase) {
      setPwMessage({ type: "error", text: "Service unavailable." });
      return;
    }

    setPwLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (error) {
        setPwMessage({ type: "error", text: error.message });
        return;
      }
      setPwMessage({ type: "success", text: "Password updated successfully." });
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setPwMessage({
        type: "error",
        text: err.message || "Something went wrong.",
      });
    } finally {
      setPwLoading(false);
    }
  };

  const handleLogout = async () => {
    const supabase = getSupabaseClient();
    if (supabase) await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  if (loading) {
    return (
      <main
        className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-amber-50"
        style={{ paddingTop: "70px" }}
      >
        <div className="max-w-6xl mx-auto px-4 py-12">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="animate-pulse space-y-4">
              <div className="h-6 bg-gray-200 rounded w-1/3" />
              <div className="h-4 bg-gray-200 rounded w-1/2" />
              <div className="h-4 bg-gray-200 rounded w-2/3" />
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <main
        className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-amber-50"
        style={{ paddingTop: "70px" }}
      >
        <div className="max-w-6xl mx-auto px-4 py-12">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <p className="text-gray-600 mb-4">
              You need to log in to see your profile.
            </p>
            <Link
              href="/login"
              className="inline-block px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-lg transition-colors"
            >
              Log in
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main
      className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-amber-50"
      style={{ paddingTop: "70px" }}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
        {/* HERO */}
        <section className="relative overflow-hidden rounded-2xl shadow-lg bg-gradient-to-br from-[#b2041d] via-[#c8181c] to-[#e03313] text-white">
          {/* Character image as soft full-card background */}
          <div className="absolute inset-0 pointer-events-none">
            <Image
              key={`${avatarSrc}-bg`}
              src={avatarSrc}
              alt=""
              fill
              sizes="100vw"
              className="object-cover object-center opacity-20 blur-sm scale-110"
              priority
            />
          </div>
          <div
            className="absolute inset-0 opacity-25 pointer-events-none"
            style={{
              backgroundImage:
                "radial-gradient(circle at 80% 0%, white 0%, transparent 45%), linear-gradient(180deg, rgba(178,4,29,0.4), rgba(224,51,19,0.4))",
            }}
          />

          {/* Hero info row */}
          <div className="relative p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="relative shrink-0 w-24 h-24 sm:w-28 sm:h-28 rounded-2xl ring-4 ring-white/30 bg-white/10 shadow-md overflow-hidden">
              <Image
                key={`${avatarSrc}-mini`}
                src={avatarSrc}
                alt={`Level ${level} character`}
                fill
                sizes="(max-width: 640px) 96px, 112px"
                className="object-contain p-1"
                priority
              />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="text-2xl sm:text-3xl font-extrabold truncate">
                  {profile?.username ?? "Player"}
                </h1>
                {isMaxLevel && (
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-white/20 border border-white/40">
                    MAX
                  </span>
                )}
                {profile?.role === "admin" && (
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-white/15 border border-white/30">
                    Admin
                  </span>
                )}
              </div>
              <p className="text-white/85 text-sm">
                {profile?.email ?? user.email}
              </p>
              {memberSince && (
                <p className="text-white/70 text-xs mt-1">
                  Member since{" "}
                  {memberSince.toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              )}
            </div>

            <div className="flex flex-col sm:items-end gap-2">
              <div className="text-right">
                <div className="text-white/70 text-xs uppercase tracking-wider">
                  Level
                </div>
                <div className="text-5xl sm:text-6xl font-black leading-none">
                  {level}
                </div>
              </div>
              <div className="inline-flex items-center gap-1.5 self-start sm:self-end px-3 py-1.5 rounded-full bg-white/15 border border-white/25 backdrop-blur-sm">
                <ShieldTokenIcon className="w-4 h-4 text-amber-200" />
                <span className="text-sm font-bold tabular-nums">
                  {tokens.toLocaleString()}
                </span>
                <span className="text-[11px] uppercase tracking-wider text-white/75">
                  tokens
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* CHARACTER — only equipped items overlay, no visible grid cells */}
        <section className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
          <div className="flex flex-wrap items-end justify-between gap-3 mb-4">
            <div>
              <h2 className="text-lg font-bold text-gray-800">Character</h2>
              <p className="text-sm text-gray-500">
                Equipped items appear over your character. Toggle them in the
                inventory below.
              </p>
            </div>
            <span className="text-xs text-gray-500">
              {equippedItems.length} equipped
            </span>
          </div>

          <div className="relative mx-auto aspect-square w-full max-w-[560px] rounded-2xl overflow-hidden border border-gray-200 bg-gradient-to-br from-amber-50 via-white to-amber-100 shadow-inner">
            <Image
              key={`${avatarSrc}-big`}
              src={avatarSrc}
              alt={`Level ${level} character`}
              fill
              sizes="(max-width: 640px) 100vw, 560px"
              className="object-contain p-4 drop-shadow-xl"
              priority
            />

            {/* Equipped items overlay — invisible grid, items float at their slot */}
            <div
              className="absolute inset-0 grid gap-2 p-3 pointer-events-none"
              style={{
                gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
                gridTemplateRows: `repeat(${GRID_SIZE}, 1fr)`,
              }}
              aria-hidden="true"
            >
              {equippedItems.map((item) => {
                // slot_row / slot_col are 0-indexed; CSS grid is 1-indexed.
                const r = Math.min(
                  Math.max(0, Number(item.slot_row) || 0),
                  GRID_SIZE - 1,
                );
                const c = Math.min(
                  Math.max(0, Number(item.slot_col) || 0),
                  GRID_SIZE - 1,
                );
                return (
                  <div
                    key={item.id}
                    className="relative"
                    style={{ gridRow: r + 1, gridColumn: c + 1 }}
                  >
                    <Image
                      src={resolveItemImage(item.image_path)}
                      alt={item.name}
                      fill
                      sizes="180px"
                      className="object-contain drop-shadow-[0_4px_10px_rgba(0,0,0,0.35)]"
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* INVENTORY — click items to equip / unequip */}
        <section className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
          <div className="flex flex-wrap items-end justify-between gap-2 mb-4">
            <div>
              <h2 className="text-lg font-bold text-gray-800">Inventory</h2>
              <p className="text-sm text-gray-500">
                Click an item to equip or unequip it on your character.
              </p>
            </div>
            <span className="text-xs text-gray-500">
              {userItems.length} owned
            </span>
          </div>

          {inventoryLoading ? (
            <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-3">
              {Array.from({ length: INVENTORY_VISIBLE_SLOTS }).map((_, i) => (
                <div
                  key={i}
                  className="aspect-square rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 animate-pulse"
                />
              ))}
            </div>
          ) : userItems.length === 0 ? (
            <div className="text-center py-10 px-4 border-2 border-dashed border-gray-200 rounded-xl">
              <p className="text-gray-600 text-sm mb-2">
                No items yet. Visit the shop below to pick something up.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-3">
              {Array.from({
                length: Math.max(INVENTORY_VISIBLE_SLOTS, userItems.length),
              }).map((_, i) => {
                const ui = userItems[i];
                const item = ui?.item;
                const equipped = !!ui?.is_equipped;
                const isPending = !!item && pendingItemId === item.id;
                return (
                  <button
                    key={ui?.item_id ?? `empty-${i}`}
                    type="button"
                    onClick={() => item && handleEquipToggle(item)}
                    disabled={!item || isPending}
                    title={
                      item
                        ? `${item.name} — click to ${equipped ? "unequip" : "equip"}`
                        : "Empty slot"
                    }
                    className={`relative aspect-square rounded-xl border-2 transition-all group ${
                      item
                        ? equipped
                          ? "border-[#b2041d] bg-gradient-to-br from-amber-100 to-amber-200 shadow-md ring-2 ring-[#b2041d]/30 cursor-pointer"
                          : "border-gray-200 bg-white hover:border-[#b2041d]/40 hover:shadow-md cursor-pointer"
                        : "border-dashed border-gray-200 bg-gray-50 cursor-default"
                    } ${isPending ? "opacity-60" : ""}`}
                  >
                    {item ? (
                      <Image
                        src={resolveItemImage(item.image_path)}
                        alt={item.name}
                        fill
                        sizes="(max-width: 640px) 25vw, (max-width: 1024px) 16vw, 12vw"
                        className="object-contain p-2 transition-transform group-hover:scale-110"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-gray-300 text-2xl select-none">
                        +
                      </div>
                    )}
                    {equipped && (
                      <span className="absolute -top-1 -right-1 px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-[#b2041d] text-white shadow">
                        ✓
                      </span>
                    )}
                    {item && (
                      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 translate-y-full opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap text-xs bg-gray-900 text-white px-2 py-1 rounded shadow-lg z-10">
                        {item.name}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </section>

        {/* SHOP — collapsible dropdown */}
        <section className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <button
            type="button"
            onClick={() => setShopOpen((v) => !v)}
            aria-expanded={shopOpen}
            className="w-full flex items-center justify-between gap-4 p-6 sm:p-8 text-left hover:bg-amber-50/40 transition-colors"
          >
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-gray-800">Shop</h2>
                <span className="text-xs text-gray-500">
                  {catalogue.length} item{catalogue.length === 1 ? "" : "s"}
                </span>
              </div>
              <p className="text-sm text-gray-500 mt-0.5">
                Spend your Shield tokens on cosmetics for your character.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200">
                <ShieldTokenIcon className="w-4 h-4" />
                <span className="text-sm font-bold tabular-nums">
                  {tokens.toLocaleString()}
                </span>
              </span>
              <span
                className={`text-gray-500 transition-transform ${shopOpen ? "rotate-180" : ""}`}
                aria-hidden="true"
              >
                ▾
              </span>
            </div>
          </button>

          {shopOpen && (
            <div className="border-t border-gray-100 p-6 sm:p-8">
              {shopMessage.text && (
                <div
                  className={`mb-4 p-3 rounded-lg text-sm ${
                    shopMessage.type === "error"
                      ? "bg-red-50 text-red-700 border border-red-200"
                      : "bg-green-50 text-green-800 border border-green-200"
                  }`}
                >
                  {shopMessage.text}
                </div>
              )}

              {inventoryLoading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div
                      key={i}
                      className="aspect-[3/4] rounded-xl border border-gray-200 bg-gray-50 animate-pulse"
                    />
                  ))}
                </div>
              ) : catalogue.length === 0 ? (
                <div className="text-center py-10 px-4 border-2 border-dashed border-gray-200 rounded-xl">
                  <p className="text-gray-600 text-sm">
                    No items available right now.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {catalogue.map((item) => {
                    const owned = ownedItemIds.has(item.id);
                    const isPending = pendingItemId === item.id;
                    const canAfford = tokens >= item.cost;
                    return (
                      <div
                        key={item.id}
                        className="flex flex-col rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                      >
                        <div className="relative aspect-square bg-gradient-to-br from-amber-50 via-white to-amber-100">
                          <Image
                            src={resolveItemImage(item.image_path)}
                            alt={item.name}
                            fill
                            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                            className="object-contain p-4"
                          />
                          {owned && (
                            <span className="absolute top-2 right-2 px-2 py-1 text-[10px] font-bold rounded-full bg-[#b2041d] text-white shadow">
                              OWNED
                            </span>
                          )}
                        </div>
                        <div className="p-3 flex-1 flex flex-col gap-2">
                          <div>
                            <h3 className="text-sm font-bold text-gray-900">
                              {item.name}
                            </h3>
                            {item.description && (
                              <p className="text-xs text-gray-500 line-clamp-2 mt-0.5">
                                {item.description}
                              </p>
                            )}
                          </div>
                          <div className="mt-auto flex items-center justify-between gap-2">
                            <span className="inline-flex items-center gap-1 text-sm font-bold text-gray-900">
                              <ShieldTokenIcon className="w-4 h-4 text-amber-500" />
                              {item.cost.toLocaleString()}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleBuy(item)}
                              disabled={owned || isPending || !canAfford}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                                owned
                                  ? "bg-gray-100 text-gray-500 cursor-default"
                                  : !canAfford
                                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                    : "bg-gradient-to-r from-[#b2041d] to-[#e03313] text-white hover:opacity-90 shadow-sm"
                              } ${isPending ? "opacity-60" : ""}`}
                            >
                              {owned
                                ? "Owned"
                                : isPending
                                  ? "Buying…"
                                  : !canAfford
                                    ? "Not enough"
                                    : "Buy"}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </section>

        {/* LEVEL / XP PROGRESS */}
        <section className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
          <div className="flex flex-wrap items-end justify-between gap-2 mb-3">
            <div>
              <h2 className="text-lg font-bold text-gray-800">
                {levelName(level)}
              </h2>
              <p className="text-sm text-gray-500">
                {progress.nextLevelXp == null
                  ? "You've reached the highest level. Legendary."
                  : `${progress.xpIntoLevel.toLocaleString()} / ${progress.xpForLevel.toLocaleString()} XP to ${levelName(level + 1)}`}
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-extrabold text-gray-900">
                {xp.toLocaleString()} XP
              </div>
              <div className="text-xs text-gray-500">total earned</div>
            </div>
          </div>

          <div
            className="relative h-4 w-full rounded-full bg-gray-100 overflow-hidden"
            role="progressbar"
            aria-valuenow={progress.percent}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              className="h-full bg-gradient-to-r from-[#b2041d] via-[#c8181c] to-[#e03313] transition-[width] duration-700 ease-out"
              style={{ width: `${progress.percent}%` }}
            />
          </div>

          <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs text-gray-600">
            <div>
              Voted in poll{" "}
              <span className="font-semibold text-gray-900">+10 XP</span>
            </div>
            <div>
              Casino registration{" "}
              <span className="font-semibold text-gray-900">+50 XP</span>
            </div>
            <div>
              Daily check-in{" "}
              <span className="font-semibold text-gray-900">soon</span>
            </div>
          </div>
        </section>

        {/* ADMIN XP TEST PANEL */}
        {isAdmin && (
          <section className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 border-l-4 border-[#b2041d]">
            <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-lg font-bold text-gray-800">
                    Admin: XP controls
                  </h2>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[#b2041d] text-white">
                    Admin only
                  </span>
                </div>
                <p className="text-sm text-gray-500">
                  Adjust your own XP to test the level system. The character
                  image and progress bar update automatically.
                </p>
              </div>
            </div>

            {xpMessage.text && (
              <div
                className={`mb-4 p-3 rounded-lg text-sm ${
                  xpMessage.type === "error"
                    ? "bg-red-50 text-red-700 border border-red-200"
                    : "bg-green-50 text-green-800 border border-green-200"
                }`}
              >
                {xpMessage.text}
              </div>
            )}

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => handleAdjustXp(100)}
                disabled={xpAdjusting}
                className="px-5 py-2.5 bg-gradient-to-r from-[#b2041d] to-[#e03313] hover:opacity-90 disabled:opacity-60 text-white font-bold rounded-lg shadow-md transition-opacity"
              >
                {xpAdjusting ? "Working…" : "+100 XP"}
              </button>
              <button
                type="button"
                onClick={() => handleAdjustXp(-100)}
                disabled={xpAdjusting || xp <= 0}
                className="px-5 py-2.5 border-2 border-[#b2041d] text-[#b2041d] hover:bg-[#b2041d]/5 disabled:opacity-50 disabled:cursor-not-allowed font-bold rounded-lg transition-colors"
              >
                {xpAdjusting ? "Working…" : "−100 XP"}
              </button>
              <span className="text-xs text-gray-500 ml-auto">
                XP can&apos;t go below 0. Negative adjustments aren&apos;t
                logged in the activity feed.
              </span>
            </div>
          </section>
        )}

        {/* STATS GRID */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Polls voted"
            value={statsLoading ? "…" : stats.pollsVoted}
          />
          <StatCard
            label="Casinos registered"
            value={statsLoading ? "…" : stats.casinosRegistered}
          />
          <StatCard label="Days as member" value={daysAsMember || "—"} />
          <StatCard label="Total XP" value={xp.toLocaleString()} />
        </section>

        {/* TWO-COLUMN: ACTIVITY + ACCOUNT */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* RECENT ACTIVITY */}
          <section className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-800">
                Recent activity
              </h2>
              <span className="text-xs text-gray-500">XP history</span>
            </div>
            {events.length === 0 ? (
              <div className="text-center py-10 px-4 border-2 border-dashed border-gray-200 rounded-xl">
                <p className="text-gray-600 text-sm mb-2">No XP earned yet.</p>
                <p className="text-gray-400 text-xs">
                  Vote in a poll on the home page to start leveling up.
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-100">
                {events.map((e) => (
                  <li
                    key={e.id}
                    className="py-3 flex items-center justify-between gap-4"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">
                        {e.reason}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(e.created_at).toLocaleString()}
                      </p>
                    </div>
                    <span className="shrink-0 text-sm font-bold text-[#b2041d]">
                      +{e.amount} XP
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* RESPONSIBLE GAMBLING */}
          <section className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
            <h2 className="text-lg font-bold text-gray-800 mb-1">
              Stay in control
            </h2>
            <p className="text-sm text-gray-500 mb-4">
              GambleShield is built around responsible play. Use these tools
              whenever you need them.
            </p>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/faq"
                  className="block px-3 py-2 rounded-lg border border-gray-200 hover:border-[#b2041d] hover:bg-amber-50 transition-colors text-gray-800"
                >
                  Helplines & support resources
                </Link>
              </li>
              <li>
                <Link
                  href="/blog/tips-and-education"
                  className="block px-3 py-2 rounded-lg border border-gray-200 hover:border-[#b2041d] hover:bg-amber-50 transition-colors text-gray-800"
                >
                  Tips &amp; education
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="block px-3 py-2 rounded-lg border border-gray-200 hover:border-[#b2041d] hover:bg-amber-50 transition-colors text-gray-800"
                >
                  Our mission
                </Link>
              </li>
            </ul>
          </section>
        </div>

        {/* ACCOUNT & SECURITY */}
        <section className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
          <h2 className="text-lg font-bold text-gray-800 mb-1">
            Account &amp; security
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            Manage your login details.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <span className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                Username
              </span>
              <p className="text-gray-900 font-semibold">
                {profile?.username ?? "—"}
              </p>
            </div>
            <div>
              <span className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                Email
              </span>
              <p className="text-gray-900 font-semibold break-all">
                {profile?.email ?? user.email ?? "—"}
              </p>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-6">
            <h3 className="text-base font-bold text-gray-800 mb-1">
              Change password
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Choose a new password for your account.
            </p>

            {pwMessage.text && (
              <div
                className={`mb-4 p-3 rounded-lg text-sm ${
                  pwMessage.type === "error"
                    ? "bg-red-50 text-red-700 border border-red-200"
                    : "bg-green-50 text-green-800 border border-green-200"
                }`}
              >
                {pwMessage.text}
              </div>
            )}

            <form
              onSubmit={handleChangePassword}
              className="space-y-4 max-w-md"
            >
              <div>
                <label
                  htmlFor="newPassword"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  New password
                </label>
                <input
                  type="password"
                  id="newPassword"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition"
                  placeholder="At least 6 characters"
                />
              </div>
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Confirm new password
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition"
                  placeholder="Repeat your new password"
                />
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="submit"
                  disabled={pwLoading}
                  className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-60 text-white font-semibold rounded-lg transition duration-200"
                >
                  {pwLoading ? "Updating…" : "Update password"}
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="px-6 py-2.5 border border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold rounded-lg transition-colors"
                >
                  Log out
                </button>
              </div>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="bg-white rounded-2xl shadow-md p-4 sm:p-5 border border-gray-100">
      <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
        {label}
      </div>
      <div className="mt-1 text-2xl sm:text-3xl font-extrabold text-gray-900">
        {value}
      </div>
    </div>
  );
}

function ShieldTokenIcon({ className = "w-4 h-4" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 2.5 4 5v6.2c0 4.6 3.2 8.7 8 10.3 4.8-1.6 8-5.7 8-10.3V5l-8-2.5Z" />
    </svg>
  );
}
