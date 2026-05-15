import path from "node:path";
import { fileURLToPath } from "node:url";

/** @type {import('next').NextConfig} */

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const SUPABASE_HOST = (() => {
  try {
    return new URL(process.env.NEXT_PUBLIC_SUPABASE_URL || "").hostname;
  } catch {
    return null;
  }
})();

const CSP = [
  "default-src 'self'",
  // next/image and external blog images
  "img-src 'self' https: data: blob:",
  // GA / Google Ads / Meta Pixel + Next.js inline runtime
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com https://connect.facebook.net",
  // Kick stream + chat embeds, and our own pages
  "frame-src 'self' https://player.kick.com https://kick.com",
  // Supabase REST + realtime (wss), analytics endpoints
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://www.google-analytics.com https://www.googletagmanager.com https://connect.facebook.net https://www.facebook.com",
  // Google Fonts (next/font/google)
  "font-src 'self' https://fonts.gstatic.com data:",
  // Tailwind injects inline <style> tags; keep 'unsafe-inline' for now
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "geolocation=(), microphone=(), camera=(), payment=(), usb=()",
  },
  { key: "X-DNS-Prefetch-Control", value: "on" },
  { key: "Content-Security-Policy", value: CSP },
];

const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,

  // Pin Turbopack's workspace root to this folder. Next 16.2 stopped inferring
  // it automatically when the repo has no upstream package.json.
  turbopack: {
    root: __dirname,
  },

  images: {
    formats: ["image/avif", "image/webp"],
    qualities: [75, 100],
    // Explicit allow-list. Wildcard hostnames are an open image-proxy/SSRF surface.
    remotePatterns: [
      ...(SUPABASE_HOST
        ? [
            {
              protocol: "https",
              hostname: SUPABASE_HOST,
              pathname: "/storage/v1/object/public/**",
            },
          ]
        : []),
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
    // Don't optimize SVGs (they can carry script and bypass image checks).
    dangerouslyAllowSVG: false,
    contentDispositionType: "attachment",
  },

  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
