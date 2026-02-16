"use client";

import { useEffect, useState } from "react";
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
            <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr_340px] gap-4">
              {/* Column 1: Poll / stream commands */}
              <div className="bg-black/90 rounded-2xl overflow-hidden shadow-2xl border border-white/10 flex flex-col min-h-[400px] lg:min-h-[360px]">
                <div className="px-4 py-3 border-b border-white/10">
                  <span className="text-white font-semibold">
                    Stream commands
                  </span>
                </div>
                <div className="p-4 flex-1 flex flex-col gap-4 overflow-auto">
                  {/* Polls */}
                  <section>
                    <h3 className="text-sm font-medium text-gray-400 mb-2">
                      Polls
                    </h3>
                    <div className="space-y-3">
                      {activePolls.length === 0 &&
                        resolvedPolls.length === 0 && (
                          <p className="text-xs text-gray-500">No polls yet.</p>
                        )}
                      {activePolls.map((p) => (
                        <Poll
                          key={p.id}
                          pollId={p.id}
                          userId={user?.id ?? null}
                        />
                      ))}
                      {resolvedPolls.length > 0 && (
                        <>
                          <h4 className="text-xs font-medium text-gray-500 mt-3">
                            Previous polls
                          </h4>
                          {resolvedPolls.map((p) => (
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
              {/* Kick Stream Embed */}
              <div className="bg-black rounded-2xl overflow-hidden shadow-2xl aspect-video relative min-h-[300px]">
                <iframe
                  src={`https://player.kick.com/${KICK_CHANNEL}?autoplay=true`}
                  className="absolute inset-0 w-full h-full"
                  allowFullScreen
                  allow="autoplay; fullscreen"
                  style={{ border: "none" }}
                  title="Kick stream"
                />

                {/* Stream Overlay Info */}
                <div className="absolute top-4 left-4 flex gap-2 z-10">
                  <span className="px-3 py-1 bg-red-600/90 backdrop-blur-sm text-white text-sm font-medium rounded flex items-center gap-2">
                    <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                    LIVE
                  </span>
                  <span className="px-3 py-1 bg-green-600/90 backdrop-blur-sm text-white text-sm font-medium rounded">
                    AI Monitoring Active
                  </span>
                </div>
              </div>

              {/* Kick Chat Embed */}
              <div className="bg-black/90 rounded-2xl overflow-hidden shadow-2xl border border-white/10 flex flex-col min-h-[400px] lg:min-h-[360px]">
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
