'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getArticleById } from '@/lib/blogArticles';

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
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white" style={{ paddingTop: '70px' }}>
        <div className="container mx-auto px-4 py-20 text-center">
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white" style={{ paddingTop: '70px' }}>
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Post Not Found</h1>
          <p className="text-gray-600 mb-8">Sorry, we couldn&apos;t find the blog post you&apos;re looking for.</p>
          <Link href="/blog" className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg font-semibold hover:from-orange-600 hover:to-red-600 transition-all inline-block">
            Back to Blog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white" style={{ paddingTop: '70px' }}>
      {/* Back Button */}
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <Link
          href="/blog"
          className="inline-flex items-center text-gray-600 hover:text-orange-600 transition-colors font-medium"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Blog
        </Link>
      </div>

      {/* Article Header */}
      <article className="container mx-auto px-4 max-w-4xl pb-20">
        <header className="mb-12">
          {/* Category Badge */}
          <div className="mb-4">
            <span className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full text-sm font-semibold">
              {post.category}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            {post.title}
          </h1>

          {/* Author Info */}
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center text-white text-lg font-bold">
                {post.author.charAt(0)}
              </div>
              <div>
                <p className="font-semibold text-gray-900">{post.author}</p>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <span>{post.date}</span>
                  <span>•</span>
                  <span>{post.readTime}</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Featured Image */}
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

        {/* Article Content */}
        <div
          className="prose prose-lg max-w-none
            prose-headings:text-gray-900 prose-headings:font-bold
            prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-6
            prose-h3:text-2xl prose-h3:mt-8 prose-h3:mb-4
            prose-p:text-gray-700 prose-p:leading-relaxed prose-p:mb-6
            prose-ul:my-6 prose-ul:space-y-2
            prose-li:text-gray-700
            prose-strong:text-gray-900 prose-strong:font-semibold"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* Related Articles */}
        <div className="mt-16 pt-8 border-t border-gray-200">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Related Articles</h3>
          <div className="text-gray-600">
            <Link href="/blog" className="text-orange-600 hover:text-orange-700 font-medium">
              View all articles →
            </Link>
          </div>
        </div>
      </article>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 mt-20">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-400">
            © 2026 GambleShield. All rights reserved. | Promoting responsible gaming worldwide.
          </p>
        </div>
      </footer>
    </div>
  );
}
