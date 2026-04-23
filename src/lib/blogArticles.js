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
    keywords: row.keywords || '',
    featured: !!row.featured,
    hidden: !!row.hidden,
    content: row.content || '',
    createdAt: row.created_at || '',
    cardBackground: row.card_background || '/3_Affiliate/zlatna/5.png',
    relatedSlugs: Array.isArray(row.related_slugs)
      ? row.related_slugs.filter((value) => typeof value === 'string' && value.trim())
      : [],
  };
}

function parseFlexibleDate(value) {
  if (!value || typeof value !== 'string') return 0;
  const trimmed = value.trim();
  if (!trimmed) return 0;

  const direct = new Date(trimmed);
  if (!Number.isNaN(direct.getTime())) return direct.getTime();

  const ddmmyyyy = trimmed.match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{4})$/);
  if (ddmmyyyy) {
    const [, day, month, year] = ddmmyyyy;
    const normalized = new Date(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`);
    if (!Number.isNaN(normalized.getTime())) return normalized.getTime();
  }

  return 0;
}

export function compareArticlesByNewest(a, b) {
  const bDate = parseFlexibleDate(b?.date);
  const aDate = parseFlexibleDate(a?.date);
  if (bDate !== aDate) return bDate - aDate;

  const bCreated = parseFlexibleDate(b?.createdAt);
  const aCreated = parseFlexibleDate(a?.createdAt);
  if (bCreated !== aCreated) return bCreated - aCreated;

  return (Number(b?.id) || 0) - (Number(a?.id) || 0);
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
    keywords: article.keywords || '',
    featured: !!article.featured,
    hidden: !!article.hidden,
    content: article.content || '',
    card_background: article.cardBackground || '/3_Affiliate/zlatna/5.png',
    related_slugs: Array.isArray(article.relatedSlugs)
      ? article.relatedSlugs
          .map((value) => (typeof value === 'string' ? value.trim() : ''))
          .filter(Boolean)
      : [],
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

    if (bySlug) {
      if (bySlug.hidden) return null;
      return rowToArticle(bySlug);
    }

    // Fall back to numeric ID (so old /blog/18 URLs keep working)
    const numericId = Number(slugOrId);
    if (!Number.isInteger(numericId) || numericId <= 0) return null;

    const { data: byId } = await supabase
      .from('blog_articles')
      .select('*')
      .eq('id', numericId)
      .maybeSingle();

    if (!byId) return null;
    if (byId.hidden) return null;
    return rowToArticle(byId);
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

    const runInsert = async (payload) =>
      supabase.from('blog_articles').insert(payload).select().single();

    let { data, error } = await runInsert(row);

    // Fallback 1: remove keywords if column doesn't exist yet
    if (error) {
      const { keywords, ...rowWithoutKeywords } = row;
      ({ data, error } = await runInsert(rowWithoutKeywords));
    }

    // Fallback 2: also remove related_slugs if still failing
    if (error) {
      const { keywords, related_slugs, ...rowCore } = row;
      ({ data, error } = await runInsert(rowCore));
    }

    // Fallback 3: also remove hidden if column doesn't exist yet
    if (error) {
      const { keywords, related_slugs, hidden, ...rowCore } = row;
      ({ data, error } = await runInsert(rowCore));
    }

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
    const payload = { ...row, updated_at: new Date().toISOString() };

    const runUpdate = async (updatePayload) =>
      supabase
        .from('blog_articles')
        .update(updatePayload)
        .eq('id', id)
        .select()
        .single();

    let { data, error } = await runUpdate(payload);

    // Fallback 1: remove keywords if column doesn't exist yet
    if (error) {
      const { keywords, ...fallbackPayload } = payload;
      ({ data, error } = await runUpdate(fallbackPayload));
    }

    // Fallback 2: also remove related_slugs if still failing
    if (error) {
      const { keywords, related_slugs, ...fallbackPayload } = payload;
      ({ data, error } = await runUpdate(fallbackPayload));
    }

    // Fallback 3: also remove hidden if column doesn't exist yet
    if (error) {
      const { keywords, related_slugs, hidden, ...fallbackPayload } = payload;
      ({ data, error } = await runUpdate(fallbackPayload));
    }

    if (error) {
      const errorDetails = {
        message: error?.message || null,
        details: error?.details || null,
        hint: error?.hint || null,
        code: error?.code || null,
        raw: error,
      };
      console.error('Supabase updateArticle error details:', errorDetails);
      return null;
    }

    return rowToArticle(data);
  } catch (err) {
    console.error('updateArticle error:', {
      message: err?.message || null,
      stack: err?.stack || null,
      raw: err,
    });
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
