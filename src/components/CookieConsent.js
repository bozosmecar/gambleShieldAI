"use client";

import { useState, useEffect } from "react";

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookieConsent");
    if (!consent) {
      // Small delay so age verification renders first
      const timer = setTimeout(() => setVisible(true), 600);
      return () => clearTimeout(timer);
    }
  }, []);

  function handleAccept() {
    localStorage.setItem("cookieConsent", "accepted");
    window.dispatchEvent(new Event("cookieConsentChanged"));
    setVisible(false);
  }

  function handleDecline() {
    localStorage.setItem("cookieConsent", "declined");
    window.dispatchEvent(new Event("cookieConsentChanged"));
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[9998] px-4 pb-4 sm:px-6">
      <div className="mx-auto max-w-4xl rounded-2xl border border-gray-700 bg-gray-950/95 p-5 shadow-2xl shadow-black/50 backdrop-blur-md sm:flex sm:items-center sm:gap-6">
        {/* Icon + text */}
        <div className="mb-4 flex items-start gap-3 sm:mb-0 sm:flex-1">
          <span className="mt-0.5 text-2xl">🍪</span>
          <div>
            <p className="mb-1 font-semibold text-white">We use cookies</p>
            <p className="text-sm leading-relaxed text-gray-400">
              We use cookies to improve your experience, analyse site traffic, and
              personalise content. By accepting, you agree to our{" "}
              <a
                href="#"
                className="text-yellow-400 underline underline-offset-2 hover:text-yellow-300"
              >
                Cookie Policy
              </a>
              .
            </p>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-3 sm:shrink-0">
          <button
            onClick={handleDecline}
            className="flex-1 rounded-xl border border-gray-700 bg-gray-800 px-5 py-2.5 text-sm font-semibold text-gray-300 transition-all duration-200 hover:bg-gray-700 hover:text-white active:scale-95 sm:flex-none"
          >
            Decline
          </button>
          <button
            onClick={handleAccept}
            className="flex-1 rounded-xl bg-yellow-500 px-5 py-2.5 text-sm font-bold text-black transition-all duration-200 hover:bg-yellow-400 hover:shadow-lg hover:shadow-yellow-500/20 active:scale-95 sm:flex-none"
          >
            Accept All
          </button>
        </div>
      </div>
    </div>
  );
}
