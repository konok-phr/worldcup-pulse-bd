
-- TOURNAMENTS
CREATE TABLE public.tournaments (
  year INT PRIMARY KEY,
  host_countries TEXT[] NOT NULL,
  winner_code TEXT,
  runner_up_code TEXT,
  third_place_code TEXT,
  final_score TEXT,
  top_scorer TEXT,
  top_scorer_goals INT,
  golden_ball TEXT,
  golden_glove TEXT,
  total_goals INT,
  matches_played INT,
  teams_count INT,
  summary TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- TEAMS
CREATE TABLE public.teams (
  code TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  short_name TEXT,
  confederation TEXT,
  fifa_ranking INT,
  coach TEXT,
  captain TEXT,
  flag_emoji TEXT,
  flag_url TEXT,
  group_letter TEXT,
  wc_titles INT DEFAULT 0,
  wc_appearances INT DEFAULT 0,
  best_finish TEXT,
  founded_year INT,
  nickname TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- STADIUMS
CREATE TABLE public.stadiums (
  slug TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  city TEXT NOT NULL,
  country TEXT NOT NULL,
  country_code TEXT,
  capacity INT,
  opened_year INT,
  lat NUMERIC,
  lng NUMERIC,
  image_url TEXT,
  description TEXT,
  is_wc26 BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- GROUPS (WC 2026)
CREATE TABLE public.groups_2026 (
  letter TEXT PRIMARY KEY,
  name TEXT NOT NULL
);

-- MATCHES
CREATE TABLE public.matches (
  id BIGSERIAL PRIMARY KEY,
  external_id TEXT UNIQUE,
  tournament_year INT NOT NULL REFERENCES public.tournaments(year),
  stage TEXT NOT NULL,
  group_letter TEXT,
  home_team_code TEXT REFERENCES public.teams(code),
  away_team_code TEXT REFERENCES public.teams(code),
  home_team_name TEXT,
  away_team_name TEXT,
  home_score INT,
  away_score INT,
  home_score_ht INT,
  away_score_ht INT,
  home_pens INT,
  away_pens INT,
  kickoff_utc TIMESTAMPTZ,
  stadium_slug TEXT REFERENCES public.stadiums(slug),
  status TEXT NOT NULL DEFAULT 'scheduled',
  minute INT,
  attendance INT,
  referee TEXT,
  matchday INT,
  last_synced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_matches_tournament_kickoff ON public.matches(tournament_year, kickoff_utc);
CREATE INDEX idx_matches_status ON public.matches(status);
CREATE INDEX idx_matches_group ON public.matches(tournament_year, group_letter);

-- MATCH EVENTS
CREATE TABLE public.match_events (
  id BIGSERIAL PRIMARY KEY,
  match_id BIGINT NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
  minute INT NOT NULL,
  added_time INT,
  event_type TEXT NOT NULL,
  team_code TEXT,
  player_name TEXT,
  assist_name TEXT,
  detail TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_match_events_match ON public.match_events(match_id, minute);

-- PLAYERS
CREATE TABLE public.players (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  team_code TEXT REFERENCES public.teams(code),
  position TEXT,
  club TEXT,
  jersey_number INT,
  date_of_birth DATE,
  height_cm INT,
  is_captain BOOLEAN DEFAULT false,
  goals INT DEFAULT 0,
  assists INT DEFAULT 0,
  yellow_cards INT DEFAULT 0,
  red_cards INT DEFAULT 0,
  minutes_played INT DEFAULT 0,
  tournament_year INT,
  image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_players_team ON public.players(team_code);
CREATE INDEX idx_players_goals ON public.players(tournament_year, goals DESC);

-- STANDINGS
CREATE TABLE public.standings (
  id BIGSERIAL PRIMARY KEY,
  tournament_year INT NOT NULL,
  group_letter TEXT NOT NULL,
  team_code TEXT NOT NULL REFERENCES public.teams(code),
  position INT,
  played INT DEFAULT 0,
  won INT DEFAULT 0,
  drawn INT DEFAULT 0,
  lost INT DEFAULT 0,
  goals_for INT DEFAULT 0,
  goals_against INT DEFAULT 0,
  goal_diff INT DEFAULT 0,
  points INT DEFAULT 0,
  qualification_status TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(tournament_year, group_letter, team_code)
);

-- RECORDS
CREATE TABLE public.records (
  id BIGSERIAL PRIMARY KEY,
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  holder TEXT NOT NULL,
  value TEXT NOT NULL,
  year INT,
  description TEXT,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- TRANSLATIONS
CREATE TABLE public.translations (
  id BIGSERIAL PRIMARY KEY,
  entity_type TEXT NOT NULL,
  entity_key TEXT NOT NULL,
  locale TEXT NOT NULL,
  value TEXT NOT NULL,
  UNIQUE(entity_type, entity_key, locale)
);

-- Enable RLS, public read
ALTER TABLE public.tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stadiums ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.groups_2026 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.standings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.translations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public read tournaments" ON public.tournaments FOR SELECT USING (true);
CREATE POLICY "public read teams" ON public.teams FOR SELECT USING (true);
CREATE POLICY "public read stadiums" ON public.stadiums FOR SELECT USING (true);
CREATE POLICY "public read groups_2026" ON public.groups_2026 FOR SELECT USING (true);
CREATE POLICY "public read matches" ON public.matches FOR SELECT USING (true);
CREATE POLICY "public read match_events" ON public.match_events FOR SELECT USING (true);
CREATE POLICY "public read players" ON public.players FOR SELECT USING (true);
CREATE POLICY "public read standings" ON public.standings FOR SELECT USING (true);
CREATE POLICY "public read records" ON public.records FOR SELECT USING (true);
CREATE POLICY "public read translations" ON public.translations FOR SELECT USING (true);

-- Enable realtime on live tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.matches;
ALTER PUBLICATION supabase_realtime ADD TABLE public.match_events;
ALTER PUBLICATION supabase_realtime ADD TABLE public.standings;
ALTER TABLE public.matches REPLICA IDENTITY FULL;
ALTER TABLE public.match_events REPLICA IDENTITY FULL;
ALTER TABLE public.standings REPLICA IDENTITY FULL;
