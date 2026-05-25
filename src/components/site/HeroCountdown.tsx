import * as React from "react";
import { countdownTo } from "@/lib/time";
import { fmtNumber, useI18n } from "@/lib/i18n";

export function HeroCountdown({ utc }: { utc: string }) {
  const { t, banglaNumerals, locale } = useI18n();
  const [mounted, setMounted] = React.useState(false);
  const [tick, setTick] = React.useState(0);

  React.useEffect(() => {
    setMounted(true);
    const id = setInterval(() => setTick((x) => x + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const c = countdownTo(utc);

  if (!mounted) {
    return (
      <div className="grid grid-cols-4 gap-2 md:gap-4 max-w-xl">
        <TimeCard value={0} label={t("days")} banglaNumerals={banglaNumerals} loading />
        <TimeCard value={0} label={t("hours")} banglaNumerals={banglaNumerals} loading />
        <TimeCard value={0} label={t("minutes")} banglaNumerals={banglaNumerals} loading />
        <TimeCard value={0} label={t("seconds")} banglaNumerals={banglaNumerals} loading />
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

  return (
    <div className="w-full max-w-3xl">
      <div className="grid grid-cols-4 gap-2 md:gap-4">
        <TimeCard value={c.days} label={t("days")} banglaNumerals={banglaNumerals} tick={tick} />
        <Separator />
        <TimeCard value={c.hours} label={t("hours")} banglaNumerals={banglaNumerals} tick={tick} />
        <Separator />
        <TimeCard value={c.minutes} label={t("minutes")} banglaNumerals={banglaNumerals} tick={tick} />
        <Separator />
        <TimeCard value={c.seconds} label={t("seconds")} banglaNumerals={banglaNumerals} tick={tick} />
      </div>
      <p className="mt-3 text-[10px] md:text-xs uppercase tracking-[0.2em] font-mono text-muted-foreground/80">
        {locale === "bn" ? "বিশ্বকাপ ২০২৬ শুরু হতে আর" : "FIFA World Cup 2026 kickoff in"} · {t("bst")}
      </p>
    </div>
  );
}

function Separator() {
  return (
    <div className="hidden md:flex flex-col items-center justify-center gap-1.5 py-4">
      <span className="h-1.5 w-1.5 rounded-full bg-primary/80 animate-pulse" />
      <span className="h-1.5 w-1.5 rounded-full bg-primary/50 animate-pulse" style={{ animationDelay: "150ms" }} />
    </div>
  );
}

function TimeCard({
  value,
  label,
  banglaNumerals,
  tick,
}: {
  value: number;
  label: string;
  banglaNumerals: boolean;
  tick: number;
}) {
  const display = fmtNumber(String(value).padStart(2, "0"), banglaNumerals);
  const [pop, setPop] = React.useState(false);

  React.useEffect(() => {
    setPop(true);
    const id = setTimeout(() => setPop(false), 400);
    return () => clearTimeout(id);
  }, [tick]);

  return (
    <div className="flex flex-col items-center">
      <div
        className={`
          relative w-full max-w-[120px] md:max-w-[140px] aspect-[4/5] rounded-xl
          border border-primary/20 bg-card/80 backdrop-blur
          flex flex-col items-center justify-center overflow-hidden
          shadow-[0_0_30px_-12px_rgba(255,255,255,0.05)]
          transition-transform duration-300
          ${pop ? "scale-105 border-primary/40 shadow-[0_0_40px_-10px_rgba(255,255,255,0.1)]" : "scale-100"}
        `}
      >
        {/* Top decorative line */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
        {/* Bottom decorative line */}
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
        {/* Middle line */}
        <div className="absolute inset-x-0 top-1/2 h-px bg-gradient-to-r from-transparent via-primary/10 to-transparent" />

        {/* Glow behind number */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-primary/[0.06] blur-2xl" />
        </div>

        <span className="relative text-4xl md:text-6xl font-black tabular-nums text-foreground tracking-tight leading-none">
          {display}
        </span>
      </div>
      <span className="mt-2.5 text-[10px] md:text-xs uppercase tracking-wider font-mono text-muted-foreground">
        {label}
      </span>
    </div>
  );
}
