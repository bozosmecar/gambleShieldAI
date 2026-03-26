-- Add slug column to blog_articles for SEO-friendly URLs
-- Existing articles will have NULL slug and continue to work via numeric ID fallback

ALTER TABLE blog_articles
  ADD COLUMN IF NOT EXISTS slug TEXT;

-- Unique constraint (only on non-null values so existing articles aren't affected)
CREATE UNIQUE INDEX IF NOT EXISTS blog_articles_slug_unique
  ON blog_articles (slug)
  WHERE slug IS NOT NULL AND slug <> '';
