import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import * as React from "react";
import {
  getGroups,
  getAllFixtures,
  getAllTeams,
} from "@/lib/data.functions";
import { TeamCrest } from "@/components/site/TeamCrest";
import { useI18n, fmtNumber } from "@/lib/i18n";
import { buildHead } from "@/lib/seo";
import { RotateCcw } from "lucide-react";

const groupsQO = queryOptions({ queryKey: ["groups"], queryFn: () => getGroups(), staleTime: 600_000 });
const fixturesQO = queryOptions({ queryKey: ["fixtures"], queryFn: () => getAllFixtures(), staleTime: 300_000 });
const teamsQO = queryOptions({ queryKey: ["teams-all"], queryFn: () => getAllTeams(), staleTime: 600_000 });

export const Route = createFileRoute("/simulator")({
  head: () => ({
    ...buildHead({
      title: "Group Stage Simulator — FIFA World Cup 2026 | WC26 Hub",
      description:
        "Predict every World Cup 2026 group-stage score and instantly see the updated standings and qualification picture.",
      path: "/simulator",
    }),
  }),
  loader: ({ context }) =>
    Promise.all([
      context.queryClient.ensureQueryData(groupsQO),
      context.queryClient.ensureQueryData(fixturesQO),
      context.queryClient.ensureQueryData(teamsQO),
    ]),
  component: SimulatorPage,
});

type Score = { h: number; a: number };
type Picks = Record<number, Score>; // match.id -> score

