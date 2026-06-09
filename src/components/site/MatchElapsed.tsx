import * as React from "react";
import { useI18n, fmtNumber } from "@/lib/i18n";
import { cn } from "@/lib/utils";

/**
 * Live elapsed-time counter since kickoff for in-play matches.
 * SSR-safe: shows placeholder until mounted.
 */
export function MatchElapsed({
  kickoffUtc,
  className,
}: {
  kickoffUtc: string;
  className?: string;
}) {
  const { locale, banglaNumerals } = useI18n();
  const [mounted, setMounted] = React.useState(false);
  const [, force] = React.useReducer((x) => x + 1, 0);

  React.useEffect(() => {
    setMounted(true);
    const id = setInterval(force, 1000);
    return () => clearInterval(id);
  }, []);

  const ms = mounted ? Math.max(0, Date.now() - new Date(kickoffUtc).getTime()) : 0;
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  const pad = (n: number) => fmtNumber(String(n).padStart(2, "0"), banglaNumerals);
  const display = mounted
    ? h > 0
      ? `${pad(h)}:${pad(m)}:${pad(s)}`
      : `${pad(m)}:${pad(s)}`
    : "--:--";

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 rounded-lg border border-primary/40 bg-primary/10 px-4 py-2",
        className,
      )}
    >
      <span className="relative inline-flex h-2.5 w-2.5">
        <span className="absolute inline-flex h-full w-full rounded-full bg-primary opacity-75 animate-ping" />
        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-primary" />
      </span>
      <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-primary/80">
        {locale === "bn" ? "চলছে" : "Elapsed"}
      </span>
      <span className="font-mono font-bold tabular-nums text-primary text-base">
        {display}
      </span>
    </div>
  );
}