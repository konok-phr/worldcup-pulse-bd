import { createServerFn } from "@tanstack/react-start";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

// ----- Matches -----
export const getLiveMatches = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await supabaseAdmin
    .from("matches")
    .select("*")
    .eq("tournament_year", 2026)
    .in("status", ["live", "in_play", "half_time"])
    .order("kickoff_utc", { ascending: true });
  if (error) throw new Error(error.message);
  return data ?? [];
});

export const getUpcomingMatches = createServerFn({ method: "GET" }).handler(async () => {
  const nowIso = new Date().toISOString();
  const { data, error } = await supabaseAdmin
    .from("matches")
    .select("*")
    .eq("tournament_year", 2026)
    .gte("kickoff_utc", nowIso)
    .order("kickoff_utc", { ascending: true })
    .limit(12);
  if (error) throw new Error(error.message);
  return data ?? [];
});

export const getAllFixtures = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await supabaseAdmin
    .from("matches")
    .select("*")
    .eq("tournament_year", 2026)
    .order("kickoff_utc", { ascending: true, nullsFirst: false });
  if (error) throw new Error(error.message);
  return data ?? [];
});

export const getMatchById = createServerFn({ method: "GET" })
  .inputValidator((d: { id: number }) => d)
  .handler(async ({ data }) => {
    const [matchRes, eventsRes] = await Promise.all([
      supabaseAdmin.from("matches").select("*").eq("id", data.id).maybeSingle(),
      supabaseAdmin.from("match_events").select("*").eq("match_id", data.id).order("minute", { ascending: true }),
    ]);
    if (matchRes.error) throw new Error(matchRes.error.message);
    return { match: matchRes.data, events: eventsRes.data ?? [] };
  });

// ----- Teams -----
export const getAllTeams = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await supabaseAdmin
    .from("teams")
    .select("*")
    .order("group_letter", { ascending: true, nullsFirst: false })
    .order("name", { ascending: true });
  if (error) throw new Error(error.message);
  return data ?? [];
});

export const getTeamByCode = createServerFn({ method: "GET" })
  .inputValidator((d: { code: string }) => d)
  .handler(async ({ data }) => {
    const code = data.code.toUpperCase();
    const [team, fixtures] = await Promise.all([
      supabaseAdmin.from("teams").select("*").eq("code", code).maybeSingle(),
      supabaseAdmin.from("matches").select("*").eq("tournament_year", 2026)
        .or(`home_team_code.eq.${code},away_team_code.eq.${code}`)
        .order("kickoff_utc", { ascending: true }),
    ]);
    if (team.error) throw new Error(team.error.message);
    return { team: team.data, fixtures: fixtures.data ?? [] };
  });

// ----- Standings -----
export const getStandings = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await supabaseAdmin
    .from("standings")
    .select("*")
    .eq("tournament_year", 2026)
    .order("group_letter", { ascending: true })
    .order("points", { ascending: false })
    .order("goal_diff", { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
});

export const getGroups = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await supabaseAdmin
    .from("groups_2026")
    .select("*")
    .order("letter", { ascending: true });
  if (error) throw new Error(error.message);
  return data ?? [];
});

// ----- Stadiums -----
export const getAllStadiums = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await supabaseAdmin
    .from("stadiums")
    .select("*")
    .eq("is_wc26", true)
    .order("country", { ascending: true })
    .order("city", { ascending: true });
  if (error) throw new Error(error.message);
  return data ?? [];
});

export const getStadiumBySlug = createServerFn({ method: "GET" })
  .inputValidator((d: { slug: string }) => d)
  .handler(async ({ data }) => {
    const { data: stadium, error } = await supabaseAdmin
      .from("stadiums").select("*").eq("slug", data.slug).maybeSingle();
    if (error) throw new Error(error.message);
    if (!stadium) return { stadium: null, matches: [] };
    const { data: matches } = await supabaseAdmin
      .from("matches").select("*").eq("stadium_slug", data.slug).eq("tournament_year", 2026)
      .order("kickoff_utc", { ascending: true });
    return { stadium, matches: matches ?? [] };
  });

// ----- History -----
export const getTournaments = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await supabaseAdmin
    .from("tournaments").select("*").order("year", { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
});

export const getTournamentByYear = createServerFn({ method: "GET" })
  .inputValidator((d: { year: number }) => d)
  .handler(async ({ data }) => {
    const { data: t, error } = await supabaseAdmin
      .from("tournaments").select("*").eq("year", data.year).maybeSingle();
    if (error) throw new Error(error.message);
    return t;
  });

// ----- Records -----
export const getRecords = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await supabaseAdmin
    .from("records").select("*").order("category", { ascending: true }).order("sort_order", { ascending: true });
  if (error) throw new Error(error.message);
  return data ?? [];
});

// ----- Search -----
export const globalSearch = createServerFn({ method: "GET" })
  .inputValidator((d: { q: string }) => d)
  .handler(async ({ data }) => {
    const q = data.q.trim();
    if (!q) return { teams: [], stadiums: [], tournaments: [] };
    const like = `%${q}%`;
    const [teams, stadiums, tournaments] = await Promise.all([
      supabaseAdmin.from("teams").select("code,name,group_letter,flag_emoji")
        .or(`name.ilike.${like},code.ilike.${like},nickname.ilike.${like}`).limit(20),
      supabaseAdmin.from("stadiums").select("slug,name,city,country").eq("is_wc26", true)
        .or(`name.ilike.${like},city.ilike.${like},country.ilike.${like}`).limit(20),
      supabaseAdmin.from("tournaments").select("year,winner_code,host_countries")
        .or(`winner_code.ilike.${like}`).limit(10),
    ]);
    return {
      teams: teams.data ?? [],
      stadiums: stadiums.data ?? [],
      tournaments: tournaments.data ?? [],
    };
  });

// ----- Homepage aggregate -----
export const getHomeData = createServerFn({ method: "GET" }).handler(async () => {
  const nowIso = new Date().toISOString();
  const [live, upcoming, opener, finalM] = await Promise.all([
    supabaseAdmin.from("matches").select("*").eq("tournament_year", 2026)
      .in("status", ["live", "in_play", "half_time"]),
    supabaseAdmin.from("matches").select("*").eq("tournament_year", 2026)
      .gte("kickoff_utc", nowIso).order("kickoff_utc", { ascending: true }).limit(6),
    supabaseAdmin.from("matches").select("*").eq("tournament_year", 2026)
      .order("kickoff_utc", { ascending: true }).limit(1),
    supabaseAdmin.from("matches").select("*").eq("tournament_year", 2026)
      .eq("stage", "Final").maybeSingle(),
  ]);
  return {
    live: live.data ?? [],
    upcoming: upcoming.data ?? [],
    opener: opener.data?.[0] ?? null,
    final: finalM.data ?? null,
  };
});