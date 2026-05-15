"use client";

import { useEffect, useMemo, useState } from "react";
import { compareArticlesByNewest, getArticles } from "@/lib/blogArticles";
import BlogPostCard from "@/components/BlogPostCard";
import { isBestCasinos } from "@/lib/categoryUtils";
import BlogPostCardSkeleton from "@/components/BlogPostCardSkeleton";

const POSTS_PER_PAGE = 9;

export default function BestCasinosPage() {
  const [blogPosts, setBlogPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    async function load() {
      const data = await getArticles();
      setBlogPosts(data);
      setLoading(false);
    }
    load();
  }, []);

  const gridPosts = useMemo(() => {
    return [...blogPosts]
      .filter((p) => isBestCasinos(p.category) && !p.hidden)
      .sort(compareArticlesByNewest);
  }, [blogPosts]);

  const totalPages = Math.ceil(gridPosts.length / POSTS_PER_PAGE) || 1;
  const startIdx = (currentPage - 1) * POSTS_PER_PAGE;
  const paginatedPosts = gridPosts.slice(startIdx, startIdx + POSTS_PER_PAGE);
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://gamble-shield-ai.vercel.app";
  const reviewSchema = useMemo(() => {
    const reviews = gridPosts.slice(0, 10).map((post) => ({
      "@type": "Review",
      name: post.title || "Casino review",
      url: `${baseUrl}/blog/${post.slug || post.id}`,
      datePublished: post.date || undefined,
      author: {
        "@type": "Organization",
        name: "GambleShield",
      },
      publisher: {
        "@type": "Organization",
        name: "GambleShield",
      },
      reviewBody:
        post.excerpt ||
        "Independent casino review focused on safety, bonuses, and user experience.",
      itemReviewed: {
        "@type": "Casino",
        name: post.title || "Online Casino",
      },
    }));

    return {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: "GambleShield Best Casinos",
      url: `${baseUrl}/blog/best-casinos`,
      mainEntity: {
        "@type": "ItemList",
        itemListElement: reviews.map((review, idx) => ({
          "@type": "ListItem",
          position: idx + 1,
          item: review,
        })),
      },
    };
  }, [baseUrl, gridPosts]);

  if (loading) {
    return (
      <div className="min-h-screen normal-case">
        <div
          className="w-full pt-28 pb-12 min-h-screen"
          style={{
            backgroundImage: "url(/1_Home%20page/pozadina_blog.webp)",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundAttachment: "fixed",
          }}
        >
          <div className="container mx-auto px-4 w-full text-white">
            <section className="mx-auto max-w-4xl rounded-2xl border border-white/25 bg-black/60 p-6 mb-10 shadow-xl">
              <h1 className="text-2xl md:text-3xl font-bold mb-3">
                GambleShield Best Casinos
              </h1>
              <p className="text-white/90 leading-relaxed">
                GambleShield curated casino lists with best bonuses, optimal RTP
                and strong safety features.
              </p>
            </section>
            <div className="flex flex-wrap justify-center gap-8 gap-y-14">
              {Array.from({ length: 6 }).map((_, i) => (
                <BlogPostCardSkeleton key={i} />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen normal-case">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(reviewSchema),
        }}
      />
      <div
        className="w-full pt-28 pb-12 min-h-screen"
        style={{
          backgroundImage: "url(/1_Home%20page/pozadina_blog.webp)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
        }}
      >
        <div className="container mx-auto px-4 w-full text-white">
          <section className="mx-auto max-w-4xl rounded-2xl border border-white/25 bg-black/60 p-6 mb-10 shadow-xl">
            <h1 className="text-2xl md:text-3xl font-bold mb-3">
              GambleShield Best Casinos
            </h1>
            <p className="text-white/90 leading-relaxed">
              GambleShield curated casino lists with best bonuses, optimal RTP
              and strong safety features.
            </p>
          </section>
          <div className="flex flex-wrap justify-center gap-8 gap-y-14">
            {paginatedPosts.map((post) => (
              <BlogPostCard key={post.id} post={post} />
            ))}
          </div>

          {gridPosts.length > POSTS_PER_PAGE && (
            <div className="mt-12 flex items-center justify-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 rounded-lg border border-white/50 text-white hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                Previous
              </button>
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                        currentPage === page
                          ? "bg-red-500 text-white"
                          : "border border-white/50 text-white hover:bg-white/20"
                      }`}
                    >
                      {page}
                    </button>
                  ),
                )}
              </div>
              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
                className="px-4 py-2 rounded-lg border border-white/50 text-white hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                Next
              </button>
            </div>
          )}

          {gridPosts.length === 0 && (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">🎰</div>
              <h3 className="text-2xl font-bold text-white mb-2">
                Casino reviews coming soon
              </h3>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
