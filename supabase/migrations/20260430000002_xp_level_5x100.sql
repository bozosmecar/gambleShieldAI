-- =============================================================================
-- GAMBLESHIELD: align level scale with the existing tier thresholds
-- =============================================================================
-- Replaces the 20-level ramping curve from
--   20260430000001_user_xp_level.sql
-- with a 5-level scale that mirrors the tier thresholds (1000 / 3000 / 7000 / 15000):
--
--   L1 :     0 -    999 XP   (matches BRONZE)
--   L2 :  1000 -   2999 XP   (matches SILVER)
--   L3 :  3000 -   6999 XP   (matches GOLD)
--   L4 :  7000 -  14999 XP   (matches PLATINUM)
--   L5 : 15000+      XP      (matches DIAMOND, max)
--
-- Safe to run repeatedly. Drops & re-creates the generated `level` column so
-- existing rows are recomputed automatically.
-- =============================================================================

-- 1. Drop the old generated column if it exists.
ALTER TABLE public.users DROP COLUMN IF EXISTS level;

-- 2. Re-add with the new 5-level curve aligned with tier thresholds.
ALTER TABLE public.users
  ADD COLUMN level INTEGER GENERATED ALWAYS AS (
    CASE
      WHEN experience >= 15000 THEN 5
      WHEN experience >=  7000 THEN 4
      WHEN experience >=  3000 THEN 3
      WHEN experience >=  1000 THEN 2
      ELSE 1
    END
  ) STORED;

-- =============================================================================
-- Done. Verify with:
--   SELECT id, username, experience, level, tier FROM public.users
--    ORDER BY experience DESC;
-- (Note: tier is the existing column from 20260430000001; level now aligns 1:1.)
-- =============================================================================
