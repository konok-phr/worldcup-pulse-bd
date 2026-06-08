import * as React from "react";
import { countdownTo } from "@/lib/time";
import { fmtNumber, useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

/**
 * Compact live-ticking countdown to kickoff.
 * SSR-safe: renders a placeholder until mounted to avoid hydration mismatch.
 */
export function CountdownChip({
  utc,
  className,
  size = "sm",
}: {
  utc: string | null | undefined;
  className?: string;
  size?: "xs" | "sm" | "md";
}) {
  const { banglaNumerals, locale } = useI18n();
  const [mounted, setMounted] = React.useState(false);
  const [, setTick] = React.useState(0);

  React.useEffect(() => {
    setMounted(true);
    const id = setInterval(() => setTick((x) => x + 1), 1000);
    return () => clearInterval(id);
  }, []);

  if (!utc) return null;

  const sizeClass =
    size === "xs" ? "text-[10px] px-1.5 py-0.5" : size === "md" ? "text-sm px-2.5 py-1" : "text-xs px-2 py-0.5";

  if (!mounted) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1 rounded-full font-mono tabular-nums text-muted-foreground border border-border/60",
          sizeClass,
          className,
        )}
      >
        --:--:--
      </span>
    );
  }

  const c = countdownTo(utc);
  if (c.past) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1 rounded-full font-mono tabular-nums border border-primary/40 bg-primary/10 text-primary",
          sizeClass,
          className,
        )}
      >
        <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
        {locale === "bn" ? "শুরু হয়েছে" : "LIVE"}
      </span>
    );
  }

  const fmt = (n: number) => fmtNumber(String(n).padStart(2, "0"), banglaNumerals);
  const label =
    c.days > 0
      ? `${fmtNumber(c.days, banglaNumerals)}${locale === "bn" ? "দ" : "d"} ${fmt(c.hours)}:${fmt(c.minutes)}:${fmt(c.seconds)}`
      : `${fmt(c.hours)}:${fmt(c.minutes)}:${fmt(c.seconds)}`;

  const urgent = c.days === 0 && c.hours < 1;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full font-mono tabular-nums border",
        urgent
          ? "border-amber-400/50 bg-amber-400/10 text-amber-300"
          : "border-primary/30 bg-primary/5 text-primary",
        sizeClass,
        className,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", urgent ? "bg-amber-400 animate-pulse" : "bg-primary/70")} />
      {label}
    </span>
  );
}