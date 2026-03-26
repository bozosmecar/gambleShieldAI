export const metadata = {
  title: "Blog | News, Guides & Gambling Insights | GambleShield",
  description:
    "Read the latest gambling news, casino guides, and responsible gaming insights from GambleShield. Updated regularly by experienced players and analysts.",
  keywords:
    "gambling blog, casino news, gambling guides, casino tips, online gambling insights, responsible gambling blog",
  openGraph: {
    title: "Blog | News, Guides & Gambling Insights | GambleShield",
    description:
      "Read the latest gambling news, casino guides, and responsible gaming insights from GambleShield.",
    url: "https://gamble-shield-ai.vercel.app/blog",
    siteName: "GambleShield",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "GambleShield Blog – Gambling News & Guides",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Blog | GambleShield",
    description:
      "Read the latest gambling news, casino guides, and responsible gaming insights from GambleShield.",
    images: ["/og-image.png"],
  },
  alternates: {
    canonical: "https://gamble-shield-ai.vercel.app/blog",
  },
};

export default function BlogLayout({ children }) {
  return children;
}
