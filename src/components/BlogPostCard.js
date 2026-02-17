"use client";

import Link from "next/link";

const CARD_BG_IMAGE = "/3_Affiliate/zlatna/5.png";

export default function BlogPostCard({ post }) {
  if (!post) return null;

  return (
    <Link
      href={`/blog/${post.id}`}
      className="block h-full min-w-[450px] w-[18vw]"
    >
      <article
        className="relative rounded-lg overflow-hidden hover:scale-[1.02] transition-transform duration-300 cursor-pointer flex flex-col min-h-[420px] w-full "
        style={{
          backgroundImage: `url(${CARD_BG_IMAGE})`,
          backgroundSize: "90% 100%",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="relative flex-1 flex flex-col px-26 py-15 z-10 min-h-0 box-border overflow-hidden">
          <div className="mb-3 shrink-0">
            <span className="inline-block px-3 py-1 bg-white/90 backdrop-blur-sm text-gray-800 rounded-full text-xs font-semibold">
              {post.category}
            </span>
          </div>
          <div className="relative h-32 rounded-lg overflow-hidden mb-3 shrink-0">
            {post.image ? (
              <img
                src={post.image}
                alt={post.title}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-orange-400/80 to-red-500/80 flex items-center justify-center text-white text-sm font-bold">
                Article Image
              </div>
            )}
          </div>
          <h3 className="text-lg font-bold mb-2 text-gray-900 hover:text-orange-600 transition-colors line-clamp-2 drop-shadow-sm shrink-0">
            {post.title}
          </h3>
          <p className="text-gray-800 text-sm mb-3 line-clamp-3 flex-1 min-h-0 drop-shadow-sm overflow-hidden">
            {post.excerpt}
          </p>
          <div className="flex items-center justify-between pt-3 border-t border-white/30 shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                {post.author?.charAt(0) ?? "?"}
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  {post.author}
                </p>
                <p className="text-xs text-gray-700">{post.date}</p>
              </div>
            </div>
            <span className="text-sm text-gray-700 font-medium">
              {post.readTime}
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}
