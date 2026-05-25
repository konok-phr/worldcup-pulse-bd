import * as React from "react";
import { countdownTo } from "@/lib/time";
import { fmtNumber, useI18n } from "@/lib/i18n";

export function CountdownPill({ utc, label }: { utc: string; label?: string }) {
  const { t, banglaNumerals } = useI18n();
  const [mounted, setMounted] = React.useState(false);
  const [, force] = React.useReducer((x) => x + 1, 0);
  React.useEffect(() => {
    setMounted(true);
    const id = setInterval(force, 1000);
    return () => clearInterval(id);
  }, []);
  const c = countdownTo(utc);

  return (
    <div className="inline-flex items-center gap-2 rounded-md border border-primary/30 bg-primary/10 px-3 py-1.5 font-mono text-xs">
      <span className="text-primary uppercase tracking-wider">{label ?? t("countdown_to_kickoff")}</span>
      {!mounted ? (
        <span className="text-foreground tabular-nums opacity-60">--d --:--:--</span>
      ) : c.past ? (
        <span className="text-foreground">{t("live_now")}</span>
      ) : (
        <span className="text-foreground tabular-nums">
          {fmtNumber(c.days, banglaNumerals)}d {fmtNumber(String(c.hours).padStart(2, "0"), banglaNumerals)}:
          {fmtNumber(String(c.minutes).padStart(2, "0"), banglaNumerals)}:
          {fmtNumber(String(c.seconds).padStart(2, "0"), banglaNumerals)}
        </span>
      )}
    </div>
  );
}