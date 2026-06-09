import * as React from "react";
import { Link } from "@tanstack/react-router";
import { Clock, ArrowRight } from "lucide-react";
import { HeroCountdown } from "./HeroCountdown";
import { MatchCountdown } from "./MatchCountdown";
import { TeamCrest } from "./TeamCrest";
import { useI18n } from "@/lib/i18n";
import { formatKickoff } from "@/lib/time";
import type { MatchRow } from "./MatchCard";

/**
 * Landing-page kickoff banner.
 * Before the tournament opener kicks off: shows opener countdown.
 * After the opener has started: swaps to the next upcoming match countdown
 * (with teams + deep link). Falls back to opener if no upcoming match exists.
 */
export function LandingKickoffSection({
  openerUtc,
  nextUpcoming,
  emojiMap,
}: {
  openerUtc: string;
  nextUpcoming: MatchRow | null;
  emojiMap: Record<string, string | null>;
}) {
  const { t, tn, locale } = useI18n();
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => {
    setMounted(true);
  }, []);

  const openerPast = mounted && new Date(openerUtc).getTime() <= Date.now();
  const showUpcoming = openerPast && nextUpcoming?.kickoff_utc;

  return (
    <section className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-r from-blue-600/15 via-emerald-500/10 to-amber-500/15 p-6 md:p-10">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,oklch(0.72_0.13_180/0.18),transparent_60%)]" />
      <div className="relative flex flex-col items-center text-center gap-4">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.25em] text-primary">
          <Clock className="h-3 w-3" />
          {showUpcoming
            ? (locale === "bn" ? "পরবর্তী ম্যাচ" : "Next Match") + " · " + t("countdown_to_kickoff")
            : t("opener") + " · " + t("countdown_to_kickoff")}
        </div>

        {showUpcoming ? (
          <UpcomingMatchBlock match={nextUpcoming!} emojiMap={emojiMap} />
        ) : (
          <HeroCountdown utc={openerUtc} />
        )}
      </div>
    </section>
  );

  function UpcomingMatchBlock({
    match,
    emojiMap,
  }: {
    match: MatchRow;
    emojiMap: Record<string, string | null>;
  }) {
    const home = match.home_team_code ?? "TBD";
    const away = match.away_team_code ?? "TBD";
    const homeName = tn("team", match.home_team_name) || home;
    const awayName = tn("team", match.away_team_name) || away;
    return (
      <div className="flex flex-col items-center gap-4 w-full">
        <Link
          to="/match/$id"
          params={{ id: String(match.id) }}
          className="group flex items-center gap-3 sm:gap-5 rounded-xl border border-border/60 bg-card/60 backdrop-blur px-4 py-2 hover:border-primary/50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <TeamCrest code={home} emoji={emojiMap[home] ?? null} size={28} />
            <span className="font-bold text-sm sm:text-base">{homeName}</span>
          </div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
            {t("vs")}
          </span>
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm sm:text-base">{awayName}</span>
            <TeamCrest code={away} emoji={emojiMap[away] ?? null} size={28} />
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
        </Link>
        <MatchCountdown utc={match.kickoff_utc!} />
        <p className="text-[10px] md:text-xs uppercase tracking-[0.2em] font-mono text-muted-foreground">
          {formatKickoff(match.kickoff_utc, "BST", locale)}
          {match.stage ? ` · ${tn("stage", match.stage)}` : ""}
          {match.group_letter ? ` · ${t("group")} ${match.group_letter}` : ""}
        </p>
      </div>
    );
  }
}