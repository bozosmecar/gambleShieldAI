-- Polls: question, options, resolves_at. Only admins create; logged-in users vote; vote counts visible after vote.
-- Requires: public.users and public.is_admin() (from RUN_ME_users_and_admins.sql).

CREATE TABLE public.polls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question TEXT NOT NULL,
  resolves_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.poll_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_id UUID NOT NULL REFERENCES public.polls(id) ON DELETE CASCADE,
  option_text TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0
);

CREATE TABLE public.poll_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_id UUID NOT NULL REFERENCES public.polls(id) ON DELETE CASCADE,
  option_id UUID NOT NULL REFERENCES public.poll_options(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(poll_id, user_id)
);

CREATE INDEX idx_poll_options_poll_id ON public.poll_options(poll_id);
CREATE INDEX idx_poll_votes_poll_id ON public.poll_votes(poll_id);
CREATE INDEX idx_poll_votes_option_id ON public.poll_votes(option_id);
CREATE INDEX idx_polls_resolves_at ON public.polls(resolves_at);

ALTER TABLE public.polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.poll_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.poll_votes ENABLE ROW LEVEL SECURITY;

-- Polls: everyone can read; only admins can insert/update/delete
CREATE POLICY "Polls are viewable by everyone"
  ON public.polls FOR SELECT USING (true);

CREATE POLICY "Only admins can insert polls"
  ON public.polls FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY "Only admins can update polls"
  ON public.polls FOR UPDATE USING (public.is_admin());

CREATE POLICY "Only admins can delete polls"
  ON public.polls FOR DELETE USING (public.is_admin());

-- Poll options: everyone read; admins write
CREATE POLICY "Poll options are viewable by everyone"
  ON public.poll_options FOR SELECT USING (true);

CREATE POLICY "Only admins can insert poll options"
  ON public.poll_options FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "Only admins can update poll options"
  ON public.poll_options FOR UPDATE USING (public.is_admin());
CREATE POLICY "Only admins can delete poll options"
  ON public.poll_options FOR DELETE USING (public.is_admin());

-- Poll votes: authenticated can insert their own; everyone can read (for counting)
CREATE POLICY "Authenticated users can vote"
  ON public.poll_votes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Votes are viewable for counting"
  ON public.poll_votes FOR SELECT USING (true);
