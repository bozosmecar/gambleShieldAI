export const dynamic = 'force-static';
export const revalidate = 3600;

const CANONICAL_PRODUCTION_URL = "https://gamble-shield-ai.vercel.app";

function getBaseUrl() {
  // Mirror the precedence used by sitemap.js. Never fall back to VERCEL_URL
  // (preview deployment domains are password protected and break crawlers).
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  const vercelProd = process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "";
  const raw = explicit || vercelProd || CANONICAL_PRODUCTION_URL;
  return raw.replace(/\/+$/, "");
}

export default function robots() {
  const baseUrl = getBaseUrl();

  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/blog", "/about", "/faq", "/stream"],
      disallow: ["/login", "/register", "/profile", "/admin", "/api"],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
