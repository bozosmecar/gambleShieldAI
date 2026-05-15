"use client";

import { getSupabaseClient } from "@/lib/supabaseClient";

const CHANNEL_NAME = "stream-fight-room-v1";

export const FIGHT_EVENTS = Object.freeze({
  SESSION_START: "session_start",
  SESSION_END: "session_end",
  TROOP_ADD: "troop_add",
  COMBAT_STEP: "combat_step",
  STATE_REQUEST: "state_request",
  STATE_SNAPSHOT: "state_snapshot",
});

/**
 * Subscribes to the stream fight broadcast channel.
 * Returns a controller with `send(eventName, payload)` and `unsubscribe()`.
 * `handlers` is an object keyed by event name from FIGHT_EVENTS.
 *
 * @param {Partial<Record<string, (payload: any) => void>>} handlers
 * @param {(status: string) => void} [onStatus]
 */
export function subscribeFightChannel(handlers, onStatus) {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return {
      send: async () => {},
      unsubscribe: () => {},
    };
  }

  const channel = supabase.channel(CHANNEL_NAME, {
    config: { broadcast: { self: true } },
  });

  Object.values(FIGHT_EVENTS).forEach((eventName) => {
    channel.on("broadcast", { event: eventName }, (payload) => {
      const cb = handlers?.[eventName];
      if (cb) cb(payload.payload);
    });
  });

  channel.subscribe((status) => {
    if (onStatus) onStatus(status);
  });

  return {
    send: async (eventName, payload) => {
      try {
        await channel.send({ type: "broadcast", event: eventName, payload });
      } catch (err) {
        console.error("Fight channel send failed:", err);
      }
    },
    unsubscribe: () => {
      try {
        supabase.removeChannel(channel);
      } catch {
        // ignore
      }
    },
  };
}
