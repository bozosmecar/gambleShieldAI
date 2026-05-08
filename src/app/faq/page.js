import FaqClient from "./FaqClient";

const BASE_URL = "https://gamble-shield-ai.vercel.app";
const FAQ_URL = `${BASE_URL}/faq`;

export const metadata = {
  title: "FAQ | GambleShield",
  description:
    "Frequently asked questions about GambleShield reviews, live stream features, accounts, points, and responsible gambling safety.",
  alternates: {
    canonical: FAQ_URL,
  },
  openGraph: {
    title: "FAQ | GambleShield",
    description:
      "Answers to the most common GambleShield questions about stream, points, reviews, and player safety.",
    url: FAQ_URL,
    type: "website",
  },
};

export default function FaqPage() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "FAQPage",
        "@id": `${FAQ_URL}#faq`,
        url: FAQ_URL,
        mainEntity: [
          {
            "@type": "Question",
            name: "What is GambleShield?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "GambleShield is an independent gambling review platform built by experienced players. We provide in-depth casino analysis, transparent affiliate links, 24/7 live streaming, and an RPG-based user experience.",
            },
          },
          {
            "@type": "Question",
            name: "Is GambleShield free to use?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Yes. Creating an account, watching streams, earning points, and reading casino reviews is free.",
            },
          },
          {
            "@type": "Question",
            name: "Is GambleShield affiliated with any casinos?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Yes. GambleShield has transparent affiliate partnerships with vetted and licensed casinos, but partnerships do not influence review outcomes.",
            },
          },
          {
            "@type": "Question",
            name: "How is GambleShield different from other casino review sites?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "GambleShield combines live casino streaming, RPG-style user progression, hands-on gameplay testing, and transparent reviews by experienced players.",
            },
          },
          {
            "@type": "Question",
            name: "Where can I watch the GambleShield live stream?",
            acceptedAnswer: {
              "@type": "Answer",
              text: `You can watch on ${BASE_URL}/stream where GambleShield streams 24/7 casino gameplay, slot reviews, and community interaction.`,
            },
          },
          {
            "@type": "Question",
            name: "Can I suggest which slot gets played on stream?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Yes. Registered users can vote in active stream polls to influence which slot is played next.",
            },
          },
          {
            "@type": "Question",
            name: "How do I create a GambleShield account?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Use the Register page and sign up with email and password.",
            },
          },
          {
            "@type": "Question",
            name: "How do I earn GambleShield points?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Users earn points by participating in stream-related actions, voting in polls, and other profile activities.",
            },
          },
          {
            "@type": "Question",
            name: "What can I do with my points?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Points are used for stream voting and character progression on the user profile.",
            },
          },
          {
            "@type": "Question",
            name: "How do you choose which casinos to recommend?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Recommendations are based on hands-on testing, licensing checks, bonus term analysis, payout behavior, and complaint history.",
            },
          },
          {
            "@type": "Question",
            name: "Are the casino links on GambleShield safe?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Yes. Listed casinos are vetted for licensing, fair terms, and payout reliability before being published.",
            },
          },
        ],
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${FAQ_URL}#breadcrumb`,
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: BASE_URL,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "FAQ",
            item: FAQ_URL,
          },
        ],
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqSchema),
        }}
      />
      <FaqClient />
    </>
  );
}
