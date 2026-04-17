"use client";

import Link from "next/link";
import { useMemo } from "react";

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
    BLOG_THEME_MAP[cardBackground] ||
    BLOG_THEME_MAP["/3_Affiliate/zlatna/5.png"]
  );
}

function slugifyHeading(text) {
  return (text || "")
    .toLowerCase()
    .trim()
    .replace(/&[a-z0-9#]+;/gi, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function stripHtmlTags(value) {
  return (value || "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function buildAnchoredHtmlAndToc(rawHtml) {
  const source = rawHtml || "";
  if (!source) return { htmlWithAnchors: "", tocItems: [] };

  const seenSlugs = new Map();
  const tocItems = [];
  const htmlWithAnchors = source.replace(
    /<h2\b([^>]*)>([\s\S]*?)<\/h2>/gi,
    (fullMatch, attrs = "", inner = "") => {
      const headingText = stripHtmlTags(inner);
      if (!headingText) return fullMatch;

      const baseSlug = slugifyHeading(headingText) || "section";
      const currentCount = seenSlugs.get(baseSlug) || 0;
      seenSlugs.set(baseSlug, currentCount + 1);
      const id =
        currentCount === 0 ? baseSlug : `${baseSlug}-${currentCount + 1}`;
      tocItems.push({ id, text: headingText });

      const attrsWithoutId = String(attrs).replace(
        /\s+id\s*=\s*(['"]).*?\1/i,
        "",
      );
      return `<h2${attrsWithoutId} id="${id}">${inner}</h2>`;
    },
  );

  return { htmlWithAnchors, tocItems };
}

export default function BlogPostContent({ post, relatedArticles = [] }) {
  const theme = getTheme(post.cardBackground);
  const { introHtml, bodyFromFirstH2Html, tocItems } = useMemo(() => {
    const { htmlWithAnchors, tocItems: toc } = buildAnchoredHtmlAndToc(
      post.content || "",
    );
    if (!htmlWithAnchors) {
      return { introHtml: "", bodyFromFirstH2Html: "", tocItems: [] };
    }

    const firstH2Match = htmlWithAnchors.match(/<h2\b[^>]*>/i);
    const firstH2Index = firstH2Match ? firstH2Match.index : -1;

    if (firstH2Index === -1) {
      return {
        introHtml: htmlWithAnchors,
        bodyFromFirstH2Html: "",
        tocItems: toc,
      };
    }

    return {
      introHtml: htmlWithAnchors.slice(0, firstH2Index),
      bodyFromFirstH2Html: htmlWithAnchors.slice(firstH2Index),
      tocItems: toc,
    };
  }, [post.content]);

  const relatedCards = [
    ...relatedArticles.slice(0, 3).map((article) => ({
      ...article,
      isPlaceholder: false,
    })),
    ...Array.from(
      { length: Math.max(0, 3 - relatedArticles.length) },
      (_, index) => ({
        id: `placeholder-${index + 1}`,
        title: "Related article coming soon",
        excerpt:
          "This slot is reserved for articles with similar keywords and topic.",
        slug: null,
        isPlaceholder: true,
      }),
    ),
  ];
  const leftRailCards = [
    {
      id: "best-casinos",
      title: "Best Casinos 2026",
      description:
        "High-intent traffic: push directly to ranked casino lists and bonus offers.",
      href: "/blog/best-casinos",
      cta: "Open best casino list",
      external: false,
    },
    {
      id: "top-3-casinos",
      title: "Top 3 Casino Picks",
      description:
        "Placeholder for top 3 conversion widget (commission-focused placements).",
      href: "/blog/best-casinos",
      cta: "View top 3 picks",
      external: false,
    },
  ];

  const rightRailCards = [
    {
      id: "watch-stream",
      title: "Watch Live Stream",
      description:
        "Move engaged readers into live stream touchpoints, polls and offer CTAs.",
      href: "/stream",
      cta: "Watch stream now",
      external: false,
    },
    {
      id: "youtube-archive",
      title: "YouTube Archive (Offline)",
      description:
        "When stream is offline, route traffic to recorded sessions and highlights.",
      href: "https://youtube.com/gambleshield",
      cta: "Open YouTube archive",
      external: true,
    },
  ];

  return (
    <div
      className="min-h-screen normal-case text-white"
      style={{
        backgroundImage: ` ${theme.pageGradient}`,
        backgroundSize: "cover, cover, cover",
        backgroundPosition: "center, center, center",
        backgroundRepeat: "no-repeat, no-repeat, no-repeat",
      }}
    >
      <div className="pt-25">
        <div className="w-full px-4 sm:px-6 lg:px-10 pb-16">
          <div className="mx-auto max-w-[1800px]">
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

            <div className="mx-auto mt-8 sm:mt-10 grid gap-6 xl:grid-cols-[210px_minmax(0,1fr)_210px]">
              <aside className="hidden xl:block">
                <div className="sticky top-28 rounded-3xl border border-white/20 bg-black/45 backdrop-blur-sm p-4 shadow-2xl max-h-[calc(100vh-9rem)] overflow-y-auto">
                  <p className="text-xs uppercase tracking-wider text-white/70 mb-3">
                    Sales Focus Left
                  </p>
                  <div className="space-y-3">
                    {leftRailCards.map((card) => (
                      <div
                        key={card.id}
                        className="rounded-2xl border border-white/20 bg-white/5 p-4"
                      >
                        <p className="font-semibold text-white mb-2">
                          {card.title}
                        </p>
                        <p className="text-sm text-white/80 mb-3 leading-relaxed">
                          {card.description}
                        </p>
                        <Link
                          href={card.href}
                          className="text-sm underline"
                          style={{ color: theme.linkColor }}
                        >
                          {card.cta} &rarr;
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>
              </aside>
              <article className="self-start">
                <div className="w-full max-w-6xl mx-auto rounded-3xl border border-white/15 bg-black/45 backdrop-blur-sm px-4 sm:px-6 md:px-10 py-8 sm:py-10 shadow-2xl">
                  {post.image && (
                    <div className="mb-10">
                      <img
                        src={post.image}
                        alt={post.imageAlt || post.title}
                        className="w-full lg:w-[60%] h-auto rounded-2xl mx-auto"
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
                    dangerouslySetInnerHTML={{ __html: introHtml }}
                  />

                  {tocItems.length > 0 && (
                    <nav className="mb-10 rounded-2xl border border-white/20 bg-white/5 p-5 sm:p-6">
                      <p className="text-white font-semibold mb-3">
                        Table of Contents
                      </p>
                      <ul className="space-y-2">
                        {tocItems.map((item) => (
                          <li key={item.id}>
                            <a
                              href={`#${item.id}`}
                              className="underline"
                              style={{ color: theme.linkColor }}
                            >
                              {item.text}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </nav>
                  )}

                  {bodyFromFirstH2Html && (
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
                      dangerouslySetInnerHTML={{ __html: bodyFromFirstH2Html }}
                    />
                  )}

                  <div className="mt-16 pt-8 border-t border-white/30">
                    <h3
                      className="font-bold text-white mb-6"
                      style={{ fontSize: "clamp(1.1rem, 2vw, 1.5rem)" }}
                    >
                      Related Articles
                    </h3>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-6">
                      {relatedCards.map((article) => (
                        <article
                          key={article.id}
                          className="rounded-2xl border border-white/20 bg-white/5 p-4"
                        >
                          <p className="text-white font-semibold mb-2">
                            {article.title}
                          </p>
                          <p className="text-white/80 text-sm leading-relaxed">
                            {article.excerpt ||
                              "Explore more articles on this topic."}
                          </p>
                          {article.slug && (
                            <Link
                              href={`/blog/${article.slug}`}
                              className="inline-block mt-3 text-sm underline"
                              style={{ color: theme.linkColor }}
                            >
                              Read article &rarr;
                            </Link>
                          )}
                        </article>
                      ))}
                    </div>
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
              <aside className="hidden xl:block">
                <div className="sticky top-28 rounded-3xl border border-white/20 bg-black/45 backdrop-blur-sm p-4 sm:p-5 shadow-2xl max-h-[calc(100vh-9rem)] overflow-y-auto">
                  <p className="text-xs uppercase tracking-wider text-white/70 mb-3">
                    Sales Focus Right
                  </p>
                  <div className="space-y-3">
                    {rightRailCards.map((card) => (
                      <div
                        key={card.id}
                        className="rounded-2xl border border-white/20 bg-white/5 p-4"
                      >
                        <p className="font-semibold text-white mb-2">
                          {card.title}
                        </p>
                        <p className="text-sm text-white/80 mb-3 leading-relaxed">
                          {card.description}
                        </p>
                        {card.external ? (
                          <a
                            href={card.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm underline"
                            style={{ color: theme.linkColor }}
                          >
                            {card.cta} &rarr;
                          </a>
                        ) : (
                          <Link
                            href={card.href}
                            className="text-sm underline"
                            style={{ color: theme.linkColor }}
                          >
                            {card.cta} &rarr;
                          </Link>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </aside>
            </div>
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
          .blog-content :global(h2) {
            scroll-margin-top: 120px;
          }
          .blog-content :global(img) {
            display: block;
            margin-left: auto;
            margin-right: auto;
          }
          .blog-content :global(figcaption) {
            text-align: center;
            font-size: 0.9rem;
            line-height: 1.35rem;
            opacity: 0.8;
            margin-top: 0.6rem;
          }
          html {
            scroll-behavior: smooth;
          }
        `}</style>
      </div>
    </div>
  );
}
