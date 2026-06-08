
CREATE TABLE public.page_visits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  visited_at timestamptz NOT NULL DEFAULT now(),
  visit_date date NOT NULL DEFAULT (now() AT TIME ZONE 'UTC')::date,
  country text,
  country_code text,
  path text,
  user_agent text
);

CREATE INDEX page_visits_date_idx ON public.page_visits(visit_date);
CREATE INDEX page_visits_country_idx ON public.page_visits(country_code);

GRANT INSERT ON public.page_visits TO anon, authenticated;
GRANT SELECT ON public.page_visits TO authenticated;
GRANT ALL ON public.page_visits TO service_role;

ALTER TABLE public.page_visits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert visits"
  ON public.page_visits FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated can read visits"
  ON public.page_visits FOR SELECT
  TO authenticated
  USING (true);

-- Cleanup function: removes visits older than 30 days
CREATE OR REPLACE FUNCTION public.cleanup_old_page_visits()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  DELETE FROM public.page_visits WHERE visited_at < now() - interval '30 days';
$$;
