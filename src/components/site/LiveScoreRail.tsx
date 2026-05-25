import { Link } from "@tanstack/react-router";
import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useI18n, fmtNumber } from "@/lib/i18n";
import { TeamCrest } from "./TeamCrest";

type LiveMatch = {
  id: number;
  status: string;
  home_team_code: string | null;
  away_team_code: string | null;
  home_score: number | null;
  away_score: number | null;
  minute: number | null;
  kickoff_utc: string | null;
  stage: string;
};

async function fetchLive(): Promise<LiveMatch[]> {
  const { data, error } = await supabase
    .from("matches")
    .select("id,status,home_team_code,away_team_code,home_score,away_score,minute,kickoff_utc,stage")
    .eq("tournament_year", 2026)
    .in("status", ["live", "in_play", "half_time"])
    .order("kickoff_utc", { ascending: true });
  if (error) throw error;
  return (data ?? []) as LiveMatch[];
}

export function LiveScoreRail() {
  const { t, banglaNumerals } = useI18n();
  const { data = [], refetch } = useQuery({
    queryKey: ["live-rail"],
    queryFn: fetchLive,
    refetchInterval: 30_000,
    staleTime: 15_000,
  });

  React.useEffect(() => {
    const channel = supabase
      .channel("live-matches-rail")
      .on("postgres_changes", { event: "*", schema: "public", table: "matches" }, () => {
        refetch();
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [refetch]);

  return (
    <div className="h-9 border-b border-border/60 bg-card/50 overflow-hidden">
      <div className="flex items-center h-full px-3 gap-6 overflow-x-auto scrollbar-none text-xs">
        <span className="inline-flex items-center gap-1.5 text-primary font-mono uppercase tracking-wider shrink-0">
          <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
          {t("live_now")}
        </span>
        {data.length === 0 ? (
          <span className="text-muted-foreground font-mono">{t("no_live")}</span>
        ) : (
          data.map((m) => (
            <Link
              key={m.id}
              to="/match/$id"
              params={{ id: String(m.id) }}
              className="inline-flex items-center gap-2 shrink-0 font-mono hover:text-primary transition-colors"
            >
              <TeamCrest code={m.home_team_code} size={16} />
              <span className="tabular-nums">
                {fmtNumber(m.home_score ?? 0, banglaNumerals)}–{fmtNumber(m.away_score ?? 0, banglaNumerals)}
              </span>
              <TeamCrest code={m.away_team_code} size={16} />
              <span className="text-primary">
                {m.minute != null ? `${fmtNumber(m.minute, banglaNumerals)}'` : m.status}
              </span>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}