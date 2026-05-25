import * as React from "react";
import { countdownTo } from "@/lib/time";
import { fmtNumber, useI18n } from "@/lib/i18n";

export function HeroCountdown({ utc }: { utc: string }) {
  const { t, banglaNumerals, locale } = useI18n();
  const [mounted, setMounted] = React.useState(false);
  const [tick, setTick] = React.useState(1);

  React.useEffect(() => {
    setMounted(true);
    const id = setInterval(() => setTick((x) => x + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const c = countdownTo(utc);

  if (!mounted) {
    return (
      <div className="grid grid-cols-4 gap-2 md:gap-4 max-w-xl">
        <TimeCard value="--" label={t("days")} />
        <TimeCard value="--" label={t("hours")} />
        <TimeCard value="--" label={t("minutes")} />
        <TimeCard value="--" label={t("seconds")} />
      </div>
    );
  }

  if (c.past) {
    return (
      <div className="inline-flex items-center gap-3 rounded-xl border border-primary/40 bg-primary/15 px-6 py-3 text-lg font-bold text-primary animate-pulse">
        <span className="inline-block h-3 w-3 rounded-full bg-red-500 animate-ping" />
        {t("live_now")}
      </div>
    );
  }

  const pad2 = (n: number) => String(n).padStart(2, "0");

  return (
    <div className="w-full max-w-3xl">
      <div className="grid grid-cols-4 gap-2 md:gap-4">
        <AnimatedCard value={c.days} max={99} label={t("days")} banglaNumerals={banglaNumerals} tick={tick} />
        <Separator />
        <AnimatedCard value={c.hours} max={23} label={t("hours")} banglaNumerals={banglaNumerals} tick={tick} />
        <Separator />
        <AnimatedCard value={c.minutes} max={59} label={t("minutes")} banglaNumerals={banglaNumerals} tick={tick} />
        <Separator />
        <AnimatedCard value={c.seconds} max={59} label={t("seconds")} banglaNumerals={banglaNumerals} tick={tick} />
      </div>
      <p className="mt-3 text-[10px] md:text-xs uppercase tracking-[0.2em] font-mono text-muted-foreground/80">
        {locale === "bn" ? "বিশ্বকাপ ২০২৬ শুরু হতে আর" : "FIFA World Cup 2026 kickoff in"} · {t("bst")}
      </p>
    </div>
  );
}

function Separator() {
  return (
    <div className="hidden md:flex flex-col items-center justify-center gap-1 py-4">
      <span className="h-2 w-2 rounded-full bg-primary/60 animate-pulse" />
      <span className="h-2 w-2 rounded-full bg-primary/40 animate-pulse delay-150" />
    </div>
  );
}

function TimeCard({ value, label }: { value: string | number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="relative w-full aspect-square max-w-[140px] rounded-xl border border-border/60 bg-card/80 backdrop-blur flex items-center justify-center overflow-hidden">
        <span className="text-3xl md:text-5xl font-black tabular-nums text-foreground tracking-tight">
          {value}
        </span>
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
      </div>
      <span className="mt-2 text-[10px] md:text-xs uppercase tracking-wider font-mono text-muted-foreground">
        {label}
      </span>
    </div>
  );
}

function AnimatedCard({
  value,
  label,
  banglaNumerals,
  tick,
}: {
  value: number;
  max: number;
  label: string;
  banglaNumerals: boolean;
  tick: number;
}) {
  const display = fmtNumber(String(value).padStart(2, "0"), banglaNumerals);
  const [prev, setPrev] = React.useState(display);
  const [flipping, setFlipping] = React.useState(false);

  React.useEffect(() => {
    if (prev !== display) {
      setFlipping(true);
      const id = setTimeout(() => {
        setPrev(display);
        setFlipping(false);
      }, 300);
      return () => clearTimeout(id);
    }
  }, [display, prev]);

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-full aspect-square max-w-[140px] rounded-xl border border-primary/20 bg-gradient-to-b from-primary/5 to-card overflow-hidden shadow-[0_0_30px_-10px_rgba(var(--primary-rgb),0.15)]">
        {/* Top half */}
        <div className="absolute inset-1/2 bottom-0 top-1/2 flex items-center justify-center overflow-hidden">
          <span
            className={`text-4xl md:text-6xl font-black tabular-nums text-foreground tracking-tight transition-transform duration-300 ${flipping ? "scale-y-0" : "scale-y-100"}`}
            style={{ transformOrigin: "center bottom" }}
          >
            {display}
          </span>
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <span
            className={`text-4xl md:text-6xl font-black tabular-nums text-foreground tracking-tight transition-transform duration-300 ${flipping ? "scale-y-100" : "scale-y-0"}`}
            style={{ transformOrigin: "center top" }}
          >
            {prev}
          </span>
        </div>

        {/* Decorative lines */}
        <div className="absolute inset-x-0 top-1/2 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

        {/* Glow */}
        <div className="absolute inset-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 rounded-full bg-primary/[0.04] blur-xl" />
      </div>
      <span className="mt-2.5 text-[10px] md:text-xs uppercase tracking-wider font-mono text-muted-foreground">
        {label}
      </span>
    </div>
  );
}
