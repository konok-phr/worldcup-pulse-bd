import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { getHomeData, getAllTeams } from "@/lib/data.functions";
import { MatchCard, type MatchRow } from "@/components/site/MatchCard";
import { HeroCountdown } from "@/components/site/HeroCountdown";
import { NextMatchWidget } from "@/components/site/NextMatchWidget";
import { useI18n, fmtNumber } from "@/lib/i18n";
import { buildHead } from "@/lib/seo";
import { Calendar, Trophy, MapPin, ArrowRight, Clock } from "lucide-react";
import { formatDateLabel } from "@/lib/time";

const homeQO = queryOptions({ queryKey: ["home"], queryFn: () => getHomeData(), staleTime: 60_000 });
const teamsQO = queryOptions({ queryKey: ["teams-all"], queryFn: () => getAllTeams(), staleTime: 600_000 });

export const Route = createFileRoute("/")({
  head: () => ({
    ...buildHead({
      title: "WC26 Hub — FIFA World Cup 2026 Live Scores & Fixtures (BST)",
      description: "The premier hub for FIFA World Cup 2026 — live scores, fixtures (Bangladesh time), groups, knockout bracket, teams, stadiums, history and records. Bilingual EN/বাংলা.",
      path: "/",
    }),
  }),
  loader: ({ context }) =>
    Promise.all([
      context.queryClient.ensureQueryData(homeQO),
      context.queryClient.ensureQueryData(teamsQO),
    ]),
  component: Home,
});

function Home() {
  const { t, locale, banglaNumerals } = useI18n();
  const { data: home } = useSuspenseQuery(homeQO);
  const { data: teams } = useSuspenseQuery(teamsQO);
  const emojiMap = Object.fromEntries(teams.map((t) => [t.code, t.flag_emoji]));
  const todayLabel = formatDateLabel(new Date().toISOString(), "BST", locale);
  const nextMatch = (home.live[0] ?? home.upcoming[0] ?? null) as MatchRow | null;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 space-y-6">
      {/* Next match strip */}
      {nextMatch && (
        <NextMatchWidget match={nextMatch} emojiMap={emojiMap} />
      )}

      {/* Hero / countdown */}
      <section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-indigo-950 via-slate-950 to-emerald-950 shadow-2xl">
        <div className="pointer-events-none absolute -top-24 -right-24 h-96 w-96 rounded-full bg-blue-600/25 blur-[100px]" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-emerald-500/15 blur-[100px]" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-10 p-6 md:p-12 lg:p-16">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 mb-6">
              <div className="flex -space-x-2">
                <div className="h-5 w-5 rounded-full bg-blue-600 border border-slate-950" />
                <div className="h-5 w-5 rounded-full bg-red-600 border border-slate-950" />
                <div className="h-5 w-5 rounded-full bg-emerald-500 border border-slate-950" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/70">
                {t("tagline")} · USA · Canada · Mexico
              </span>
            </div>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black uppercase tracking-tighter leading-[0.95] text-white">
              {locale === "bn" ? (
                <>
                  ফিফা বিশ্বকাপ ২০২৬ —{" "}
                  <span className="bg-gradient-to-r from-blue-400 via-emerald-400 to-yellow-400 bg-clip-text text-transparent">
                    সব তথ্য এক জায়গায়।
                  </span>
                </>
              ) : (
                <>
                  FIFA WORLD CUP 2026 —{" "}
                  <span className="bg-gradient-to-r from-blue-400 via-emerald-400 to-yellow-400 bg-clip-text text-transparent">
                    EVERY MATCH, EVERY MOMENT.
                  </span>
                </>
              )}
            </h1>

            <p className="mt-6 max-w-lg text-base md:text-lg leading-relaxed text-slate-400">
              {t("about")}
            </p>

            <div className="mt-8 flex items-center gap-4">
              <Link
                to="/live"
                className="group inline-flex items-center gap-2 rounded-2xl bg-emerald-500 px-7 py-3.5 text-sm font-black uppercase tracking-tight text-slate-950 transition-transform hover:scale-[1.03]"
              >
                {t("nav_live")}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" strokeWidth={3} />
              </Link>
              <Link
                to="/fixtures"
                className="text-sm font-bold uppercase tracking-[0.2em] text-white/40 hover:text-white/70 transition-colors"
              >
                {t("nav_fixtures")} →
              </Link>
            </div>
          </div>

        </div>
      </section>

      {/* Prominent countdown banner */}
      {home.opener?.kickoff_utc && (
        <section className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-r from-blue-600/15 via-emerald-500/10 to-amber-500/15 p-6 md:p-10">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,oklch(0.72_0.13_180/0.18),transparent_60%)]" />
          <div className="relative flex flex-col items-center text-center gap-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.25em] text-primary">
              <Clock className="h-3 w-3" /> {t("opener")} · {t("countdown_to_kickoff")}
            </div>
            <HeroCountdown utc={home.opener.kickoff_utc} />
          </div>
        </section>
      )}

      {/* Stats strip */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatTile accent="blue" icon={<Trophy className="h-3.5 w-3.5" />} label={t("teams_count")} value={fmtNumber(48, banglaNumerals)} />
        <StatTile accent="rose" icon={<Calendar className="h-3.5 w-3.5" />} label={t("matches_played")} value={fmtNumber(104, banglaNumerals)} />
        <StatTile accent="amber" icon={<MapPin className="h-3.5 w-3.5" />} label={t("nav_stadiums")} value={fmtNumber(16, banglaNumerals)} />
        <StatTile accent="emerald" icon={<Trophy className="h-3.5 w-3.5" />} label={t("nav_groups")} value={fmtNumber(12, banglaNumerals)} />
      </section>

      {/* Today's matches (BST) */}
      <section>
        <SectionHeader
          title={`${t("today")} · ${todayLabel} · ${t("bst")}`}
          href="/fixtures"
          linkLabel={t("view_all")}
        />
        {home.today.length === 0 ? (
          <div className="rounded-md border border-border/60 bg-card/40 p-6 text-sm text-muted-foreground font-mono">
            {locale === "bn" ? "আজ কোনো ম্যাচ নেই" : "No matches scheduled today"}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {home.today.map((m) => <MatchCard key={m.id} match={m as MatchRow} emojiMap={emojiMap} />)}
          </div>
        )}
      </section>

      {/* Live + upcoming */}
      <section>
        <SectionHeader title={t("live_now")} href="/live" linkLabel={t("nav_live")} />
        {home.live.length === 0 ? (
          <div className="rounded-md border border-border/60 bg-card/40 p-6 text-sm text-muted-foreground font-mono">
            {t("no_live")}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {home.live.map((m) => <MatchCard key={m.id} match={m as MatchRow} emojiMap={emojiMap} />)}
          </div>
        )}
      </section>

      <section>
        <SectionHeader title={t("upcoming")} href="/fixtures" linkLabel={t("view_all")} />
        {home.upcoming.length === 0 ? (
          <div className="rounded-md border border-border/60 bg-card/40 p-6 text-sm text-muted-foreground font-mono">
            —
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {home.upcoming.map((m) => <MatchCard key={m.id} match={m as MatchRow} emojiMap={emojiMap} />)}
          </div>
        )}
      </section>
    </div>
  );
}

