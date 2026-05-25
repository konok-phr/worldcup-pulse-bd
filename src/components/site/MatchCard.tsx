import { Link } from "@tanstack/react-router";
import { TeamCrest } from "./TeamCrest";
import { formatKickoff, formatTimeOnly } from "@/lib/time";
import { fmtNumber, useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export type MatchRow = {
  id: number;
  stage: string;
  group_letter: string | null;
  status: string;
  kickoff_utc: string | null;
  home_team_code: string | null;
  away_team_code: string | null;
  home_team_name: string | null;
  away_team_name: string | null;
  home_score: number | null;
  away_score: number | null;
  minute: number | null;
  stadium_slug: string | null;
};

export function MatchCard({
  match,
  emojiMap,
  compact,
}: {
  match: MatchRow;
  emojiMap?: Record<string, string | null>;
  compact?: boolean;
}) {
  const { t, locale, banglaNumerals } = useI18n();
  const isLive = ["live", "in_play", "half_time"].includes(match.status);
  const isFinished = ["finished", "ft", "full_time"].includes(match.status);

  const home = match.home_team_code ?? "TBD";
  const away = match.away_team_code ?? "TBD";

  return (
    <Link
      to="/match/$id"
      params={{ id: String(match.id) }}
      className={cn(
        "group block rounded-md border border-border/60 bg-card hover:border-primary/60 hover:bg-card/80 transition-colors",
        compact ? "p-2" : "p-3",
      )}
    >
      <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-muted-foreground mb-2 font-mono">
        <span>
          {match.stage}
          {match.group_letter ? ` · ${t("group")} ${match.group_letter}` : ""}
        </span>
        {isLive ? (
          <span className="inline-flex items-center gap-1 text-primary">
            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
            LIVE {match.minute != null ? `${fmtNumber(match.minute, banglaNumerals)}'` : ""}
          </span>
        ) : isFinished ? (
          <span className="text-muted-foreground">FT</span>
        ) : (
          <span>{formatTimeOnly(match.kickoff_utc, "BST", locale)} BST</span>
        )}
      </div>

      <div className="flex items-center gap-2 mb-1">
        <TeamCrest code={home} emoji={emojiMap?.[home] ?? null} size={22} />
        <span className="flex-1 text-sm font-medium truncate">
          {match.home_team_name ?? home}
        </span>
        <span className={cn("font-mono text-base tabular-nums w-6 text-right", isLive && "text-primary")}>
          {match.home_score != null ? fmtNumber(match.home_score, banglaNumerals) : "–"}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <TeamCrest code={away} emoji={emojiMap?.[away] ?? null} size={22} />
        <span className="flex-1 text-sm font-medium truncate">
          {match.away_team_name ?? away}
        </span>
        <span className={cn("font-mono text-base tabular-nums w-6 text-right", isLive && "text-primary")}>
          {match.away_score != null ? fmtNumber(match.away_score, banglaNumerals) : "–"}
        </span>
      </div>

      {!compact && match.kickoff_utc && !isLive && !isFinished && (
        <div className="mt-2 text-[10px] text-muted-foreground font-mono">
          {formatKickoff(match.kickoff_utc, "BST", locale)}
        </div>
      )}
    </Link>
  );
}