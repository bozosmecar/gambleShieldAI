export const metadata = {
  title: "Gambling Tips & Education | Safe Gambling Guides | GambleShield",
  description:
    "Learn how to gamble safely and responsibly. GambleShield's tips and education section covers gambling strategies, bankroll management, bonus hunting, and responsible gaming.",
  keywords:
    "gambling tips, responsible gambling, safe gambling, gambling strategies, bankroll management, casino education, how to gamble, gambling guides 2026",
  openGraph: {
    title: "Gambling Tips & Education | Safe Gambling Guides | GambleShield",
    description:
      "Learn how to gamble safely and responsibly. Strategies, bankroll management, and responsible gaming guides.",
    url: "https://gamble-shield-ai.vercel.app/blog/tips-and-education",
    siteName: "GambleShield",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Gambling Tips & Education – GambleShield",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Gambling Tips & Education | GambleShield",
    description:
      "Learn how to gamble safely and responsibly. Strategies, bankroll management, and responsible gaming guides.",
    images: ["/og-image.png"],
  },
  alternates: {
    canonical: "https://gamble-shield-ai.vercel.app/blog/tips-and-education",
  },
};

export default function TipsAndEducationLayout({ children }) {
  return children;
}
