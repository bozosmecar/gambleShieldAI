"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export default function Home() {
  const aboutSectionRef = useRef(null);
  const affiliateSectionRef = useRef(null);
  const mainRef = useRef(null);
  const vrataRef = useRef(null);

  const [backgroundOffset, setBackgroundOffset] = useState(0); // ostavljam ga, ali ga više ne koristimo za scroll

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        });
      },
      { threshold: 0.2, rootMargin: "0px 0px -50px 0px" },
    );

    const aboutRef = aboutSectionRef.current;
    const affiliateRef = affiliateSectionRef.current;

    if (aboutRef) observer.observe(aboutRef);
    if (affiliateRef) observer.observe(affiliateRef);

    return () => {
      if (aboutRef) observer.unobserve(aboutRef);
      if (affiliateRef) observer.unobserve(affiliateRef);
    };
  }, []);

  // ✅ REF + RAF scroll update (instant, bez rerendera)
  useEffect(() => {
    let rafId = null;

    const apply = () => {
      rafId = null;
      if (!aboutSectionRef.current || !mainRef.current) return;

      const aboutTop = aboutSectionRef.current.getBoundingClientRect().top;
      const threshold = 0;

      let offset = 0;
      if (aboutTop <= threshold) {
        const distanceScrolled = Math.abs(aboutTop - threshold);
        offset = -(distanceScrolled * 1);
      }

      // direktno u DOM — instant
      mainRef.current.style.backgroundPosition = `center ${offset}px`;

      // Sync vrata s background pozicijom - koristi isti offset kao background
      if (vrataRef.current) {
        vrataRef.current.style.transform = `translateY(${offset}px)`;
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
    <div style={{ margin: 0, padding: 0, width: "100%", overflow: "hidden" }}>
      {/* Navbar */}
      <nav
        className="fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-md shadow-md z-[100]"
        style={{ height: "70px" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
          {/* Logo/Brand */}
          <div className="flex items-center">
            <Link href="/">
              <h1
                className="font-bold text-green-600 cursor-pointer"
                style={{ fontSize: "clamp(1.25rem, 2.5vw, 1.75rem)" }}
              >
                GambleShield
              </h1>
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="flex items-center gap-6 sm:gap-8">
            <Link
              href="/"
              className="text-green-600 font-bold transition-colors border-b-2 border-green-600"
              style={{ fontSize: "clamp(0.9rem, 1.5vw, 1.1rem)" }}
            >
              Home
            </Link>
            <Link
              href="/profile"
              className="text-gray-700 hover:text-green-600 font-medium transition-colors"
              style={{ fontSize: "clamp(0.9rem, 1.5vw, 1.1rem)" }}
            >
              Profile
            </Link>
            <Link
              href="/stream"
              className="text-gray-700 hover:text-green-600 font-medium transition-colors"
              style={{ fontSize: "clamp(0.9rem, 1.5vw, 1.1rem)" }}
            >
              Stream
            </Link>
            <Link
              href="/register"
              className="text-gray-700 hover:text-green-600 font-medium transition-colors"
              style={{ fontSize: "clamp(0.9rem, 1.5vw, 1.1rem)" }}
            >
              Register
            </Link>
            <Link
              href="/login"
              className="text-gray-700 hover:text-green-600 font-medium transition-colors"
              style={{ fontSize: "clamp(0.9rem, 1.5vw, 1.1rem)" }}
            >
              Login
            </Link>
          </div>
        </div>
      </nav>

      <main
        ref={mainRef}
        className="block w-full bg-[url('/1_Home%20page/home4.png')] lg:bg-[url('/1_Home%20page/home.png')] bg-no-repeat bg-fixed"
        style={{
          height: "auto",
          backgroundSize: "100% auto",
          // ✅ inicijalno (scroll effect poslije preuzima)
          backgroundPosition: `center ${backgroundOffset}px`,
          display: "block",
          overflow: "visible",
          position: "relative",
          zIndex: 20,
          marginTop: "70px",
        }}
      >
        <div style={{ height: "120vh", position: "relative" }}>
          {/* Vrata Image - syncs with background */}
          <div
            ref={vrataRef}
            className="fixed opacity-0 hover:opacity-100 transition-opacity duration-300"
            style={{
              left: "43.4%",
              top: "17.3vw",
              width: "clamp(9vw, 13vw, 17vw)",
              height: "auto",
              zIndex: 15,
              willChange: "transform",
            }}
          >
            <Image
              src="/1_Home page/vrata.png"
              alt="Vrata"
              width={400}
              height={200}
              className="w-full h-auto"
              style={{ objectFit: "contain" }}
            />
          </div>
        </div>

        {/* Wrapper for About and Affiliate sections with shared background */}
        <div
          className="relative w-full scrool-fade-in overflow-hidden"
          style={{
            marginTop: "-200px",
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

          <div className="relative z-2000">
            <section
              ref={aboutSectionRef}
              className="relative w-full flex flex-col items-center justify-center  bg-[url('/2_About%20company/luk4.png')] bg-no-repeat bg-center bg-cover md:bg-contain"
              style={{
                minHeight: "90vh",
                paddingTop: "clamp(100px, 15vh, 200px)",
                paddingBottom: "clamp(3rem, 8vw, 6rem)",
                paddingLeft: "clamp(2rem, 5vw, 4rem)",
                paddingRight: "clamp(2rem, 5vw, 4rem)",
                overflow: "visible",
                marginTop: "-300px",
                backgroundPosition: "center center",
                overflow: "visible",
                zIndex: 2000,
              }}
            >
              <div
                className="relative flex flex-col md:flex-row items-center justify-center gap-4 md:gap-10 z-20 w-full px-4"
                style={{
                  minHeight: "auto",
                  maxWidth: "1200px",
                  margin: "0 auto",
                  marginTop: "clamp(80vh, 80%, 450px)",
                }}
              >
                <div
                  className="bg-gray-200/40 backdrop-blur-sm rounded-2xl text-center p-6 flex flex-col"
                  style={{
                    minHeight: "250px",
                    width: "clamp(300px, 45%, 450px)",
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
                  className="bg-gray-200/40 backdrop-blur-sm rounded-2xl text-center p-6 flex flex-col"
                  style={{
                    minHeight: "250px",
                    width: "clamp(300px, 45%, 450px)",
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

            <div
              className="mt-[30px] flex justify-around w-full bg-amber-500"
              style={{
                minHeight: "70vh",
                overflow: "hidden",
                position: "relative",
                paddingTop: "clamp(80px, 10vw, 150px)",
                paddingBottom: "clamp(2rem, 5vw, 3rem)",
              }}
            >
              <div
                ref={affiliateSectionRef}
                className="relative w-full max-w-[1400px] mx-auto scroll-fade-in"
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "center",
                  paddingLeft: "clamp(1rem, 3vw, 2rem)",
                  paddingRight: "clamp(1rem, 3vw, 2rem)",
                  zIndex: 10,
                  overflow: "visible",
                }}
              >
                <div
                  className="relative w-full grid grid-cols-2 lg:grid-cols-4 place-items-center grid-col-gap-10"
                  style={{
                    columnGap: "clamp(2rem, 8vw, 10rem)",
                    rowGap: "clamp(1rem, 3vh, 2rem)",
                    overflow: "visible",
                  }}
                >
                  {[
                    { folder: "crvena", suffix: "", prefix: "", maxFrame: 6 },
                    { folder: "plava", suffix: "", prefix: "", maxFrame: 6 },
                    { folder: "zelena", suffix: "", prefix: "", maxFrame: 6 },
                    { folder: "ljubicasta", suffix: "", prefix: "", maxFrame: 6 },
                    { folder: "crvena", suffix: "", prefix: "", maxFrame: 6 },
                    { folder: "plava", suffix: "", prefix: "", maxFrame: 6 },
                    { folder: "zelena", suffix: "", prefix: "", maxFrame: 6 },
                    { folder: "ljubicasta", suffix: "", prefix: "", maxFrame: 6 },
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
                
                <div className="flex flex-wrap gap-8 mb-12 w-full" style={{ justifyContent: "center" }}>
                  {/* Watch Stream */}
                  <div className="text-center" style={{ padding: "clamp(1.5rem, 3vw, 3rem)", width: "20%", minWidth: "200px" }}>
                    <div className="mx-auto mb-6 flex items-center justify-center">
                      <Image
                        src="/how_it_works/watch.png"
                        alt="Watch Stream"
                        width={300}
                        height={300}
                        className="w-full max-w-[300px] h-auto"
                        style={{ objectFit: "contain" }}
                      />
                    </div>
                    <p className="text-gray-600" style={{ fontSize: "clamp(1.125rem, 2.25vw, 1.5rem)", lineHeight: "1.6" }}>
                      Watch live gambling streams and real gameplay. Learn from experienced players and see how bonuses work in practice.
                    </p>
                  </div>

                  {/* Upgrade Your Character */}
                  <div className="text-center" style={{ padding: "clamp(1.5rem, 3vw, 3rem)", width: "20%", minWidth: "200px" }}>
                    <div className="mx-auto mb-6 flex items-center justify-center">
                      <Image
                        src="/how_it_works/upgrade.png"
                        alt="Upgrade Your Character"
                        width={300}
                        height={300}
                        className="w-full max-w-[300px] h-auto"
                        style={{ objectFit: "contain" }}
                      />
                    </div>
                    <p className="text-gray-600" style={{ fontSize: "clamp(1.125rem, 2.25vw, 1.5rem)", lineHeight: "1.6" }}>
                      Upgrade your character and unlock new features. Progress through levels and unlock exclusive rewards.
                    </p>
                  </div>

                  {/* Vote Which Slot Will Be Played */}
                  <div className="text-center" style={{ padding: "clamp(1.5rem, 3vw, 3rem)", width: "20%", minWidth: "200px" }}>
                    <div className="mx-auto mb-6 flex items-center justify-center">
                      <Image
                        src="/how_it_works/vote.png"
                        alt="Vote Which Slot Will Be Played"
                        width={300}
                        height={300}
                        className="w-full max-w-[300px] h-auto"
                        style={{ objectFit: "contain" }}
                      />
                    </div>
                    <p className="text-gray-600" style={{ fontSize: "clamp(1.125rem, 2.25vw, 1.5rem)", lineHeight: "1.6" }}>
                      Use your points to vote on which slot game will be played next. Influence the stream and interact with streamers in real-time.
                    </p>
                  </div>

                  {/* Play Extra Games to Earn More */}
                  <div className="text-center" style={{ padding: "clamp(1.5rem, 3vw, 3rem)", width: "20%", minWidth: "200px" }}>
                    <div className="mx-auto mb-6 flex items-center justify-center">
                      <Image
                        src="/how_it_works/play.png"
                        alt="Play Extra Games to Earn More"
                        width={300}
                        height={300}
                        className="w-full max-w-[300px] h-auto"
                        style={{ objectFit: "contain" }}
                      />
                    </div>
                    <p className="text-gray-600" style={{ fontSize: "clamp(1.125rem, 2.25vw, 1.5rem)", lineHeight: "1.6" }}>
                      Play additional games and mini-games to earn extra points. Boost your rewards and unlock special bonuses.
                    </p>
                  </div>
                </div>


              </div>
            </section>
          </div>
        </div>
      </main>

      {/* Footer Section */}
      <footer className="bg-gray-900 text-white w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            {/* Company Info */}
            <div>
              <h3 className="font-bold text-green-400 mb-4 text-xl">GambleShield</h3>
              <p className="text-gray-400 mb-4" style={{ fontSize: "clamp(0.875rem, 1.5vw, 1rem)" }}>
                Transparent gambling platform built by experienced players. We educate, test, and hold casinos accountable.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-bold mb-4 text-lg">Quick Links</h4>
              <ul className="space-y-2">
                <li>
                  <Link href="/" className="text-gray-400 hover:text-green-400 transition-colors">
                    Home
                  </Link>
                </li>
                <li>
                  <Link href="/profile" className="text-gray-400 hover:text-green-400 transition-colors">
                    Profile
                  </Link>
                </li>
                <li>
                  <Link href="/stream" className="text-gray-400 hover:text-green-400 transition-colors">
                    Stream
                  </Link>
                </li>
                <li>
                  <Link href="/register" className="text-gray-400 hover:text-green-400 transition-colors">
                    Register
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contact & Social */}
            <div>
              <h4 className="font-bold mb-4 text-lg">Contact & Social</h4>
              <div className="space-y-3 mb-4">
                <p className="text-gray-400" style={{ fontSize: "clamp(0.875rem, 1.5vw, 1rem)" }}>
                  Email: contact@gambleshield.com
                </p>
                <p className="text-gray-400" style={{ fontSize: "clamp(0.875rem, 1.5vw, 1rem)" }}>
                  Support: support@gambleshield.com
                </p>
              </div>
              <div className="flex gap-4">
                <a
                  href="https://twitter.com/gambleshield"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-green-400 transition-colors"
                  aria-label="Twitter"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
                <a
                  href="https://facebook.com/gambleshield"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-green-400 transition-colors"
                  aria-label="Facebook"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                  </svg>
                </a>
                <a
                  href="https://youtube.com/gambleshield"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-green-400 transition-colors"
                  aria-label="YouTube"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" d="M19.812 5.418c.861.23 1.538.907 1.768 1.768C21.998 8.746 22 12 22 12s0 3.255-.418 4.814a2.504 2.504 0 0 1-1.768 1.768c-1.56.419-7.814.419-7.814.419s-6.255 0-7.814-.419a2.505 2.505 0 0 1-1.768-1.768C2 15.255 2 12 2 12s0-3.255.417-4.814a2.507 2.507 0 0 1 1.768-1.768C5.744 5 11.998 5 11.998 5s6.255 0 7.814.418ZM15.194 12 10 15V9l5.194 3Z" clipRule="evenodd" />
                  </svg>
                </a>
                <a
                  href="https://instagram.com/gambleshield"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-green-400 transition-colors"
                  aria-label="Instagram"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.398.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                  </svg>
                </a>
              </div>
            </div>
          </div>

          {/* Copyright */}
          <div className="border-t border-gray-800 pt-8 text-center">
            <p className="text-gray-400" style={{ fontSize: "clamp(0.75rem, 1.2vw, 0.875rem)" }}>
              © {new Date().getFullYear()} GambleShield. All rights reserved. | Responsible Gambling
            </p>
          </div>
        </div>
      </footer>
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
      className={`relative flex flex-col items-center justify-start ${
        isSecondRowSmall ? "-mt-[50%]" : ""
      } ${isSecondRowLarge ? "lg:mt-[-30%] lg:ml-[5%]" : "lg:mt-0"}`}
      style={{
        width: "clamp(250px, 30vw, 450px)",
        maxHeight: "60vh",
        minHeight: "150px",
        overflow: "visible",
        zIndex: 1,
        isolation: "isolate",
      }}
    >
      <Image
        src={stupImage}
        alt="Affiliate Column"
        width={stupWidth}
        height={stupHeight}
        style={{
          width: "120vh",
          maxHeight: "140vh",
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
          style={{ width: "100%", height: "auto", display: "block" }}
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
          className="w-full max-w-[260px] h-auto"
          style={{ objectFit: "contain", position: "relative", zIndex: 100 }}
        />
      </div>
    </div>
  );
}
