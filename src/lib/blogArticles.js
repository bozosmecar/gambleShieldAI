import { getSupabaseClient } from './supabaseClient';

/** Map DB row (snake_case) to app format (camelCase) */
function rowToArticle(row) {
  if (!row) return null;
  return {
    id: row.id,
    title: row.title,
    excerpt: row.excerpt || '',
    category: row.category || '',
    author: row.author || '',
    date: row.date || '',
    readTime: row.read_time || '',
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
    excerpt: article.excerpt || '',
    category: article.category || '',
    author: article.author || '',
    date: article.date || '',
    read_time: article.readTime || '',
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
 * Create a new article.
 * @param {Object} article - { title, excerpt, category, author, date, readTime, image, featured, content }
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
