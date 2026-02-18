-- Add card_background to blog_articles (scroll/card background image path)
-- Same numbering as affiliate: 1 = gold (zlatna), etc.
ALTER TABLE public.blog_articles
ADD COLUMN IF NOT EXISTS card_background TEXT DEFAULT '/3_Affiliate/zlatna/5.png';

COMMENT ON COLUMN public.blog_articles.card_background IS 'Path to card background image, e.g. /3_Affiliate/zlatna/5.png (gold)';
