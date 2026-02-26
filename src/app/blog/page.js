"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { getArticles } from "@/lib/blogArticles";
import BlogPostCard from "@/components/BlogPostCard";

const POSTS_PER_PAGE = 9; // 3 rows × 3 columns

/** Parse date string to timestamp for sorting (handles ISO, DD.MM.YYYY, etc.) */
function parseDate(dateStr) {
  if (!dateStr) return 0;
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? 0 : d.getTime();
}

export default function BlogPage() {
  const [blogPosts, setBlogPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [filterCategory, setFilterCategory] = useState(""); // "" = all

  useEffect(() => {
    async function load() {
      const data = await getArticles();
      setBlogPosts(data);
      setLoading(false);
    }
    load();
  }, []);

  const visiblePosts = blogPosts.filter(
    (p) => (p.category || "").toLowerCase() !== "casino",
  );

  const gridPosts = useMemo(() => {
    let posts = [...visiblePosts];

    if (filterCategory) {
      posts = posts.filter(
        (p) =>
          (p.category || "").toLowerCase() === filterCategory.toLowerCase(),
      );
    }

    posts.sort((a, b) => parseDate(b.date) - parseDate(a.date));
    return posts;
  }, [visiblePosts, filterCategory]);

  const categories = [
    { name: "Best casinos", flag: "crvena" },
    { name: "Education", flag: "zelena" },
    { name: "Tips", flag: "plava" },
    { name: "GambleShield", flag: "ljubicasta" },
  ];

  const handleFilterChange = (value) => {
    setFilterCategory(value);
    setCurrentPage(1);
  };
  const totalPages = Math.ceil(gridPosts.length / POSTS_PER_PAGE) || 1;
  const startIdx = (currentPage - 1) * POSTS_PER_PAGE;
  const paginatedPosts = gridPosts.slice(startIdx, startIdx + POSTS_PER_PAGE);

  if (loading) {
    return (
      <div
        className="min-h-screen"
        style={{
          backgroundImage: "url(blog/background.png)",
          backgroundSize: "cover",
        }}
      >
        <div className="container mx-auto px-4 py-20 text-center">
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen normal-case">
      {/* Header - affiliate-style background */}
      <header className="bg-amber-500 py-20">
        <div className="container mx-auto px-4 w-full"></div>
      </header>

      {/* Full-width wrapper - same background as affiliate (nebo) */}
      <div
        className="w-full py-12 min-h-screen"
        style={{
          backgroundImage: "url(blog/background.png)",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="container mx-auto px-4 w-full text-white">
          {/* Category filter - flags with name inside */}
          <div className="flex flex-wrap items-center justify-center gap-3 mb-10">
            <button
              type="button"
              onClick={() => handleFilterChange("")}
              className={`relative rounded-lg transition-all overflow-hidden ${
                !filterCategory
                  ? "ring-2 ring-white ring-offset-2 ring-offset-transparent"
                  : "opacity-70 hover:opacity-100"
              }`}
              title="Sve kategorije"
            >
              <img
                src="/3_Affiliate/crvena/4.png"
                alt="Sve"
                className="h-12 w-auto object-contain block"
              />
              <span className="absolute inset-0 flex items-center justify-center text-white text-xs font-bold drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                All
              </span>
            </button>
            {categories.map((cat) => (
              <button
                key={cat.name}
                type="button"
                onClick={() => handleFilterChange(cat.name)}
                className={`relative rounded-lg transition-all overflow-hidden ${
                  filterCategory === cat.name
                    ? "ring-2 ring-white ring-offset-2 ring-offset-transparent"
                    : "opacity-70 hover:opacity-100"
                }`}
                title={cat.name}
              >
                <img
                  src={`/3_Affiliate/${cat.flag}/4.png`}
                  alt={cat.name}
                  className="h-12 w-auto object-contain block"
                />
                <span className="absolute inset-0 flex items-center justify-center text-white text-xs font-bold drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                  {cat.name}
                </span>
              </button>
            ))}
          </div>

          {/* Blog Grid - flex wrap, cards wrap naturally by min-width */}
          <div className="flex flex-wrap justify-center gap-8 gap-y-14">
            {paginatedPosts.length > 0 &&
              paginatedPosts.map((post) => (
                <BlogPostCard key={post.id} post={post} />
              ))}
          </div>

          {/* Pagination */}
          {gridPosts.length > POSTS_PER_PAGE && (
            <div className="mt-12 flex items-center justify-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 rounded-lg border border-white/50 text-white hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent font-medium"
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
                          ? "bg-orange-500 text-white"
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
                className="px-4 py-2 rounded-lg border border-white/50 text-white hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent font-medium"
              >
                Next
              </button>
            </div>
          )}

          {/* Empty State */}
          {gridPosts.length === 0 && (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">📝</div>
              <h3 className="text-2xl font-bold text-white mb-2">
                {filterCategory
                  ? `Nema članaka u kategoriji "${filterCategory}"`
                  : "Još članaka uskoro"}
              </h3>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-400">
            © 2026 GambleShield. All rights reserved. | Promoting responsible
            gaming worldwide.
          </p>
        </div>
      </footer>
    </div>
  );
}
