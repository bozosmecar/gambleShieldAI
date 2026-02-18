"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getArticles } from "@/lib/blogArticles";
import BlogPostCard from "@/components/BlogPostCard";

const POSTS_PER_PAGE = 9; // 3 rows × 3 columns

export default function BlogPage() {
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

  const featuredPost = blogPosts.find((p) => p.featured) || blogPosts[0];
  const gridPosts = blogPosts.filter((p) => p.id !== featuredPost?.id);
  const totalPages = Math.ceil(gridPosts.length / POSTS_PER_PAGE) || 1;
  const startIdx = (currentPage - 1) * POSTS_PER_PAGE;
  const paginatedPosts = gridPosts.slice(startIdx, startIdx + POSTS_PER_PAGE);

  if (loading) {
    return (
      <div
        className="min-h-screen bg-gradient-to-b from-gray-50 to-white"
        style={{ paddingTop: "70px" }}
      >
        <div className="container mx-auto px-4 py-20 text-center">
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-gradient-to-b from-gray-50 to-white"
      style={{ paddingTop: "70px" }}
    >
      {/* Header - affiliate-style background */}
      <header className="bg-amber-500 text-gray-900 py-20">
        <div className="container mx-auto px-4 w-full">
          <h1 className="text-5xl md:text-6xl font-bold mb-4">
            GambleShield Blog
          </h1>
          <p className="text-xl md:text-2xl text-amber-900/90">
            Insights, tips, and resources for responsible gaming
          </p>
        </div>
      </header>

      {/* Full-width wrapper so background extends into margins */}
      <div
        className="w-full py-12"
        style={{
          backgroundImage: "url(/blog/bg.png)",
          backgroundRepeat: "repeat",
        }}
      >
        <div className="container mx-auto px-4 w-full">
        {/* Featured Post */}
        {blogPosts.length > 0 && featuredPost && (
          <div className="mb-16">
            <h2 className="text-3xl font-bold mb-6 text-gray-800">
              Featured Article
            </h2>
            <Link href={`/blog/${featuredPost.id}`}>
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-shadow duration-300 cursor-pointer">
                <div className="grid md:grid-cols-2 gap-0">
                  <div className="relative h-64 md:h-full bg-gradient-to-br from-orange-400 via-red-400 to-orange-500 overflow-hidden">
                    {featuredPost.image ? (
                      <img
                        src={featuredPost.image}
                        alt={featuredPost.title}
                        className="absolute inset-0 w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-white text-2xl font-bold">
                        Featured Image
                      </div>
                    )}
                  </div>
                  <div className="p-8 md:p-12 flex flex-col justify-center">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="px-4 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-semibold">
                        {featuredPost.category}
                      </span>
                      <span className="text-gray-500 text-sm">
                        {featuredPost.readTime}
                      </span>
                    </div>
                    <h3 className="text-3xl font-bold mb-4 text-gray-800 hover:text-orange-600">
                      {featuredPost.title}
                    </h3>
                    <p className="text-gray-600 mb-6 text-lg leading-relaxed">
                      {featuredPost.excerpt}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center text-white font-bold">
                          {featuredPost.author.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">
                            {featuredPost.author}
                          </p>
                          <p className="text-sm text-gray-500">
                            {featuredPost.date}
                          </p>
                        </div>
                      </div>
                      <span className="px-6 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 transition-all font-semibold">
                        Read More
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        )}

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
              className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent font-medium"
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
                        : "border border-gray-300 text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    {page}
                  </button>
                ),
              )}
            </div>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent font-medium"
            >
              Next
            </button>
          </div>
        )}

        {/* Empty State */}
        {gridPosts.length === 0 && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">
              More articles coming soon
            </h3>
          </div>
        )}

        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 mt-20">
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
