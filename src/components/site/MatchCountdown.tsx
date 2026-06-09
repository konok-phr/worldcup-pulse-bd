import * as React from "react";
import { countdownTo } from "@/lib/time";
import { fmtNumber, useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

/**
 * Large, polished kickoff countdown for match detail pages.
 * SSR-safe (renders placeholder until mounted).
 */
export function MatchCountdown({ utc, className }: { utc: string; className?: string }) {
  const { t, locale, banglaNumerals } = useI18n();
  const [mounted, setMounted] = React.useState(false);
  const [, force] = React.useReducer((x) => x + 1, 0);

  React.useEffect(() => {
    setMounted(true);
    const id = setInterval(force, 1000);
    return () => clearInterval(id);
  }, []);

  const c = countdownTo(utc);

  if (mounted && c.past) {
    return (
      <div
        className={cn(
          "inline-flex items-center gap-2 rounded-lg border border-primary/40 bg-primary/10 px-4 py-2 font-mono text-sm font-bold text-primary",
          className,
        )}
      >
        <span className="relative inline-flex h-2.5 w-2.5">
          <span className="absolute inline-flex h-full w-full rounded-full bg-primary opacity-75 animate-ping" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-primary" />
        </span>
        {t("live_now")}
      </div>
    );
  }

  const urgent = mounted && c.days === 0 && c.hours < 1;
  const items: Array<{ key: string; value: number; label: string }> = [
    { key: "d", value: c.days, label: locale === "bn" ? "দিন" : "Days" },
    { key: "h", value: c.hours, label: locale === "bn" ? "ঘন্টা" : "Hours" },
    { key: "m", value: c.minutes, label: locale === "bn" ? "মিনিট" : "Min" },
    { key: "s", value: c.seconds, label: locale === "bn" ? "সেকেন্ড" : "Sec" },
  ];

  return (
    <div className={cn("w-full max-w-md", className)}>
      <div
        className={cn(
          "text-center text-[10px] font-mono uppercase tracking-[0.2em] mb-2",
          urgent ? "text-amber-500 dark:text-amber-300" : "text-muted-foreground",
        )}
      >
        <span className={cn("inline-block mr-1.5", urgent ? "" : "text-primary")}>▸</span>
        {t("countdown_to_kickoff")}
      </div>
      <div className="grid grid-cols-4 gap-2">
        {items.map((it) => (
          <div
            key={it.key}
            className={cn(
              "rounded-lg border bg-card/80 backdrop-blur px-2 py-3 flex flex-col items-center",
              urgent ? "border-amber-400/50" : "border-primary/25",
            )}
          >
            <span
              className={cn(
                "font-black tabular-nums leading-none tracking-tight",
                banglaNumerals ? "text-2xl" : "text-3xl",
                urgent ? "text-amber-500 dark:text-amber-300" : "text-foreground",
              )}
            >
              {mounted ? fmtNumber(String(it.value).padStart(2, "0"), banglaNumerals) : "--"}
            </span>
            <span className="mt-1.5 text-[9px] font-mono uppercase tracking-wider text-muted-foreground">
              {it.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}