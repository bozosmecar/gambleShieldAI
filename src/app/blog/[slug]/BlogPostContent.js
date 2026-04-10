"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import DOMPurify from "dompurify";

const BLOG_THEME_MAP = {
  "/3_Affiliate/crvena/5.png": {
    pageGradient:
      "linear-gradient(160deg, #2b0b0f 0%, #5a1018 45%, #1f090d 100%)",
    heroGradient:
      "linear-gradient(135deg, rgba(179, 28, 42, 0.72) 0%, rgba(120, 17, 29, 0.52) 100%)",
    navColor: "#7f1d1d",
    linkColor: "#fca5a5",
    linkHoverColor: "#fecaca",
  },
  "/3_Affiliate/plava/5.png": {
    pageGradient:
      "linear-gradient(160deg, #0b1935 0%, #153164 48%, #09162d 100%)",
    heroGradient:
      "linear-gradient(135deg, rgba(37, 99, 235, 0.68) 0%, rgba(29, 78, 216, 0.5) 100%)",
    navColor: "#1d4ed8",
    linkColor: "#93c5fd",
    linkHoverColor: "#bfdbfe",
  },
  "/3_Affiliate/zelena/5.png": {
    pageGradient:
      "linear-gradient(160deg, #082116 0%, #0f3f2b 46%, #071b13 100%)",
    heroGradient:
      "linear-gradient(135deg, rgba(22, 163, 74, 0.66) 0%, rgba(21, 128, 61, 0.48) 100%)",
    navColor: "#15803d",
    linkColor: "#6ee7b7",
    linkHoverColor: "#a7f3d0",
  },
  "/3_Affiliate/zlatna/5.png": {
    pageGradient:
      "linear-gradient(160deg, #2f1f07 0%, #5f3b0e 44%, #231704 100%)",
    heroGradient:
      "linear-gradient(135deg, rgba(245, 158, 11, 0.68) 0%, rgba(217, 119, 6, 0.5) 100%)",
    navColor: "#b45309",
    linkColor: "#fcd34d",
    linkHoverColor: "#fde68a",
  },
  "/3_Affiliate/ljubicasta/5.png": {
    pageGradient:
      "linear-gradient(160deg, #210c32 0%, #3e1a63 48%, #190a27 100%)",
    heroGradient:
      "linear-gradient(135deg, rgba(147, 51, 234, 0.66) 0%, rgba(109, 40, 217, 0.5) 100%)",
    navColor: "#6d28d9",
    linkColor: "#c4b5fd",
    linkHoverColor: "#ddd6fe",
  },
};

function getTheme(cardBackground) {
  return (
    BLOG_THEME_MAP[cardBackground] || BLOG_THEME_MAP["/3_Affiliate/zlatna/5.png"]
  );
}

export default function BlogPostContent({ post }) {
  const [navBarHidden, setNavBarHidden] = useState(false);

  useEffect(() => {
    const handleScroll = () => setNavBarHidden(window.scrollY > 60);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const theme = getTheme(post.cardBackground);
  const safeContent = DOMPurify.sanitize(post.content || "");

  return (
    <div
      className="min-h-screen normal-case text-white"
      style={{ background: theme.pageGradient }}
    >
      <div className="pt-25">
        <div
          className={`fixed top-0 left-0 right-0 z-[98] transition-transform duration-300 ${
            navBarHidden ? "-translate-y-full" : "translate-y-0"
          }`}
          style={{
            height: "100px",
            background: theme.navColor,
            pointerEvents: "none",
          }}
        />
        <div className="w-full px-4 sm:px-6 lg:px-10 pb-16">
          <div className="mx-auto max-w-5xl">
            <header
              className="mt-4 sm:mt-6 rounded-3xl p-8 sm:p-10 lg:p-14 border border-white/20 shadow-2xl"
              style={{ background: theme.heroGradient }}
            >
              <h1
                className="font-bold text-white mb-4 leading-tight text-center"
                style={{ fontSize: "clamp(1.35rem, 4vw, 3.1rem)" }}
              >
                {post.title}
              </h1>
              <p
                className="text-white/90 text-center"
                style={{ fontSize: "clamp(0.8rem, 1.6vw, 1rem)" }}
              >
                {post.date}
              </p>
            </header>

            <article className="mx-auto mt-8 sm:mt-10">
              <div className="rounded-3xl border border-white/15 bg-black/45 backdrop-blur-sm px-4 sm:px-6 md:px-10 py-8 sm:py-10 shadow-2xl">
                {post.image && (
                  <div className="mb-10">
                    <img
                      src={post.image}
                      alt={post.imageAlt || post.title}
                      className="w-full h-auto rounded-2xl"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                )}

                <div
                  className={`blog-content prose max-w-none prose-invert
                  prose-headings:!text-white prose-headings:font-bold
                  prose-h2:mt-12 prose-h2:mb-6
                  prose-h3:mt-8 prose-h3:mb-4
                  prose-p:!text-white prose-p:leading-relaxed prose-p:mb-6
                  prose-ul:my-6 prose-ul:space-y-2
                  prose-li:!text-white
                  prose-strong:!text-white prose-strong:font-semibold
                  prose-em:!text-white prose-blockquote:!text-white
                  prose-td:!text-white prose-th:!text-white
                  [&_*]:!text-white [&_a]:underline`}
                  style={{ fontSize: "clamp(0.9rem, 1.45vw, 1.08rem)" }}
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
                      className="font-medium underline"
                      style={{ color: theme.linkColor }}
                    >
                      View all articles &rarr;
                    </Link>
                  </div>
                </div>
              </div>
            </article>
          </div>
        </div>
        <style jsx>{`
          .blog-content :global(a) {
            color: ${theme.linkColor};
            transition: color 160ms ease;
          }
          .blog-content :global(a:hover) {
            color: ${theme.linkHoverColor};
          }
        `}</style>
      </div>
    </div>
  );
}
