import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { getAllFixtures, getAllTeams } from "@/lib/data.functions";
import { TeamCrest } from "@/components/site/TeamCrest";
import { useI18n, fmtNumber } from "@/lib/i18n";
import { formatTimeOnly } from "@/lib/time";
import { buildHead } from "@/lib/seo";
import { cn } from "@/lib/utils";

const fixturesQO = queryOptions({
  queryKey: ["fixtures"],
  queryFn: () => getAllFixtures(),
  staleTime: 300_000,
});
const teamsQO = queryOptions({
  queryKey: ["teams-all"],
  queryFn: () => getAllTeams(),
  staleTime: 600_000,
});

type Stage = { key: string; label: string };
const STAGES: Stage[] = [
  { key: "Round of 32", label: "R32" },
  { key: "Round of 16", label: "R16" },
  { key: "Quarter-final", label: "QF" },
  { key: "Semi-final", label: "SF" },
  { key: "Final", label: "Final" },
];

export const Route = createFileRoute("/knockout")({
  head: () => ({
    ...buildHead({
      title: "Knockout Bracket — FIFA World Cup 2026 | WC26 Hub",
      description:
        "Interactive World Cup 2026 knockout bracket: follow every team from the Round of 32 to the Final.",
      path: "/knockout",
    }),
  }),
  loader: ({ context }) =>
    Promise.all([
      context.queryClient.ensureQueryData(fixturesQO),
      context.queryClient.ensureQueryData(teamsQO),
    ]),
  component: KnockoutPage,
});

