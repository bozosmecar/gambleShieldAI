import { getArticles } from '@/lib/blogArticles';

// Next.js automatically serves sitemap.js with Content-Type: application/xml.
// We force this route to be statically generated at build time so the response
// is a plain, uncompressed XML file (no RSC/streaming overhead, no Vary header
// pollution from the App Router). Google Search Console is sensitive to both.
export const dynamic = 'force-static';
export const revalidate = 3600;

const CANONICAL_PRODUCTION_URL = 'https://gamble-shield-ai.vercel.app';

function getBaseUrl() {
  // Priority:
  // 1. Explicit override (set this in Vercel env: NEXT_PUBLIC_SITE_URL).
  // 2. Vercel's canonical production domain (stable across deploys).
  // 3. Hard-coded canonical fallback.
  //
  // We intentionally DO NOT fall back to VERCEL_URL because that variable
  // points to the per-deployment preview URL (e.g.
  // gamble-shield-xxxxx-aleas-projects-...vercel.app), which is password
  // protected by Vercel preview protection. Linking the sitemap to those
  // URLs makes Google fetch a login page (binary/HTML) instead of real pages.
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  const vercelProd = process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : '';
  const raw = explicit || vercelProd || CANONICAL_PRODUCTION_URL;
  return raw.replace(/\/+$/, '');
}

function toSafeLastModified(value, fallback, now) {
  const parsed = value ? new Date(value) : null;
  const candidate =
    parsed instanceof Date && !Number.isNaN(parsed.getTime()) ? parsed : fallback;
  return candidate.getTime() > now.getTime() ? now : candidate;
}

export default async function sitemap() {
  const baseUrl = getBaseUrl();
  const now = new Date();
  const fallbackLastModified = now;

  const staticRoutes = [
    {
      url: `${baseUrl}/`,
      lastModified: fallbackLastModified,
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: fallbackLastModified,
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/blog/best-casinos`,
      lastModified: fallbackLastModified,
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/blog/tips-and-education`,
      lastModified: fallbackLastModified,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/stream`,
      lastModified: fallbackLastModified,
      changeFrequency: 'weekly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: fallbackLastModified,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/faq`,
      lastModified: fallbackLastModified,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ];

  let articles = [];
  try {
    articles = await getArticles();
  } catch (error) {
    // Never fail sitemap generation because of upstream content fetch issues.
    console.error("sitemap getArticles failed:", error);
    articles = [];
  }
  const blogRoutes = articles
    .filter((post) => !post.hidden)
    .map((post) => ({
      url: `${baseUrl}/blog/${post.slug || post.id}`,
      lastModified: toSafeLastModified(post.date, fallbackLastModified, now),
      changeFrequency: 'monthly',
      priority: 0.6,
    }));

  // Prevent duplicate URLs in case slug/id collisions happen in content data.
  const uniqueRoutes = new Map();
  [...staticRoutes, ...blogRoutes].forEach((route) => {
    if (!uniqueRoutes.has(route.url)) uniqueRoutes.set(route.url, route);
  });

  return Array.from(uniqueRoutes.values());
}
