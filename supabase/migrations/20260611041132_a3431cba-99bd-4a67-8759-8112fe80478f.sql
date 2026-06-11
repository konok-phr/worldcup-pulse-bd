CREATE TABLE IF NOT EXISTS public.live_tv_channels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  logo_url text,
  stream_url text NOT NULL,
  sort_order int NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.live_tv_channels TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.live_tv_channels TO authenticated;
GRANT ALL ON public.live_tv_channels TO service_role;
ALTER TABLE public.live_tv_channels ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read live tv channels" ON public.live_tv_channels FOR SELECT USING (true);
CREATE POLICY "Anyone can insert live tv channels" ON public.live_tv_channels FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update live tv channels" ON public.live_tv_channels FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Anyone can delete live tv channels" ON public.live_tv_channels FOR DELETE USING (true);