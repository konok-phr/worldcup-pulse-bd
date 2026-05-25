import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { getTournamentByYear } from "@/lib/data.functions";
import { useI18n, fmtNumber } from "@/lib/i18n";
import { buildHead } from "@/lib/seo";
import { ArrowLeft } from "lucide-react";

const yearQO = (year: number) => queryOptions({ queryKey: ["history", year], queryFn: () => getTournamentByYear({ data: { year } }), staleTime: 24 * 3600_000 });

export const Route = createFileRoute("/history/$year")({
  loader: ({ context, params }) => { const year = Number(params.year); return context.queryClient.ensureQueryData(yearQO(year)).then(() => ({ year })); },
  head: ({ loaderData }) => ({ ...buildHead({ title: `FIFA World Cup ${loaderData?.year ?? ""} | WC26 Hub`, description: `History of the FIFA World Cup ${loaderData?.year ?? ""} — hosts, champions, top scorers and key stats.`, path: `/history/${loaderData?.year ?? ""}` }) }),
  component: HistoryDetail,
});

function HistoryDetail() {
  const { t, banglaNumerals } = useI18n();
  const { year } = Route.useLoaderData();
  const { data: tn } = useSuspenseQuery(yearQO(year));
  if (!tn) return <div className="mx-auto max-w-3xl px-4 py-16 text-center text-muted-foreground">Tournament not found.</div>;
  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <Link to="/history" className="inline-flex items-center gap-1 text-xs font-mono uppercase tracking-wider text-muted-foreground hover:text-primary mb-3"><ArrowLeft className="h-3 w-3" /> {t("nav_history")}</Link>
      <h1 className="text-4xl font-bold mb-1">FIFA World Cup <span className="font-mono">{fmtNumber(tn.year, banglaNumerals)}</span></h1>
      <p className="text-muted-foreground mb-6">{t("hosts")}: {(tn.host_countries ?? []).join(", ")}</p>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
        <Stat label={t("winner")} value={tn.winner_code ?? "—"} />
        <Stat label={t("runner_up")} value={tn.runner_up_code ?? "—"} />
        <Stat label={t("third")} value={tn.third_place_code ?? "—"} />
        <Stat label={t("top_scorer")} value={tn.top_scorer ? `${tn.top_scorer} (${tn.top_scorer_goals ?? 0})` : "—"} />
        <Stat label={t("golden_ball")} value={tn.golden_ball ?? "—"} />
        <Stat label={t("golden_glove")} value={tn.golden_glove ?? "—"} />
        <Stat label={t("teams_count")} value={tn.teams_count != null ? fmtNumber(tn.teams_count, banglaNumerals) : "—"} />
        <Stat label={t("matches_played")} value={tn.matches_played != null ? fmtNumber(tn.matches_played, banglaNumerals) : "—"} />
        <Stat label={t("total_goals")} value={tn.total_goals != null ? fmtNumber(tn.total_goals, banglaNumerals) : "—"} />
      </div>
      {tn.summary && <p className="text-sm text-muted-foreground leading-relaxed">{tn.summary}</p>}
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