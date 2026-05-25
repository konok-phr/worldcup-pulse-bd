import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { getAllTeams } from "@/lib/data.functions";
import { TeamCrest } from "@/components/site/TeamCrest";
import { useI18n } from "@/lib/i18n";
import { buildHead } from "@/lib/seo";

const teamsQO = queryOptions({ queryKey: ["teams-all"], queryFn: () => getAllTeams(), staleTime: 600_000 });

export const Route = createFileRoute("/teams")({
  head: () => ({ ...buildHead({ title: "Teams — FIFA World Cup 2026 (48 nations) | WC26 Hub", description: "All 48 nations qualified for the FIFA World Cup 2026 — coaches, FIFA rankings and group assignments.", path: "/teams" }) }),
  loader: ({ context }) => context.queryClient.ensureQueryData(teamsQO),
  component: TeamsPage,
});

function TeamsPage() {
  const { t, tn } = useI18n();
  const { data: teams } = useSuspenseQuery(teamsQO);
  const byGroup = teams.reduce<Record<string, typeof teams>>((acc, tm) => {
    const k = tm.group_letter ?? "—";
    (acc[k] = acc[k] ?? []).push(tm);
    return acc;
  }, {});
  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <header className="mb-5">
        <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-primary mb-1">▸ {t("nav_teams")}</div>
        <h1 className="text-2xl font-bold">Teams · 48 Nations</h1>
      </header>
      <div className="space-y-6">
        {Object.entries(byGroup).sort(([a], [b]) => a.localeCompare(b)).map(([letter, list]) => (
          <section key={letter}>
            <h2 className="text-xs uppercase tracking-[0.2em] font-mono text-muted-foreground mb-2"><span className="text-primary">◆</span> {t("group")} {letter}</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {list.map((tm) => (
                <Link key={tm.code} to="/teams/$code" params={{ code: tm.code }} className="flex items-center gap-3 rounded-md border border-border/60 bg-card hover:border-primary/60 hover:bg-card/80 p-3 transition-colors">
                  <TeamCrest code={tm.code} emoji={tm.flag_emoji} size={28} />
                  <div className="min-w-0">
                    <div className="text-sm font-semibold truncate">{tn("team", tm.name)}</div>
                    <div className="text-[10px] font-mono text-muted-foreground uppercase">{tn("confederation", tm.confederation) || tm.code}</div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}