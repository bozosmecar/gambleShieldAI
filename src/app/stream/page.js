"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import Poll from "@/components/Poll";
import { getPolls } from "@/lib/polls";
import { useUserProfile } from "@/hooks/useUserProfile";

const KICK_CHANNEL = "pgl";

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
        className="min-h-screen bg-[url('/stream_background.png')] bg-no-repeat bg-center bg-cover"
        style={{ paddingTop: "70px" }}
      >
        <div className="w-[90vw] mx-auto px-4 sm:px-6 lg:px-8 py-12  items-center ">
          {/* Stream Header */}

          {/* Kick Stream + Chat */}
          <div className="mb-8">
            <div className="mt-[20%]"></div>
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
                className="order-1 min-[1400px]:order-2 bg-black rounded-2xl overflow-hidden shadow-2xl aspect-video relative min-w-[720px] w-full"
              >
                <iframe
                  src={`https://player.kick.com/${KICK_CHANNEL}?autoplay=true`}
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
                  src={`https://kick.com/${KICK_CHANNEL}/chatroom`}
                  className="w-full flex-1 min-h-[320px]"
                  style={{ border: "none" }}
                  title="Kick chat"
                />
              </div>
            </div>
          </div>
          <div
            className="grid grid-cols-[1fr_1fr_1fr] items-center max-w-[1000px] mx-auto"
            style={{
              backgroundImage: "url('/4_Login/lev1/kuca_1.png')",
              backgroundRepeat: "no-repeat",
              backgroundPosition: "center",
              backgroundSize: "contain",
              minHeight: "500px",
              width: "100%",
              minWidth: "1000px",
            }}
          >
            <div className="flex items-center justify-center mt-[60%]">
              <Image
                src="/4_Login/lev1/lik.png"
                alt="Kuca 1"
                width={160}
                height={160}
              />
            </div>
            <div className="col-start-3 flex items-center justify-center  h-[200px] opacity-50  mr-[30%]         ">
              <div className="flex flex-col items-start justify-center space-y-2 px-6 py-4 bg-black/85 rounded-xl shadow-2xl border-2 border-white/10 h-[180px] w-[380px]">
                <span className="text-base font-extrabold text-gray-100 drop-shadow-lg">
                  Username:{" "}
                  <span className="font-mono text-white font-black">
                    Guest123
                  </span>
                </span>
                <span className="text-sm font-extrabold text-gray-100 drop-shadow-lg">
                  Tier:{" "}
                  <span className="font-black text-yellow-400 drop-shadow-md">
                    Gold
                  </span>
                </span>
                <span className="text-sm font-extrabold text-gray-100 drop-shadow-lg">
                  Bodovi:{" "}
                  <span className="font-black text-green-400 drop-shadow-md">
                    8920
                  </span>
                </span>
                <span className="text-sm font-extrabold text-gray-100 drop-shadow-lg">
                  XP:{" "}
                  <span className="font-black text-blue-400 drop-shadow-md">
                    2350 / 5000
                  </span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
