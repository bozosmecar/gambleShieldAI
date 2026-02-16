"use client";

import Image from "next/image";
import Link from "next/link";

export default function Stream() {
  const streamUsername = "qcy"; // Hard-coded to qcy

  return (
    <>
      {/* Main Content */}
      <main
        className="min-h-screen bg-[url('/stream_background.png')] bg-no-repeat bg-center bg-cover"
        style={{ paddingTop: "70px" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12  items-center ">
          {/* Stream Header */}

          {/* Kick Stream Embed */}
          <div className="mb-8  ">
            <div className="mt-[20%]"></div>
            <div className="bg-black rounded-2xl overflow-hidden shadow-2xl aspect-video relative  ">
              <iframe
                src={`https://player.kick.com/Naru?autoplay=true`}
                className="w-full h-full"
                allowFullScreen
                allow="autoplay; fullscreen"
                style={{ border: "none" }}
              ></iframe>

              {/* Stream Overlay Info */}
              <div className="absolute top-4 left-4 flex gap-2">
                <span className="px-3 py-1 bg-red-600/90 backdrop-blur-sm text-white text-sm font-medium rounded flex items-center gap-2">
                  <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                  LIVE
                </span>
                <span className="px-3 py-1 bg-green-600/90 backdrop-blur-sm text-white text-sm font-medium rounded">
                  AI Monitoring Active
                </span>
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
