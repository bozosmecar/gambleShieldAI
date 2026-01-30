"use client";

import Image from "next/image";
import Link from "next/link";

export default function Stream() {
  const streamUsername = "qcy"; // Hard-coded to qcy

  return (
    <>
      {/* Navbar */}
      <nav
        className="fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-md shadow-md z-[100]"
        style={{ height: "70px" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
          {/* Logo/Brand */}
          <div className="flex items-center">
            <Link href="/">
              <h1
                className="font-bold text-green-600 cursor-pointer"
                style={{ fontSize: "clamp(1.25rem, 2.5vw, 1.75rem)" }}
              >
                GambleShield
              </h1>
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="flex items-center gap-6 sm:gap-8">
            <Link
              href="/"
              className="text-gray-700 hover:text-green-600 font-medium transition-colors"
              style={{ fontSize: "clamp(0.9rem, 1.5vw, 1.1rem)" }}
            >
              Home
            </Link>
            <Link
              href="/profile"
              className="text-gray-700 hover:text-green-600 font-medium transition-colors"
              style={{ fontSize: "clamp(0.9rem, 1.5vw, 1.1rem)" }}
            >
              Profile
            </Link>
            <Link
              href="/stream"
              className="text-green-600 font-bold transition-colors border-b-2 border-green-600"
              style={{ fontSize: "clamp(0.9rem, 1.5vw, 1.1rem)" }}
            >
              Stream
            </Link>
            <Link
              href="/register"
              className="text-gray-700 hover:text-green-600 font-medium transition-colors"
              style={{ fontSize: "clamp(0.9rem, 1.5vw, 1.1rem)" }}
            >
              Register
            </Link>
            <Link
              href="/login"
              className="text-gray-700 hover:text-green-600 font-medium transition-colors"
              style={{ fontSize: "clamp(0.9rem, 1.5vw, 1.1rem)" }}
            >
              Login
            </Link>
          </div>
        </div>
      </nav>

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
