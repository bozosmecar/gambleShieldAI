-- Add role to users so we can separate admins from regular users.
-- Run this after 20240101000000_initial_schema.sql

-- Role enum: only 'user' and 'admin'
CREATE TYPE user_role AS ENUM ('user', 'admin');

-- Add role column (default 'user')
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS role user_role NOT NULL DEFAULT 'user';

-- Optional: index for filtering admins
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);

-- Helper: true if current user is an admin (for use in RLS)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- Comment: to promote a user to admin, run in SQL Editor or your backend:
--   UPDATE public.users SET role = 'admin' WHERE username = 'your_admin_username';
-- or: UPDATE public.users SET role = 'admin' WHERE id = 'user-uuid-here';
