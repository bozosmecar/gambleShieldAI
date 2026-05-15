import { notFound } from "next/navigation";
import { getArticleBySlug, getArticles } from "@/lib/blogArticles";
import BlogPostContent from "./BlogPostContent";

const BASE_URL = "https://gamble-shield-ai.vercel.app";

function toIsoDateOrUndefined(value) {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const post = await getArticleBySlug(slug);
  if (!post) {
    return { title: "Post Not Found | GambleShield" };
  }
  const canonical = `${BASE_URL}/blog/${post.slug || post.id}`;
  const publishedTime = toIsoDateOrUndefined(post.date);
  return {
    title: `${post.title} | GambleShield`,
    description:
      post.excerpt ||
      `Read ${post.title} on GambleShield - casino reviews, tips and responsible gambling guides.`,
    openGraph: {
      title: post.title,
      description: post.excerpt || "",
      url: canonical,
      siteName: "GambleShield",
      type: "article",
      publishedTime,
      images: post.image
        ? [{ url: post.image, alt: post.imageAlt || post.title }]
        : [
            {
              url: "/1_Home%20page/ShieldLogo.png",
              width: 553,
              height: 451,
              alt: "GambleShield",
            },
          ],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt || "",
      images: post.image ? [post.image] : ["/1_Home%20page/ShieldLogo.png"],
    },
    alternates: { canonical },
  };
}

function buildArticleJsonLd(post) {
  const canonical = `${BASE_URL}/blog/${post.slug || post.id}`;
  const datePublished = toIsoDateOrUndefined(post.date);

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        "@id": `${canonical}#article`,
        headline: post.title,
        description: post.excerpt || post.title,
        url: canonical,
        datePublished,
        dateModified: datePublished,
        author: {
          "@type": "Organization",
          name: "GambleShield",
          url: BASE_URL,
        },
        publisher: {
          "@type": "Organization",
          "@id": `${BASE_URL}/#organization`,
          name: "GambleShield",
          url: BASE_URL,
        },
        mainEntityOfPage: {
          "@type": "WebPage",
          "@id": canonical,
        },
        ...(post.image && {
          image: {
            "@type": "ImageObject",
            url: post.image,
            ...(post.imageAlt && { caption: post.imageAlt }),
          },
        }),
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${canonical}#breadcrumb`,
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: BASE_URL,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Blog",
            item: `${BASE_URL}/blog`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: post.title,
            item: canonical,
          },
        ],
      },
    ],
  };
}

function extractKeywords(value) {
  return (value || "")
    .toLowerCase()
    .replace(/<[^>]*>/g, " ")
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length >= 4);
}

function getRelatedArticles(currentPost, allPosts) {
  const manualSlugs = Array.isArray(currentPost.relatedSlugs)
    ? currentPost.relatedSlugs
    : [];
  const manualRelated = manualSlugs
    .map((manualSlug) =>
      allPosts.find(
        (candidate) =>
          candidate.id !== currentPost.id && candidate.slug === manualSlug
      )
    )
    .filter(Boolean);

  const currentKeywords = new Set([
    ...extractKeywords(currentPost.title),
    ...extractKeywords(currentPost.excerpt),
    ...extractKeywords(currentPost.category),
  ]);

  if (currentKeywords.size === 0) {
    return manualRelated.slice(0, 3);
  }

  const keywordBased = allPosts
    .filter((candidate) => candidate.id !== currentPost.id)
    .map((candidate) => {
      const candidateKeywords = [
        ...extractKeywords(candidate.title),
        ...extractKeywords(candidate.excerpt),
        ...extractKeywords(candidate.category),
      ];
      const score = candidateKeywords.reduce(
        (total, word) => total + (currentKeywords.has(word) ? 1 : 0),
        0
      );
      return { candidate, score };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((item) => item.candidate);

  const combined = [...manualRelated];
  keywordBased.forEach((candidate) => {
    if (combined.some((entry) => entry.id === candidate.id)) return;
    combined.push(candidate);
  });

  return combined.slice(0, 3);
}

export default async function BlogPostPage({ params }) {
  const { slug } = await params;
  const post = await getArticleBySlug(slug);
  if (!post) notFound();
  const allPosts = await getArticles();
  const relatedArticles = getRelatedArticles(post, allPosts);

  const jsonLd = buildArticleJsonLd(post);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <BlogPostContent post={post} relatedArticles={relatedArticles} />
    </>
  );
}