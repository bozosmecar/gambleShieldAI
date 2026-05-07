-- =============================================================================
-- GAMBLESHIELD: ITEMS IMAGE STORAGE BUCKET
-- =============================================================================
-- Creates a public bucket called `items` for character / inventory cosmetics,
-- with size + mime restrictions and RLS policies so that:
--   * everyone can READ (public bucket → object URLs work without auth)
--   * only admins can INSERT / UPDATE / DELETE objects
--
-- After this runs you can:
--   1. Drag a PNG into the `items` bucket via the Supabase dashboard, OR
--   2. POST a file to /api/upload-item-image (admin-only)
--   3. Reference it in public.items.image_path as either:
--        - the full public URL Supabase gives you, OR
--        - just `items/<filename>.png`  (the resolveItemImage() helper expands it)
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. Bucket
-- ---------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'items',
  'items',
  TRUE,
  5242880, -- 5 MB
  ARRAY['image/png', 'image/jpeg', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE
  SET public             = EXCLUDED.public,
      file_size_limit    = EXCLUDED.file_size_limit,
      allowed_mime_types = EXCLUDED.allowed_mime_types;

-- ---------------------------------------------------------------------------
-- 2. RLS policies on storage.objects, scoped to bucket_id = 'items'
-- ---------------------------------------------------------------------------
-- (storage.objects already has RLS enabled by default in Supabase.)

DROP POLICY IF EXISTS "Items bucket: public read" ON storage.objects;
CREATE POLICY "Items bucket: public read"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'items');

DROP POLICY IF EXISTS "Items bucket: admin insert" ON storage.objects;
CREATE POLICY "Items bucket: admin insert"
  ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'items' AND public.is_admin());

DROP POLICY IF EXISTS "Items bucket: admin update" ON storage.objects;
CREATE POLICY "Items bucket: admin update"
  ON storage.objects
  FOR UPDATE
  USING (bucket_id = 'items' AND public.is_admin())
  WITH CHECK (bucket_id = 'items' AND public.is_admin());

DROP POLICY IF EXISTS "Items bucket: admin delete" ON storage.objects;
CREATE POLICY "Items bucket: admin delete"
  ON storage.objects
  FOR DELETE
  USING (bucket_id = 'items' AND public.is_admin());

-- =============================================================================
-- DONE
-- =============================================================================
-- Notes:
--   * Service-role uploads (e.g. from /api/upload-item-image which uses the
--     admin client) bypass RLS automatically — no extra policy needed.
--   * If you upload `sword.png` to the bucket, its public URL is:
--       https://<project-ref>.supabase.co/storage/v1/object/public/items/sword.png
--     Either paste that into items.image_path, or just store `items/sword.png`
--     and let resolveItemImage() expand it on the client.
-- =============================================================================
