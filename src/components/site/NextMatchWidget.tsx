import { Link } from "@tanstack/react-router";
import { ArrowRight, Radio } from "lucide-react";
import { TeamCrest } from "./TeamCrest";
import { CountdownChip } from "./CountdownChip";
import { formatKickoff } from "@/lib/time";
import { fmtNumber, useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import type { MatchRow } from "./MatchCard";

export function NextMatchWidget({
  match,
  emojiMap,
}: {
  match: MatchRow;
  emojiMap?: Record<string, string | null>;
}) {
  const { t, tn, locale, banglaNumerals } = useI18n();
  const isLive = ["live", "in_play", "half_time"].includes(match.status);

  const home = match.home_team_code ?? "TBD";
  const away = match.away_team_code ?? "TBD";
  const homeName = tn("team", match.home_team_name) || home;
  const awayName = tn("team", match.away_team_name) || away;

  return (
    <Link
      to={isLive ? "/live" : "/match/$id"}
      params={{ id: String(match.id) }}
      className={cn(
        "group relative flex items-center gap-4 rounded-2xl border bg-card/60 backdrop-blur px-4 py-3 hover:bg-card transition-colors overflow-hidden",
        isLive ? "border-primary/50" : "border-border/60 hover:border-primary/50",
      )}
    >
      {/* Left label */}
      <div className="hidden sm:flex flex-col items-start gap-1 pr-3 border-r border-border/60 shrink-0">
        <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-[0.2em] text-primary">
          {isLive ? <Radio className="h-3 w-3 animate-pulse" /> : null}
          {isLive ? t("live_now") : locale === "bn" ? "পরবর্তী ম্যাচ" : "Next Match"}
        </span>
        <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
          {tn("stage", match.stage)}
          {match.group_letter ? ` · ${t("group")} ${match.group_letter}` : ""}
        </span>
      </div>

      {/* Teams */}
      <div className="flex-1 min-w-0 flex items-center justify-center gap-3 sm:gap-5">
        <div className="flex items-center gap-2 min-w-0 flex-1 justify-end">
          <span className="truncate text-sm sm:text-base font-bold text-right">{homeName}</span>
          <TeamCrest code={home} emoji={emojiMap?.[home] ?? null} size={28} />
        </div>
        <div className="flex flex-col items-center shrink-0">
          {isLive ? (
            <span className="font-mono text-base sm:text-lg font-black tabular-nums text-primary">
              {fmtNumber(match.home_score ?? 0, banglaNumerals)} - {fmtNumber(match.away_score ?? 0, banglaNumerals)}
            </span>
          ) : (
            <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">{t("vs")}</span>
          )}
        </div>
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <TeamCrest code={away} emoji={emojiMap?.[away] ?? null} size={28} />
          <span className="truncate text-sm sm:text-base font-bold">{awayName}</span>
        </div>
      </div>

      {/* Right: countdown + arrow */}
      <div className="flex flex-col items-end gap-1 shrink-0">
        <CountdownChip utc={match.kickoff_utc} size="sm" />
        <span className="hidden md:inline text-[10px] font-mono text-muted-foreground/80">
          {formatKickoff(match.kickoff_utc, "BST", locale)}
        </span>
      </div>
      <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0" />
    </Link>
  );
}