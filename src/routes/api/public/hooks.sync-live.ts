import { createFileRoute } from "@tanstack/react-router";
import { WC26_VENUES } from "@/lib/wc26-venues";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

// Polls Football-Data.org for World Cup 2026 (competition WC) live matches
// and upserts results into the matches table. Safe to call repeatedly.
// Auth: relies on /api/public/* bypass + apikey header from pg_cron.

const FD_BASE = "https://api.football-data.org/v4";
const COMP_CODE = "WC"; // FIFA World Cup

type FDMatch = {
  id: number;
  utcDate: string;
  status: string;
  matchday: number | null;
  stage: string;
  group: string | null;
  homeTeam: { name: string; tla: string | null };
  awayTeam: { name: string; tla: string | null };
  score: {
    fullTime: { home: number | null; away: number | null };
    halfTime: { home: number | null; away: number | null };
    penalties?: { home: number | null; away: number | null } | null;
  };
  minute?: number | null;
  referees?: { name: string; role: string }[];
};

function mapStatus(s: string): string {
  switch (s) {
    case "IN_PLAY":
    case "PAUSED":
      return "live";
    case "FINISHED":
      return "finished";
    case "POSTPONED":
    case "SUSPENDED":
    case "CANCELLED":
      return "postponed";
    default:
      return "scheduled";
  }
}

function mapStage(s: string): string {
  switch (s) {
    case "GROUP_STAGE": return "Group Stage";
    case "LAST_32": return "Round of 32";
    case "LAST_16": return "Round of 16";
    case "QUARTER_FINALS": return "Quarter-finals";
    case "SEMI_FINALS": return "Semi-finals";
    case "THIRD_PLACE": return "Third-place";
    case "FINAL": return "Final";
    default: return s || "Group Stage";
  }
}

export const Route = createFileRoute("/api/public/hooks/sync-live")({
  server: {
    handlers: {
      POST: async () => {
        const apiKey = process.env.FOOTBALL_DATA_API_KEY;
        if (!apiKey) {
          return Response.json(
            { ok: false, error: "FOOTBALL_DATA_API_KEY not configured" },
            { status: 500 },
          );
        }

        try {
          const res = await fetch(`${FD_BASE}/competitions/${COMP_CODE}/matches`, {
            headers: { "X-Auth-Token": apiKey },
          });
          if (!res.ok) {
            return Response.json(
              { ok: false, error: `Football-Data ${res.status}` },
              { status: 502 },
            );
          }
          const json = (await res.json()) as { matches?: FDMatch[] };
          const matches = json.matches ?? [];
          let upserts = 0;

          for (const m of matches) {
            const externalId = String(m.id);
            const payload = {
              external_id: externalId,
              tournament_year: 2026,
              stage: mapStage(m.stage),
              group_letter: m.group ? m.group.replace(/Group[\s_]+/i, "") : null,
              home_team_name: m.homeTeam?.name ?? null,
              away_team_name: m.awayTeam?.name ?? null,
              home_team_code: m.homeTeam?.tla ?? null,
              away_team_code: m.awayTeam?.tla ?? null,
              home_score: m.score?.fullTime?.home ?? null,
              away_score: m.score?.fullTime?.away ?? null,
              home_score_ht: m.score?.halfTime?.home ?? null,
              away_score_ht: m.score?.halfTime?.away ?? null,
              home_pens: m.score?.penalties?.home ?? null,
              away_pens: m.score?.penalties?.away ?? null,
              status: mapStatus(m.status),
              kickoff_utc: m.utcDate,
              matchday: m.matchday ?? null,
              minute: m.minute ?? null,
              referee: m.referees?.[0]?.name ?? null,
              last_synced_at: new Date().toISOString(),
            };
            const venue = WC26_VENUES[externalId];
            if (venue) (payload as Record<string, unknown>).stadium_slug = venue;

            const { data: existing } = await supabaseAdmin
              .from("matches")
              .select("id")
              .eq("external_id", externalId)
              .maybeSingle();

            if (existing) {
              await supabaseAdmin
                .from("matches")
                .update(payload)
                .eq("id", existing.id);
            } else {
              await supabaseAdmin.from("matches").insert(payload);
            }
            upserts++;
          }

          return Response.json({ ok: true, count: upserts });
        } catch (err) {
          console.error("sync-live error", err);
          return Response.json(
            { ok: false, error: (err as Error).message },
            { status: 500 },
          );
        }
      },
    },
  },
});