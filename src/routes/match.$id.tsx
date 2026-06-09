import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { getMatchById, getAllTeams, getHeadToHead } from "@/lib/data.functions";
import { TeamCrest } from "@/components/site/TeamCrest";
import { MatchCountdown } from "@/components/site/MatchCountdown";
import { MatchElapsed } from "@/components/site/MatchElapsed";
import { formatKickoff } from "@/lib/time";
import { useI18n, fmtNumber } from "@/lib/i18n";
import { buildHead } from "@/lib/seo";
import { ArrowLeft, Goal, Square, ArrowLeftRight, Flag, Users, Info } from "lucide-react";
import * as React from "react";

const matchQO = (id: number) =>
  queryOptions({
    queryKey: ["match", id],
    queryFn: () => getMatchById({ data: { id } }),
    staleTime: 15_000,
  });
const teamsQO = queryOptions({
  queryKey: ["teams-all"],
  queryFn: () => getAllTeams(),
  staleTime: 600_000,
});

export const Route = createFileRoute("/match/$id")({
  loader: async ({ params, context }) => {
    const id = Number(params.id);
    if (!Number.isFinite(id)) throw notFound();
    await Promise.all([
      context.queryClient.ensureQueryData(matchQO(id)),
      context.queryClient.ensureQueryData(teamsQO),
    ]);
    return { id };
  },
  head: ({ loaderData }) => ({
    ...buildHead({
      title: `Match #${loaderData?.id ?? ""} — FIFA World Cup 2026 | WC26 Hub`,
      description:
        "Live score, minute-by-minute timeline, head-to-head and stats for this FIFA World Cup 2026 match.",
      path: `/match/${loaderData?.id ?? ""}`,
      type: "article",
    }),
  }),
  component: MatchPage,
});

function eventIcon(type: string) {
  const t = type.toLowerCase();
  if (t.includes("goal") || t === "penalty")
    return <Goal className="h-3.5 w-3.5 text-primary" />;
  if (t.includes("yellow"))
    return <Square className="h-3.5 w-3.5 text-yellow-400 fill-yellow-400" />;
  if (t.includes("red"))
    return <Square className="h-3.5 w-3.5 text-red-500 fill-red-500" />;
  if (t.includes("sub"))
    return <ArrowLeftRight className="h-3.5 w-3.5 text-muted-foreground" />;
  return <Flag className="h-3.5 w-3.5 text-muted-foreground" />;
}

