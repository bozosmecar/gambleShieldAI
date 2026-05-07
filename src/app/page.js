import HomeClient from "./HomeClient";

export default function Home() {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://gamble-shield-ai.vercel.app";

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "GambleShield",
    url: baseUrl,
    logo: `${baseUrl}/1_Home page/logo.webp`,
    sameAs: [
      "https://instagram.com/gambleshield",
      "https://twitter.com/gambleshield",
      "https://facebook.com/gambleshield",
      "https://youtube.com/gambleshield",
    ],
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "GambleShield",
    url: baseUrl,
    inLanguage: "en",
    potentialAction: {
      "@type": "SearchAction",
      target: `${baseUrl}/blog?search={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(websiteSchema),
        }}
      />
      <HomeClient />
    </>
  );
}
