"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import Poll from "@/components/Poll";
import StreamFightVote from "@/components/StreamFightVote";
import { getPolls } from "@/lib/polls";
import { useUserProfile } from "@/hooks/useUserProfile";

// Change channel then hard-refresh (Ctrl+Shift+R) or restart dev server if embed doesn't update
// After changing channel: hard-refresh (Ctrl+Shift+R) or restart dev server if embed does not update
const KICK_CHANNEL = "cct_cs2";

export default function Stream() {
  const { user } = useUserProfile();
  const [activePolls, setActivePolls] = useState([]);
  const [resolvedPolls, setResolvedPolls] = useState([]);
  const streamRef = useRef(null);

  const MAX_POLLS = 10;
  const activeToShow = activePolls.slice(0, MAX_POLLS);
  const resolvedToShow = resolvedPolls.slice(
    0,
    Math.max(0, MAX_POLLS - activeToShow.length),
  );
  const [pollMaxHeight, setPollMaxHeight] = useState(400);

  useEffect(() => {
    const el = streamRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      setPollMaxHeight(el.offsetHeight);
    });
    ro.observe(el);
    setPollMaxHeight(el.offsetHeight);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    async function load() {
      const [active, resolved] = await Promise.all([
        getPolls("active"),
        getPolls("resolved"),
      ]);
      setActivePolls(active);
      setResolvedPolls(resolved);
    }
    load();
  }, []);

  return (
    <>
      {/* Main Content */}
      <main
        className="min-h-screen bg-[url('/stream_background.png')] bg-no-repeat bg-center bg-cover relative"
        style={{ paddingTop: "70px" }}
      >
        <div className="w-[90vw] mx-auto px-4 sm:px-6 lg:px-8 py-12  items-center ">
          {/* Stream Header */}
          <h1 className="text-white text-center font-bold mb-2" style={{ fontSize: "clamp(1.5rem, 3vw, 2.5rem)", textShadow: "0 2px 8px rgba(0,0,0,0.7)" }}>
            Live Casino Gambling Stream on GambleShield
          </h1>
          <p className="text-gray-300 text-center mb-6" style={{ fontSize: "clamp(0.9rem, 1.5vw, 1.1rem)" }}>
            Watch real money slots, bonus hunts &amp; casino strategies – streamed live by experienced players
          </p>

          {/* Kick Stream + Chat */}
          <div className="mb-8 mt-30">
            <div className="grid grid-cols-1 min-[1400px]:grid-cols-[340px_1fr_340px] gap-4 items-start">
              {/* Column 1: Poll - below stream when stacked */}
              <div
                className="order-2 min-[1400px]:order-1 bg-black/90 rounded-2xl overflow-hidden shadow-2xl border border-white/10 flex flex-col min-h-[280px] w-full"
                style={{ maxHeight: pollMaxHeight }}
              >
                <div className="px-4 py-3 border-b border-white/10 shrink-0">
                  <span className="text-white font-semibold">
                    Stream commands
                  </span>
                </div>
                <div className="p-4 flex-1 min-h-0 overflow-y-auto">
                  {/* Polls */}
                  <section>
                    <h3 className="text-sm font-medium text-gray-400 mb-2">
                      Polls
                    </h3>
                    <div className="space-y-3">
                      {activeToShow.length === 0 &&
                        resolvedToShow.length === 0 && (
                          <p className="text-xs text-gray-500">No polls yet.</p>
                        )}
                      {activeToShow.map((p) => (
                        <Poll
                          key={p.id}
                          pollId={p.id}
                          userId={user?.id ?? null}
                        />
                      ))}
                      {resolvedToShow.length > 0 && (
                        <>
                          <h4 className="text-xs font-medium text-gray-500 mt-3">
                            Previous polls
                          </h4>
                          {resolvedToShow.map((p) => (
                            <Poll
                              key={p.id}
                              pollId={p.id}
                              userId={user?.id ?? null}
                            />
                          ))}
                        </>
                      )}
                    </div>
                  </section>
                </div>
              </div>
              {/* Kick Stream Embed - first when stacked */}
              <div
                ref={streamRef}
                className="order-1 min-[1400px]:order-2 bg-black rounded-2xl overflow-hidden shadow-2xl aspect-video relative w-[83vw] max-[1399px]:mx-auto min-[1400px]:w-full min-[1400px]:min-w-[720px]"
              >
                <iframe
                  key={`stream-${KICK_CHANNEL}`}
                  src={`https://player.kick.com/${KICK_CHANNEL}?autoplay=true&_=${KICK_CHANNEL}`}
                  className="absolute inset-0 w-full h-full"
                  allowFullScreen
                  allow="autoplay; fullscreen"
                  style={{ border: "none" }}
                  title="Kick stream"
                />
              </div>

              {/* Kick Chat Embed - below stream when stacked */}
              <div className="order-3 bg-black/90 rounded-2xl overflow-hidden shadow-2xl border border-white/10 flex flex-col min-h-0 min-[1400px]:h-full">
                <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
                  <span className="text-white font-semibold">Kick Chat</span>
                  <a
                    href={`https://kick.com/${KICK_CHANNEL}/chat`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-green-400 hover:text-green-300"
                  >
                    Open in Kick →
                  </a>
                </div>
                <iframe
                  key={`chat-${KICK_CHANNEL}`}
                  src={`https://kick.com/${KICK_CHANNEL}/chatroom?_=${KICK_CHANNEL}`}
                  className="w-full flex-1 min-h-[320px]"
                  style={{ border: "none" }}
                  title="Kick chat"
                />
              </div>
            </div>
          </div>

          <div className="mt-6">
            <StreamFightVote />
          </div>
        </div>
      </main>
    </>
  );
}
