
CREATE TABLE public.commentary (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  match_id bigint NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
  username text NOT NULL CHECK (length(username) BETWEEN 1 AND 40),
  message text NOT NULL CHECK (length(message) BETWEEN 1 AND 280),
  minute integer,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX commentary_match_id_created_at_idx ON public.commentary (match_id, created_at DESC);

GRANT SELECT, INSERT ON public.commentary TO anon, authenticated;
GRANT ALL ON public.commentary TO service_role;

ALTER TABLE public.commentary ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view commentary" ON public.commentary FOR SELECT USING (true);
CREATE POLICY "Anyone can post commentary" ON public.commentary FOR INSERT WITH CHECK (true);

ALTER PUBLICATION supabase_realtime ADD TABLE public.commentary;
