-- Blog articles table for GambleShield
CREATE TABLE public.blog_articles (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  excerpt TEXT,
  category TEXT,
  author TEXT,
  date TEXT,
  read_time TEXT,
  image TEXT,
  featured BOOLEAN DEFAULT false,
  content TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.blog_articles ENABLE ROW LEVEL SECURITY;

-- Allow public read (anyone can view blog posts)
CREATE POLICY "Blog articles are viewable by everyone"
  ON public.blog_articles
  FOR SELECT
  USING (true);

-- Allow public insert/update/delete for now (admin - you can restrict later with auth)
CREATE POLICY "Blog articles are insertable by everyone"
  ON public.blog_articles
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Blog articles are updatable by everyone"
  ON public.blog_articles
  FOR UPDATE
  USING (true);

CREATE POLICY "Blog articles are deletable by everyone"
  ON public.blog_articles
  FOR DELETE
  USING (true);

-- Index for ordering by id
CREATE INDEX idx_blog_articles_id ON public.blog_articles(id DESC);
