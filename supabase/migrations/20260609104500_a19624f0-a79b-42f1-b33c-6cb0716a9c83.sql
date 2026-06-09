ALTER TABLE public.page_visits ADD COLUMN IF NOT EXISTS session_id text;
CREATE INDEX IF NOT EXISTS page_visits_visited_at_idx ON public.page_visits(visited_at DESC);
CREATE INDEX IF NOT EXISTS page_visits_session_idx ON public.page_visits(session_id);