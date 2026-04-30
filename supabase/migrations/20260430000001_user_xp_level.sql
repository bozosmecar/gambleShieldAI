-- =============================================================================
-- GAMBLESHIELD: USER XP, LEVEL, TIER + XP AUDIT LOG
-- =============================================================================
-- Adds:
--   * users.experience  (INT, total XP)
--   * users.level       (INT, generated from experience)
--   * users.tier        (tier_type enum, generated from experience)
--   * public.xp_events  (audit log of every XP grant)
--   * public.award_xp() RPC for granting XP from the client (SECURITY DEFINER)
--
-- Safe to run multiple times: every statement is guarded with IF NOT EXISTS /
-- DO $$ blocks. Does NOT touch existing columns / data.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. tier_type enum (may already exist from initial_schema.sql)
-- ---------------------------------------------------------------------------
DO $$ BEGIN
  CREATE TYPE tier_type AS ENUM ('BRONZE', 'SILVER', 'GOLD', 'PLATINUM', 'DIAMOND');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ---------------------------------------------------------------------------
-- 2. users.experience
-- ---------------------------------------------------------------------------
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS experience INTEGER NOT NULL DEFAULT 0;

ALTER TABLE public.users
  ADD CONSTRAINT users_experience_non_negative CHECK (experience >= 0) NOT VALID;

-- Validate cheaply (any pre-existing rows already satisfy default 0)
DO $$ BEGIN
  ALTER TABLE public.users VALIDATE CONSTRAINT users_experience_non_negative;
EXCEPTION WHEN others THEN NULL;
END $$;

-- ---------------------------------------------------------------------------
-- 3. users.level (generated)
-- ---------------------------------------------------------------------------
-- XP curve: xp_to_level(N) = 50 * N * (N - 1)
--   L1=0, L2=100, L3=300, L4=600, L5=1000, L6=1500, L7=2100, L8=2800,
--   L9=3600, L10=4500, ..., L20=19000
DO $$ BEGIN
  ALTER TABLE public.users
    ADD COLUMN level INTEGER GENERATED ALWAYS AS (
      CASE
        WHEN experience <   100 THEN 1
        WHEN experience <   300 THEN 2
        WHEN experience <   600 THEN 3
        WHEN experience <  1000 THEN 4
        WHEN experience <  1500 THEN 5
        WHEN experience <  2100 THEN 6
        WHEN experience <  2800 THEN 7
        WHEN experience <  3600 THEN 8
        WHEN experience <  4500 THEN 9
        WHEN experience <  5500 THEN 10
        WHEN experience <  6600 THEN 11
        WHEN experience <  7800 THEN 12
        WHEN experience <  9100 THEN 13
        WHEN experience < 10500 THEN 14
        WHEN experience < 12000 THEN 15
        WHEN experience < 13600 THEN 16
        WHEN experience < 15300 THEN 17
        WHEN experience < 17100 THEN 18
        WHEN experience < 19000 THEN 19
        ELSE 20
      END
    ) STORED;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

-- ---------------------------------------------------------------------------
-- 4. users.tier (generated). Initial schema already creates this; guard it.
-- ---------------------------------------------------------------------------
DO $$ BEGIN
  ALTER TABLE public.users
    ADD COLUMN tier tier_type GENERATED ALWAYS AS (
      CASE
        WHEN experience >= 15000 THEN 'DIAMOND'::tier_type
        WHEN experience >=  7000 THEN 'PLATINUM'::tier_type
        WHEN experience >=  3000 THEN 'GOLD'::tier_type
        WHEN experience >=  1000 THEN 'SILVER'::tier_type
        ELSE 'BRONZE'::tier_type
      END
    ) STORED;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

