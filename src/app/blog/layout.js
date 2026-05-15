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
        url: "/1_Home%20page/ShieldLogo.png",
        width: 553,
        height: 451,
        alt: "GambleShield Blog – Gambling News & Guides",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Blog | GambleShield",
    description:
      "Read the latest gambling news, casino guides, and responsible gaming insights from GambleShield.",
    images: ["/1_Home%20page/ShieldLogo.png"],
  },
  alternates: {
    canonical: "https://gamble-shield-ai.vercel.app/blog",
  },
};

export default function BlogLayout({ children }) {
  return children;
}
