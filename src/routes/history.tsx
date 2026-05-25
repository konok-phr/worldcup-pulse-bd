import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { getTournaments, getAllTeams } from "@/lib/data.functions";
import { useI18n, fmtNumber } from "@/lib/i18n";
import { buildHead } from "@/lib/seo";
import { TeamCrest } from "@/components/site/TeamCrest";
import { Trophy } from "lucide-react";

const historyQO = queryOptions({ queryKey: ["history"], queryFn: () => getTournaments(), staleTime: 24 * 3600_000 });
const teamsQO = queryOptions({ queryKey: ["teams-all"], queryFn: () => getAllTeams(), staleTime: 600_000 });

export const Route = createFileRoute("/history")({
  head: () => ({ ...buildHead({ title: "World Cup History 1930–2022 | WC26 Hub", description: "Every FIFA World Cup edition from 1930 to 2022 — hosts, champions, top scorers and key facts.", path: "/history" }) }),
  loader: ({ context }) => Promise.all([
    context.queryClient.ensureQueryData(historyQO),
    context.queryClient.ensureQueryData(teamsQO),
  ]),
  component: HistoryPage,
});

function HistoryPage() {
  const { t, tn, banglaNumerals } = useI18n();
  const { data: tournaments } = useSuspenseQuery(historyQO);
  const { data: teams } = useSuspenseQuery(teamsQO);
  const emojiMap = Object.fromEntries(teams.map((tm) => [tm.code, tm.flag_emoji]));
  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <header className="mb-5">
        <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-primary mb-1">▸ {t("nav_history")}</div>
        <h1 className="text-2xl font-bold">World Cup Archive · 1930–2026</h1>
      </header>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {tournaments.map((tn) => (
          <Link key={tn.year} to="/history/$year" params={{ year: String(tn.year) }} className="group rounded-lg border border-border/60 bg-card hover:border-primary/60 hover:bg-card/80 p-4 transition-colors">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="font-mono text-3xl font-bold tabular-nums group-hover:text-primary transition-colors">{fmtNumber(tnRow.year, banglaNumerals)}</div>
                <div className="text-sm text-muted-foreground line-clamp-1">{(tnRow.host_countries ?? []).map((c) => tn("country", c)).join(", ")}</div>
              </div>
              {tnRow.winner_code && <TeamCrest code={tnRow.winner_code} emoji={emojiMap[tnRow.winner_code]} size={40} />}
            </div>
            {tn.winner_code && (
              <div className="mt-3 flex items-center gap-1.5 text-xs font-mono text-muted-foreground">
                <Trophy className="h-3 w-3 text-primary" />
                <span>{t("champions")}: <span className="text-foreground font-semibold">{tn.winner_code}</span></span>
              </div>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}