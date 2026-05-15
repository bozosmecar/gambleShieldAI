import "./globals.css";
import { Libre_Baskerville } from "next/font/google";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AgeVerification from "@/components/AgeVerification";
import CookieConsent from "@/components/CookieConsent";
import AnalyticsLoader from "@/components/AnalyticsLoader";

const libreBaskerville = Libre_Baskerville({
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata = {
  metadataBase: new URL("https://gamble-shield-ai.vercel.app"),
  title: "GambleShield | Best Casino List & Online Casino Reviews 2026",
  description:
    "Discover the best online casinos tested by real players. GambleShield offers transparent casino reviews, exclusive welcome bonuses, live gambling streams, and responsible gambling tools. Find the top licensed casinos with the best payouts.",
  keywords:
    "best casino list, best online casinos, online casino reviews, casino bonuses, casino welcome bonus, licensed casinos, responsible gambling, gambling platform, slot games, live casino, casino streams, top casinos 2026",
  openGraph: {
    title: "GambleShield | Best Casino List & Online Casino Reviews 2026",
    description:
      "Discover the best online casinos tested by real players. Transparent reviews, live streams, and exclusive casino bonuses.",
    url: "https://gamble-shield-ai.vercel.app",
    siteName: "GambleShield",
    type: "website",
    locale: "en_US",
    images: [
      {
        url: "/1_Home%20page/ShieldLogo.png",
        width: 553,
        height: 451,
        alt: "GambleShield – Best Casino List & Online Casino Reviews 2026",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "GambleShield | Best Casino List & Online Casino Reviews 2026",
    description:
      "Discover the best online casinos tested by real players. Transparent reviews, live streams, and exclusive casino bonuses.",
    images: ["/1_Home%20page/ShieldLogo.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
    },
  },
  alternates: {
    canonical: "https://gamble-shield-ai.vercel.app",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": "https://gamble-shield-ai.vercel.app/#website",
      name: "GambleShield",
      url: "https://gamble-shield-ai.vercel.app",
      description:
        "Best casino list and responsible gambling platform. Transparent reviews, live streams, and exclusive casino bonuses.",
      potentialAction: {
        "@type": "SearchAction",
        target:
          "https://gamble-shield-ai.vercel.app/blog?q={search_term_string}",
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@type": "Organization",
      "@id": "https://gamble-shield-ai.vercel.app/#organization",
      name: "GambleShield",
      url: "https://gamble-shield-ai.vercel.app",
      description:
        "Independent gambling platform built by experienced players and analysts. We review online casinos, stream real gameplay, and help players find the best casino bonuses.",
    },
    {
      "@type": "ItemList",
      "@id": "https://gamble-shield-ai.vercel.app/#casinolist",
      name: "Best Casino List 2026",
      description:
        "Top-rated online casinos reviewed and tested by GambleShield experts.",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Powerup Casino",
          description: "Welcome bonus up to $3000. 6000+ slots, crypto support, licensed & fair.",
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Tonybet",
          description: "Welcome bonus up to $300. Licensed in Estonia, great sportsbook.",
        },
        {
          "@type": "ListItem",
          position: 3,
          name: "Mr Green Casino",
          description: "Welcome bonus up to $100. 1500+ slots, licensed in Malta.",
        },
        {
          "@type": "ListItem",
          position: 4,
          name: "Casino Action",
          description: "Welcome bonus up to $1250. Great loyalty program, licensed & fair.",
        },
        {
          "@type": "ListItem",
          position: 5,
          name: "mBit Casino",
          description: "Welcome bonus up to 3 BTC. 2000+ slots, crypto casino, licensed in Curaçao.",
        },
        {
          "@type": "ListItem",
          position: 6,
          name: "Casumo",
          description: "Welcome bonus up to $300. Licensed in Malta & UK, reliable payouts.",
        },
        {
          "@type": "ListItem",
          position: 7,
          name: "Spinline",
          description: "Welcome package up to €1800 + 800 free spins. Licensed & fair.",
        },
      ],
    },
  ],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={libreBaskerville.className} style={{ fontWeight: 500 }}>
        <AgeVerification />
        <CookieConsent />
        <AnalyticsLoader />
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  );
}
