import { getSupabaseClient } from './supabaseClient';

/** Map DB row (snake_case) to app format (camelCase) */
function rowToArticle(row) {
  if (!row) return null;
  return {
    id: row.id,
    slug: row.slug || '',
    title: row.title,
    excerpt: row.excerpt || '',
    category: row.category || '',
    date: row.date || '',
    image: row.image || '',
    imageAlt: row.image_alt || '',
    imageName: row.image_name || '',
    featured: !!row.featured,
    content: row.content || '',
    cardBackground: row.card_background || '/3_Affiliate/zlatna/5.png',
  };
}

/** Map app article to DB row format */
function articleToRow(article) {
  return {
    title: article.title,
    slug: article.slug ? article.slug.trim() : null,
    excerpt: article.excerpt || '',
    category: article.category || '',
    date: article.date || '',
    image: article.image || '',
    image_alt: article.imageAlt || '',
    image_name: article.imageName || '',
    featured: !!article.featured,
    content: article.content || '',
    card_background: article.cardBackground || '/3_Affiliate/zlatna/5.png',
  };
}

/**
 * Fetch all blog articles from Supabase.
 * @returns {Promise<Array>}
 */
export async function getArticles() {
  const supabase = getSupabaseClient();
  if (!supabase) return [];

  try {
    const { data, error } = await supabase
      .from('blog_articles')
      .select('*')
      .order('id', { ascending: false });

    if (error) {
      console.error('Supabase getArticles error:', error);
      return [];
    }
    return (data || []).map(rowToArticle);
  } catch (err) {
    console.error('getArticles error:', err);
    return [];
  }
}

/**
 * Fetch a single article by id.
 * @param {number|string} id
 * @returns {Promise<Object|null>}
 */
export async function getArticleById(id) {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from('blog_articles')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) return null;
    return rowToArticle(data);
  } catch (err) {
    console.error('getArticleById error:', err);
    return null;
  }
}

/**
 * Fetch a single article by slug.
 * Falls back to numeric ID lookup so old /blog/18 URLs still work.
 * @param {string} slugOrId
 * @returns {Promise<Object|null>}
 */
export async function getArticleBySlug(slugOrId) {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  try {
    // Try slug match first
    const { data: bySlug } = await supabase
      .from('blog_articles')
      .select('*')
      .eq('slug', slugOrId)
      .maybeSingle();

    if (bySlug) return rowToArticle(bySlug);

    // Fall back to numeric ID (so old /blog/18 URLs keep working)
    const numericId = Number(slugOrId);
    if (!Number.isInteger(numericId) || numericId <= 0) return null;

    const { data: byId } = await supabase
      .from('blog_articles')
      .select('*')
      .eq('id', numericId)
      .maybeSingle();

    return byId ? rowToArticle(byId) : null;
  } catch (err) {
    console.error('getArticleBySlug error:', err);
    return null;
  }
}

/**
 * Create a new article.
 * @param {Object} article - { title, slug, excerpt, category, date, image, featured, content }
 * @returns {Promise<Object|null>} Created article with id, or null on error
 */
export async function createArticle(article) {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  try {
    const row = articleToRow(article);
    const { data, error } = await supabase
      .from('blog_articles')
      .insert(row)
      .select()
      .single();

    if (error) {
      console.error('Supabase createArticle error:', error);
      return null;
    }
    return rowToArticle(data);
  } catch (err) {
    console.error('createArticle error:', err);
    return null;
  }
}

/**
 * Update an existing article.
 * @param {number|string} id
 * @param {Object} article - Partial article fields
 * @returns {Promise<Object|null>}
 */
export async function updateArticle(id, article) {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  try {
    const row = articleToRow(article);
    const { data, error } = await supabase
      .from('blog_articles')
      .update({ ...row, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Supabase updateArticle error:', error);
      return null;
    }
    return rowToArticle(data);
  } catch (err) {
    console.error('updateArticle error:', err);
    return null;
  }
}

/**
 * Delete an article.
 * @param {number|string} id
 * @returns {Promise<boolean>}
 */
export async function deleteArticle(id) {
  const supabase = getSupabaseClient();
  if (!supabase) return false;

  try {
    const { error } = await supabase
      .from('blog_articles')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Supabase deleteArticle error:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('deleteArticle error:', err);
    return false;
  }
}
