-- =============================================================================
-- GAMBLESHIELD: FIX PURCHASE_ITEM RPC ("item_id is ambiguous")
-- =============================================================================
-- The original purchase_item() declared OUT columns named item_id, acquired_at
-- and is_equipped via RETURNS TABLE(...). Inside the body, references to those
-- same names also resolved to columns of public.user_items, which Postgres
-- flagged as:
--    ERROR: column reference "item_id" is ambiguous
--
-- Fix: drop the multi-column return type and just return the new shield_tokens
-- balance as a scalar INTEGER. The client refetches the inventory after a
-- successful purchase anyway, so it doesn't need acquired_at / is_equipped.
-- All table references inside the function are now fully qualified to keep
-- things unambiguous regardless of future signature changes.
-- =============================================================================

DROP FUNCTION IF EXISTS public.purchase_item(UUID);

CREATE FUNCTION public.purchase_item(p_item_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id  UUID := auth.uid();
  v_cost     INTEGER;
  v_active   BOOLEAN;
  v_balance  INTEGER;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated' USING ERRCODE = '28000';
  END IF;

  SELECT i.cost, i.active
    INTO v_cost, v_active
    FROM public.items i
   WHERE i.id = p_item_id;

  IF v_cost IS NULL THEN
    RAISE EXCEPTION 'Item not found' USING ERRCODE = '22023';
  END IF;
  IF NOT v_active THEN
    RAISE EXCEPTION 'Item not for sale' USING ERRCODE = '22023';
  END IF;

  IF EXISTS (
    SELECT 1
      FROM public.user_items ui
     WHERE ui.user_id = v_user_id
       AND ui.item_id = p_item_id
  ) THEN
    RAISE EXCEPTION 'Item already owned' USING ERRCODE = '23505';
  END IF;

  -- Atomically deduct tokens. The CHECK (shield_tokens >= 0) constraint will
  -- fire as a check_violation if the user can't afford it, which we translate
  -- to a friendlier message in the EXCEPTION block below.
  UPDATE public.users u
     SET shield_tokens = u.shield_tokens - v_cost
   WHERE u.id = v_user_id
   RETURNING u.shield_tokens INTO v_balance;

  IF v_balance IS NULL THEN
    RAISE EXCEPTION 'User row missing' USING ERRCODE = '22023';
  END IF;

  INSERT INTO public.user_items (user_id, item_id, is_equipped)
  VALUES (v_user_id, p_item_id, FALSE);

  RETURN v_balance;
EXCEPTION
  WHEN check_violation THEN
    RAISE EXCEPTION 'Insufficient Shield tokens' USING ERRCODE = '22023';
END;
$$;

REVOKE ALL ON FUNCTION public.purchase_item(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.purchase_item(UUID) TO authenticated;

-- =============================================================================
-- DONE
-- =============================================================================
-- New call shape (client side):
--   const { data, error } = await supabase.rpc('purchase_item', { p_item_id });
--   // data is now a number (new shield_tokens balance) or null on error
-- =============================================================================
