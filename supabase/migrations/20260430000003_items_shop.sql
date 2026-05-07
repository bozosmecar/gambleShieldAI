-- =============================================================================
-- GAMBLESHIELD: ITEMS, INVENTORY, SHOP, SHIELD TOKENS
-- =============================================================================
-- Adds:
--   * users.shield_tokens     INTEGER (currency, default 100)
--   * public.items            (admin-managed catalogue, image_path + slot)
--   * public.user_items       (which user owns which item, equipped flag)
--   * RPCs:
--       - public.purchase_item(p_item_id)   -- spend tokens, add to inventory
--       - public.equip_item(p_item_id)      -- auto-unequips the item that was
--                                              already on the same (row, col)
--       - public.unequip_item(p_item_id)
--       - public.admin_award_tokens(p_user_id, p_amount, p_reason)
--
-- Slot grid is fixed at 3 × 3 → row/col ∈ {0,1,2}.
-- Safe to run multiple times.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. users.shield_tokens
-- ---------------------------------------------------------------------------
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS shield_tokens INTEGER NOT NULL DEFAULT 100;

DO $$ BEGIN
  ALTER TABLE public.users
    ADD CONSTRAINT users_shield_tokens_non_negative CHECK (shield_tokens >= 0) NOT VALID;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE public.users VALIDATE CONSTRAINT users_shield_tokens_non_negative;
EXCEPTION WHEN others THEN NULL;
END $$;

-- Make sure the trigger that creates new auth users gives them 100 tokens too.
-- The handle_new_user() function in 20240101000000_initial_schema.sql only
-- inserts (id, username), so the column default kicks in. Nothing to change.

