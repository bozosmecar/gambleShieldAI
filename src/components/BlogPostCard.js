"use client";

import Link from "next/link";

const DEFAULT_CARD_BG = "/3_Affiliate/zlatna/5.png";

export default function BlogPostCard({ post }) {
  if (!post) return null;

  const cardBg = post.cardBackground || DEFAULT_CARD_BG;

  return (
    <Link
      href={`/blog/${post.id}`}
      className="block min-w-[400px] lg:flex-[0_0_calc(33.333%-1.5rem)] lg:max-w-[450px]"
    >
      <article
        className="relative rounded-lg overflow-hidden hover:scale-[1.02] transition-transform duration-300 cursor-pointer flex flex-col h-[480px] w-full "
        style={{
          backgroundImage: `url(${cardBg})`,
          backgroundSize: "90% 100%",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="relative flex-1 flex flex-col px-26 py-15 z-10 min-h-0 box-border overflow-hidden">
          <div className="mb-3 shrink-0">
            <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-sm text-white rounded-full text-xs font-semibold">
              {post.category}
            </span>
          </div>
          <div className="rounded-lg overflow-hidden mb-3 shrink-0">
            {post.image ? (
              <img
                src={post.image}
                alt={post.imageAlt || post.title}
                className="w-full h-auto rounded-lg"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-full h-32 bg-gradient-to-br from-orange-400/80 to-red-500/80 flex items-center justify-center text-white text-sm font-bold rounded-lg">
                Article Image
              </div>
            )}
          </div>
          <h3 className="text-lg font-bold mb-2 text-white hover:text-orange-300 transition-colors line-clamp-2 drop-shadow-sm shrink-0 text-ellipsis overflow-hidden">
            {post.title}
          </h3>
          <p className="text-white/90 text-sm mb-3 line-clamp-3 flex-1 min-h-0 drop-shadow-sm overflow-hidden text-ellipsis">
            {post.excerpt}
          </p>
          <div className="flex items-center justify-end pt-3 border-t border-white/30 shrink-0">
            <p className="text-xs text-white/90">{post.date}</p>
          </div>
        </div>
      </article>
    </Link>
  );
}
