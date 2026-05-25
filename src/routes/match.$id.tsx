import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { getMatchById, getAllTeams } from "@/lib/data.functions";
import { TeamCrest } from "@/components/site/TeamCrest";
import { formatKickoff } from "@/lib/time";
import { useI18n, fmtNumber } from "@/lib/i18n";
import { buildHead } from "@/lib/seo";
import { ArrowLeft } from "lucide-react";

const matchQO = (id: number) => queryOptions({ queryKey: ["match", id], queryFn: () => getMatchById({ data: { id } }), staleTime: 15_000 });
const teamsQO = queryOptions({ queryKey: ["teams-all"], queryFn: () => getAllTeams(), staleTime: 600_000 });

export const Route = createFileRoute("/match/$id")({
  loader: async ({ params, context }) => {
    const id = Number(params.id);
    if (!Number.isFinite(id)) throw notFound();
    await Promise.all([context.queryClient.ensureQueryData(matchQO(id)), context.queryClient.ensureQueryData(teamsQO)]);
    return { id };
  },
  head: ({ loaderData }) => ({ ...buildHead({ title: `Match #${loaderData?.id ?? ""} — FIFA World Cup 2026 | WC26 Hub`, description: "Live score, timeline and stats for this FIFA World Cup 2026 match.", path: `/match/${loaderData?.id ?? ""}`, type: "article" }) }),
  component: MatchPage,
});

function MatchPage() {
  const { t, locale, banglaNumerals } = useI18n();
  const { id } = Route.useLoaderData();
  const { data } = useSuspenseQuery(matchQO(id));
  const { data: teams } = useSuspenseQuery(teamsQO);
  const emojiMap = Object.fromEntries(teams.map((tm) => [tm.code, tm.flag_emoji]));
  const m = data.match;
  if (!m) return <div className="mx-auto max-w-3xl px-4 py-16 text-center text-muted-foreground">Match not found.</div>;
  const isLive = ["live", "in_play", "half_time"].includes(m.status);
  const isFinished = ["finished", "ft", "full_time"].includes(m.status);
  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <Link to="/fixtures" className="inline-flex items-center gap-1 text-xs font-mono uppercase tracking-wider text-muted-foreground hover:text-primary mb-4"><ArrowLeft className="h-3 w-3" /> {t("nav_fixtures")}</Link>
      <div className="rounded-lg border border-border/60 bg-card p-6">
        <div className="text-[10px] uppercase tracking-[0.2em] font-mono text-muted-foreground mb-3 flex items-center justify-between">
          <span>{m.stage}{m.group_letter ? ` · ${t("group")} ${m.group_letter}` : ""}</span>
          {isLive ? <span className="text-primary inline-flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" /> LIVE {m.minute != null ? `${fmtNumber(m.minute, banglaNumerals)}'` : ""}</span> : isFinished ? "FT" : t("scheduled")}
        </div>
        <div className="grid grid-cols-3 items-center gap-4 my-6">
          <div className="text-center"><TeamCrest code={m.home_team_code} emoji={emojiMap[m.home_team_code ?? ""] ?? null} size={56} className="mx-auto" /><div className="mt-2 font-semibold">{m.home_team_name ?? m.home_team_code ?? "TBD"}</div></div>
          <div className="text-center font-mono">
            <div className="text-5xl font-bold tabular-nums">{m.home_score != null ? fmtNumber(m.home_score, banglaNumerals) : "–"}<span className="text-muted-foreground mx-2">:</span>{m.away_score != null ? fmtNumber(m.away_score, banglaNumerals) : "–"}</div>
            {m.kickoff_utc && <div className="mt-2 text-xs text-muted-foreground">{formatKickoff(m.kickoff_utc, "BST", locale)}</div>}
          </div>
          <div className="text-center"><TeamCrest code={m.away_team_code} emoji={emojiMap[m.away_team_code ?? ""] ?? null} size={56} className="mx-auto" /><div className="mt-2 font-semibold">{m.away_team_name ?? m.away_team_code ?? "TBD"}</div></div>
        </div>
        {m.stadium_slug && <div className="text-center text-xs text-muted-foreground font-mono"><Link to="/stadiums/$slug" params={{ slug: m.stadium_slug }} className="hover:text-primary">◊ {m.stadium_slug.replace(/-/g, " ")}</Link></div>}
      </div>
      <div className="mt-6">
        <h2 className="text-xs uppercase tracking-[0.2em] font-mono text-muted-foreground mb-3"><span className="text-primary">▸</span> Timeline</h2>
        {data.events.length === 0 ? (
          <div className="rounded-md border border-border/60 bg-card/40 p-6 text-sm text-muted-foreground font-mono">No events yet.</div>
        ) : (
          <ul className="space-y-1.5">{data.events.map((e) => (
            <li key={e.id} className="flex items-center gap-3 text-sm border border-border/40 rounded px-3 py-2 bg-card/40">
              <span className="font-mono text-primary w-10">{fmtNumber(e.minute, banglaNumerals)}'</span>
              <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground w-16">{e.event_type}</span>
              <span className="flex-1">{e.player_name}</span>
              <span className="font-mono text-xs text-muted-foreground">{e.team_code}</span>
            </li>
          ))}</ul>
        )}
      </div>
    </div>
  );
}