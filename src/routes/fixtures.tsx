import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import * as React from "react";
import { getAllFixtures, getAllTeams } from "@/lib/data.functions";
import { MatchCard, type MatchRow } from "@/components/site/MatchCard";
import { dateKeyBST, formatDateLabel } from "@/lib/time";
import { useI18n } from "@/lib/i18n";
import { buildHead } from "@/lib/seo";

const fixturesQO = queryOptions({ queryKey: ["fixtures"], queryFn: () => getAllFixtures(), staleTime: 300_000 });
const teamsQO = queryOptions({ queryKey: ["teams-all"], queryFn: () => getAllTeams(), staleTime: 600_000 });

export const Route = createFileRoute("/fixtures")({
  head: () => ({ ...buildHead({ title: "Fixtures — FIFA World Cup 2026 (BST) | WC26 Hub", description: "Complete FIFA World Cup 2026 fixtures and schedule in Bangladesh time (BST).", path: "/fixtures" }) }),
  loader: ({ context }) => Promise.all([context.queryClient.ensureQueryData(fixturesQO), context.queryClient.ensureQueryData(teamsQO)]),
  component: FixturesPage,
});

function FixturesPage() {
  const { t, locale } = useI18n();
  const { data: fixtures } = useSuspenseQuery(fixturesQO);
  const { data: teams } = useSuspenseQuery(teamsQO);
  const emojiMap = Object.fromEntries(teams.map((tm) => [tm.code, tm.flag_emoji]));
  const [stage, setStage] = React.useState<string>("all");
  const stages = React.useMemo(() => ["all", ...Array.from(new Set(fixtures.map((f) => f.stage)))], [fixtures]);
  const filtered = fixtures.filter((f) => stage === "all" || f.stage === stage);
  const grouped = React.useMemo(() => {
    const map = new Map<string, MatchRow[]>();
    for (const f of filtered) {
      const k = dateKeyBST(f.kickoff_utc);
      if (!map.has(k)) map.set(k, []);
      map.get(k)!.push(f as MatchRow);
    }
    return Array.from(map.entries());
  }, [filtered]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <header className="mb-5">
        <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-primary mb-1">▸ {t("nav_fixtures")}</div>
        <h1 className="text-2xl font-bold">Fixtures & Schedule</h1>
        <p className="text-sm text-muted-foreground mt-1">All times in Bangladesh time (BST, UTC+6).</p>
      </header>
      <div className="flex flex-wrap gap-1.5 mb-5">
        {stages.map((s) => (
          <button key={s} onClick={() => setStage(s)} className={`px-3 py-1.5 rounded font-mono text-xs uppercase tracking-wider border transition-colors ${stage === s ? "border-primary text-primary bg-primary/10" : "border-border/60 text-muted-foreground hover:text-foreground"}`}>
            {s === "all" ? t("filter_all") : s}
          </button>
        ))}
      </div>
      <div className="space-y-6">
        {grouped.map(([day, list]) => (
          <section key={day}>
            <h2 className="text-xs uppercase tracking-[0.2em] font-mono text-muted-foreground mb-2"><span className="text-primary">◆</span> {day === "tbd" ? "TBD" : formatDateLabel(list[0]?.kickoff_utc, "BST", locale)}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">{list.map((m) => <MatchCard key={m.id} match={m} emojiMap={emojiMap} />)}</div>
          </section>
        ))}
      </div>
    </div>
  );
}