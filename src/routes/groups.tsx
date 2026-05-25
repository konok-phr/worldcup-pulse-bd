import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { getGroups, getStandings, getAllTeams } from "@/lib/data.functions";
import { TeamCrest } from "@/components/site/TeamCrest";
import { useI18n, fmtNumber } from "@/lib/i18n";
import { buildHead } from "@/lib/seo";

const groupsQO = queryOptions({ queryKey: ["groups"], queryFn: () => getGroups(), staleTime: 600_000 });
const standingsQO = queryOptions({ queryKey: ["standings"], queryFn: () => getStandings(), staleTime: 60_000 });
const teamsQO = queryOptions({ queryKey: ["teams-all"], queryFn: () => getAllTeams(), staleTime: 600_000 });

export const Route = createFileRoute("/groups")({
  head: () => ({ ...buildHead({ title: "Groups & Standings — FIFA World Cup 2026 | WC26 Hub", description: "All 12 groups, live standings and qualification status for the FIFA World Cup 2026.", path: "/groups" }) }),
  loader: ({ context }) => Promise.all([context.queryClient.ensureQueryData(groupsQO), context.queryClient.ensureQueryData(standingsQO), context.queryClient.ensureQueryData(teamsQO)]),
  component: GroupsPage,
});

function GroupsPage() {
  const { t, banglaNumerals } = useI18n();
  const { data: groups } = useSuspenseQuery(groupsQO);
  const { data: standings } = useSuspenseQuery(standingsQO);
  const { data: teams } = useSuspenseQuery(teamsQO);
  const teamMap = Object.fromEntries(teams.map((tm) => [tm.code, tm]));

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <header className="mb-5">
        <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-primary mb-1">▸ {t("nav_groups")}</div>
        <h1 className="text-2xl font-bold">Groups & Standings</h1>
      </header>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {groups.map((g) => {
          const rows = standings.filter((s) => s.group_letter === g.letter);
          return (
            <div key={g.letter} className="rounded-lg border border-border/60 bg-card">
              <div className="px-4 py-3 border-b border-border/60 flex items-center justify-between">
                <span className="font-mono text-sm font-bold"><span className="text-primary">{t("group")}</span> {g.letter}</span>
                <Link to="/groups/$letter" params={{ letter: g.letter }} className="text-[10px] uppercase tracking-wider font-mono text-muted-foreground hover:text-primary">{t("view_all")} →</Link>
              </div>
              <table className="w-full text-sm">
                <thead className="text-[10px] uppercase tracking-wider font-mono text-muted-foreground">
                  <tr><th className="text-left px-3 py-1.5 w-6">#</th><th className="text-left">{t("team")}</th><th className="text-center px-1 w-7">{t("played")}</th><th className="text-center px-1 w-7">{t("gd")}</th><th className="text-center px-1 w-7">{t("pts")}</th></tr>
                </thead>
                <tbody>
                  {rows.map((r, i) => {
                    const tm = teamMap[r.team_code];
                    return (
                      <tr key={r.team_code} className="border-t border-border/40">
                        <td className="px-3 py-2 font-mono text-muted-foreground">{fmtNumber(i + 1, banglaNumerals)}</td>
                        <td className="py-2"><Link to="/teams/$code" params={{ code: r.team_code }} className="inline-flex items-center gap-2 hover:text-primary"><TeamCrest code={r.team_code} emoji={tm?.flag_emoji ?? null} size={18} /><span className="truncate">{tm?.name ?? r.team_code}</span></Link></td>
                        <td className="text-center font-mono tabular-nums text-xs">{fmtNumber(r.played ?? 0, banglaNumerals)}</td>
                        <td className="text-center font-mono tabular-nums text-xs">{fmtNumber(r.goal_diff ?? 0, banglaNumerals)}</td>
                        <td className="text-center font-mono font-bold tabular-nums">{fmtNumber(r.points ?? 0, banglaNumerals)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          );
        })}
      </div>
    </div>
  );
}