-- ---------------------------------------------------------------------------
-- 2. items catalogue
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.items (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name         TEXT NOT NULL,
  description  TEXT,
  image_path   TEXT NOT NULL,
  cost         INTEGER NOT NULL CHECK (cost >= 0),
  slot_row     SMALLINT NOT NULL CHECK (slot_row BETWEEN 0 AND 2),
  slot_col     SMALLINT NOT NULL CHECK (slot_col BETWEEN 0 AND 2),
  active       BOOLEAN NOT NULL DEFAULT TRUE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_items_active ON public.items(active);

ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Items are viewable by everyone" ON public.items;
CREATE POLICY "Items are viewable by everyone"
  ON public.items
  FOR SELECT
  USING (true);

-- Only admins can mutate the catalogue (manual SQL works as service-role too).
DROP POLICY IF EXISTS "Admins can manage items" ON public.items;
CREATE POLICY "Admins can manage items"
  ON public.items
  FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ---------------------------------------------------------------------------
-- 3. user_items (ownership + equipped state)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_items (
  user_id      UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  item_id      UUID NOT NULL REFERENCES public.items(id) ON DELETE CASCADE,
  acquired_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_equipped  BOOLEAN NOT NULL DEFAULT FALSE,
  PRIMARY KEY (user_id, item_id)
);

CREATE INDEX IF NOT EXISTS idx_user_items_user ON public.user_items(user_id);
CREATE INDEX IF NOT EXISTS idx_user_items_user_equipped
  ON public.user_items(user_id) WHERE is_equipped;

ALTER TABLE public.user_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users read their own items" ON public.user_items;
CREATE POLICY "Users read their own items"
  ON public.user_items
  FOR SELECT
  USING (auth.uid() = user_id);

-- All writes go through the SECURITY DEFINER RPCs below, so we don't grant
-- direct INSERT/UPDATE/DELETE policies to clients.

-- ---------------------------------------------------------------------------
-- 4. purchase_item RPC
-- ---------------------------------------------------------------------------
-- Spend shield_tokens and add the item to user_items. Fails loudly if the
-- user already owns the item, can't afford it, or the item is inactive.
CREATE OR REPLACE FUNCTION public.purchase_item(p_item_id UUID)
RETURNS TABLE (
  shield_tokens INTEGER,
  item_id       UUID,
  acquired_at   TIMESTAMPTZ,
  is_equipped   BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id   UUID := auth.uid();
  v_cost      INTEGER;
  v_active    BOOLEAN;
  v_balance   INTEGER;
  v_acquired  TIMESTAMPTZ;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated' USING ERRCODE = '28000';
  END IF;

  SELECT cost, active INTO v_cost, v_active
    FROM public.items
   WHERE id = p_item_id;

  IF v_cost IS NULL THEN
    RAISE EXCEPTION 'Item not found' USING ERRCODE = '22023';
  END IF;
  IF NOT v_active THEN
    RAISE EXCEPTION 'Item not for sale' USING ERRCODE = '22023';
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.user_items
     WHERE user_id = v_user_id AND item_id = p_item_id
  ) THEN
    RAISE EXCEPTION 'Item already owned' USING ERRCODE = '23505';
  END IF;

  -- Atomically deduct tokens (CHECK constraint blocks going negative, so this
  -- naturally fails the transaction if balance is insufficient).
  UPDATE public.users
     SET shield_tokens = shield_tokens - v_cost
   WHERE id = v_user_id
   RETURNING shield_tokens INTO v_balance;

  IF v_balance IS NULL THEN
    RAISE EXCEPTION 'Insufficient Shield tokens' USING ERRCODE = '22023';
  END IF;

  INSERT INTO public.user_items (user_id, item_id, is_equipped)
  VALUES (v_user_id, p_item_id, FALSE)
  RETURNING acquired_at, is_equipped INTO v_acquired, is_equipped;

  shield_tokens := v_balance;
  item_id       := p_item_id;
  acquired_at   := v_acquired;
  RETURN NEXT;
EXCEPTION
  -- Convert balance underflow (CHECK violation) into a friendlier message.
  WHEN check_violation THEN
    RAISE EXCEPTION 'Insufficient Shield tokens' USING ERRCODE = '22023';
END;
$$;

REVOKE ALL ON FUNCTION public.purchase_item(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.purchase_item(UUID) TO authenticated;

-- ---------------------------------------------------------------------------
-- 5. equip_item RPC  (auto-unequips whatever else sits on the same (row,col))
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.equip_item(p_item_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_row     SMALLINT;
  v_col     SMALLINT;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated' USING ERRCODE = '28000';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.user_items
     WHERE user_id = v_user_id AND item_id = p_item_id
  ) THEN
    RAISE EXCEPTION 'Item not owned' USING ERRCODE = '42501';
  END IF;

  SELECT slot_row, slot_col INTO v_row, v_col
    FROM public.items
   WHERE id = p_item_id;

  IF v_row IS NULL THEN
    RAISE EXCEPTION 'Item not found' USING ERRCODE = '22023';
  END IF;

  -- Unequip anything else this user has on the same slot.
  UPDATE public.user_items ui
     SET is_equipped = FALSE
    FROM public.items i
   WHERE ui.user_id = v_user_id
     AND ui.item_id = i.id
     AND ui.item_id <> p_item_id
     AND i.slot_row = v_row
     AND i.slot_col = v_col
     AND ui.is_equipped = TRUE;

  UPDATE public.user_items
     SET is_equipped = TRUE
   WHERE user_id = v_user_id
     AND item_id = p_item_id;
END;
$$;

REVOKE ALL ON FUNCTION public.equip_item(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.equip_item(UUID) TO authenticated;

-- ---------------------------------------------------------------------------
-- 6. unequip_item RPC
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.unequip_item(p_item_id UUID)
RETURNS VOID
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

  UPDATE public.user_items
     SET is_equipped = FALSE
   WHERE user_id = v_user_id
     AND item_id = p_item_id;
END;
$$;

REVOKE ALL ON FUNCTION public.unequip_item(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.unequip_item(UUID) TO authenticated;

-- ---------------------------------------------------------------------------
-- 7. Optional admin helper: grant / deduct Shield tokens
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.admin_award_tokens(
  p_user_id UUID,
  p_amount  INTEGER,
  p_reason  TEXT DEFAULT 'Admin grant'
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_balance INTEGER;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Admin only' USING ERRCODE = '42501';
  END IF;
  IF p_amount IS NULL OR p_amount = 0 OR p_amount < -100000 OR p_amount > 100000 THEN
    RAISE EXCEPTION 'Invalid token amount: %', p_amount USING ERRCODE = '22023';
  END IF;

  UPDATE public.users
     SET shield_tokens = GREATEST(0, public.users.shield_tokens + p_amount)
   WHERE id = p_user_id
   RETURNING shield_tokens INTO v_balance;

  RETURN v_balance;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_award_tokens(UUID, INTEGER, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_award_tokens(UUID, INTEGER, TEXT) TO authenticated;

-- ---------------------------------------------------------------------------
-- 8. Seed: the Sword item (image at /public/avatar/sword.png)
-- ---------------------------------------------------------------------------
-- Idempotent insert: anchored on the lowercase name. Re-running the migration
-- doesn't duplicate or overwrite admin edits.
INSERT INTO public.items (name, description, image_path, cost, slot_row, slot_col, active)
SELECT 'Sword', 'A trusty starter blade.', '/avatar/sword.png', 50, 0, 2, TRUE
 WHERE NOT EXISTS (
   SELECT 1 FROM public.items WHERE lower(name) = 'sword'
 );

-- =============================================================================
-- DONE
-- =============================================================================
-- Quick test recipe in the SQL editor:
--   -- give yourself tokens
--   UPDATE public.users SET shield_tokens = 1000 WHERE id = auth.uid();
--   -- buy the sword
--   SELECT * FROM public.purchase_item(
--     (SELECT id FROM public.items WHERE name = 'Sword')
--   );
--   -- equip it
--   SELECT public.equip_item(
--     (SELECT id FROM public.items WHERE name = 'Sword')
--   );
-- =============================================================================
