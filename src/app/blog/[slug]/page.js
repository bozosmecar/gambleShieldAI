import { notFound } from "next/navigation";
import { getArticleBySlug } from "@/lib/blogArticles";
import BlogPostContent from "./BlogPostContent";

const BASE_URL = "https://gamble-shield-ai.vercel.app";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const post = await getArticleBySlug(slug);
  if (!post) {
    return { title: "Post Not Found | GambleShield" };
  }
  const canonical = `${BASE_URL}/blog/${post.slug || post.id}`;
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
      publishedTime: post.date ? new Date(post.date).toISOString() : undefined,
      images: post.image
        ? [{ url: post.image, alt: post.imageAlt || post.title }]
        : [{ url: "/og-image.png", width: 1200, height: 630, alt: "GambleShield" }],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt || "",
      images: post.image ? [post.image] : ["/og-image.png"],
    },
    alternates: { canonical },
  };
}

function buildArticleJsonLd(post) {
  const canonical = `${BASE_URL}/blog/${post.slug || post.id}`;
  const datePublished = post.date ? new Date(post.date).toISOString() : undefined;

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

export default async function BlogPostPage({ params }) {
  const { slug } = await params;
  const post = await getArticleBySlug(slug);
  if (!post) notFound();

  const jsonLd = buildArticleJsonLd(post);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <BlogPostContent post={post} />
    </>
  );
}