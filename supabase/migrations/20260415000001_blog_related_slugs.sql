-- Manual related article slugs for curated internal linking
ALTER TABLE public.blog_articles
ADD COLUMN IF NOT EXISTS related_slugs TEXT[] DEFAULT ARRAY[]::TEXT[];

COMMENT ON COLUMN public.blog_articles.related_slugs IS 'Optional list of blog slugs chosen in admin for related articles.';
