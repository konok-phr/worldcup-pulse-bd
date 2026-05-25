import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { getTeamByCode, getAllTeams } from "@/lib/data.functions";
import { MatchCard, type MatchRow } from "@/components/site/MatchCard";
import { TeamCrest } from "@/components/site/TeamCrest";
import { useI18n, fmtNumber } from "@/lib/i18n";
import { buildHead } from "@/lib/seo";
import { ArrowLeft } from "lucide-react";

const teamQO = (code: string) => queryOptions({ queryKey: ["team", code], queryFn: () => getTeamByCode({ data: { code } }), staleTime: 600_000 });
const teamsQO = queryOptions({ queryKey: ["teams-all"], queryFn: () => getAllTeams(), staleTime: 600_000 });

export const Route = createFileRoute("/teams/$code")({
  loader: ({ context, params }) => Promise.all([context.queryClient.ensureQueryData(teamQO(params.code.toUpperCase())), context.queryClient.ensureQueryData(teamsQO)]).then(() => ({ code: params.code.toUpperCase() })),
  head: ({ loaderData }) => ({ ...buildHead({ title: `${loaderData?.code ?? ""} — FIFA World Cup 2026 | WC26 Hub`, description: `Squad, coach, FIFA ranking, fixtures and World Cup history for ${loaderData?.code ?? ""} at the FIFA World Cup 2026.`, path: `/teams/${loaderData?.code ?? ""}` }) }),
  component: TeamDetail,
});

function TeamDetail() {
  const { t, banglaNumerals } = useI18n();
  const { code } = Route.useLoaderData();
  const { data } = useSuspenseQuery(teamQO(code));
  const { data: allTeams } = useSuspenseQuery(teamsQO);
  const emojiMap = Object.fromEntries(allTeams.map((tm) => [tm.code, tm.flag_emoji]));
  const tm = data.team;
  if (!tm) return <div className="mx-auto max-w-3xl px-4 py-16 text-center text-muted-foreground">Team not found.</div>;
  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <Link to="/teams" className="inline-flex items-center gap-1 text-xs font-mono uppercase tracking-wider text-muted-foreground hover:text-primary mb-3"><ArrowLeft className="h-3 w-3" /> {t("nav_teams")}</Link>
      <header className="flex items-center gap-4 mb-6">
        <TeamCrest code={tm.code} emoji={tm.flag_emoji} size={64} />
        <div>
          <h1 className="text-3xl font-bold">{tm.name}</h1>
          <div className="text-sm font-mono text-muted-foreground">{tm.confederation} · {tm.nickname ?? tm.code}</div>
        </div>
      </header>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <Stat label={t("group")} value={tm.group_letter ?? "—"} />
        <Stat label={t("ranking")} value={tm.fifa_ranking != null ? `#${fmtNumber(tm.fifa_ranking, banglaNumerals)}` : "—"} />
        <Stat label={t("appearances")} value={fmtNumber(tm.wc_appearances ?? 0, banglaNumerals)} />
        <Stat label={t("titles")} value={fmtNumber(tm.wc_titles ?? 0, banglaNumerals)} />
        <Stat label={t("coach")} value={tm.coach ?? "—"} />
        <Stat label={t("best_finish")} value={tm.best_finish ?? "—"} />
      </div>
      <h2 className="text-xs uppercase tracking-[0.2em] font-mono text-muted-foreground mb-3"><span className="text-primary">▸</span> {t("fixtures_results")}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {data.fixtures.map((m) => <MatchCard key={m.id} match={m as MatchRow} emojiMap={emojiMap} />)}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border/60 bg-card/60 p-3">
      <div className="text-[10px] uppercase tracking-wider font-mono text-muted-foreground">{label}</div>
      <div className="mt-0.5 font-mono font-semibold truncate">{value}</div>
    </div>
  );
}