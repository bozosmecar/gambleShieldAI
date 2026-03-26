"use client";

import { useEffect, useMemo, useState } from "react";
import { getArticles } from "@/lib/blogArticles";
import BlogPostCard from "@/components/BlogPostCard";
import { isTipsEducation } from "@/lib/categoryUtils";
import BlogPostCardSkeleton from "@/components/BlogPostCardSkeleton";

const POSTS_PER_PAGE = 12;

function parseDate(dateStr) {
  if (!dateStr) return 0;
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? 0 : d.getTime();
}

export default function TipsAndEducationPage() {
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
      .filter((p) => isTipsEducation(p.category))
      .sort((a, b) => parseDate(b.date) - parseDate(a.date));
  }, [blogPosts]);

  const totalPages = Math.ceil(gridPosts.length / POSTS_PER_PAGE) || 1;
  const startIdx = (currentPage - 1) * POSTS_PER_PAGE;
  const paginatedPosts = gridPosts.slice(startIdx, startIdx + POSTS_PER_PAGE);

  if (loading) {
    return (
      <div className="min-h-screen normal-case">
        <header className="bg-green-700 py-20">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl font-bold text-white">Tips &amp; Education</h1>
            <p className="text-white/80 mt-2 text-lg">Gambling guides, strategies &amp; responsible gaming tips</p>
          </div>
        </header>
        <div
          className="w-full py-12 min-h-screen"
          style={{ backgroundImage: "url(/blog/background.png)", backgroundSize: "cover", backgroundPosition: "center" }}
        >
          <div className="container mx-auto px-4 w-full">
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
      <header className="bg-green-700 py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold text-white">Tips &amp; Education</h1>
          <p className="text-white/80 mt-2 text-lg">
            Gambling guides, strategies &amp; responsible gaming tips
          </p>
        </div>
      </header>

      <div
        className="w-full py-12 min-h-screen"
        style={{
          backgroundImage: "url(/blog/background.png)",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="container mx-auto px-4 w-full text-white">
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
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                      currentPage === page
                        ? "bg-green-600 text-white"
                        : "border border-white/50 text-white hover:bg-white/20"
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 rounded-lg border border-white/50 text-white hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                Next
              </button>
            </div>
          )}

          {gridPosts.length === 0 && (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">📚</div>
              <h3 className="text-2xl font-bold text-white mb-2">Articles coming soon</h3>
            </div>
          )}
        </div>
      </div>

      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-400">
            © 2026 GambleShield. All rights reserved. | Promoting responsible gaming worldwide.
          </p>
        </div>
      </footer>
    </div>
  );
}