function SimulatorPage() {
  const { t, banglaNumerals } = useI18n();
  const { data: groups } = useSuspenseQuery(groupsQO);
  const { data: fixtures } = useSuspenseQuery(fixturesQO);
  const { data: teams } = useSuspenseQuery(teamsQO);
  const teamMap = Object.fromEntries(teams.map((tm) => [tm.code, tm]));

  // Seed picks from actual scores if present
  const initial: Picks = React.useMemo(() => {
    const p: Picks = {};
    for (const f of fixtures) {
      if (!f.group_letter) continue;
      if (f.home_score != null && f.away_score != null) {
        p[f.id] = { h: f.home_score, a: f.away_score };
      }
    }
    return p;
  }, [fixtures]);

  const [picks, setPicks] = React.useState<Picks>(initial);

  const groupFixtures = React.useMemo(() => {
    const by: Record<string, typeof fixtures> = {};
    for (const f of fixtures) {
      if (!f.group_letter) continue;
      (by[f.group_letter] ||= []).push(f);
    }
    return by;
  }, [fixtures]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <header className="mb-5 flex items-end justify-between gap-3">
        <div>
          <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-primary mb-1">
            ▸ {t("simulator")}
          </div>
          <h1 className="text-2xl font-bold">Group Stage Simulator</h1>
          <p className="text-sm text-muted-foreground mt-1 max-w-2xl">{t("simulator_desc")}</p>
        </div>
        <button
          onClick={() => setPicks(initial)}
          className="inline-flex items-center gap-1.5 rounded-md border border-border/60 bg-card px-3 py-1.5 text-xs font-mono uppercase tracking-wider hover:border-primary hover:text-primary"
        >
          <RotateCcw className="h-3 w-3" /> {t("reset")}
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {groups.map((g) => {
          const list = (groupFixtures[g.letter] ?? []).sort(
            (x, y) => (x.kickoff_utc ?? "").localeCompare(y.kickoff_utc ?? ""),
          );
          const standings = computeStandings(list, picks);
          return (
            <section key={g.letter} className="rounded-lg border border-border/60 bg-card overflow-hidden">
              <div className="px-4 py-2.5 border-b border-border/60 flex items-center justify-between bg-card/60">
                <span className="font-mono text-sm font-bold">
                  <span className="text-primary">{t("group")}</span> {g.letter}
                </span>
                <Link
                  to="/groups/$letter"
                  params={{ letter: g.letter }}
                  className="text-[10px] uppercase tracking-wider font-mono text-muted-foreground hover:text-primary"
                >
                  {t("actual")} →
                </Link>
              </div>

              {/* Editable matches */}
              <div className="divide-y divide-border/40">
                {list.map((m) => {
                  const pick = picks[m.id];
                  return (
                    <div key={m.id} className="px-3 py-2 flex items-center gap-2 text-sm">
                      <TeamCrest code={m.home_team_code} emoji={teamMap[m.home_team_code ?? ""]?.flag_emoji ?? null} size={16} />
                      <span className="flex-1 truncate text-xs">{m.home_team_code}</span>
                      <ScoreInput
                        value={pick?.h}
                        onChange={(v) =>
                          setPicks((p) => ({ ...p, [m.id]: { h: v, a: p[m.id]?.a ?? 0 } }))
                        }
                      />
                      <span className="text-muted-foreground font-mono text-xs">:</span>
                      <ScoreInput
                        value={pick?.a}
                        onChange={(v) =>
                          setPicks((p) => ({ ...p, [m.id]: { h: p[m.id]?.h ?? 0, a: v } }))
                        }
                      />
                      <span className="flex-1 truncate text-xs text-right">{m.away_team_code}</span>
                      <TeamCrest code={m.away_team_code} emoji={teamMap[m.away_team_code ?? ""]?.flag_emoji ?? null} size={16} />
                    </div>
                  );
                })}
              </div>

              {/* Live standings */}
              <table className="w-full text-sm border-t-2 border-primary/40">
                <thead className="text-[10px] uppercase tracking-wider font-mono text-muted-foreground bg-card/40">
                  <tr>
                    <th className="text-left px-3 py-1.5 w-6">#</th>
                    <th className="text-left">{t("team")}</th>
                    <th className="text-center px-1 w-7">{t("played")}</th>
                    <th className="text-center px-1 w-7">{t("won")}</th>
                    <th className="text-center px-1 w-7">{t("drawn")}</th>
                    <th className="text-center px-1 w-7">{t("lost")}</th>
                    <th className="text-center px-1 w-8">{t("gd")}</th>
                    <th className="text-center px-1 w-8">{t("pts")}</th>
                  </tr>
                </thead>
                <tbody>
                  {standings.map((r, i) => (
                    <tr
                      key={r.code}
                      className={`border-t border-border/40 ${i < 2 ? "bg-primary/5" : ""}`}
                    >
                      <td className="px-3 py-1.5 font-mono text-muted-foreground">
                        {fmtNumber(i + 1, banglaNumerals)}
                      </td>
                      <td className="py-1.5">
                        <span className="inline-flex items-center gap-2">
                          <TeamCrest code={r.code} emoji={teamMap[r.code]?.flag_emoji ?? null} size={16} />
                          <span className="truncate text-xs">{teamMap[r.code]?.name ?? r.code}</span>
                        </span>
                      </td>
                      <td className="text-center font-mono tabular-nums text-xs">{fmtNumber(r.p, banglaNumerals)}</td>
                      <td className="text-center font-mono tabular-nums text-xs">{fmtNumber(r.w, banglaNumerals)}</td>
                      <td className="text-center font-mono tabular-nums text-xs">{fmtNumber(r.d, banglaNumerals)}</td>
                      <td className="text-center font-mono tabular-nums text-xs">{fmtNumber(r.l, banglaNumerals)}</td>
                      <td className="text-center font-mono tabular-nums text-xs">
                        {r.gd > 0 ? "+" : ""}
                        {fmtNumber(r.gd, banglaNumerals)}
                      </td>
                      <td className="text-center font-mono font-bold tabular-nums">
                        {fmtNumber(r.pts, banglaNumerals)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          );
        })}
      </div>
    </div>
  );
}

function ScoreInput({ value, onChange }: { value: number | undefined; onChange: (v: number) => void }) {
  return (
    <input
      type="number"
      min={0}
      max={20}
      value={value ?? ""}
      placeholder="–"
      onChange={(e) => {
        const n = Math.max(0, Math.min(20, Number(e.target.value) || 0));
        onChange(n);
      }}
      className="w-10 h-7 rounded border border-border/60 bg-background text-center font-mono text-sm tabular-nums focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
    />
  );
}

type Row = { code: string; p: number; w: number; d: number; l: number; gf: number; ga: number; gd: number; pts: number };

function computeStandings(
  matches: Array<{ id: number; home_team_code: string | null; away_team_code: string | null }>,
  picks: Picks,
): Row[] {
  const rows: Record<string, Row> = {};
  const ensure = (c: string) =>
    (rows[c] ||= { code: c, p: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, gd: 0, pts: 0 });

  for (const m of matches) {
    if (!m.home_team_code || !m.away_team_code) continue;
    ensure(m.home_team_code);
    ensure(m.away_team_code);
    const s = picks[m.id];
    if (!s) continue;
    const H = ensure(m.home_team_code);
    const A = ensure(m.away_team_code);
    H.p++; A.p++;
    H.gf += s.h; H.ga += s.a;
    A.gf += s.a; A.ga += s.h;
    if (s.h > s.a) { H.w++; A.l++; H.pts += 3; }
    else if (s.h < s.a) { A.w++; H.l++; A.pts += 3; }
    else { H.d++; A.d++; H.pts++; A.pts++; }
  }
  for (const r of Object.values(rows)) r.gd = r.gf - r.ga;
  return Object.values(rows).sort(
    (a, b) => b.pts - a.pts || b.gd - a.gd || b.gf - a.gf || a.code.localeCompare(b.code),
  );
}