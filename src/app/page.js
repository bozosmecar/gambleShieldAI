"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Cinzel_Decorative,
  Cormorant_Garamond,
  Libre_Baskerville,
} from "next/font/google";
import { useEffect, useRef, useState } from "react";

const cinzelDecorative = Cinzel_Decorative({
  subsets: ["latin"],
  weight: ["400", "700"],
});
const cormorantGaramond = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["700"],
});
const libreBaskerville = Libre_Baskerville({
  subsets: ["latin"],
  weight: ["400", "700"],
});

const FONT_OPTIONS = [
  {
    id: "cinzel",
    name: "Cinzel Decorative",
    font: cinzelDecorative,
    label: "Elegant serif",
  },
  {
    id: "palatino",
    name: "Libre Baskerville",
    font: libreBaskerville,
    label: "Roman serif",
  },
  {
    id: "cormorant",
    name: "Cormorant Garamond",
    font: cormorantGaramond,
    label: "Classic serif",
  },
];

export default function Home() {
  const [selectedFont, setSelectedFont] = useState("cinzel");
  const aboutSectionRef = useRef(null);
  const affiliateSectionRef = useRef(null);
  const affiliateRow1Ref = useRef(null);
  const affiliateRow2Ref = useRef(null);
  const affiliateRow3Ref = useRef(null);
  const affiliateRow4Ref = useRef(null);
  const mainRef = useRef(null);
  const vrataRef = useRef(null);

  const [backgroundOffset, setBackgroundOffset] = useState(0); // ostavljam ga, ali ga više ne koristimo za scroll

  useEffect(() => {
    const rowRefs = [
      affiliateRow1Ref,
      affiliateRow2Ref,
      affiliateRow3Ref,
      affiliateRow4Ref,
    ];

    const observer = new IntersectionObserver(
      (entries) => {
        const is4Col = window.innerWidth >= 1024;
        entries.forEach((entry) => {
          const visible = entry.isIntersecting;
          const target = entry.target;

          // About and affiliate section: single element
          if (
            target === aboutSectionRef.current ||
            target === affiliateSectionRef.current
          ) {
            if (visible) target.classList.add("visible");
            else target.classList.remove("visible");
            return;
          }

          // Affiliate rows: which index is this?
          const rowIndex = rowRefs.findIndex((r) => r.current === target);
          if (rowIndex === -1) return;

          if (is4Col) {
            // 4 cols: row 0+1 fade together, row 2+3 fade together
            const group = rowIndex < 2 ? [0, 1] : [2, 3];
            group.forEach((i) => {
              const el = rowRefs[i].current;
              if (el) {
                if (visible) el.classList.add("visible");
                else el.classList.remove("visible");
              }
            });
          } else {
            // 2 cols: each row fades on its own
            if (visible) target.classList.add("visible");
            else target.classList.remove("visible");
          }
        });
      },
      { threshold: 0.2, rootMargin: "0px 0px -50px 0px" },
    );

    const aboutRef = aboutSectionRef.current;
    const affiliateRef = affiliateSectionRef.current;
    const rows = rowRefs.map((r) => r.current).filter(Boolean);

    if (aboutRef) observer.observe(aboutRef);
    if (affiliateRef) observer.observe(affiliateRef);
    rows.forEach((el) => observer.observe(el));

    return () => {
      if (aboutRef) observer.unobserve(aboutRef);
      if (affiliateRef) observer.unobserve(affiliateRef);
      rows.forEach((el) => observer.unobserve(el));
    };
  }, []);

  // ✅ REF + RAF scroll update (instant, bez rerendera)
  useEffect(() => {
    let rafId = null;

    const apply = () => {
      rafId = null;
      if (!aboutSectionRef.current || !mainRef.current) return;

      // Same breakpoint as background (lg = 1024px): home4.png < lg, home.png >= lg
      const isSmallScreen = window.innerWidth < 1024;
      const threshold = window.innerHeight * 0.3; // 20vh – start when about section is 20vh from top

      const aboutTop = aboutSectionRef.current.getBoundingClientRect().top;

      let offset = 0;
      if (!isSmallScreen && aboutTop <= threshold) {
        const distanceScrolled = Math.abs(aboutTop - threshold);
        offset = -(distanceScrolled * 1);
      }

      // direktno u DOM — instant
      mainRef.current.style.backgroundPosition = `center ${offset}px`;

      // Sync vrata s background pozicijom - koristi isti offset kao background
      // On phone (home4 bg): center with translateX(-50%), bigger and lower via CSS
      if (vrataRef.current) {
        if (isSmallScreen) {
          vrataRef.current.style.transform = `translate(-50%, ${offset}px)`;
        } else {
          vrataRef.current.style.transform = `translateY(${offset}px)`;
        }
      }
    };

    const handleScroll = () => {
      if (rafId) return;
      rafId = requestAnimationFrame(apply);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    // init
    apply();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  const currentFont =
    FONT_OPTIONS.find((f) => f.id === selectedFont) || FONT_OPTIONS[0];
  const isCormorant = selectedFont === "cormorant";

  return (
    <div
      className={`${currentFont.font.className} ${isCormorant ? "font-bold text-[1.5rem] uppercase" : "font-semibold"}`}
      style={{
        margin: 0,
        padding: 0,
        width: "100%",
        overflow: "hidden",
        ...(isCormorant ? { WebkitTextStroke: "0.5px currentColor", letterSpacing: "0.02em" } : {}),
      }}
    >
      {/* Font picker */}
      <div className="fixed top-20 right-4 z-[100] flex flex-col gap-2 bg-white/90 backdrop-blur-sm rounded-lg p-2 shadow-lg border border-gray-200">
        <span className="text-xs font-medium text-gray-600 px-2">Font</span>
        {FONT_OPTIONS.map((opt) => (
          <button
            key={opt.id}
            type="button"
            onClick={() => setSelectedFont(opt.id)}
            className={`px-3 py-1.5 rounded text-sm text-left transition-colors ${
              selectedFont === opt.id
                ? "bg-orange-500 text-white"
                : "hover:bg-gray-100 text-gray-700"
            }`}
            title={opt.label}
          >
            {opt.name}
          </button>
        ))}
      </div>
      <main
        ref={mainRef}
        className="block w-full bg-[url('/1_Home%20page/home4.png')] lg:bg-[url('/1_Home%20page/home.png')] bg-no-repeat bg-fixed"
        style={{
          backgroundSize: "cover",
          // ✅ inicijalno (scroll effect poslije preuzima)
          backgroundPosition: `center ${backgroundOffset}px`,
          display: "block",
          overflow: "visible",
          position: "relative",
          zIndex: 20,
        }}
      >
        <div style={{ height: "120vh", position: "relative" }}>
          {/* Vrata Image - syncs with background, clickable link to register */}
          <div
            ref={vrataRef}
            className="hidden lg:block fixed opacity-0 hover:opacity-100 transition-opacity duration-300 cursor-pointer lg:left-[43%] lg:top-[18vw] lg:w-[13.6vw]"
            style={{
              height: "auto",
              zIndex: 25,
              willChange: "transform",
            }}
          >
            <Link
              href="/register"
              className="block w-full h-full cursor-pointer"
            >
              <Image
                src="/1_Home page/vrata.png"
                alt="Vrata - Go to Register"
                width={400}
                height={200}
                className="w-full h-auto"
                style={{ objectFit: "contain" }}
              />
            </Link>
          </div>
        </div>

        {/* Wrapper for About and Affiliate sections with shared background */}
        <div
          className="relative w-full scrool-fade-in overflow-visible max-lg:-mt-[1150px] lg:-mt-[0px]"
          style={{
            position: "relative",
            zIndex: 30,
            paddingTop: "",
          }}
        >
          <div
            aria-hidden
            className="absolute inset-0 "
            style={{
              backgroundPosition: "center top",
              zIndex: 0,
              transform: "translateZ(0)",
              willChange: "transform",
            }}
          />

          <div className="relative z-2000 max-lg:mt-[75vh]">
            <section
              ref={aboutSectionRef}
              className="relative w-full flex flex-col items-center justify-center bg-no-repeat bg-center md:bg-[url('/2_About%20company/luk4.png')] md:bg-[length:100%_auto] md:bg-top"
              style={{
                minHeight: "10vh",
                paddingBottom: "clamp(3rem, 8vw, 6rem)",
                paddingLeft: "clamp(2rem, 5vw, 4rem)",
                paddingRight: "clamp(2rem, 5vw, 4rem)",
                overflow: "visible",
                marginTop: "-300px",
                backgroundPosition: "center top",
                overflow: "visible",
                zIndex: 2000,
              }}
            >
              <div
                className="relative flex flex-col md:flex-row items-stretch justify-center gap-4 md:gap-10 z-20 w-full px-4"
                style={{
                  minHeight: "auto",
                  maxWidth: "1200px",
                  margin: "0 auto",
                  marginTop: "clamp(30vh, 40%, 450px)",
                }}
              >
                <div
                  className="bg-gray-200/40 backdrop-blur-sm rounded-2xl text-center p-6 flex flex-col text-black md:flex-1 md:min-w-0 md:max-w-[450px]"
                  style={{
                    minHeight: "280px",
                  }}
                >
                  <h3
                    className="font-bold mb-6"
                    style={{ fontSize: "clamp(1.5rem, 3vw, 2rem)" }}
                  >
                    Our Vision
                  </h3>
                  <p
                    className="leading-relaxed"
                    style={{ fontSize: "clamp(0.875rem, 1.5vw, 1.125rem)" }}
                  >
                    Entertainment first. Transparency always. Gamble Shield is
                    an independent gambling platform built by experienced
                    players and analysts who have tested thousands of bonuses
                    across hundreds of online casinos. We stream real play,
                    explain the math behind gambling, expose unfair terms, and
                    help players understand where and why money is really lost.
                  </p>
                </div>

                <div
                  className="bg-gray-200/40 backdrop-blur-sm rounded-2xl text-center p-6 flex flex-col text-black md:flex-1 md:min-w-0 md:max-w-[450px]"
                  style={{
                    minHeight: "280px",
                  }}
                >
                  <h3
                    className="font-bold mb-6"
                    style={{ fontSize: "clamp(1.5rem, 3vw, 2rem)" }}
                  >
                    Our Mission
                  </h3>
                  <p
                    className="leading-relaxed"
                    style={{ fontSize: "clamp(0.875rem, 1.5vw, 1.125rem)" }}
                  >
                    To make online gambling more transparent, fair, and
                    informed, without pretending it&apos;s risk-free. We educate
                    players, reward good operators, and hold casinos accountable
                    through real testing, data analysis, and public standards. A
                    gambling industry where terms are clear and withdrawals are
                    paid as promised.
                  </p>
                </div>
              </div>
            </section>

            {/* Divide image between home and affiliate – no space, half over each background */}
            <div
              className="relative w-full pointer-events-none"
              style={{ height: 0, overflow: "visible" }}
              aria-hidden
            >
              <img
                src="/1_Home%20page/divide.png"
                alt=""
                className="absolute left-0 w-full h-auto object-cover object-center min-h-[100px]"
                style={{
                  top: 0,
                  transform: "translateY(-50%)",
                  zIndex: 25,
                }}
              />
            </div>

            <div
              className="mt-[30px] flex justify-around w-full bg-cover bg-center bg-no-repeat"
              style={{
                minHeight: "70vh",
                overflow: "hidden",
                position: "relative",
                paddingTop: "clamp(150px, 10vw, 150px)",
                paddingBottom: "clamp(2rem, 5vw, 3rem)",
                backgroundImage: "url(/3_Affiliate/testNebo.png)",
              }}
            >
              <div
                ref={affiliateSectionRef}
                className="relative w-full max-w-[1400px] mx-auto"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  paddingLeft: "clamp(1rem, 3vw, 2rem)",
                  paddingRight: "clamp(1rem, 3vw, 2rem)",
                  marginLeft: "clamp(1rem, 3vw, 2rem)",
                  marginRight: "clamp(1rem, 3vw, 2rem)",
                  marginTop: "10vw",
                  zIndex: 10,
                  overflow: "visible",
                  gap: "clamp(1rem, 3vh, 2rem)",
                }}
              >
                <div className="grid grid-cols-1 lg:grid-cols-2 w-full  lg:gap-[25vw] ">
                  {/* Row 1: pillars 0,1 — 4-col: fades with row2; 2-col: fades alone */}
                  <div
                    ref={affiliateRow1Ref}
                    className="relative w-full scroll-fade-in grid grid-cols-2 lg:grid-cols-4 place-items-center "
                    style={{
                      columnGap: "clamp(4rem, 24vw, 30rem)",
                      overflow: "visible",
                    }}
                  >
                    {[
                      { folder: "crvena", suffix: "", prefix: "", maxFrame: 6 },
                      { folder: "plava", suffix: "", prefix: "", maxFrame: 6 },
                    ].map((flagConfig, idx) => (
                      <AffiliateColumn
                        key={idx}
                        stupImage="/3_Affiliate/stup_1567/stup_afili_1567px.png"
                        stupWidth={1800}
                        stupHeight={1200}
                        index={idx}
                        flagFolder={flagConfig.folder}
                        flagSuffix={flagConfig.suffix}
                        flagPrefix={flagConfig.prefix}
                        maxFrame={flagConfig.maxFrame}
                      />
                    ))}
                  </div>
                  {/* Row 2: pillars 2,3 — on small: push down with vh */}
                  <div
                    ref={affiliateRow2Ref}
                    className="relative w-full scroll-fade-in grid grid-cols-2 lg:grid-cols-4 place-items-center mt-[6vh] lg:mt-0"
                    style={{
                      columnGap: "clamp(4rem, 24vw, 30rem)",
                      overflow: "visible",
                    }}
                  >
                    {[
                      { folder: "zelena", suffix: "", prefix: "", maxFrame: 6 },
                      {
                        folder: "zlatna",
                        suffix: "",
                        prefix: "",
                        maxFrame: 6,
                      },
                    ].map((flagConfig, idx) => (
                      <AffiliateColumn
                        key={idx + 2}
                        stupImage="/3_Affiliate/stup_1567/stup_afili_1567px.png"
                        stupWidth={1800}
                        stupHeight={1200}
                        index={idx + 2}
                        flagFolder={flagConfig.folder}
                        flagSuffix={flagConfig.suffix}
                        flagPrefix={flagConfig.prefix}
                        maxFrame={flagConfig.maxFrame}
                      />
                    ))}
                  </div>
                  {/* Row 3: pillars 4,5 — small: push down (vh); lg: pull up */}
                  <div
                    ref={affiliateRow3Ref}
                    className="relative w-full scroll-fade-in grid grid-cols-2 lg:grid-cols-4 place-items-center mt-[6vh]  lg:-mt-[20vw]"
                    style={{
                      columnGap: "clamp(4rem, 24vw, 30rem)",
                      overflow: "visible",
                    }}
                  >
                    {[
                      { folder: "crvena", suffix: "", prefix: "", maxFrame: 6 },
                      { folder: "plava", suffix: "", prefix: "", maxFrame: 6 },
                    ].map((flagConfig, idx) => (
                      <AffiliateColumn
                        key={idx + 4}
                        stupImage="/3_Affiliate/stup_1567/stup_afili_1567px.png"
                        stupWidth={1800}
                        stupHeight={1200}
                        index={idx + 4}
                        flagFolder={flagConfig.folder}
                        flagSuffix={flagConfig.suffix}
                        flagPrefix={flagConfig.prefix}
                        maxFrame={flagConfig.maxFrame}
                      />
                    ))}
                  </div>
                  {/* Row 4: pillars 6,7 — small: push down (vh); lg: pull up */}
                  <div
                    ref={affiliateRow4Ref}
                    className="relative w-full scroll-fade-in grid grid-cols-2 lg:grid-cols-4 place-items-center mt-[6vh]  lg:-mt-[20vw]"
                    style={{
                      columnGap: "clamp(4rem, 24vw, 30rem)",
                      overflow: "visible",
                    }}
                  >
                    {[
                      { folder: "zelena", suffix: "", prefix: "", maxFrame: 6 },
                      {
                        folder: "ljubicasta",
                        suffix: "",
                        prefix: "",
                        maxFrame: 6,
                      },
                    ].map((flagConfig, idx) => (
                      <AffiliateColumn
                        key={idx + 6}
                        stupImage="/3_Affiliate/stup_1567/stup_afili_1567px.png"
                        stupWidth={1800}
                        stupHeight={1200}
                        index={idx + 6}
                        flagFolder={flagConfig.folder}
                        flagSuffix={flagConfig.suffix}
                        flagPrefix={flagConfig.prefix}
                        maxFrame={flagConfig.maxFrame}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* How It Works Section */}
            <section
              className="relative w-full bg-[#FFF3C4] py-16 px-4"
              style={{
                minHeight: "80vh",
                paddingTop: "clamp(4rem, 8vw, 6rem)",
                paddingBottom: "clamp(4rem, 8vw, 6rem)",
              }}
            >
              <div className="w-full">
                <h2
                  className="text-center font-bold mb-12 text-red-600"
                  style={{ fontSize: "clamp(2rem, 4vw, 3rem)" }}
                >
                  How It Works
                </h2>

                <div
                  className="flex flex-wrap gap-8 mb-12 w-full"
                  style={{ justifyContent: "center" }}
                >
                  {/* Watch Stream */}
                  <div
                    className="text-center flex flex-col"
                    style={{
                      padding: "clamp(1.5rem, 3vw, 3rem)",
                      width: "20%",
                      minWidth: "200px",
                    }}
                  >
                    <div
                      className="text-red-600 font-bold mb-4 h-16 flex items-center justify-center shrink-0"
                      style={{ fontSize: "clamp(1.25rem, 2vw, 1.5rem)" }}
                    >
                      <h3 className="m-0 leading-tight text-center">
                        Watch Stream
                      </h3>
                    </div>
                    <div
                      className="mx-auto mb-6 flex items-center justify-center w-full"
                      style={{ height: 220 }}
                    >
                      <Image
                        src="/how_it_works/watch.png"
                        alt="Watch Stream"
                        width={300}
                        height={220}
                        className="max-w-full"
                        style={{
                          height: 220,
                          width: "auto",
                          objectFit: "contain",
                        }}
                      />
                    </div>
                    <p
                      className="text-gray-600"
                      style={{
                        fontSize: "clamp(1.125rem, 2.25vw, 1.5rem)",
                        lineHeight: "1.6",
                      }}
                    >
                      Watch live gambling streams and real gameplay. Learn from
                      experienced players and see how bonuses work in practice.
                    </p>
                  </div>

                  {/* Upgrade Your Character */}
                  <div
                    className="text-center flex flex-col"
                    style={{
                      padding: "clamp(1.5rem, 3vw, 3rem)",
                      width: "20%",
                      minWidth: "200px",
                    }}
                  >
                    <div
                      className="text-red-600 font-bold mb-4 h-16 flex items-center justify-center shrink-0"
                      style={{ fontSize: "clamp(1.25rem, 2vw, 1.5rem)" }}
                    >
                      <h3 className="m-0 leading-tight text-center">
                        Upgrade Your Character
                      </h3>
                    </div>
                    <div
                      className="mx-auto mb-6 flex items-center justify-center w-full"
                      style={{ height: 220 }}
                    >
                      <Image
                        src="/how_it_works/upgrade.png"
                        alt="Upgrade Your Character"
                        width={300}
                        height={220}
                        className="max-w-full"
                        style={{
                          height: 220,
                          width: "auto",
                          objectFit: "contain",
                        }}
                      />
                    </div>
                    <p
                      className="text-gray-600"
                      style={{
                        fontSize: "clamp(1.125rem, 2.25vw, 1.5rem)",
                        lineHeight: "1.6",
                      }}
                    >
                      Upgrade your character and unlock new features. Progress
                      through levels and unlock exclusive rewards.
                    </p>
                  </div>

                  {/* Vote Which Slot Will Be Played */}
                  <div
                    className="text-center flex flex-col"
                    style={{
                      padding: "clamp(1.5rem, 3vw, 3rem)",
                      width: "20%",
                      minWidth: "200px",
                    }}
                  >
                    <div
                      className="text-red-600 font-bold mb-4 h-16 flex items-center justify-center shrink-0"
                      style={{ fontSize: "clamp(1.25rem, 2vw, 1.5rem)" }}
                    >
                      <h3 className="m-0 leading-tight text-center">
                        Vote Which Slot Will Be Played
                      </h3>
                    </div>
                    <div
                      className="mx-auto mb-6 flex items-center justify-center w-full"
                      style={{ height: 220 }}
                    >
                      <Image
                        src="/how_it_works/vote.png"
                        alt="Vote Which Slot Will Be Played"
                        width={300}
                        height={220}
                        className="max-w-full"
                        style={{
                          height: 220,
                          width: "auto",
                          objectFit: "contain",
                        }}
                      />
                    </div>
                    <p
                      className="text-gray-600"
                      style={{
                        fontSize: "clamp(1.125rem, 2.25vw, 1.5rem)",
                        lineHeight: "1.6",
                      }}
                    >
                      Use your points to vote on which slot game will be played
                      next. Influence the stream and interact with streamers in
                      real-time.
                    </p>
                  </div>

                  {/* Play Extra Games to Earn More */}
                  <div
                    className="text-center flex flex-col"
                    style={{
                      padding: "clamp(1.5rem, 3vw, 3rem)",
                      width: "20%",
                      minWidth: "200px",
                    }}
                  >
                    <div
                      className="text-red-600 font-bold mb-4 h-16 flex items-center justify-center shrink-0"
                      style={{ fontSize: "clamp(1.25rem, 2vw, 1.5rem)" }}
                    >
                      <h3 className="m-0 leading-tight text-center">
                        Play Extra Games to Earn More
                      </h3>
                    </div>
                    <div
                      className="mx-auto mb-6 flex items-center justify-center w-full"
                      style={{ height: 220 }}
                    >
                      <Image
                        src="/how_it_works/play.png"
                        alt="Play Extra Games to Earn More"
                        width={300}
                        height={220}
                        className="max-w-full"
                        style={{
                          height: 220,
                          width: "auto",
                          objectFit: "contain",
                        }}
                      />
                    </div>
                    <p
                      className="text-gray-600"
                      style={{
                        fontSize: "clamp(1.125rem, 2.25vw, 1.5rem)",
                        lineHeight: "1.6",
                      }}
                    >
                      Play additional games and mini-games to earn extra points.
                      Boost your rewards and unlock special bonuses.
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}

// Component for each affiliate column with flag animation
function AffiliateColumn({
  stupImage,
  stupWidth,
  stupHeight,
  index = 0,
  flagFolder = "crvena",
  flagSuffix = "",
  flagPrefix = "",
  maxFrame = 6,
}) {
  const [currentFrame, setCurrentFrame] = useState(4);
  const [isAnimating, setIsAnimating] = useState(false);
  const [direction, setDirection] = useState("backward");
  const [textOpacity, setTextOpacity] = useState(1);

  const handleFlagClick = () => {
    if (isAnimating) return;

    setIsAnimating(true);

    if (direction === "backward") {
      setTextOpacity(0);

      setTimeout(() => {
        let frame = currentFrame;
        const interval = setInterval(() => {
          frame--;
          setCurrentFrame(frame);
          if (frame <= 1) {
            clearInterval(interval);

            setTimeout(() => {
              let forwardFrame = 1;
              const forwardInterval = setInterval(() => {
                forwardFrame++;
                setCurrentFrame(forwardFrame);
                if (forwardFrame >= maxFrame) {
                  clearInterval(forwardInterval);
                  setCurrentFrame(forwardFrame);
                  setIsAnimating(false);
                  setDirection("forward");
                  setTimeout(() => setTextOpacity(1), 100);
                }
              }, 10);
            }, 300);
          }
        }, 10);
      }, 300);
    } else {
      setTextOpacity(0);

      setTimeout(() => {
        let frame = maxFrame;
        const interval = setInterval(() => {
          frame--;
          setCurrentFrame(frame);
          if (frame <= 1) {
            clearInterval(interval);

            setTimeout(() => {
              let forwardFrame = 1;
              const forwardInterval = setInterval(() => {
                forwardFrame++;
                setCurrentFrame(forwardFrame);
                if (forwardFrame >= 4) {
                  clearInterval(forwardInterval);
                  setCurrentFrame(forwardFrame);
                  setIsAnimating(false);
                  setDirection("backward");
                  setTimeout(() => setTextOpacity(1), 100);
                }
              }, 10);
            }, 300);
          }
        }, 10);
      }, 300);
    }
  };

  const isSecondRowSmall = index >= 2;
  const isSecondRowLarge = index >= 4;

  return (
    <div
      className={`relative flex flex-col items-center justify-start mb-[30%] ${
        isSecondRowSmall ? "mt-[-90%]" : ""
      } ${isSecondRowLarge ? "lg:ml-[5%]" : "lg:mt-[0%]"}`}
      style={{
        width: "clamp(250px, 30vw, 450px)",
        maxHeight: "60vh",
        minHeight: "150px",
        overflow: "visible",
        zIndex: 1,
        isolation: "isolate",
        marginLeft: "clamp(1rem, 3vw, 2.5rem)",
        marginRight: "clamp(1rem, 3vw, 2.5rem)",
      }}
    >
      <Image
        src={stupImage}
        alt="Affiliate Column"
        width={stupWidth}
        height={stupHeight}
        style={{
          width: "120vw",
          maxHeight: "140vw",
          objectFit: "contain",
          position: "relative",
          zIndex: 1,
        }}
      />

      <div
        className="absolute left-1/2 transform -translate-x-1/2 cursor-pointer"
        style={{
          top: "20%",
          width: "clamp(65%, 85%, 105%)",
          zIndex: 10,
        }}
        onClick={handleFlagClick}
      >
        <img
          src={`/3_Affiliate/${flagFolder}/${flagPrefix || ""}${currentFrame}${flagSuffix}.png`}
          alt="Flag"
          style={{ width: "100vw", height: "auto", display: "block" }}
        />

        <div
          className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
          style={{
            opacity: textOpacity,
            transition: "opacity 0.3s ease-in-out",
            padding: "10%",
          }}
        >
          {currentFrame === 4 && (
            <div className="text-center mt-[-00%] text-white">
              <h3
                className="font-bold "
                style={{
                  fontSize: "clamp(0.8rem, 1.5vw, 1.2rem)",
                  textShadow: "2px 2px 4px rgba(0,0,0,0.7)",
                }}
              >
                Affiliate Partner
              </h3>
              <p
                style={{
                  fontSize: "clamp(0.6rem, 1vw, 0.9rem)",
                  textShadow: "1px 1px 3px rgba(0,0,0,0.7)",
                }}
              >
                Click to learn more
              </p>
            </div>
          )}

          {currentFrame === maxFrame && (
            <div className="text-center text-white flex flex-col items-center justify-center">
              <h3
                className="font-bold mb-3"
                style={{
                  fontSize: "clamp(1rem, 2vw, 1.2rem)",
                  textShadow: "2px 2px 4px rgba(0,0,0,0.7)",
                }}
              >
                Premium Partnership
              </h3>
              <p
                className="mb-2"
                style={{
                  width: "80%",
                  textAlign: "center",
                  fontSize: "clamp(0.7rem, 1.2vw, 1rem)",
                  textShadow: "1px 1px 3px rgba(0,0,0,0.7)",
                  lineHeight: "1.4",
                }}
              >
                Join our network of trusted gambling platforms
              </p>
              <p
                style={{
                  fontSize: "clamp(0.65rem, 1.1vw, 0.9rem)",
                  textShadow: "1px 1px 3px rgba(0,0,0,0.7)",
                  opacity: 0.9,
                }}
              >
                Verified • Secure • Responsible
              </p>
            </div>
          )}
        </div>
      </div>

      <div
        className="absolute left-0 right-0 flex justify-center px-1"
        style={{
          top: "-15%",
          zIndex: 100,
          pointerEvents: "none",
        }}
      >
        <Image
          src="/affiliate_casumo_dublinbet_ninecasino/casumo/casumo.png"
          alt="Casumo"
          width={280}
          height={168}
          className="h-auto w-full"
          style={{
            marginTop: "clamp(10px, 2vw, 20px)",
            objectFit: "contain",
            position: "relative",
            zIndex: 100,
            width: "clamp(160px, 20vw, 300px)",
          }}
        />
      </div>
    </div>
  );
}
