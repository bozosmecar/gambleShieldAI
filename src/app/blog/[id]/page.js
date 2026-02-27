"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { getArticleById } from "@/lib/blogArticles";

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

export default function BlogPostPage() {
  const params = useParams();
  const postId = params.id;
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const article = await getArticleById(postId);
      setPost(article);
      setLoading(false);
    }
    load();
  }, [postId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4 py-20 text-center">
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Post Not Found
          </h1>
          <p className="text-gray-600 mb-8">
            Sorry, we couldn&apos;t find the blog post you&apos;re looking for.
          </p>
        </div>
      </div>
    );
  }

  const scroll = getScrollImages(post.cardBackground);

  return (
    <div
      className="min-h-screen normal-case mt-25 text-white"
      style={{
        backgroundImage: "url(/blog/backgroundPost.png)",
        backgroundSize: "cover",
        backgroundPosition: "center top",
        backgroundRepeat: "no-repeat",
        backgroundColor: "#8B7355",
      }}
    >
      <div
        className="grid gap-0 overflow-x-visible"
        style={{ gridTemplateRows: "auto auto auto" }}
      >
        {/* Row 1: top */}
        <div className="w-full relative flex justify-center">
          <img
            src={scroll.top}
            alt=""
            aria-hidden
            className="w-[100vw] lg:w-[80vw] h-auto block"
          />
          <div className="lg:top-[200px] top-0 absolute inset-0 flex flex-col items-center justify-center container mx-auto px-4 py-6 max-w-4xl text-center">
            <span className="px-4 py-10 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full text-sm font-semibold mb-4">
              {post.category}
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight">
              {post.title}
            </h1>
            <span className="text-white/90 text-sm">{post.date}</span>
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
          <article className="mx-auto w-[90vw] max-lg:relative lg:w-[75vw] pb-20 pt-8 lg:pt-12">
            <div className="px-4 mx-auto w-[60vw] lg:w-[45vw]">
              {post.image && (
                <div className="mb-12">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-auto rounded-2xl"
                    referrerPolicy="no-referrer"
                  />
                </div>
              )}

              <div
                className="prose prose-lg max-w-none prose-invert
                  prose-headings:!text-white prose-headings:font-bold
                  prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-6
                  prose-h3:text-2xl prose-h3:mt-8 prose-h3:mb-4
                  prose-p:!text-white prose-p:leading-relaxed prose-p:mb-6
                  prose-ul:my-6 prose-ul:space-y-2
                  prose-li:!text-white
                  prose-strong:!text-white prose-strong:font-semibold
                  prose-em:!text-white prose-blockquote:!text-white
                  prose-td:!text-white prose-th:!text-white
                  [&_*]:!text-white [&_a]:!text-orange-300 [&_a:hover]:!text-orange-200"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />

              <div className="mt-16 pt-8 border-t border-white/30">
                <h3 className="text-2xl font-bold text-white mb-6">
                  Related Articles
                </h3>
                <div>
                  <Link
                    href="/blog"
                    className="text-orange-400 hover:text-orange-300 font-medium"
                  >
                    View all articles →
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
  );
}
