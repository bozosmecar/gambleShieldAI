-- ============================================================
-- STEP 1: Add slug column (skip if already ran the migration)
-- ============================================================
ALTER TABLE blog_articles
  ADD COLUMN IF NOT EXISTS slug TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS blog_articles_slug_unique
  ON blog_articles (slug)
  WHERE slug IS NOT NULL AND slug <> '';

-- ============================================================
-- STEP 2: Set SEO-optimised slugs for all existing articles
-- ============================================================

UPDATE blog_articles SET slug = 'top-10-tips-safe-online-gambling'
  WHERE id = 2;

UPDATE blog_articles SET slug = 'how-to-set-gambling-limits-online-casino'
  WHERE id = 3;

UPDATE blog_articles SET slug = 'psychology-behind-gambling-addiction'
  WHERE id = 4;

UPDATE blog_articles SET slug = 'quick-tips-for-new-online-casino-players'
  WHERE id = 8;

UPDATE blog_articles SET slug = 'understanding-online-casino-odds-guide'
  WHERE id = 9;

UPDATE blog_articles SET slug = 'when-to-take-a-break-from-gambling'
  WHERE id = 10;

UPDATE blog_articles SET slug = 'budgeting-for-online-casino-entertainment'
  WHERE id = 11;

UPDATE blog_articles SET slug = 'mobile-casino-gaming-safety-tips'
  WHERE id = 12;

UPDATE blog_articles SET slug = 'talking-to-kids-about-gambling'
  WHERE id = 13;

UPDATE blog_articles SET slug = 'casino-cooling-off-periods-guide'
  WHERE id = 14;

UPDATE blog_articles SET slug = 'gambling-reality-check-reminders'
  WHERE id = 15;

UPDATE blog_articles SET slug = 'recognising-a-gambling-slip'
  WHERE id = 16;

UPDATE blog_articles SET slug = 'where-to-get-gambling-help-resources'
  WHERE id = 17;

UPDATE blog_articles SET slug = 'casumo-casino-review-best-online-casino-2026'
  WHERE id = 18;

UPDATE blog_articles SET slug = 'japan-online-casino-guide'
  WHERE id = 19;

-- ============================================================
-- VERIFY: Check results
-- ============================================================
SELECT id, title, slug FROM blog_articles ORDER BY id;
