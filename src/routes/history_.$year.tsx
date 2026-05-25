import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { getTournamentByYear, getAllTeams } from "@/lib/data.functions";
import { useI18n, fmtNumber } from "@/lib/i18n";
import { buildHead } from "@/lib/seo";
import { TeamCrest } from "@/components/site/TeamCrest";
import { ArrowLeft, Trophy, Medal, Award, Target, Star, Shield, Users, Calendar, Goal } from "lucide-react";

const yearQO = (year: number) =>
  queryOptions({
    queryKey: ["history", year],
    queryFn: () => getTournamentByYear({ data: { year } }),
    staleTime: 24 * 3600_000,
  });
const teamsQO = queryOptions({
  queryKey: ["teams-all"],
  queryFn: () => getAllTeams(),
  staleTime: 600_000,
});

export const Route = createFileRoute("/history_/$year")({
  // path resolves to /history/$year (underscore escapes the /history layout)
  loader: ({ context, params }) => {
    const year = Number(params.year);
    return Promise.all([
      context.queryClient.ensureQueryData(yearQO(year)),
      context.queryClient.ensureQueryData(teamsQO),
    ]).then(() => ({ year }));
  },
  head: ({ loaderData }) => ({
    ...buildHead({
      title: `FIFA World Cup ${loaderData?.year ?? ""} | WC26 Hub`,
      description: `History of the FIFA World Cup ${loaderData?.year ?? ""} — hosts, champions, top scorers and key stats.`,
      path: `/history/${loaderData?.year ?? ""}`,
    }),
  }),
  component: HistoryDetail,
});

function HistoryDetail() {
  const { t, tn, banglaNumerals } = useI18n();
  const { year } = Route.useLoaderData();
  const { data: row } = useSuspenseQuery(yearQO(year));
  const { data: teams } = useSuspenseQuery(teamsQO);
  const emojiMap = Object.fromEntries(teams.map((tm) => [tm.code, tm.flag_emoji]));

  if (!row) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center text-muted-foreground">
        Tournament not found.
        <div className="mt-4">
          <Link to="/history" className="text-primary underline">Back to history</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <Link to="/history" className="inline-flex items-center gap-1 text-xs font-mono uppercase tracking-wider text-muted-foreground hover:text-primary mb-4">
        <ArrowLeft className="h-3 w-3" /> {t("nav_history")}
      </Link>

      {/* Hero */}
      <div className="relative overflow-hidden rounded-xl border border-border/60 bg-gradient-to-br from-primary/10 via-card to-card p-6 md:p-8 mb-6">
        <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-primary/10 blur-3xl" />
        <div className="relative">
          <div className="text-[10px] font-mono uppercase tracking-[0.25em] text-primary mb-2">▸ FIFA World Cup</div>
          <div className="flex items-baseline gap-4 flex-wrap">
            <h1 className="font-mono text-6xl md:text-7xl font-bold tabular-nums leading-none">
              {fmtNumber(row.year, banglaNumerals)}
            </h1>
            {row.winner_code && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-primary/40 bg-primary/10">
                <Trophy className="h-4 w-4 text-primary" />
                <span className="font-mono text-sm font-semibold">{row.winner_code} Champions</span>
              </div>
            )}
          </div>
          <div className="mt-3 flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>{t("hosts")}: {(row.host_countries ?? []).map((c) => tn("country", c)).join(", ") || "—"}</span>
          </div>
        </div>
      </div>

      {/* Podium */}
      {(row.winner_code || row.runner_up_code || row.third_place_code) && (
        <section className="mb-6">
          <h2 className="text-xs uppercase tracking-[0.2em] font-mono text-muted-foreground mb-3"><span className="text-primary">▸</span> Podium</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <PodiumCard place={1} code={row.winner_code} label={t("winner")} emoji={emojiMap[row.winner_code ?? ""]} />
            <PodiumCard place={2} code={row.runner_up_code} label={t("runner_up")} emoji={emojiMap[row.runner_up_code ?? ""]} />
            <PodiumCard place={3} code={row.third_place_code} label={t("third")} emoji={emojiMap[row.third_place_code ?? ""]} />
          </div>
          {row.final_score && (
            <div className="mt-3 text-center text-sm text-muted-foreground">
              Final: <span className="font-mono font-semibold text-foreground">{row.final_score}</span>
            </div>
          )}
        </section>
      )}

      {/* Awards */}
      <section className="mb-6">
        <h2 className="text-xs uppercase tracking-[0.2em] font-mono text-muted-foreground mb-3"><span className="text-primary">▸</span> Individual Awards</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <AwardCard
            icon={<Target className="h-4 w-4" />}
            label={t("top_scorer")}
            value={row.top_scorer ?? "—"}
            sub={row.top_scorer_goals != null ? `${fmtNumber(row.top_scorer_goals, banglaNumerals)} ${t("goals") ?? "goals"}` : null}
          />
          <AwardCard icon={<Star className="h-4 w-4" />} label={t("golden_ball")} value={row.golden_ball ?? "—"} />
          <AwardCard icon={<Shield className="h-4 w-4" />} label={t("golden_glove")} value={row.golden_glove ?? "—"} />
        </div>
      </section>

      {/* Stats grid */}
      <section className="mb-6">
        <h2 className="text-xs uppercase tracking-[0.2em] font-mono text-muted-foreground mb-3"><span className="text-primary">▸</span> Tournament Stats</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatTile icon={<Users className="h-4 w-4" />} label={t("teams_count")} value={row.teams_count != null ? fmtNumber(row.teams_count, banglaNumerals) : "—"} />
          <StatTile icon={<Calendar className="h-4 w-4" />} label={t("matches_played")} value={row.matches_played != null ? fmtNumber(row.matches_played, banglaNumerals) : "—"} />
          <StatTile icon={<Goal className="h-4 w-4" />} label={t("total_goals")} value={row.total_goals != null ? fmtNumber(row.total_goals, banglaNumerals) : "—"} />
          <StatTile
            icon={<Award className="h-4 w-4" />}
            label="Goals / match"
            value={row.total_goals && row.matches_played ? (row.total_goals / row.matches_played).toFixed(2) : "—"}
          />
        </div>
      </section>

      {/* Summary */}
      {row.summary && (
        <section className="rounded-lg border border-border/60 bg-card/60 p-5">
          <h2 className="text-xs uppercase tracking-[0.2em] font-mono text-muted-foreground mb-2"><span className="text-primary">▸</span> Summary</h2>
          <p className="text-sm md:text-base text-foreground/90 leading-relaxed">{row.summary}</p>
        </section>
      )}
    </div>
  );
}

