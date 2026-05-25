import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { getAllFixtures, getAllTeams } from "@/lib/data.functions";
import { MatchCard, type MatchRow } from "@/components/site/MatchCard";
import { useI18n } from "@/lib/i18n";
import { buildHead } from "@/lib/seo";

const fixturesQO = queryOptions({ queryKey: ["fixtures"], queryFn: () => getAllFixtures(), staleTime: 300_000 });
const teamsQO = queryOptions({ queryKey: ["teams-all"], queryFn: () => getAllTeams(), staleTime: 600_000 });
const STAGES = ["Round of 32", "Round of 16", "Quarter-final", "Semi-final", "Third-place playoff", "Final"];

export const Route = createFileRoute("/knockout")({
  head: () => ({ ...buildHead({ title: "Knockout Bracket — FIFA World Cup 2026 | WC26 Hub", description: "Full FIFA World Cup 2026 knockout bracket from Round of 32 to the Final.", path: "/knockout" }) }),
  loader: ({ context }) => Promise.all([context.queryClient.ensureQueryData(fixturesQO), context.queryClient.ensureQueryData(teamsQO)]),
  component: KnockoutPage,
});

function KnockoutPage() {
  const { t } = useI18n();
  const { data: fixtures } = useSuspenseQuery(fixturesQO);
  const { data: teams } = useSuspenseQuery(teamsQO);
  const emojiMap = Object.fromEntries(teams.map((tm) => [tm.code, tm.flag_emoji]));
  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <header className="mb-5">
        <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-primary mb-1">▸ {t("nav_knockout")}</div>
        <h1 className="text-2xl font-bold">Knockout Bracket</h1>
      </header>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {STAGES.map((stage) => {
          const list = fixtures.filter((f) => f.stage === stage);
          if (list.length === 0) return null;
          return (
            <section key={stage}>
              <h2 className="text-xs uppercase tracking-[0.2em] font-mono text-muted-foreground mb-2"><span className="text-primary">◆</span> {stage}</h2>
              <div className="space-y-2">
                {list.map((m) => <MatchCard key={m.id} match={m as MatchRow} emojiMap={emojiMap} compact />)}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}