"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const FAQ_ITEMS = [
  {
    q: "What is GambleShield?",
    a: (
      <>
        GambleShield is an independent gambling review platform built by
        experienced players. We provide in-depth casino analysis, transparent
        affiliate links, 24/7 live streaming, and a unique RPG-based user
        experience. For players, by players. Browse our{" "}
        <Link href="/blog" className="text-red-600 underline font-semibold">
          blog
        </Link>{" "}
        to learn more.
      </>
    ),
  },
  {
    q: "Is GambleShield free to use?",
    a: "Yes - creating an account, watching streams, earning points, and accessing all casino reviews is completely free.",
  },
  {
    q: "Is GambleShield affiliated with any casinos?",
    a: "Yes, we maintain transparent affiliate partnerships with vetted, licensed casinos. We earn a commission when players register through our links, but this never influences our reviews or rankings.",
  },
  {
    q: "How is GambleShield different from other casino review sites?",
    a: "We combine 24/7 live casino streaming, an RPG character progression system, real hands-on gameplay testing, and transparent reviews - built by people who actually gamble, not just write about it.",
  },
  {
    q: "Where can I watch the GambleShield live stream?",
    a: (
      <>
        Visit the{" "}
        <Link
          href="/stream"
          className="text-red-600 underline font-semibold"
        >
          Stream page
        </Link>{" "}
        on GambleShield. We stream 24/7 on Kick with live casino gameplay, slot
        reviews, and real-time community interaction.
      </>
    ),
  },
  {
    q: "Can I suggest which slot gets played on stream?",
    a: (
      <>
        Yes. Registered users can use their GambleShield points to vote on
        which slot gets played next. Visit the{" "}
        <Link
          href="/stream"
          className="text-red-600 underline font-semibold"
        >
          Stream page
        </Link>{" "}
        to participate in active polls.
      </>
    ),
  },
  {
    q: "How do I create a GambleShield account?",
    a: "Click Register in the navigation bar. All you need is an email and password - it takes under a minute and is completely free.",
  },
  {
    q: "How do I earn GambleShield points?",
    a: (
      <>
        Earn points by watching the live stream, voting on polls, and playing
        mini-games on your{" "}
        <Link
          href="/profile"
          className="text-red-600 underline font-semibold"
        >
          profile
        </Link>
        .
      </>
    ),
  },
  {
    q: "What can I do with my points?",
    a: (
      <>
        Use points to vote on which slot gets played on stream and level up
        your{" "}
        <Link
          href="/profile"
          className="text-red-600 underline font-semibold"
        >
          GambleShield avatar
        </Link>{" "}
        to unlock exclusive features and rewards.
      </>
    ),
  },
  {
    q: "How do you choose which casinos to recommend?",
    a: (
      <>
        Through hands-on testing, mathematical analysis, and thorough due
        diligence - we verify licensing, bonus terms, payout speeds, and player
        complaint history. Read full reviews on our{" "}
        <Link
          href="/blog/best-casinos"
          className="text-red-600 underline font-semibold"
        >
          best casinos
        </Link>{" "}
        page. We never recommend unlicensed or illegitimate casinos.
      </>
    ),
  },
  {
    q: "Are the casino links on GambleShield safe?",
    a: "Yes. Every casino we list is verified for valid licensing (Curacao, MGA, UKGC, Estonia), fair terms, and reliable payouts. We test bonuses ourselves and openly discuss any fine print.",
  },
];

export default function FaqPage() {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://gamble-shield-ai.vercel.app";
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
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
          text: `You can watch on ${baseUrl}/stream where GambleShield streams 24/7 casino gameplay, slot reviews, and community interaction.`,
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
  };

  return (
    <main
      className="relative isolate min-h-screen px-4 pt-28 pb-20 bg-fixed bg-cover bg-center"
      style={{
        backgroundImage: "url(/1_Home%20page/faq_background.webp)",
      }}
    >
      <div className="absolute inset-0 -z-10 bg-black/30" />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqSchema),
        }}
      />
      <div className="max-w-4xl mx-auto">
        <h1
          className="text-center font-bold mb-4 text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.35)]"
          style={{ fontSize: "clamp(2rem, 4vw, 3rem)" }}
        >
          Frequently Asked Questions
        </h1>
        <p
          className="text-center mb-10 font-medium drop-shadow-[0_1px_4px_rgba(0,0,0,0.3)]"
          style={{
            fontSize: "clamp(0.9rem, 1.5vw, 1.05rem)",
            color: "rgba(255,255,255,0.88)",
          }}
        >
          Most common questions about GambleShield, reviews, stream and player safety.
        </p>
        <div className="space-y-3">
          {FAQ_ITEMS.map((item) => (
            <FaqItem key={item.q} question={item.q} answer={item.a} />
          ))}
        </div>
      </div>
    </main>
  );
}

function FaqItem({ question, answer }) {
  const [open, setOpen] = useState(false);
  const contentRef = useRef(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    if (!contentRef.current) return;
    setHeight(open ? contentRef.current.scrollHeight : 0);
  }, [open]);

  return (
    <div className="border border-red-200/70 rounded-xl overflow-hidden bg-white/60 backdrop-blur-[2px] shadow-lg">
      <button
        className="w-full flex items-center justify-between px-6 py-4 text-left font-semibold text-gray-900 hover:bg-white/40 transition-colors duration-200"
        style={{ fontSize: "clamp(0.9rem, 1.5vw, 1.05rem)" }}
        onClick={() => setOpen((value) => !value)}
      >
        <span>{question}</span>
        <span
          className="ml-4 shrink-0 text-red-500"
          style={{
            transform: open ? "rotate(45deg)" : "rotate(0deg)",
            transition: "transform 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
            fontSize: "1.5rem",
            lineHeight: 1,
            display: "inline-block",
          }}
        >
          +
        </span>
      </button>
      <div
        ref={contentRef}
        style={{
          height: `${height}px`,
          overflow: "hidden",
          transition: "height 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        <div
          className="px-6 pb-5 text-gray-700 leading-relaxed"
          style={{ fontSize: "clamp(0.85rem, 1.3vw, 0.975rem)" }}
        >
          {answer}
        </div>
      </div>
    </div>
  );
}
