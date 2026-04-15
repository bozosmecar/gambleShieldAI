"use client";

import { useEffect, useSyncExternalStore } from "react";

function subscribe(onStoreChange) {
  window.addEventListener("storage", onStoreChange);
  return () => {
    window.removeEventListener("storage", onStoreChange);
  };
}

function getSnapshot() {
  return !localStorage.getItem("ageVerified");
}

export default function AgeVerification() {
  const visible = useSyncExternalStore(subscribe, getSnapshot, () => false);

  useEffect(() => {
    document.body.style.overflow = visible ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [visible]);

  function handleConfirm() {
    localStorage.setItem("ageVerified", "true");
    window.dispatchEvent(new Event("storage"));
    document.body.style.overflow = "";
  }

  function handleDeny() {
    window.location.href = "https://www.google.com";
  }

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-9999 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

      {/* Card */}
      <div className="relative z-10 mx-4 w-full max-w-md rounded-2xl border border-yellow-500/30 bg-gray-950 p-8 text-center shadow-2xl shadow-black/60">
        {/* Icon */}
        <div className="mb-5 flex justify-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-yellow-500/50 bg-yellow-500/10 text-4xl">
            🎲
          </div>
        </div>

        {/* Title */}
        <h1 className="mb-1 text-3xl font-bold tracking-tight text-white">
          GambleShield
        </h1>
        <p className="mb-6 text-sm font-medium uppercase tracking-widest text-yellow-400">
          Responsible Gambling Platform
        </p>

        {/* Message */}
        <p className="mb-2 text-lg font-semibold text-white">
          Age Verification Required
        </p>
        <p className="mb-8 text-sm leading-relaxed text-gray-400">
          This website contains content related to gambling. You must be{" "}
          <span className="font-bold text-yellow-400">18 years or older</span>{" "}
          to enter. Please confirm your age to continue.
        </p>

        {/* Buttons */}
        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            onClick={handleConfirm}
            className="flex-1 rounded-xl bg-yellow-500 px-6 py-3 font-bold text-black transition-all duration-200 hover:bg-yellow-400 hover:shadow-lg hover:shadow-yellow-500/30 active:scale-95"
          >
            I am 18 or older
          </button>
          <button
            onClick={handleDeny}
            className="flex-1 rounded-xl border border-gray-700 bg-gray-800 px-6 py-3 font-semibold text-gray-300 transition-all duration-200 hover:bg-gray-700 hover:text-white active:scale-95"
          >
            I am under 18
          </button>
        </div>

        {/* Legal note */}
        <p className="mt-6 text-xs text-gray-600">
          By entering this site you confirm you are of legal gambling age in
          your jurisdiction and agree to our Terms &amp; Conditions.
        </p>
      </div>
    </div>
  );
}
