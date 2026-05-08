"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export default function HomeClient() {
  const aboutSectionRef = useRef(null);
  const affiliateSectionRef = useRef(null);
  const affiliateRow1Ref = useRef(null);
  const affiliateRow2Ref = useRef(null);
  const affiliateRow3Ref = useRef(null);
  const affiliateRow4Ref = useRef(null);
  const affiliateTitleRef = useRef(null);
  const mainRef = useRef(null);
  const vrataRef = useRef(null);
  const diceRef = useRef(null);
  const stitRubRef = useRef(null);
  const scrollGuyRef = useRef(null);
  const [scrollGuyHover, setScrollGuyHover] = useState(false);
  const [diceImage, setDiceImage] = useState("/1_Home page/dices/dice5.png");
  const [diceRolling, setDiceRolling] = useState(false);
  const [dicePop, setDicePop] = useState(false);

  const rollDice = () => {
    if (diceRolling) return;
    setDiceRolling(true);
    setDicePop(false);

    const allDice = [1, 2, 3, 4, 5, 6];
    const picks = [];
    let last = -1;
    for (let i = 0; i < 15; i++) {
      let next;
      do {
        next = allDice[Math.floor(Math.random() * 6)];
      } while (next === last);
      picks.push(next);
      last = next;
    }

    let i = 0;
    const showNext = () => {
      if (i >= picks.length) {
        setDicePop(true);
        setTimeout(() => {
          setDicePop(false);
          setDiceRolling(false);
        }, 400);
        return;
      }
      setDiceImage(`/1_Home page/dices/dice${picks[i]}.png`);
      i++;
      const delay = i <= 12 ? 100 : 500;
      setTimeout(showNext, delay);
    };
    showNext();
  };

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

          // About, affiliate section, and affiliate title: single elements
          if (
            target === aboutSectionRef.current ||
            target === affiliateSectionRef.current ||
            target === affiliateTitleRef.current
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
    const affiliateTitleEl = affiliateTitleRef.current;
    const rows = rowRefs.map((r) => r.current).filter(Boolean);

    if (aboutRef) observer.observe(aboutRef);
    if (affiliateRef) observer.observe(affiliateRef);
    if (affiliateTitleEl) observer.observe(affiliateTitleEl);
    rows.forEach((el) => observer.observe(el));

    return () => {
      if (aboutRef) observer.unobserve(aboutRef);
      if (affiliateRef) observer.unobserve(affiliateRef);
      if (affiliateTitleEl) observer.unobserve(affiliateTitleEl);
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
      if (diceRef.current) {
        diceRef.current.style.transform = `translateY(${offset}px)`;
      }
      if (stitRubRef.current) {
        stitRubRef.current.style.transform = `translateY(${offset}px)`;
      }
      if (scrollGuyRef.current) {
        scrollGuyRef.current.style.transform = `translateY(${offset}px)`;
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

  return (
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
          <Link href="/register" className="block w-full h-full cursor-pointer">
            <Image
              src="/1_Home page/vrata.png"
              alt="Register on Gamble Shield - Best Casino Platform"
              width={400}
              height={200}
              className="w-full h-auto"
              style={{ objectFit: "contain" }}
            />
          </Link>
        </div>

        {/* Scroll Guy - bottom left corner */}
        <div
          ref={scrollGuyRef}
          className="hidden lg:block fixed left-4 bottom-[2vw] cursor-pointer"
          style={{ zIndex: 25, width: "10vw", willChange: "transform" }}
          onMouseEnter={() => setScrollGuyHover(true)}
          onMouseLeave={() => setScrollGuyHover(false)}
        >
          <Link href="/blog" className="block w-full h-full">
            <Image
              src={
                scrollGuyHover
                  ? "/1_Home page/openscrollguy.png"
                  : "/1_Home page/scrollguy.png"
              }
              alt="Read Casino News Blog on Gamble Shield"
              width={200}
              height={200}
              className="w-full h-auto transition-transform duration-200"
              style={{ objectFit: "contain" }}
            />
          </Link>
        </div>

        {/* Dice - bottom left, syncs with scroll like vrata */}
        <div
          className="hidden lg:block fixed lg:left-[83.7%] lg:top-[37.8vw] group peer cursor-pointer"
          style={{
            zIndex: 25,
            width: "calc(1.7vw + 200px)",
            height: "calc(1.7vw + 200px)",
            transform: "translate(-100px, -100px)",
            pointerEvents: "auto",
          }}
          onClick={rollDice}
        >
          {[
            { top: "0%", left: "20%", sx: "-8px", sy: "-12px", delay: "0s" },
            {
              top: "0%",
              left: "50%",
              sx: "4px",
              sy: "-14px",
              delay: "0.25s",
            },
            {
              top: "0%",
              left: "80%",
              sx: "10px",
              sy: "-10px",
              delay: "0.5s",
            },
            {
              top: "20%",
              left: "100%",
              sx: "14px",
              sy: "-6px",
              delay: "0.15s",
            },
            {
              top: "50%",
              left: "100%",
              sx: "14px",
              sy: "4px",
              delay: "0.4s",
            },
            {
              top: "80%",
              left: "100%",
              sx: "10px",
              sy: "10px",
              delay: "0.7s",
            },
            {
              top: "100%",
              left: "80%",
              sx: "6px",
              sy: "14px",
              delay: "0.3s",
            },
            {
              top: "100%",
              left: "50%",
              sx: "-2px",
              sy: "14px",
              delay: "0.55s",
            },
            {
              top: "100%",
              left: "20%",
              sx: "-10px",
              sy: "10px",
              delay: "0.1s",
            },
            { top: "80%", left: "0%", sx: "-14px", sy: "6px", delay: "0.6s" },
            {
              top: "50%",
              left: "0%",
              sx: "-14px",
              sy: "-2px",
              delay: "0.35s",
            },
            {
              top: "20%",
              left: "0%",
              sx: "-10px",
              sy: "-10px",
              delay: "0.45s",
            },
          ].map((s, i) => (
            <span
              key={i}
              className="dice-spark"
              style={{
                top: s.top,
                left: s.left,
                "--sx": s.sx,
                "--sy": s.sy,
                animationDelay: s.delay,
              }}
            />
          ))}
          <div
            ref={diceRef}
            style={{
              position: "absolute",
              top: "100px",
              left: "100px",
              width: "1.7vw",
              height: "auto",
              willChange: "transform",
              zIndex: 2,
            }}
          >
            <Image
              src={diceImage}
              alt="Roll Dice on Gamble Shield - Best Casino Platform"
              width={300}
              height={300}
              className={`w-full h-auto transition-transform ${dicePop ? "scale-[2] duration-200" : "scale-100 duration-300"}`}
              style={{ objectFit: "contain" }}
            />
          </div>
        </div>

        {/* StitRub - appears on dice hover, behind dice */}
        <div
          ref={stitRubRef}
          className="hidden lg:block fixed lg:left-[80.2%] lg:top-[32.45vw] pointer-events-none transition-opacity duration-300 opacity-0 peer-hover:opacity-100"
          style={{
            width: "8.8vw",
            height: "auto",
            zIndex: 24,
            willChange: "transform",
          }}
        >
          <Image
            src="/1_Home page/stitRub.png"
            alt="Gamble Shield Ruby - Roll Dice on Gamble Shield"
            width={300}
            height={300}
            className="w-full h-auto"
            style={{ objectFit: "contain" }}
          />
        </div>
      </div>

      {/* Wrapper for About and Affiliate sections with shared background */}
      <div
        className="relative w-full scrool-fade-in overflow-visible max-lg:-mt-[1150px] lg:mt-0"
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
            id="home-about"
            aria-label="About GambleShield - Our Vision and Mission"
            className="relative w-full flex flex-col items-center justify-center bg-no-repeat bg-center md:bg-[url('/2_About%20company/luk4.png')] md:bg-size-[100%_auto] md:bg-top scroll-mt-[120px]"
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
            {/* H1 text curved along the arch — SVG textPath follows luk4.png inner arc */}
            <svg
              viewBox="0 0 1000 430"
              className="hidden md:block absolute top-0 left-0 w-full pointer-events-none"
              style={{ zIndex: 15, overflow: "visible" }}
              aria-hidden="true"
            >
              <defs>
                {/* r=1100 → sagitta≈104, peak y≈75 (arch crown), endpoints y=179 */}
                <path id="archCurve" d="M 24,200 A 1100,1200 0 0,1 976,200" />
                <filter
                  id="archTextShadow"
                  x="-2%"
                  y="-30%"
                  width="104%"
                  height="160%"
                >
                  <feDropShadow
                    dx="0"
                    dy="1"
                    stdDeviation="2.5"
                    floodColor="#ffffff"
                    floodOpacity="0.7"
                  />
                </filter>
              </defs>
              <text
                fill="#b2041d"
                fontSize="25"
                fontWeight="bold"
                letterSpacing="2"
                filter="url(#archTextShadow)"
              >
                <textPath
                  href="#archCurve"
                  startOffset="50%"
                  textAnchor="middle"
                >
                  GambleShield: The Best Safe Online Casino Recommendations
                </textPath>
              </text>
            </svg>

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
                <h2
                  className="font-bold mb-6"
                  style={{ fontSize: "clamp(1.5rem, 3vw, 2rem)" }}
                >
                  GambleShield Vision
                </h2>
                <p
                  className="leading-relaxed"
                  style={{ fontSize: "clamp(0.875rem, 1.5vw, 1.125rem)" }}
                >
                  GambleShield is an independent gambling review platform built
                  by experienced gamblers who want to provide information and
                  in-depth analysis of online casino sites, and offer the best
                  and most trusted casino links available to the global gambling
                  player base. Because of our stream and interactive player
                  experience, GambleShield is different from the rest of the
                  casino review platforms on the web. We want you to win, and
                  for the house to lose.
                </p>
              </div>

              <div
                className="bg-gray-200/40 backdrop-blur-sm rounded-2xl text-center p-6 flex flex-col text-black md:flex-1 md:min-w-0 md:max-w-[450px]"
                style={{
                  minHeight: "280px",
                }}
              >
                <h2
                  className="font-bold mb-6"
                  style={{ fontSize: "clamp(1.5rem, 3vw, 2rem)" }}
                >
                  GambleShield Mission
                </h2>
                <p
                  className="leading-relaxed"
                  style={{ fontSize: "clamp(0.875rem, 1.5vw, 1.125rem)" }}
                >
                  Gamble Shield wants to provide the best safe casino
                  recommendations for old and new players, offer practical
                  gambling tips and tricks and be a responsible safe casino
                  review site with independent, user-based reviews. We want you
                  to understand bonuses, terms and have the best RTP possible.
                  Through our stream and game-based user experience, we want to
                  stand out from the crowd of boring and generic casino review
                  sites.
                </p>
              </div>
            </div>
          </section>

          {/* CTA – Browse safe recommended casinos, Step 1/2/3 */}
          <div
            className="w-full flex flex-col items-center gap-5 px-4 py-10"
            style={{ position: "relative", zIndex: 30 }}
          >
            <p
              className="font-bold text-black tracking-wide text-center"
              style={{
                fontSize: "clamp(1rem, 2vw, 1.4rem)",
              }}
            >
              Browse GambleShield safe recommended online casinos
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-6">
              {[
                { step: "01", label: "Find a verified casino" },
                { step: "02", label: "Claim your exclusive bonus" },
                { step: "03", label: "Play safe & smart" },
              ].map(({ step, label }) => (
                <Link
                  key={step}
                  href="/blog/best-casinos"
                  className="flex items-center gap-3 px-5 py-3 rounded-xl backdrop-blur-md bg-black/30 border border-white/20 text-white hover:bg-black/50 hover:scale-105 transition-all duration-200"
                  style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.4)" }}
                >
                  <span
                    className="font-black text-orange-400 shrink-0"
                    style={{ fontSize: "clamp(1.1rem, 2vw, 1.5rem)" }}
                  >
                    {step}
                  </span>
                  <span
                    className="font-semibold"
                    style={{ fontSize: "clamp(0.8rem, 1.3vw, 0.95rem)" }}
                  >
                    {label}
                  </span>
                </Link>
              ))}
            </div>
          </div>

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
            id="home-casinos"
            className="mt-[30px] flex justify-around w-full bg-cover bg-center bg-no-repeat scroll-mt-[120px]"
            style={{
              minHeight: "70vh",
              overflow: "hidden",
              position: "relative",
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
              {/* CTA above affiliate title */}
              <div className="flex flex-col items-center gap-3 mb-6">
                <a
                  href="/profile"
                  className="inline-block px-7 py-3 rounded-full font-bold text-white transition-all duration-300 hover:scale-105 hover:shadow-xl"
                  style={{
                    background: "linear-gradient(135deg, #fb923c, #f97316)",
                    fontSize: "clamp(0.9rem, 1.4vw, 1rem)",
                    boxShadow: "0 4px 20px rgba(249,115,22,0.4)",
                  }}
                >
                  Check Out Our Upgraded User Experience →
                </a>
              </div>

              <h2
                ref={affiliateTitleRef}
                className="scroll-fade-in text-center font-bold text-white w-full mb-10"
                style={{
                  fontSize: "clamp(1.5rem, 3vw, 2.5rem)",
                  textShadow: "2px 2px 8px rgba(0,0,0,0.8)",
                }}
              >
                Best Online Casino List 2026
              </h2>

              <div className="grid grid-cols-1 lg:grid-cols-2 w-full  lg:gap-[25vw] mt-20 ">
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
                    {
                      folder: "crvena",
                      suffix: "",
                      prefix: "",
                      maxFrame: 6,
                      blogPostId: null,
                      name: "Powerup Casino",
                      logo: "/3_Affiliate/logos/powerup.png",
                      casinoLink: "https://www.powerup-casino.com",
                      openedText: [
                        "WELCOME BONUS UP TO 3000$",
                        "1st Deposit: 150% up to $1000",
                        "6000+ Slots",
                        "Full Crypto Support",
                        "Fast Payouts",
                        "Licensed & Fair (Anjouan/Curaçao)",
                      ],
                    },
                    {
                      folder: "plava",
                      suffix: "",
                      prefix: "",
                      maxFrame: 6,
                      blogPostId: null,
                      name: "Tonybet",
                      logo: "/3_Affiliate/logos/tonybet.png",
                      casinoLink: "https://www.tonybet.com",
                      openedText: [
                        "WELCOME BONUS UP TO 300$",
                        "1st Deposit: 100% up to 150$",
                        "Licensed & Fair (Estonia)",
                        "Great sportsbook",
                        "Partial Crypto support",
                        "Fast payouts",
                      ],
                    },
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
                      blogPostId={flagConfig.blogPostId}
                      name={flagConfig.name}
                      openedText={flagConfig.openedText}
                      logo={flagConfig.logo}
                      casinoLink={flagConfig.casinoLink}
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
                    {
                      folder: "zelena",
                      suffix: "",
                      prefix: "",
                      maxFrame: 6,
                      blogPostId: null,
                      name: "Mr Green Casino",
                      logo: "/3_Affiliate/logos/mrgreen.png",
                      casinoLink: "https://www.mrgreen.com/en",
                      openedText: [
                        "WELCOME BONUS up to 100$",
                        "Only Classic deposit methods",
                        "Licensed & Fair (Malta)",
                        "More than 1500+ slots",
                      ],
                    },
                    {
                      folder: "zlatna",
                      suffix: "",
                      prefix: "",
                      maxFrame: 6,
                      blogPostId: null,
                      name: "Casino Action",
                      logo: "/3_Affiliate/logos/action.png",
                      casinoLink: "https://www.casinoaction.com/en/",
                      openedText: [
                        "WELCOME BONUS UP TO 1250$",
                        "Great loyalty program",
                        "Lots of slots options and live tables",
                        "Licensed & Fair",
                        "Only classic deposit method",
                      ],
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
                      blogPostId={flagConfig.blogPostId}
                      name={flagConfig.name}
                      openedText={flagConfig.openedText}
                      logo={flagConfig.logo}
                      casinoLink={flagConfig.casinoLink}
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
                    {
                      folder: "zelena",
                      suffix: "",
                      prefix: "",
                      maxFrame: 6,
                      blogPostId: null,
                      name: "mBit Casino",
                      logo: "/3_Affiliate/logos/mBIT.png",
                      casinoLink: "https://www.mbitcasino.io/",
                      openedText: [
                        "WELCOME BONUS UP TO 3 BTC",
                        "3 welcome bonuses",
                        "1st 175% up to 1BTC",
                        "For crypto fans only",
                        "More than 2000+ slots",
                        "Fast payout",
                        "Licensed & Fair (Curaçao)",
                      ],
                    },
                    {
                      folder: "plava",
                      suffix: "",
                      prefix: "",
                      maxFrame: 6,
                      blogPostId: 18,
                      name: "Casumo",
                      logo: "/3_Affiliate/logos/casumo.png",
                      casinoLink: "https://www.casumo.com/en/",
                      openedText: [
                        "WELCOME BONUS UP TO 300$",
                        "Licensed & Fair (Malta, UK)",
                        "Good and fast chat support",
                        "Only classic deposit method",
                        "Reliable payouts",
                      ],
                    },
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
                      blogPostId={flagConfig.blogPostId}
                      name={flagConfig.name}
                      openedText={flagConfig.openedText}
                      logo={flagConfig.logo}
                      casinoLink={flagConfig.casinoLink}
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
                    {
                      folder: "zelena",
                      suffix: "",
                      prefix: "",
                      maxFrame: 6,
                      blogPostId: null,
                      name: "Coming Soon",
                      openedText: ["Stay tuned for more partners!"],
                    },
                    {
                      folder: "ljubicasta",
                      suffix: "",
                      prefix: "",
                      maxFrame: 6,
                      blogPostId: null,
                      name: "Spinline",
                      logo: "/3_Affiliate/logos/spinline.png",
                      casinoLink: "https://spinline.one/",
                      openedText: [
                        "WELCOME PACKAGE UP TO 1,800€",
                        "+ 800 Free Spins",
                        "Huge welcome offer across deposits",
                        "Wide selection of slots & live casino",
                        "Fast and secure payouts",
                        "Licensed & Fair",
                      ],
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
                      blogPostId={flagConfig.blogPostId}
                      name={flagConfig.name}
                      openedText={flagConfig.openedText}
                      logo={flagConfig.logo}
                      casinoLink={flagConfig.casinoLink}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* CTA below affiliate section */}
          <div
            className="relative w-full flex flex-col items-center gap-4 py-14 px-4"
            style={{
              background: "linear-gradient(180deg, #7dd3fc 0%, #38bdf8 100%)",
            }}
          >
            <h3
              className="font-bold text-center text-sky-950"
              style={{
                fontSize: "clamp(1.3rem, 2.5vw, 2rem)",
                textShadow: "0 1px 4px rgba(255,255,255,0.4)",
              }}
            >
              GambleShield recommends safe casinos for best RTP
            </h3>
            <p
              className="text-sky-900 text-center max-w-xl"
              style={{ fontSize: "clamp(0.875rem, 1.4vw, 1rem)" }}
            >
              Join GambleShield and get access to safe casino links, expert
              reviews, live streams and exclusive bonuses — all in one place.
            </p>
            <div className="flex flex-wrap gap-4 justify-center mt-2">
              <a
                href="/register"
                className="inline-block px-8 py-3 rounded-full font-bold text-white transition-all duration-300 hover:scale-105 hover:shadow-lg"
                style={{
                  background: "linear-gradient(135deg, #fb923c, #f97316)",
                  fontSize: "clamp(0.9rem, 1.4vw, 1rem)",
                  boxShadow: "0 4px 16px rgba(249,115,22,0.35)",
                }}
              >
                Create Your Account
              </a>
              <a
                href="/stream"
                className="inline-block px-8 py-3 rounded-full font-bold text-sky-950 border-2 border-sky-900/40 bg-white/40 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:bg-white/60"
                style={{ fontSize: "clamp(0.9rem, 1.4vw, 1rem)" }}
              >
                Watch Live Stream
              </a>
            </div>
          </div>

          {/* How It Works Section */}
          <section
            id="how-it-works"
            aria-label="How Gamble Shield Works - Watch, Vote, Play and Upgrade"
            className="relative w-full py-16 px-4 scroll-mt-[120px]"
            style={{
              minHeight: "80vh",
              paddingTop: "clamp(4rem, 8vw, 6rem)",
              paddingBottom: "clamp(4rem, 8vw, 6rem)",
              backgroundImage: "url('/how_it_works/how_it_works.png')",
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
            }}
          >
            <div className="w-full">
              <h2
                className="text-center font-bold mb-3 text-red-700"
                style={{ fontSize: "clamp(1.35rem, 2.8vw, 1.85rem)" }}
              >
                Interactive gaming experience
              </h2>
              <h3
                className="text-center font-bold mb-12 text-red-600"
                style={{ fontSize: "clamp(2rem, 4vw, 3rem)" }}
              >
                How It Works
              </h3>

              <div className="mx-auto mb-12 grid w-full max-w-[1700px] grid-cols-1 gap-x-10 gap-y-8 sm:grid-cols-2 xl:grid-cols-4">
                {/* Watch Stream */}
                <div
                  className="text-center flex flex-col items-center w-full rounded-2xl bg-white/70 backdrop-blur-md shadow-lg ring-1 ring-white/40"
                  style={{
                    padding: "clamp(1.5rem, 3vw, 3rem)",
                  }}
                >
                  <div className="flex flex-col items-center mb-4 shrink-0">
                    <span
                      className="text-red-500 font-black uppercase tracking-widest mb-3 block leading-none"
                      style={{ fontSize: "clamp(1rem, 1.6vw, 1.35rem)" }}
                    >
                      Step 1
                    </span>
                    <div
                      className="text-red-600 font-bold min-h-[96px] flex items-start justify-center"
                      style={{ fontSize: "clamp(1.25rem, 2vw, 1.5rem)" }}
                    >
                      <h3 className="m-0 leading-tight text-center">
                        Watch Stream on GambleShield
                      </h3>
                    </div>
                  </div>
                  <div
                    className="mx-auto mb-6 flex items-center justify-center w-full"
                    style={{ height: 220 }}
                  >
                    <Image
                      src="/how_it_works/watch.png"
                      alt="Watch Stream on Gamble Shield"
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
                    Watch live gambling streams and real gameplay on the{" "}
                    <Link
                      href="/stream"
                      className="text-red-600 font-semibold underline hover:text-red-700"
                    >
                      GambleShield stream page
                    </Link>
                    . Learn from GambleShield players and see how bonuses work
                    in practice.
                  </p>
                </div>

                {/* Upgrade Your Character */}
                <div
                  className="text-center flex flex-col items-center w-full rounded-2xl bg-white/70 backdrop-blur-md shadow-lg ring-1 ring-white/40"
                  style={{
                    padding: "clamp(1.5rem, 3vw, 3rem)",
                  }}
                >
                  <div className="flex flex-col items-center mb-4 shrink-0">
                    <span
                      className="text-red-500 font-black uppercase tracking-widest mb-3 block leading-none"
                      style={{ fontSize: "clamp(1rem, 1.6vw, 1.35rem)" }}
                    >
                      Step 2
                    </span>
                    <div
                      className="text-red-600 font-bold min-h-[96px] flex items-start justify-center"
                      style={{ fontSize: "clamp(1.25rem, 2vw, 1.5rem)" }}
                    >
                      <h3 className="m-0 leading-tight text-center">
                        Upgrade Your Character on GambleShield
                      </h3>
                    </div>
                  </div>
                  <div
                    className="mx-auto mb-6 flex items-center justify-center w-full"
                    style={{ height: 220 }}
                  >
                    <img
                      src="/how_it_works/upgrade.png"
                      alt="Upgrade Your Character on Gamble Shield"
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
                    Upgrade your{" "}
                    <Link
                      href="/profile"
                      className="text-red-600 font-semibold underline hover:text-red-700"
                    >
                      GambleShield avatar
                    </Link>{" "}
                    and unlock new features. Progress through levels and unlock
                    exclusive rewards and affiliate casino bonuses.
                  </p>
                </div>

                {/* Vote Which Slot Will Be Played */}
                <div
                  className="text-center flex flex-col items-center w-full rounded-2xl bg-white/70 backdrop-blur-md shadow-lg ring-1 ring-white/40"
                  style={{
                    padding: "clamp(1.5rem, 3vw, 3rem)",
                  }}
                >
                  <div className="flex flex-col items-center mb-4 shrink-0">
                    <span
                      className="text-red-500 font-black uppercase tracking-widest mb-3 block leading-none"
                      style={{ fontSize: "clamp(1rem, 1.6vw, 1.35rem)" }}
                    >
                      Step 3
                    </span>
                    <div
                      className="text-red-600 font-bold min-h-[96px] flex items-start justify-center"
                      style={{ fontSize: "clamp(1.25rem, 2vw, 1.5rem)" }}
                    >
                      <h3 className="m-0 leading-tight text-center">
                        Vote Which Slot Will Be Played on GambleShield
                      </h3>
                    </div>
                  </div>
                  <div
                    className="mx-auto mb-6 flex items-center justify-center w-full"
                    style={{ height: 220 }}
                  >
                    <Image
                      src="/how_it_works/vote.png"
                      alt="Vote Which Slot Will Be Played on Gamble Shield"
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
                    Use your GambleShield points to vote on which slot game will
                    be played next on the{" "}
                    <Link
                      href="/stream"
                      className="text-red-600 font-semibold underline hover:text-red-700"
                    >
                      stream
                    </Link>
                    . Influence the stream and interact with streamers in
                    real-time.
                  </p>
                </div>

                {/* Play Extra Games to Earn More */}
                <div
                  className="text-center flex flex-col items-center w-full rounded-2xl bg-white/70 backdrop-blur-md shadow-lg ring-1 ring-white/40"
                  style={{
                    padding: "clamp(1.5rem, 3vw, 3rem)",
                  }}
                >
                  <div className="flex flex-col items-center mb-4 shrink-0">
                    <span
                      className="text-red-500 font-black uppercase tracking-widest mb-3 block leading-none"
                      style={{ fontSize: "clamp(1rem, 1.6vw, 1.35rem)" }}
                    >
                      Step 4
                    </span>
                    <div
                      className="text-red-600 font-bold min-h-[96px] flex items-start justify-center"
                      style={{ fontSize: "clamp(1.25rem, 2vw, 1.5rem)" }}
                    >
                      <h3 className="m-0 leading-tight text-center">
                        Play Extra Games to Earn More on GambleShield
                      </h3>
                    </div>
                  </div>
                  <div
                    className="mx-auto mb-6 flex items-center justify-center w-full"
                    style={{ height: 220 }}
                  >
                    <Image
                      src="/how_it_works/play.png"
                      alt="Play Extra Games to Earn More on Gamble Shield"
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
                    Play mini-games on your{" "}
                    <Link
                      href="/profile"
                      className="text-red-600 font-semibold underline hover:text-red-700"
                    >
                      profile
                    </Link>{" "}
                    to earn extra points and unlock special{" "}
                    <Link
                      href="/stream"
                      className="text-red-600 font-semibold underline hover:text-red-700"
                    >
                      GambleShield stream
                    </Link>{" "}
                    bonuses.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Sales placeholder section (replaces homepage FAQ) */}
          <section
            className="w-full bg-[#FFF3C4] px-4 pb-20"
            style={{ paddingTop: "clamp(3rem, 6vw, 5rem)" }}
          >
            <div className="max-w-6xl mx-auto">
              <h2
                className="text-center font-bold mb-10 text-red-600"
                style={{ fontSize: "clamp(1.8rem, 3.5vw, 2.7rem)" }}
              >
                GambleShield &ndash; watch live stream and stay informed about
                the best online casinos
              </h2>

              <div className="grid gap-5 md:grid-cols-3">
                <div className="rounded-2xl border border-red-200 bg-white/70 p-5">
                  <Link href="/blog/best-casinos" className="block group">
                    <h4 className="font-bold text-red-600 mb-2 text-lg group-hover:underline">
                      GambleShield casino lists
                    </h4>
                    <p className="text-gray-700 text-sm leading-relaxed mb-4">
                      Safe casinos by GambleShield for best bonuses and RTP.
                    </p>
                    <span className="text-red-600 underline font-semibold">
                      Open casino lists &rarr;
                    </span>
                  </Link>
                </div>

                <div className="rounded-2xl border border-red-200 bg-white/70 p-5">
                  <Link href="/stream" className="block group">
                    <h4 className="font-bold text-red-600 mb-2 text-lg group-hover:underline">
                      GambleShield stream
                    </h4>
                    <p className="text-gray-700 text-sm leading-relaxed mb-4">
                      Watch GambleShield stream &amp; earn rewards.
                    </p>
                    <span className="text-red-600 underline font-semibold">
                      Watch stream &rarr;
                    </span>
                  </Link>
                </div>

                <div className="rounded-2xl border border-red-200 bg-white/70 p-5">
                  <Link href="/blog/best-casinos" className="block group">
                    <h4 className="font-bold text-red-600 mb-2 text-lg group-hover:underline">
                      Top 3 GambleShield casinos
                    </h4>
                    <p className="text-gray-700 text-sm leading-relaxed mb-4">
                      View casino lists, updated daily.
                    </p>
                    <span className="text-red-600 underline font-semibold">
                      View top 3 &rarr;
                    </span>
                  </Link>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
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
  blogPostId = null,
  name = "Affiliate Partner",
  openedText = [],
  logo = null,
  casinoLink = null,
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
      <div className="stup-fade-mobile relative" style={{ zIndex: 1 }}>
        <Image
          src={stupImage}
          alt={`${name} Casino Partner - Best Casino List`}
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
      </div>

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
          alt={`${name} Casino Review on Gamble Shield`}
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
                className="font-bold"
                style={{
                  fontSize: "clamp(0.8rem, 1.5vw, 1.2rem)",
                  textShadow: "2px 2px 4px rgba(0,0,0,0.7)",
                }}
              >
                {name}
              </h3>
              {openedText.length > 0 && (
                <p
                  style={{
                    fontSize: "clamp(0.5rem, 0.85vw, 0.75rem)",
                    textShadow: "1px 1px 3px rgba(0,0,0,0.7)",
                    marginBottom: "4px",
                    lineHeight: "1.3",
                  }}
                >
                  {openedText[0]}
                </p>
              )}
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
                className="font-bold mb-2"
                style={{
                  fontSize: "clamp(0.9rem, 1.8vw, 1.2rem)",
                  textShadow: "2px 2px 4px rgba(0,0,0,0.7)",
                }}
              >
                {name}
              </h3>
              {openedText.map((line, i) => (
                <p
                  key={i}
                  style={{
                    width: "90%",
                    textAlign: "center",
                    fontSize: "clamp(0.5rem, 0.9vw, 0.8rem)",
                    textShadow: "1px 1px 3px rgba(0,0,0,0.7)",
                    lineHeight: "1.3",
                    marginBottom: "2px",
                  }}
                >
                  {line}
                </p>
              ))}
              <div className="flex flex-col items-center gap-1 mt-2 pointer-events-auto">
                <Link
                  href={blogPostId ? `/blog/${blogPostId}` : "/blog"}
                  className="px-4 py-1 bg-white/20 hover:bg-white/40 text-white rounded-full text-xs font-semibold transition-colors"
                  style={{ textShadow: "1px 1px 3px rgba(0,0,0,0.7)" }}
                >
                  Click to view more →
                </Link>
                {casinoLink && (
                  <a
                    href={casinoLink}
                    target="_blank"
                    rel="sponsored nofollow noopener noreferrer"
                    className="px-4 py-1 rounded-full text-white font-bold text-xs transition-all duration-200 hover:scale-105"
                    style={{
                      background: "linear-gradient(135deg, #fb923c, #f97316)",
                      boxShadow: "0 2px 8px rgba(249,115,22,0.4)",
                      textShadow: "none",
                    }}
                  >
                    Go to {name} →
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {logo && (
        <div
          className="absolute left-0 right-0 flex justify-center px-1"
          style={{
            top: "-15%",
            zIndex: 100,
          }}
        >
          {casinoLink ? (
            <a
              href={casinoLink}
              target="_blank"
              rel="sponsored nofollow noopener noreferrer"
            >
              <Image
                src={logo}
                alt={`${name} - Best Casino List on Gamble Shield`}
                width={280}
                height={168}
                className="h-auto w-full hover:scale-105 transition-transform duration-200"
                style={{
                  marginTop: "clamp(10px, 2vw, 20px)",
                  objectFit: "contain",
                  position: "relative",
                  zIndex: 100,
                  width: "clamp(160px, 20vw, 300px)",
                }}
              />
            </a>
          ) : (
            <Image
              src={logo}
              alt={`${name} - Best Casino List on Gamble Shield`}
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
          )}
        </div>
      )}
    </div>
  );
}
