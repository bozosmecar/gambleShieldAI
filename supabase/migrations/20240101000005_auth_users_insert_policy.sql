-- Allow authenticated users to insert their own profile (fallback if trigger hasn't run yet)
-- Your app can also insert after signUp if you prefer; the trigger in 20240101000000 does it automatically.
CREATE POLICY "Users can insert their own profile"
  ON public.users
  FOR INSERT
  WITH CHECK (auth.uid() = id);