function SectionHeader({ title, href, linkLabel }: { title: string; href: string; linkLabel: string }) {
  return (
    <div className="flex items-end justify-between mb-3">
      <h2 className="text-xs uppercase tracking-[0.2em] font-mono text-muted-foreground">
        <span className="text-primary">▸</span> {title}
      </h2>
      <Link to={href} className="text-xs font-mono uppercase tracking-wider text-primary hover:underline">
        {linkLabel} →
      </Link>
    </div>
  );
}

const ACCENTS = {
  blue: { text: "text-blue-400", bg: "bg-blue-500/25", bar: "bg-blue-500" },
  rose: { text: "text-rose-400", bg: "bg-rose-500/25", bar: "bg-rose-500" },
  amber: { text: "text-amber-400", bg: "bg-amber-500/25", bar: "bg-amber-500" },
  emerald: { text: "text-emerald-400", bg: "bg-emerald-500/25", bar: "bg-emerald-500" },
} as const;

function StatTile({
  icon,
  label,
  value,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  accent: keyof typeof ACCENTS;
}) {
  const a = ACCENTS[accent];
  return (
    <div className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] p-5 transition-colors hover:bg-white/[0.06]">
      <div className={`pointer-events-none absolute -top-10 -right-10 h-24 w-24 rounded-full ${a.bg} blur-2xl transition-transform duration-500 group-hover:scale-150`} />
      <div className="relative flex flex-col">
        <div className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.2em] ${a.text}`}>
          {icon} {label}
        </div>
        <div className="mt-2 text-3xl md:text-4xl font-black tabular-nums text-white">{value}</div>
        <div className={`mt-4 h-1 w-8 rounded-full ${a.bar}`} />
      </div>
    </div>
  );
}