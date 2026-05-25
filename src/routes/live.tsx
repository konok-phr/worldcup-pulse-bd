import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import * as React from "react";
import { getLiveMatches, getAllTeams } from "@/lib/data.functions";
import { MatchCard, type MatchRow } from "@/components/site/MatchCard";
import { supabase } from "@/integrations/supabase/client";
import { buildHead } from "@/lib/seo";
import { useI18n } from "@/lib/i18n";

const liveQO = queryOptions({ queryKey: ["live"], queryFn: () => getLiveMatches(), staleTime: 15_000 });
const teamsQO = queryOptions({ queryKey: ["teams-all"], queryFn: () => getAllTeams(), staleTime: 600_000 });

export const Route = createFileRoute("/live")({
  head: () => ({
    ...buildHead({
      title: "Live Match Center — FIFA World Cup 2026 | WC26 Hub",
      description: "Real-time scores, lineups and timelines for every live FIFA World Cup 2026 match. Updates in Bangladesh time (BST).",
      path: "/live",
    }),
  }),
  loader: ({ context }) =>
    Promise.all([
      context.queryClient.ensureQueryData(liveQO),
      context.queryClient.ensureQueryData(teamsQO),
    ]),
  component: LivePage,
});

function LivePage() {
  const { t } = useI18n();
  const { data: live, refetch } = useSuspenseQuery(liveQO);
  const { data: teams } = useSuspenseQuery(teamsQO);
  const emojiMap = Object.fromEntries(teams.map((tm) => [tm.code, tm.flag_emoji]));

  React.useEffect(() => {
    const ch = supabase
      .channel("live-page")
      .on("postgres_changes", { event: "*", schema: "public", table: "matches" }, () => refetch())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [refetch]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <header className="mb-5">
        <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-primary mb-1">▸ {t("live_now")}</div>
        <h1 className="text-2xl font-bold">Live Match Center</h1>
        <p className="text-sm text-muted-foreground mt-1">Auto-refreshing scores. Times in Bangladesh time (BST).</p>
      </header>
      {live.length === 0 ? (
        <div className="rounded-md border border-border/60 bg-card/40 p-10 text-center text-muted-foreground font-mono text-sm">{t("no_live")}</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {live.map((m) => <MatchCard key={m.id} match={m as MatchRow} emojiMap={emojiMap} />)}
        </div>
      )}
    </div>
  );
}