function KnockoutPage() {
  const { t, locale, banglaNumerals } = useI18n();
  const { data: fixtures } = useSuspenseQuery(fixturesQO);
  const { data: teams } = useSuspenseQuery(teamsQO);
  const emojiMap = Object.fromEntries(teams.map((tm) => [tm.code, tm.flag_emoji]));

  const byStage: Record<string, typeof fixtures> = {};
  for (const f of fixtures) (byStage[f.stage] ||= []).push(f);
  for (const k of Object.keys(byStage)) {
    byStage[k].sort((a, b) => (a.kickoff_utc ?? "").localeCompare(b.kickoff_utc ?? ""));
  }
  const thirdPlace = (byStage["Third-place playoff"] ?? [])[0];

  return (
    <div className="mx-auto max-w-[1600px] px-4 py-6">
      <header className="mb-5">
        <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-primary mb-1">
          ▸ {t("nav_knockout")}
        </div>
        <h1 className="text-2xl font-bold">{t("bracket")}</h1>
      </header>

      <div className="overflow-x-auto pb-4">
        <div className="flex gap-4 min-w-max">
          {STAGES.map((stage) => {
            const list = byStage[stage.key] ?? [];
            const count = list.length || 1;
            return (
              <div key={stage.key} className="flex flex-col" style={{ width: 230 }}>
                <div className="text-[10px] uppercase tracking-[0.2em] font-mono text-muted-foreground mb-3 text-center">
                  <span className="text-primary">◆</span> {stage.key}
                </div>
                <div
                  className="grid gap-3 flex-1"
                  style={{
                    gridTemplateRows: `repeat(${count}, minmax(0, 1fr))`,
                  }}
                >
                  {list.map((m) => (
                    <BracketMatch
                      key={m.id}
                      m={m}
                      emojiMap={emojiMap}
                      bnNumerals={banglaNumerals}
                      locale={locale}
                    />
                  ))}
                  {list.length === 0 &&
                    Array.from({ length: 1 }).map((_, i) => (
                      <div
                        key={i}
                        className="rounded-md border border-dashed border-border/40 bg-card/20 p-3 text-center text-[10px] uppercase tracking-wider font-mono text-muted-foreground self-center"
                      >
                        {t("tbd")}
                      </div>
                    ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {thirdPlace && (
        <section className="mt-6 max-w-md">
          <div className="text-[10px] uppercase tracking-[0.2em] font-mono text-muted-foreground mb-2">
            <span className="text-primary">◆</span> Third-place playoff
          </div>
          <BracketMatch
            m={thirdPlace}
            emojiMap={emojiMap}
            bnNumerals={banglaNumerals}
            locale={locale}
          />
        </section>
      )}
    </div>
  );
}

function BracketMatch({
  m,
  emojiMap,
  bnNumerals,
  locale,
}: {
  m: {
    id: number;
    status: string;
    home_team_code: string | null;
    away_team_code: string | null;
    home_team_name: string | null;
    away_team_name: string | null;
    home_score: number | null;
    away_score: number | null;
    home_pens: number | null;
    away_pens: number | null;
    kickoff_utc: string | null;
  };
  emojiMap: Record<string, string | null>;
  bnNumerals: boolean;
  locale: "en" | "bn";
}) {
  const isLive = ["live", "in_play", "half_time"].includes(m.status);
  const isFinished = ["finished", "ft", "full_time"].includes(m.status);
  const hs = m.home_score;
  const as = m.away_score;
  const hWon = isFinished && hs != null && as != null && (hs > as || (hs === as && (m.home_pens ?? 0) > (m.away_pens ?? 0)));
  const aWon = isFinished && hs != null && as != null && (as > hs || (hs === as && (m.away_pens ?? 0) > (m.home_pens ?? 0)));

  return (
    <Link
      to="/match/$id"
      params={{ id: String(m.id) }}
      className={cn(
        "block rounded-md border bg-card text-xs hover:border-primary/60 transition-colors self-center w-full",
        isLive ? "border-primary/60" : "border-border/60",
      )}
    >
      <Row
        code={m.home_team_code}
        name={m.home_team_name}
        score={hs}
        pens={m.home_pens}
        emoji={emojiMap[m.home_team_code ?? ""] ?? null}
        winner={hWon}
        loser={aWon}
        bnNumerals={bnNumerals}
      />
      <div className="border-t border-border/40" />
      <Row
        code={m.away_team_code}
        name={m.away_team_name}
        score={as}
        pens={m.away_pens}
        emoji={emojiMap[m.away_team_code ?? ""] ?? null}
        winner={aWon}
        loser={hWon}
        bnNumerals={bnNumerals}
      />
      <div className="px-2 py-1 text-[9px] uppercase tracking-wider font-mono text-muted-foreground border-t border-border/40 flex items-center justify-between">
        {isLive ? (
          <span className="text-primary inline-flex items-center gap-1">
            <span className="h-1 w-1 rounded-full bg-primary animate-pulse" /> LIVE
          </span>
        ) : isFinished ? (
          <span>FT</span>
        ) : (
          <span>{formatTimeOnly(m.kickoff_utc, "BST", locale)} BST</span>
        )}
        <span>#{m.id}</span>
      </div>
    </Link>
  );
}

function Row({
  code,
  name,
  score,
  pens,
  emoji,
  winner,
  loser,
  bnNumerals,
}: {
  code: string | null;
  name: string | null;
  score: number | null;
  pens: number | null;
  emoji: string | null;
  winner: boolean;
  loser: boolean;
  bnNumerals: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 px-2 py-1.5",
        winner && "bg-primary/10",
        loser && "opacity-60",
      )}
    >
      <TeamCrest code={code} emoji={emoji} size={16} />
      <span className={cn("flex-1 truncate", winner && "font-semibold text-primary")}>
        {name ?? code ?? "TBD"}
      </span>
      <span className="font-mono tabular-nums w-5 text-right">
        {score != null ? fmtNumber(score, bnNumerals) : "–"}
      </span>
      {pens != null && (
        <span className="font-mono tabular-nums text-[10px] text-muted-foreground">
          ({fmtNumber(pens, bnNumerals)})
        </span>
      )}
    </div>
  );
}