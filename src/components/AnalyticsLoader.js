"use client";

import { useEffect, useState, useRef } from "react";
import { usePathname } from "next/navigation";

/**
 * Needs env (see .env.local):
 *   NEXT_PUBLIC_GOOGLE_ADS_ID  — Google Ads tag, e.g. AW-1234567890
 *   NEXT_PUBLIC_META_PIXEL_ID  — Meta Pixel ID (digits only)
 *
 * Scripts load only after the user accepts cookies (CookieConsent).
 */

const GOOGLE_ADS_ID = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID?.trim() || "";
const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID?.trim() || "";

const GTAG_SCRIPT_ID = "gs-gtag-js";

function initDataLayer() {
  window.dataLayer = window.dataLayer || [];
  if (typeof window.gtag !== "function") {
    window.gtag = function gtag() {
      window.dataLayer.push(arguments);
    };
  }
}

function loadGoogleAds() {
  if (!GOOGLE_ADS_ID || typeof document === "undefined") return;

  initDataLayer();

  let script = document.getElementById(GTAG_SCRIPT_ID);
  if (!script) {
    window.gtag("js", new Date());
    script = document.createElement("script");
    script.id = GTAG_SCRIPT_ID;
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GOOGLE_ADS_ID)}`;
    document.head.appendChild(script);
  }

  window.gtag("config", GOOGLE_ADS_ID, {
    page_path:
      typeof window !== "undefined"
        ? `${window.location.pathname}${window.location.search}`
        : undefined,
  });
}

function bootstrapMetaFbq() {
  if (typeof window === "undefined" || window.fbq) return;
  !(function (f, b, e, v, n, t, s) {
    if (f.fbq) return;
    n = f.fbq = function () {
      n.callMethod
        ? n.callMethod.apply(n, arguments)
        : n.queue.push(arguments);
    };
    if (!f._fbq) f._fbq = n;
    n.push = n;
    n.loaded = !0;
    n.version = "2.0";
    n.queue = [];
    t = b.createElement(e);
    t.async = !0;
    t.src = v;
    s = b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t, s);
  })(
    window,
    document,
    "script",
    "https://connect.facebook.net/en_US/fbevents.js"
  );
}

function loadMetaPixel() {
  if (!META_PIXEL_ID || typeof window === "undefined") return;

  bootstrapMetaFbq();
  if (!window.__gsMetaPixelInited) {
    window.fbq("init", META_PIXEL_ID);
    window.__gsMetaPixelInited = true;
  }
}

function syncGtagPagePath() {
  if (!GOOGLE_ADS_ID || typeof window === "undefined" || typeof window.gtag !== "function")
    return;
  window.gtag("config", GOOGLE_ADS_ID, {
    page_path: `${window.location.pathname}${window.location.search}`,
  });
}

function syncMetaPageView() {
  if (!META_PIXEL_ID || typeof window.fbq !== "function") return;
  window.fbq("track", "PageView");
}

export default function AnalyticsLoader() {
  const [consent, setConsent] = useState(null);
  const pathname = usePathname();
  const trackersReady = useRef(false);

  useEffect(() => {
    const readConsent = () => {
      setConsent(localStorage.getItem("cookieConsent"));
    };

    readConsent();
    window.addEventListener("cookieConsentChanged", readConsent);
    return () => window.removeEventListener("cookieConsentChanged", readConsent);
  }, []);

  useEffect(() => {
    if (consent !== "accepted") {
      trackersReady.current = false;
      return;
    }
    if (!GOOGLE_ADS_ID && !META_PIXEL_ID) return;

    loadGoogleAds();
    loadMetaPixel();
    trackersReady.current = true;
  }, [consent]);

  useEffect(() => {
    if (consent !== "accepted" || !trackersReady.current) return;
    if (!GOOGLE_ADS_ID && !META_PIXEL_ID) return;

    syncGtagPagePath();
    syncMetaPageView();
  }, [consent, pathname]);

  return null;
}
