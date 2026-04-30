"use client";

export default function AboutPage() {
  return (
    <main
      className="relative min-h-screen pt-28 pb-20 px-4 text-gray-900 bg-[#FFF3C4] bg-cover bg-center bg-no-repeat bg-fixed"
      style={{ backgroundImage: "url('/about/background.webp')" }}
    >
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
            player education, and a commitment to responsible gambling.
          </p>

          <h2 className="text-xl md:text-2xl font-bold mt-8 mb-3 text-red-600">
            Only the Casinos That Pass Our Test
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
          </p>

          <h2 className="text-xl md:text-2xl font-bold mt-8 mb-3 text-red-600">
            Education as a Pillar, Not an Afterthought
          </h2>
          <p className="text-gray-700 leading-relaxed mb-6">
            One of the things that sets GambleShield apart is our dedicated
            education stream. We believe that informed players are protected
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
            GambleShield offers an interactive experience that puts players in
            control of how they explore and compare safe online casinos.
            Players can create their avatars and through them interact in the
            stream, earning rewards and access to premium casino bonuses.
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
            the casinos we recommend, responding to player feedback,
            regulatory changes, and emerging industry standards. Our
            relationship with the casinos on our platform is conditional —
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
