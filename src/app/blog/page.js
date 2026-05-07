import BlogPageClient from "./BlogPageClient";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const revalidate = 300;

function rowToArticle(row) {
  if (!row) return null;
  return {
    id: row.id,
    slug: row.slug || "",
    title: row.title,
    excerpt: row.excerpt || "",
    category: row.category || "",
    date: row.date || "",
    image: row.image || "",
    imageAlt: row.image_alt || "",
    imageName: row.image_name || "",
    keywords: row.keywords || "",
    featured: !!row.featured,
    hidden: !!row.hidden,
    content: row.content || "",
    createdAt: row.created_at || "",
    cardBackground: row.card_background || "/3_Affiliate/zlatna/5.png",
    relatedSlugs: Array.isArray(row.related_slugs)
      ? row.related_slugs.filter(
          (value) => typeof value === "string" && value.trim(),
        )
      : [],
  };
}

async function getArticlesServer() {
  const supabase = getSupabaseAdmin();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("blog_articles")
    .select("*")
    .order("id", { ascending: false });

  if (error) {
    console.error("SSR getArticlesServer error:", error);
    return [];
  }
  return (data || []).map(rowToArticle).filter(Boolean);
}

export default async function BlogPage() {
  const initialPosts = await getArticlesServer();
  return <BlogPageClient initialPosts={initialPosts} />;
}
