"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export default function Home() {
  const aboutSectionRef = useRef(null);
  const affiliateSectionRef = useRef(null);
  const mainRef = useRef(null);
  const [backgroundOffset, setBackgroundOffset] = useState(0);

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

  useEffect(() => {
    const handleScroll = () => {
      if (aboutSectionRef.current && mainRef.current) {
        const aboutTop = aboutSectionRef.current.getBoundingClientRect().top;
        const threshold = 200;

        if (aboutTop > threshold) {
          setBackgroundOffset(0);
        } else {
          const distanceScrolled = Math.abs(aboutTop - threshold);
          setBackgroundOffset(-(distanceScrolled * 0.5));
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
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
        className="block w-full bg-[url('/1_Home%20page/home4.png')] lg:bg-[url('/1_Home%20page/home3.png')] bg-no-repeat bg-fixed"
        style={{
          height: "auto",
          backgroundSize: "100% auto",
          backgroundPosition: `center ${backgroundOffset}px`,
          transition: "background-position 0.1s ease-out",
          display: "block",
          overflow: "visible",
          position: "relative",
          zIndex: 20,
          marginTop: "70px",
        }}
      >
        <div style={{ height: "120vh", position: "relative" }}>
          {/* Register Button Centered */}
          <div
            className="fixed inset-0 flex items-center justify-center pointer-events-none"
            style={{ zIndex: 20 }}
          >
            <Link
              href="/register"
              className="pointer-events-auto px-10 py-4 bg-green-600 hover:bg-green-700 text-white rounded-2xl shadow-lg text-2xl font-bold transition duration-200"
              style={{
                fontSize: "clamp(1.25rem, 3vw, 2rem)",
                fontFamily: "inherit",
                letterSpacing: "0.03em",
                marginLeft: "20px",
              }}
            >
              Register
            </Link>
          </div>
        </div>

        {/* Wrapper for About and Affiliate sections with shared background */}
        {/* ✅ CHANGE: background moved to an absolute layer to prevent first-load snap */}
        <div
          className="relative w-full scrool-fade-in overflow-hidden"
          style={{
            marginTop: "-200px",
            position: "relative",
            zIndex: 30,
            paddingTop: "clamp(250px, 35vh, 500px)",
          }}
        >
          {/* Background layer (stays stable even when content height changes) */}
          <div
            aria-hidden
            className="absolute inset-0 bg-[url('/3_Affiliate/backgroundPhone.png')] lg:bg-[url('/3_Affiliate/background3.png')] bg-no-repeat bg-cover"
            style={{
              backgroundPosition: "center top",
              zIndex: 0,
              transform: "translateZ(0)",
              willChange: "transform",
            }}
          />

          {/* Content layer */}
          <div className="relative z-10">
            {/* About Company Section */}
            <section
              ref={aboutSectionRef}
              className="relative w-full flex flex-col items-center justify-center scroll-fade-in bg-[url('/2_About%20company/luk4.png')] bg-no-repeat bg-center bg-cover md:bg-cover"
              style={{
                minHeight: "90vh",
                paddingTop: "clamp(100px, 15vh, 200px)",
                paddingBottom: "clamp(3rem, 8vw, 6rem)",
                paddingLeft: "clamp(2rem, 5vw, 4rem)",
                paddingRight: "clamp(2rem, 5vw, 4rem)",
                overflow: "visible",
                marginTop: "0px",
                backgroundPosition: "center center",
              }}
            >
              {/* Center Content - Two boxes side by side */}
              <div
                className="relative flex flex-col md:flex-row items-center justify-center gap-4 md:gap-10 z-20 w-full px-4"
                style={{
                  minHeight: "auto",
                  maxWidth: "1200px",
                  margin: "0 auto",
                  marginTop: "clamp(80vh, 80%, 450px)",
                }}
              >
                {/* Our Vision Box */}
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

                {/* Our Mission Box */}
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

            {/* Affiliate Section with 8 Columns using CSS Grid */}
            <div
              className="mt-[30px] flex justify-around w-full"
              style={{
                minHeight: "70vh",
                overflow: "visible",
                position: "relative",
                paddingTop: "clamp(80px, 10vw, 150px)",
                paddingBottom: "clamp(2rem, 5vw, 4rem)",
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
                {/* Grid Container - Responsive: 2 columns on small screens, 4 on large */}
                <div
                  className="relative w-full grid grid-cols-2 lg:grid-cols-4 place-items-center"
                  style={{
                    columnGap: "clamp(0.5rem, 4vw, 3rem)",
                    rowGap: "clamp(1rem, 3vh, 2rem)",
                    overflow: "visible",
                  }}
                >
                  {[
                    {
                      color: "green",
                      folder: "zelena_zastava/1-10 _za animaciju",
                      suffix: "",
                    },
                    { color: "blue", folder: "blue", suffix: "_blue" },
                    { color: "red", folder: "red", suffix: "_red" },
                    { color: "golden", folder: "golden", suffix: "_gold" },
                    { color: "purple", folder: "purple", suffix: "_purple" },
                    { color: "brown", folder: "brown", suffix: "_recolored" },
                    {
                      color: "green",
                      folder: "zelena_zastava/1-10 _za animaciju",
                      suffix: "",
                    },
                    { color: "blue", folder: "blue", suffix: "_blue" },
                  ].map((flagConfig, idx) => (
                    <AffiliateColumn
                      key={idx}
                      stupImage="/3_Affiliate/stup_1567/stup_afili_1567px.svg"
                      stupWidth={1567}
                      stupHeight={1200}
                      index={idx}
                      flagFolder={flagConfig.folder}
                      flagSuffix={flagConfig.suffix}
                    />
                  ))}
                </div>
              </div>
            </div>
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
  flagFolder = "zelena_zastava/1-10 _za animaciju",
  flagSuffix = "",
}) {
  const [currentFrame, setCurrentFrame] = useState(5);
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
            setIsAnimating(false);
            setDirection("forward");
            setTimeout(() => setTextOpacity(1), 100);
          }
        }, 10);
      }, 300);
    } else {
      setTextOpacity(0);

      setTimeout(() => {
        let frame = 1;
        const interval = setInterval(() => {
          frame++;
          setCurrentFrame(frame);
          if (frame >= 5) {
            clearInterval(interval);
            setIsAnimating(false);
            setDirection("backward");
            setTimeout(() => setTextOpacity(1), 100);
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
        minWidth: "180px",
        maxWidth: "320px",
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
        className="h-auto w-full"
        style={{
          maxHeight: "100vh",
          objectFit: "contain",
          position: "relative",
          zIndex: 1,
        }}
      />

      {/* Single Flag positioned at top */}
      <div
        className="absolute left-1/2 transform -translate-x-1/2 cursor-pointer"
        style={{
          top: "10%",
          width: "clamp(65%, 85%, 105%)",
          zIndex: 10,
        }}
        onClick={handleFlagClick}
      >
        <img
          src={`/3_Affiliate/${flagFolder}/${currentFrame}${flagSuffix}.png`}
          alt="Flag"
          style={{ width: "100%", height: "auto", display: "block" }}
        />

        {/* Text Overlay */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
          style={{
            opacity: textOpacity,
            transition: "opacity 0.3s ease-in-out",
            padding: "10%",
          }}
        >
          {currentFrame === 5 && (
            <div className="text-center text-white">
              <h3
                className="font-bold mb-2"
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

          {currentFrame === 1 && (
            <div className="text-center text-white">
              <h3
                className="font-bold mb-3"
                style={{
                  fontSize: "clamp(1rem, 2vw, 1.5rem)",
                  textShadow: "2px 2px 4px rgba(0,0,0,0.7)",
                }}
              >
                Premium Partnership
              </h3>
              <p
                className="mb-2"
                style={{
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

      {/* Casumo logo */}
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