function PodiumCard({
  place,
  code,
  label,
  emoji,
}: {
  place: 1 | 2 | 3;
  code: string | null | undefined;
  label: string;
  emoji: string | null | undefined;
}) {
  const icons = {
    1: <Trophy className="h-5 w-5 text-yellow-400" />,
    2: <Medal className="h-5 w-5 text-slate-300" />,
    3: <Medal className="h-5 w-5 text-amber-600" />,
  };
  const accent = place === 1 ? "border-yellow-400/40 bg-yellow-400/5" : place === 2 ? "border-slate-300/30 bg-slate-300/5" : "border-amber-600/30 bg-amber-600/5";
  const heights = place === 1 ? "md:pt-8 md:pb-10" : place === 2 ? "md:pt-6 md:pb-8" : "md:pt-4 md:pb-6";
  return (
    <div className={`rounded-lg border ${accent} p-5 ${heights} flex flex-col items-center text-center`}>
      <div className="flex items-center gap-2 mb-3">{icons[place]}<span className="text-[10px] uppercase tracking-wider font-mono text-muted-foreground">{label}</span></div>
      {code ? (
        <>
          <TeamCrest code={code} emoji={emoji} size={56} />
          <div className="mt-3 font-mono font-bold text-lg">{code}</div>
        </>
      ) : (
        <div className="font-mono text-muted-foreground">—</div>
      )}
    </div>
  );
}

function AwardCard({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: string; sub?: string | null }) {
  return (
    <div className="rounded-md border border-border/60 bg-card/60 p-4">
      <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider font-mono text-muted-foreground">{icon}{label}</div>
      <div className="mt-1 font-semibold truncate">{value}</div>
      {sub && <div className="text-xs font-mono text-primary mt-0.5">{sub}</div>}
    </div>
  );
}

function StatTile({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) {
  return (
    <div className="rounded-md border border-border/60 bg-card/60 p-4">
      <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider font-mono text-muted-foreground">{icon}{label}</div>
      <div className="mt-1 font-mono text-2xl font-bold tabular-nums">{value}</div>
    </div>
  );
}