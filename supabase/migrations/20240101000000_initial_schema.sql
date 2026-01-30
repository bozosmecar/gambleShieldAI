-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create tier enum type
CREATE TYPE tier_type AS ENUM ('BRONZE', 'SILVER', 'GOLD', 'PLATINUM', 'DIAMOND');

-- 1. Users table (extends Supabase auth.users)
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  experience INTEGER DEFAULT 0,
  tier tier_type GENERATED ALWAYS AS (
    CASE
      WHEN experience >= 15000 THEN 'DIAMOND'
      WHEN experience >= 7000 THEN 'PLATINUM'
      WHEN experience >= 3000 THEN 'GOLD'
      WHEN experience >= 1000 THEN 'SILVER'
      ELSE 'BRONZE'
    END
  ) STORED,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view all profiles"
  ON public.users
  FOR SELECT
  USING (true);

CREATE POLICY "Users can update their own profile"
  ON public.users
  FOR UPDATE
  USING (auth.uid() = id);

-- 2. Casinos table
CREATE TABLE public.casinos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  logo_url TEXT,
  website_url TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.casinos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Casinos are viewable by everyone"
  ON public.casinos
  FOR SELECT
  USING (true);

-- 3. User casino registrations
CREATE TABLE public.user_casino_registrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  casino_id UUID NOT NULL REFERENCES public.casinos(id) ON DELETE CASCADE,
  registered_at TIMESTAMPTZ DEFAULT NOW(),
  affiliate_code TEXT,
  
  UNIQUE(user_id, casino_id)
);

-- Enable RLS
ALTER TABLE public.user_casino_registrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own registrations"
  ON public.user_casino_registrations
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own registrations"
  ON public.user_casino_registrations
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create indexes
CREATE INDEX idx_user_casino_registrations_user_id ON public.user_casino_registrations(user_id);
CREATE INDEX idx_user_casino_registrations_casino_id ON public.user_casino_registrations(casino_id);

-- Function to automatically create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, username)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || substring(NEW.id::text, 1, 8))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create user on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
