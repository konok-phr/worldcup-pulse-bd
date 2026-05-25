import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { getTournaments } from "@/lib/data.functions";
import { useI18n, fmtNumber } from "@/lib/i18n";
import { buildHead } from "@/lib/seo";

const historyQO = queryOptions({ queryKey: ["history"], queryFn: () => getTournaments(), staleTime: 24 * 3600_000 });

export const Route = createFileRoute("/history")({
  head: () => ({ ...buildHead({ title: "World Cup History 1930–2022 | WC26 Hub", description: "Every FIFA World Cup edition from 1930 to 2022 — hosts, champions, top scorers and key facts.", path: "/history" }) }),
  loader: ({ context }) => context.queryClient.ensureQueryData(historyQO),
  component: HistoryPage,
});

function HistoryPage() {
  const { t, banglaNumerals } = useI18n();
  const { data: tournaments } = useSuspenseQuery(historyQO);
  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <header className="mb-5">
        <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-primary mb-1">▸ {t("nav_history")}</div>
        <h1 className="text-2xl font-bold">World Cup Archive · 1930–2026</h1>
      </header>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {tournaments.map((tn) => (
          <Link key={tn.year} to="/history/$year" params={{ year: String(tn.year) }} className="rounded-lg border border-border/60 bg-card hover:border-primary/60 p-4 transition-colors">
            <div className="font-mono text-3xl font-bold tabular-nums">{fmtNumber(tn.year, banglaNumerals)}</div>
            <div className="text-sm text-muted-foreground">{(tn.host_countries ?? []).join(", ")}</div>
            {tn.winner_code && <div className="mt-2 text-xs font-mono"><span className="text-primary">{t("champions")}:</span> {tn.winner_code}</div>}
          </Link>
        ))}
      </div>
    </div>
  );
}