-- Add "hidden" flag to blog_articles so posts can be unlisted while staying in DB.
-- Hidden posts are filtered out from public list pages and return 404 when accessed
-- directly via their slug or id. Admin UI still shows them so they can be re-listed.

ALTER TABLE public.blog_articles
ADD COLUMN IF NOT EXISTS hidden BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS blog_articles_hidden_idx
  ON public.blog_articles (hidden);

COMMENT ON COLUMN public.blog_articles.hidden IS
  'When true, article is unlisted: excluded from public listings and returns 404 on direct access. Remains visible in admin UI.';
