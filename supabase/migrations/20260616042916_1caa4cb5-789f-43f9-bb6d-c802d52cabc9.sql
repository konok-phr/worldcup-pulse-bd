
CREATE TABLE public.predictions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text NOT NULL,
  match_id bigint NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
  predicted_home integer NOT NULL CHECK (predicted_home >= 0 AND predicted_home <= 20),
  predicted_away integer NOT NULL CHECK (predicted_away >= 0 AND predicted_away <= 20),
  points integer NOT NULL DEFAULT 0,
  scored boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (username, match_id)
);

CREATE INDEX idx_predictions_username ON public.predictions(username);
CREATE INDEX idx_predictions_match ON public.predictions(match_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.predictions TO anon, authenticated;
GRANT ALL ON public.predictions TO service_role;

ALTER TABLE public.predictions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view predictions"
  ON public.predictions FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert predictions"
  ON public.predictions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update own prediction (by username)"
  ON public.predictions FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_predictions_updated_at
  BEFORE UPDATE ON public.predictions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to compute & update points for predictions whose match has finished
CREATE OR REPLACE FUNCTION public.recompute_prediction_points()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  updated_count integer := 0;
BEGIN
  WITH scored AS (
    UPDATE public.predictions p
    SET points = CASE
      WHEN m.home_score = p.predicted_home AND m.away_score = p.predicted_away THEN 5
      WHEN sign(m.home_score - m.away_score) = sign(p.predicted_home - p.predicted_away) THEN 2
      ELSE 0
    END,
    scored = true
    FROM public.matches m
    WHERE p.match_id = m.id
      AND m.home_score IS NOT NULL
      AND m.away_score IS NOT NULL
      AND m.status IN ('FINISHED','finished','FT','ft','COMPLETED','completed')
    RETURNING 1
  )
  SELECT count(*) INTO updated_count FROM scored;
  RETURN updated_count;
END;
$$;

GRANT EXECUTE ON FUNCTION public.recompute_prediction_points() TO anon, authenticated, service_role;
