"use client";

import { useEffect, useState } from "react";

/**
 * Reads cookieConsent from localStorage and re-checks whenever the user
 * accepts/declines via the CookieConsent banner (listens to the custom
 * "cookieConsentChanged" event dispatched by CookieConsent.js).
 *
 * HOW TO ADD ANALYTICS:
 *   Replace the comment block below with your actual script injection.
 *   Example for Google Analytics (GA4):
 *
 *   const GA_ID = "G-XXXXXXXXXX";
 *
 *   // Inject <script async src="https://www.googletagmanager.com/gtag/js?id=GA_ID">
 *   const scriptTag = document.createElement("script");
 *   scriptTag.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
 *   scriptTag.async = true;
 *   document.head.appendChild(scriptTag);
 *
 *   // Initialise gtag
 *   window.dataLayer = window.dataLayer || [];
 *   function gtag() { window.dataLayer.push(arguments); }
 *   gtag("js", new Date());
 *   gtag("config", GA_ID);
 */

export default function AnalyticsLoader() {
  const [consent, setConsent] = useState(null);

  useEffect(() => {
    const readConsent = () => {
      setConsent(localStorage.getItem("cookieConsent"));
    };

    readConsent();
    window.addEventListener("cookieConsentChanged", readConsent);
    return () => window.removeEventListener("cookieConsentChanged", readConsent);
  }, []);

  useEffect(() => {
    if (consent !== "accepted") return;

    // ── Inject analytics scripts here once consent is given ──────────────
    // (nothing loaded yet — add your GA4 / GTM snippet here when ready)
    // ─────────────────────────────────────────────────────────────────────
  }, [consent]);

  return null;
}
