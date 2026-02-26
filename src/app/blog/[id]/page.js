"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { getArticleById } from "@/lib/blogArticles";

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

  return (
    <div
      className="min-h-screen normal-case mt-25"
      style={{
        backgroundImage: "url(/blog/backgroundPost.png)",
        backgroundSize: "cover",
        backgroundPosition: "center top",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="w-full flex flex-col items-center py-16 px-4">
        <div className="text-center mb-12 w-[90vw] lg:w-[60vw]">
          <span className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full text-sm font-semibold">
            {post.category}
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 mt-6 leading-tight">
            {post.title}
          </h1>
          <span className="text-white/90 text-sm">{post.date}</span>
        </div>

        <div className="px-4 w-[90vw] lg:w-[60vw]">
          <div className="relative h-96 bg-gradient-to-br from-orange-400 via-red-400 to-orange-500 rounded-2xl mb-12 overflow-hidden">
            {post.image ? (
              <img
                src={post.image}
                alt={post.title}
                className="absolute inset-0 w-full h-full object-cover rounded-2xl"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-white text-3xl font-bold">
                Featured Image
              </div>
            )}
          </div>

          <div
            className="prose prose-lg max-w-none prose-invert
              prose-headings:!text-white prose-headings:font-bold
              prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-6
              prose-h3:text-2xl prose-h3:mt-8 prose-h3:mb-4
              prose-p:!text-white prose-p:leading-relaxed prose-p:mb-6
              prose-ul:my-6 prose-ul:space-y-2
              prose-li:!text-white
              prose-strong:!text-white prose-strong:font-semibold
              [&_p]:!text-white [&_h1]:!text-white [&_h2]:!text-white [&_h3]:!text-white
              [&_li]:!text-white [&_span]:!text-white [&_a]:!text-orange-300 [&_a:hover]:!text-orange-200"
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
      </div>
    </div>
  );
}
