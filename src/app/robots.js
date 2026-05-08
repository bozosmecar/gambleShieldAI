export default function robots() {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://gamble-shield-ai.vercel.app";

  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/blog", "/about", "/faq", "/stream"],
      disallow: ["/login", "/register", "/profile", "/admin", "/api"],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