function MatchPage() {
  const { t, locale, banglaNumerals } = useI18n();
  const { id } = Route.useLoaderData();
  const { data } = useSuspenseQuery(matchQO(id));
  const { data: teams } = useSuspenseQuery(teamsQO);
  const emojiMap = Object.fromEntries(teams.map((tm) => [tm.code, tm.flag_emoji]));
  const m = data.match;
  if (!m)
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center text-muted-foreground">
        Match not found.
      </div>
    );

  const isLive = ["live", "in_play", "half_time"].includes(m.status);
  const isFinished = ["finished", "ft", "full_time"].includes(m.status);
  const isScheduled = !isLive && !isFinished;
  const homeCode = m.home_team_code ?? "";
  const awayCode = m.away_team_code ?? "";

  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <Link
        to="/fixtures"
        className="inline-flex items-center gap-1 text-xs font-mono uppercase tracking-wider text-muted-foreground hover:text-primary mb-4"
      >
        <ArrowLeft className="h-3 w-3" /> {t("nav_fixtures")}
      </Link>

      {/* Scoreboard */}
      <div className="rounded-lg border border-border/60 bg-card p-6">
        <div className="text-[10px] uppercase tracking-[0.2em] font-mono text-muted-foreground mb-3 flex items-center justify-between">
          <span>
            {m.stage}
            {m.group_letter ? ` · ${t("group")} ${m.group_letter}` : ""}
          </span>
          {isLive ? (
            <span className="text-primary inline-flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
              LIVE {m.minute != null ? `${fmtNumber(m.minute, banglaNumerals)}'` : ""}
            </span>
          ) : isFinished ? (
            "FT"
          ) : (
            t("scheduled")
          )}
        </div>

        <div className="grid grid-cols-3 items-center gap-4 my-6">
          <div className="text-center">
            <TeamCrest code={homeCode} emoji={emojiMap[homeCode] ?? null} size={56} className="mx-auto" />
            <div className="mt-2 font-semibold">{m.home_team_name ?? homeCode ?? "TBD"}</div>
          </div>
          <div className="text-center font-mono">
            {isScheduled ? (
              <div className="text-3xl font-bold text-muted-foreground">vs</div>
            ) : (
              <div className="text-5xl font-bold tabular-nums">
                {m.home_score != null ? fmtNumber(m.home_score, banglaNumerals) : "–"}
                <span className="text-muted-foreground mx-2">:</span>
                {m.away_score != null ? fmtNumber(m.away_score, banglaNumerals) : "–"}
              </div>
            )}
            {m.home_pens != null && m.away_pens != null && (
              <div className="mt-1 text-xs text-muted-foreground">
                pens {fmtNumber(m.home_pens, banglaNumerals)} – {fmtNumber(m.away_pens, banglaNumerals)}
              </div>
            )}
            {m.kickoff_utc && (
              <div className="mt-2 text-xs text-muted-foreground">
                {formatKickoff(m.kickoff_utc, "BST", locale)}
              </div>
            )}
          </div>
          <div className="text-center">
            <TeamCrest code={awayCode} emoji={emojiMap[awayCode] ?? null} size={56} className="mx-auto" />
            <div className="mt-2 font-semibold">{m.away_team_name ?? awayCode ?? "TBD"}</div>
          </div>
        </div>

        {isScheduled && m.kickoff_utc && (
          <div className="flex justify-center mb-3">
            <MatchCountdown utc={m.kickoff_utc} />
          </div>
        )}

        {isLive && m.kickoff_utc && (
          <div className="flex justify-center mb-3">
            <MatchElapsed kickoffUtc={m.kickoff_utc} />
          </div>
        )}

        {m.stadium_slug && (
          <div className="text-center text-xs text-muted-foreground font-mono">
            <Link to="/stadiums/$slug" params={{ slug: m.stadium_slug }} className="hover:text-primary">
              ◊ {m.stadium_slug.replace(/-/g, " ")}
            </Link>
          </div>
        )}
      </div>

      {/* Timeline */}
      <section className="mt-6">
        <h2 className="text-xs uppercase tracking-[0.2em] font-mono text-muted-foreground mb-3">
          <span className="text-primary">▸</span> {t("timeline")}
        </h2>
        {data.events.length === 0 ? (
          <div className="rounded-md border border-border/60 bg-card/40 p-6 text-sm text-muted-foreground font-mono">
            {t("no_events")}
          </div>
        ) : (
          <ul className="space-y-1.5">
            {data.events.map((e) => {
              const isHome = e.team_code === homeCode;
              return (
                <li
                  key={e.id}
                  className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 text-sm border border-border/40 rounded px-3 py-2 bg-card/40"
                >
                  <div className={`flex items-center gap-2 ${isHome ? "" : "opacity-30"} justify-end`}>
                    {isHome && (
                      <>
                        <span>{e.player_name}</span>
                        {eventIcon(e.event_type)}
                      </>
                    )}
                  </div>
                  <span className="font-mono text-primary text-xs tabular-nums">
                    {fmtNumber(e.minute, banglaNumerals)}'
                  </span>
                  <div className={`flex items-center gap-2 ${!isHome ? "" : "opacity-30"}`}>
                    {!isHome && (
                      <>
                        {eventIcon(e.event_type)}
                        <span>{e.player_name}</span>
                      </>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* Lineups (placeholder) */}
      <section className="mt-6">
        <h2 className="text-xs uppercase tracking-[0.2em] font-mono text-muted-foreground mb-3">
          <span className="text-primary">◆</span> {t("lineups")}
        </h2>
        <div className="rounded-md border border-border/60 bg-card/40 p-6 text-sm text-muted-foreground font-mono flex items-center gap-2">
          <Users className="h-4 w-4" /> {t("lineups_tba")}
        </div>
      </section>

      {/* Match info */}
      {(m.referee || m.attendance) && (
        <section className="mt-6">
          <h2 className="text-xs uppercase tracking-[0.2em] font-mono text-muted-foreground mb-3">
            <span className="text-primary">◆</span> {t("match_info")}
          </h2>
          <div className="grid grid-cols-2 gap-3 text-sm">
            {m.referee && (
              <div className="rounded-md border border-border/40 bg-card/40 p-3 flex items-center gap-2">
                <Info className="h-4 w-4 text-primary" />
                <span className="text-muted-foreground">{t("referee")}:</span>
                <span className="font-medium">{m.referee}</span>
              </div>
            )}
            {m.attendance != null && (
              <div className="rounded-md border border-border/40 bg-card/40 p-3 flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                <span className="text-muted-foreground">{t("attendance")}:</span>
                <span className="font-medium tabular-nums">
                  {fmtNumber(m.attendance, banglaNumerals)}
                </span>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Head-to-head */}
      {homeCode && awayCode && <HeadToHead home={homeCode} away={awayCode} />}
    </div>
  );
}

const h2hQO = (home: string, away: string) =>
  queryOptions({
    queryKey: ["h2h", home, away],
    queryFn: () => getHeadToHead({ data: { home, away } }),
    staleTime: 600_000,
  });

function HeadToHead({ home, away }: { home: string; away: string }) {
  const { t, locale, banglaNumerals } = useI18n();
  const { data: rows = [] } = useSuspenseQuery(h2hQO(home, away));

  const stats = React.useMemo(() => {
    let hw = 0,
      aw = 0,
      d = 0;
    for (const r of rows) {
      if (r.home_score == null || r.away_score == null) continue;
      const homeIsA = r.home_team_code === home;
      const aGoals = homeIsA ? r.home_score : r.away_score;
      const bGoals = homeIsA ? r.away_score : r.home_score;
      if (aGoals > bGoals) hw++;
      else if (aGoals < bGoals) aw++;
      else d++;
    }
    return { hw, aw, d };
  }, [rows, home]);

  return (
    <section className="mt-6">
      <h2 className="text-xs uppercase tracking-[0.2em] font-mono text-muted-foreground mb-3">
        <span className="text-primary">◆</span> {t("head_to_head")}
      </h2>
      {rows.length === 0 ? (
        <div className="rounded-md border border-border/60 bg-card/40 p-6 text-sm text-muted-foreground font-mono">
          {t("no_h2h")}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-2 mb-3 text-center font-mono">
            <div className="rounded-md border border-border/40 bg-card/40 p-3">
              <div className="text-2xl font-bold tabular-nums text-primary">{fmtNumber(stats.hw, banglaNumerals)}</div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground mt-1">{home} wins</div>
            </div>
            <div className="rounded-md border border-border/40 bg-card/40 p-3">
              <div className="text-2xl font-bold tabular-nums">{fmtNumber(stats.d, banglaNumerals)}</div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground mt-1">Draws</div>
            </div>
            <div className="rounded-md border border-border/40 bg-card/40 p-3">
              <div className="text-2xl font-bold tabular-nums text-primary">{fmtNumber(stats.aw, banglaNumerals)}</div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground mt-1">{away} wins</div>
            </div>
          </div>
          <ul className="space-y-1.5">
            {rows.map((r) => (
              <li
                key={r.id}
                className="flex items-center gap-3 text-sm border border-border/40 rounded px-3 py-2 bg-card/40"
              >
                <span className="font-mono text-[10px] text-muted-foreground w-24 uppercase tracking-wider">
                  WC {fmtNumber(r.tournament_year, banglaNumerals)}
                </span>
                <span className="flex-1 text-right truncate">{r.home_team_name ?? r.home_team_code}</span>
                <span className="font-mono font-bold tabular-nums px-2">
                  {fmtNumber(r.home_score ?? 0, banglaNumerals)}–{fmtNumber(r.away_score ?? 0, banglaNumerals)}
                </span>
                <span className="flex-1 truncate">{r.away_team_name ?? r.away_team_code}</span>
                <span className="font-mono text-[10px] text-muted-foreground w-16 text-right hidden sm:block">
                  {formatKickoff(r.kickoff_utc, "BST", locale).split(" ")[0]}
                </span>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}