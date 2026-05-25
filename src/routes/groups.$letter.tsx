import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { getStandings, getAllTeams, getAllFixtures } from "@/lib/data.functions";
import { MatchCard, type MatchRow } from "@/components/site/MatchCard";
import { TeamCrest } from "@/components/site/TeamCrest";
import { useI18n, fmtNumber } from "@/lib/i18n";
import { buildHead } from "@/lib/seo";
import { ArrowLeft } from "lucide-react";

const standingsQO = queryOptions({ queryKey: ["standings"], queryFn: () => getStandings(), staleTime: 60_000 });
const teamsQO = queryOptions({ queryKey: ["teams-all"], queryFn: () => getAllTeams(), staleTime: 600_000 });
const fixturesQO = queryOptions({ queryKey: ["fixtures"], queryFn: () => getAllFixtures(), staleTime: 300_000 });

export const Route = createFileRoute("/groups/$letter")({
  loader: ({ context, params }) => Promise.all([context.queryClient.ensureQueryData(standingsQO), context.queryClient.ensureQueryData(teamsQO), context.queryClient.ensureQueryData(fixturesQO)]).then(() => ({ letter: params.letter.toUpperCase() })),
  head: ({ loaderData }) => ({ ...buildHead({ title: `Group ${loaderData?.letter ?? ""} — FIFA World Cup 2026 | WC26 Hub`, description: `Standings, teams and fixtures for Group ${loaderData?.letter ?? ""} at the FIFA World Cup 2026.`, path: `/groups/${loaderData?.letter ?? ""}` }) }),
  component: GroupDetail,
});

function GroupDetail() {
  const { t, banglaNumerals } = useI18n();
  const { letter } = Route.useLoaderData();
  const { data: standings } = useSuspenseQuery(standingsQO);
  const { data: teams } = useSuspenseQuery(teamsQO);
  const { data: fixtures } = useSuspenseQuery(fixturesQO);
  const teamMap = Object.fromEntries(teams.map((tm) => [tm.code, tm]));
  const emojiMap = Object.fromEntries(teams.map((tm) => [tm.code, tm.flag_emoji]));
  const rows = standings.filter((s) => s.group_letter === letter);
  const groupFixtures = fixtures.filter((f) => f.group_letter === letter);
  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <Link to="/groups" className="inline-flex items-center gap-1 text-xs font-mono uppercase tracking-wider text-muted-foreground hover:text-primary mb-3"><ArrowLeft className="h-3 w-3" /> {t("nav_groups")}</Link>
      <h1 className="text-2xl font-bold mb-4"><span className="text-primary font-mono">{t("group")}</span> {letter}</h1>
      <div className="rounded-lg border border-border/60 bg-card mb-6 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-[10px] uppercase tracking-wider font-mono text-muted-foreground border-b border-border/60">
            <tr><th className="text-left px-3 py-2 w-8">#</th><th className="text-left">{t("team")}</th><th className="text-center px-2">{t("played")}</th><th className="text-center px-2">{t("won")}</th><th className="text-center px-2">{t("drawn")}</th><th className="text-center px-2">{t("lost")}</th><th className="text-center px-2">{t("gf")}</th><th className="text-center px-2">{t("ga")}</th><th className="text-center px-2">{t("gd")}</th><th className="text-center px-2">{t("pts")}</th></tr>
          </thead>
          <tbody>
            {rows.map((r, i) => { const tm = teamMap[r.team_code]; return (
              <tr key={r.team_code} className="border-t border-border/40">
                <td className="px-3 py-2 font-mono text-muted-foreground">{fmtNumber(i + 1, banglaNumerals)}</td>
                <td className="py-2 pr-2"><Link to="/teams/$code" params={{ code: r.team_code }} className="inline-flex items-center gap-2 hover:text-primary"><TeamCrest code={r.team_code} emoji={tm?.flag_emoji ?? null} size={18} /><span>{tm?.name ?? r.team_code}</span></Link></td>
                <td className="text-center font-mono tabular-nums text-xs">{fmtNumber(r.played ?? 0, banglaNumerals)}</td>
                <td className="text-center font-mono tabular-nums text-xs">{fmtNumber(r.won ?? 0, banglaNumerals)}</td>
                <td className="text-center font-mono tabular-nums text-xs">{fmtNumber(r.drawn ?? 0, banglaNumerals)}</td>
                <td className="text-center font-mono tabular-nums text-xs">{fmtNumber(r.lost ?? 0, banglaNumerals)}</td>
                <td className="text-center font-mono tabular-nums text-xs">{fmtNumber(r.goals_for ?? 0, banglaNumerals)}</td>
                <td className="text-center font-mono tabular-nums text-xs">{fmtNumber(r.goals_against ?? 0, banglaNumerals)}</td>
                <td className="text-center font-mono tabular-nums text-xs">{fmtNumber(r.goal_diff ?? 0, banglaNumerals)}</td>
                <td className="text-center font-mono font-bold tabular-nums">{fmtNumber(r.points ?? 0, banglaNumerals)}</td>
              </tr>
            );})}
          </tbody>
        </table>
      </div>
      <h2 className="text-xs uppercase tracking-[0.2em] font-mono text-muted-foreground mb-3"><span className="text-primary">▸</span> {t("fixtures_results")}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">{groupFixtures.map((m) => <MatchCard key={m.id} match={m as MatchRow} emojiMap={emojiMap} />)}</div>
    </div>
  );
}