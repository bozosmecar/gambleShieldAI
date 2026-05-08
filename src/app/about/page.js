import Link from "next/link";

const BASE_URL = "https://gamble-shield-ai.vercel.app";
const ABOUT_URL = `${BASE_URL}/about`;

export const metadata = {
  title: "About GambleShield | Independent Casino Review Platform",
  description:
    "Learn how GambleShield tests and recommends online casinos, supports responsible gambling, and builds player-first tools through transparent reviews and live stream education.",
  alternates: {
    canonical: ABOUT_URL,
  },
  openGraph: {
    title: "About GambleShield",
    description:
      "Independent casino review platform focused on transparency, responsible gambling, and player safety.",
    url: ABOUT_URL,
    type: "website",
  },
};

export default function AboutPage() {
  const aboutSchema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "AboutPage",
        "@id": `${ABOUT_URL}#aboutpage`,
        url: ABOUT_URL,
        name: "About GambleShield",
        isPartOf: {
          "@id": `${BASE_URL}/#website`,
        },
        about: {
          "@id": `${BASE_URL}/#organization`,
        },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${ABOUT_URL}#breadcrumb`,
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
            name: "About",
            item: ABOUT_URL,
          },
        ],
      },
    ],
  };

  return (
    <main
      className="relative min-h-screen pt-28 pb-20 px-4 text-gray-900 bg-[#FFF3C4] bg-cover bg-center bg-no-repeat bg-fixed"
      style={{ backgroundImage: "url('/about/background.webp')" }}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutSchema) }}
      />
      <div className="relative max-w-4xl mx-auto">
        <section className="rounded-2xl border border-red-200 bg-white/85 backdrop-blur-sm shadow-lg p-8 md:p-10">
          <h1 className="text-3xl md:text-4xl font-bold mb-6 text-red-600">
            About GambleShield
          </h1>

          <p className="text-gray-700 leading-relaxed mb-6">
            In a digital landscape crowded with online casinos and affiliate
            noise, GambleShield exists for one reason: to help players find
            safe online casinos they can actually trust. We are not another
            review site recycling star ratings. GambleShield is an
            independently operated platform built on rigorous testing, genuine
            player education, and a commitment to{" "}
            <Link href="/faq" className="text-red-600 font-semibold underline">
              responsible gambling
            </Link>
            .
          </p>

          <h2 className="text-xl md:text-2xl font-bold mt-8 mb-3 text-red-600">
            <Link href="/blog/best-casinos" className="hover:underline">
              Only the Casinos That Pass Our Test
            </Link>
          </h2>
          <p className="text-gray-700 leading-relaxed mb-6">
            At GambleShield, we recommend safe online casinos exclusively.
            Every casino featured on our platform has been put through the
            GambleShield testing process. That means we evaluate licensing and
            regulatory compliance, audit fairness of game outcomes, scrutinise
            withdrawal speeds and payment reliability, assess responsible
            gambling tools, and review the quality of customer support before
            a single recommendation is made. If a casino does not meet the
            GambleShield standard, it does not appear on our platform.
            GambleShield is not a pay-to-play directory. It is a curated space
            where players can browse and compare with confidence, knowing that
            every option in front of them has already been held to account.
            Explore our{" "}
            <Link
              href="/blog/best-casinos"
              className="text-red-600 font-semibold underline"
            >
              best casinos
            </Link>{" "}
            list for currently recommended picks.
          </p>

          <h2 className="text-xl md:text-2xl font-bold mt-8 mb-3 text-red-600">
            Education as a Pillar, Not an Afterthought
          </h2>
          <p className="text-gray-700 leading-relaxed mb-6">
            One of the things that sets GambleShield apart is our dedicated
            education{" "}
            <Link href="/stream" className="text-red-600 font-semibold underline">
              stream
            </Link>
            . We believe that informed players are protected
            players. That is why GambleShield maintains a consistently updated
            library of guides, explainers, and responsible gambling resources
            designed to help both new and experienced players make smarter
            decisions. We help players understand wagering requirements,
            recognise the early signs of problem gambling, and our educational
            content is written to empower, never to patronise.
          </p>

          <h2 className="text-xl md:text-2xl font-bold mt-8 mb-3 text-red-600">
            An Interactive Experience Built Around Real Players
          </h2>
          <p className="text-gray-700 leading-relaxed mb-6">
            GambleShield offers an interactive{" "}
            <Link href="/login" className="text-red-600 font-semibold underline">
              experience
            </Link>{" "}
            that puts players in
            control of how they explore and compare safe online casinos.
            Players can create their avatars and through them interact in the{" "}
            <Link href="/stream" className="text-red-600 font-semibold underline">
              stream
            </Link>
            , earning rewards and access to premium casino bonuses.
            Additionally, GambleShield will also offer a direct human-based
            helpline for users of certain rank in its stream and social media.
            We want to build tools that allow players to engage with the
            information available and have fun at the same time.
          </p>

          <h2 className="text-xl md:text-2xl font-bold mt-8 mb-3 text-red-600">
            Trust Built One Test at a Time
          </h2>
          <p className="text-gray-700 leading-relaxed">
            The online gambling industry moves fast, and maintaining trust
            requires ongoing effort. GambleShield continuously re-evaluates
            the{" "}
            <Link
              href="/blog/best-casinos"
              className="text-red-600 font-semibold underline"
            >
              casinos we recommend
            </Link>
            , responding to player feedback,
            regulatory changes, and emerging industry standards. Our
            relationship with the casinos on our platform is conditional
            they stay listed because they continue to meet our criteria, not
            because they once did. This living, dynamic approach to review and
            recommendation is what makes GambleShield a name players return
            to. When you see the GambleShield seal, you know work has been
            done on your behalf. Safe online gambling starts with the right
            information. GambleShield is here to make sure you always have it.
          </p>
        </section>
      </div>
    </main>
  );
}