-- ---------------------------------------------------------------------------
-- 5. xp_events audit log
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.xp_events (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  amount      INTEGER NOT NULL CHECK (amount > 0),
  reason      TEXT NOT NULL,
  metadata    JSONB,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_xp_events_user_created
  ON public.xp_events(user_id, created_at DESC);

ALTER TABLE public.xp_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read their own xp events" ON public.xp_events;
CREATE POLICY "Users can read their own xp events"
  ON public.xp_events
  FOR SELECT
  USING (auth.uid() = user_id);

-- No client INSERT / UPDATE / DELETE policies: only the SECURITY DEFINER
-- function below may write to this table.

-- ---------------------------------------------------------------------------
-- 6. award_xp() RPC — single source of truth for granting XP
-- ---------------------------------------------------------------------------
-- Callable from the client via supabase.rpc('award_xp', { ... }). Always
-- credits the *currently authenticated* user, so a malicious client can't
-- award XP to someone else. Also caps amount at 1000 per call as a safety net.
CREATE OR REPLACE FUNCTION public.award_xp(
  p_amount   INTEGER,
  p_reason   TEXT,
  p_metadata JSONB DEFAULT NULL
)
RETURNS TABLE (experience INTEGER, level INTEGER, tier tier_type)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated' USING ERRCODE = '28000';
  END IF;

  IF p_amount IS NULL OR p_amount <= 0 OR p_amount > 1000 THEN
    RAISE EXCEPTION 'Invalid XP amount: %', p_amount USING ERRCODE = '22023';
  END IF;

  IF p_reason IS NULL OR length(trim(p_reason)) = 0 THEN
    RAISE EXCEPTION 'Reason required' USING ERRCODE = '22023';
  END IF;

  UPDATE public.users
     SET experience = users.experience + p_amount
   WHERE id = v_user_id;

  INSERT INTO public.xp_events (user_id, amount, reason, metadata)
  VALUES (v_user_id, p_amount, trim(p_reason), p_metadata);

  RETURN QUERY
  SELECT u.experience, u.level, u.tier
    FROM public.users u
   WHERE u.id = v_user_id;
END;
$$;

REVOKE ALL ON FUNCTION public.award_xp(INTEGER, TEXT, JSONB) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.award_xp(INTEGER, TEXT, JSONB) TO authenticated;

-- ---------------------------------------------------------------------------
-- 7. Optional admin helper: grant XP to any user (admins only)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.admin_award_xp(
  p_user_id  UUID,
  p_amount   INTEGER,
  p_reason   TEXT,
  p_metadata JSONB DEFAULT NULL
)
RETURNS TABLE (experience INTEGER, level INTEGER, tier tier_type)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Admin only' USING ERRCODE = '42501';
  END IF;
  IF p_amount IS NULL OR p_amount = 0 OR p_amount < -100000 OR p_amount > 100000 THEN
    RAISE EXCEPTION 'Invalid XP amount: %', p_amount USING ERRCODE = '22023';
  END IF;

  UPDATE public.users
     SET experience = GREATEST(0, public.users.experience + p_amount)
   WHERE id = p_user_id;

  IF p_amount > 0 THEN
    INSERT INTO public.xp_events (user_id, amount, reason, metadata)
    VALUES (p_user_id, p_amount, COALESCE(trim(p_reason), 'Admin grant'), p_metadata);
  END IF;

  RETURN QUERY
  SELECT u.experience, u.level, u.tier
    FROM public.users u
   WHERE u.id = p_user_id;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_award_xp(UUID, INTEGER, TEXT, JSONB) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_award_xp(UUID, INTEGER, TEXT, JSONB) TO authenticated;

-- =============================================================================
-- DONE
-- =============================================================================
-- After running:
--   * Every public.users row has experience=0, level=1, tier='BRONZE'
--   * Clients call:  supabase.rpc('award_xp', { p_amount: 10, p_reason: 'Voted in poll' })
--   * Admins call:   supabase.rpc('admin_award_xp', { p_user_id, p_amount, p_reason })
--   * Activity feed: select * from xp_events where user_id = auth.uid() order by created_at desc
-- =============================================================================
