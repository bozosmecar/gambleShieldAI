"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import DOMPurify from "dompurify";

const SCROLL_COLOR_MAP = {
  "/3_Affiliate/crvena/5.png": {
    folder: "red",
    prefix: "red",
    botSuffix: "bottom",
  },
  "/3_Affiliate/plava/5.png": { folder: "blue", prefix: "blue" },
  "/3_Affiliate/zelena/5.png": { folder: "green", prefix: "green" },
  "/3_Affiliate/zlatna/5.png": { folder: "gold", prefix: "gold" },
  "/3_Affiliate/ljubicasta/5.png": { folder: "purple", prefix: "purple" },
};

function getScrollImages(cardBackground) {
  const color =
    SCROLL_COLOR_MAP[cardBackground] ||
    SCROLL_COLOR_MAP["/3_Affiliate/zlatna/5.png"];
  const bot = color.botSuffix || "bot";
  return {
    top: `/blog/${color.folder}/${color.prefix}-top.png`,
    mid: `/blog/${color.folder}/${color.prefix}-mid.png`,
    bottom: `/blog/${color.folder}/${color.prefix}-${bot}.png`,
  };
}

export default function BlogPostContent({ post }) {
  const [navBarHidden, setNavBarHidden] = useState(false);

  useEffect(() => {
    const handleScroll = () => setNavBarHidden(window.scrollY > 60);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scroll = getScrollImages(post.cardBackground);
  const safeContent = DOMPurify.sanitize(post.content || "");

  return (
    <div
      className="min-h-screen normal-case text-white"
      style={{ backgroundColor: "#f59e0b" }}
    >
      <div
        className="pt-25"
        style={{
          backgroundImage: "url(/blog/backgroundPost.png)",
          backgroundSize: "cover",
          backgroundPosition: "center top",
          backgroundRepeat: "no-repeat",
          backgroundColor: "#8B7355",
        }}
      >
        <div
          className={`fixed top-0 left-0 right-0 z-[98] transition-transform duration-300 ${
            navBarHidden ? "-translate-y-full" : "translate-y-0"
          }`}
          style={{
            height: "100px",
            background: "#f59e0b",
            pointerEvents: "none",
          }}
        />
        <div
          className="grid gap-0 overflow-x-visible"
          style={{ gridTemplateRows: "auto auto auto" }}
        >
          {/* Row 1: top */}
          <div className="w-full relative flex justify-center z-10">
            <img
              src={scroll.top}
              alt=""
              aria-hidden
              className="w-[100vw] lg:w-[80vw] h-auto block"
            />
            <div
              className="absolute inset-0 flex flex-col items-center justify-center mx-auto px-4 sm:px-8 md:px-16 py-4 w-[95%] sm:w-[85%] md:w-[70%] lg:w-[55%] xl:w-[50%] text-center"
              style={{ top: "clamp(0px, 10vw, 100px)" }}
            >
              <h1
                className="font-bold text-white mb-2 sm:mb-4 leading-tight"
                style={{ fontSize: "clamp(0.9rem, 2.8vw, 3.5rem)" }}
              >
                {post.title}
              </h1>
              <span
                className="text-white/90"
                style={{ fontSize: "clamp(0.5rem, 0.9vw, 0.9rem)" }}
              >
                {post.date}
              </span>
            </div>
          </div>

          {/* Row 2: mid */}
          <div
            className="bg-center relative w-[100vw] lg:w-[80vw] mx-auto"
            style={{
              backgroundImage: `url(${scroll.mid})`,
              backgroundSize: "100% 100%",
              backgroundRepeat: "no-repeat",
            }}
          >
            <article className="mx-auto pb-20 pt-8 lg:pt-12" style={{ width: "clamp(280px, 65%, 900px)" }}>
              <div className="px-4 sm:px-6 md:px-10 mx-auto w-full">
                {post.image && (
                  <div className="mb-12">
                    <img
                      src={post.image}
                      alt={post.imageAlt || post.title}
                      className="w-full h-auto rounded-2xl"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                )}

                <div
                  className="prose max-w-none prose-invert
                  prose-headings:!text-white prose-headings:font-bold
                  prose-h2:mt-12 prose-h2:mb-6
                  prose-h3:mt-8 prose-h3:mb-4
                  prose-p:!text-white prose-p:leading-relaxed prose-p:mb-6
                  prose-ul:my-6 prose-ul:space-y-2
                  prose-li:!text-white
                  prose-strong:!text-white prose-strong:font-semibold
                  prose-em:!text-white prose-blockquote:!text-white
                  prose-td:!text-white prose-th:!text-white
                  [&_*]:!text-white [&_a]:!text-orange-300 [&_a:hover]:!text-orange-200"
                  style={{ fontSize: "clamp(0.8rem, 1.5vw, 1.1rem)" }}
                  dangerouslySetInnerHTML={{ __html: safeContent }}
                />

                <div className="mt-16 pt-8 border-t border-white/30">
                  <h3
                    className="font-bold text-white mb-6"
                    style={{ fontSize: "clamp(1.1rem, 2vw, 1.5rem)" }}
                  >
                    Related Articles
                  </h3>
                  <div>
                    <Link
                      href="/blog"
                      className="text-orange-400 hover:text-orange-300 font-medium"
                    >
                      View all articles &rarr;
                    </Link>
                  </div>
                </div>
              </div>
            </article>
          </div>

          {/* Row 3: bottom */}
          <div className="relative flex justify-center w-[100vw] lg:w-[80vw] mx-auto mb-15">
            <img
              src={scroll.bottom}
              alt=""
              aria-hidden
              className="w-full h-auto block"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
