import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { getHomeData, getAllTeams } from "@/lib/data.functions";
import { MatchCard, type MatchRow } from "@/components/site/MatchCard";
import { HeroCountdown } from "@/components/site/HeroCountdown";
import { useI18n, fmtNumber } from "@/lib/i18n";
import { buildHead } from "@/lib/seo";
import { Calendar, Trophy, MapPin } from "lucide-react";

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

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 space-y-8">
      {/* Hero / countdown */}
      <section className="rounded-lg border border-primary/30 bg-gradient-to-br from-primary/10 via-card to-card p-6 md:p-8 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(circle_at_30%_20%,white,transparent_60%)]" />
        <div className="relative">
          <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-primary mb-3">
            ★ {t("tagline")} · USA · Canada · Mexico
          </div>
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight max-w-3xl">
            {locale === "bn"
              ? "ফিফা বিশ্বকাপ ২০২৬ — সব তথ্য এক জায়গায়।"
              : "FIFA World Cup 2026 — every match, every moment."}
          </h1>
          <p className="mt-3 text-muted-foreground max-w-2xl">
            {t("about")}
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            {home.opener?.kickoff_utc && (
              <CountdownPill utc={home.opener.kickoff_utc} label={t("opener")} />
            )}
            <Link to="/fixtures" className="inline-flex items-center gap-1.5 text-sm font-mono uppercase tracking-wider text-primary hover:underline">
              {t("nav_fixtures")} <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <Link to="/groups" className="inline-flex items-center gap-1.5 text-sm font-mono uppercase tracking-wider text-primary hover:underline">
              {t("nav_groups")} <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Stats strip */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatTile icon={<Trophy className="h-3.5 w-3.5" />} label={t("teams_count")} value={fmtNumber(48, banglaNumerals)} />
        <StatTile icon={<Calendar className="h-3.5 w-3.5" />} label={t("matches_played")} value={fmtNumber(104, banglaNumerals)} />
        <StatTile icon={<MapPin className="h-3.5 w-3.5" />} label={t("nav_stadiums")} value={fmtNumber(16, banglaNumerals)} />
        <StatTile icon={<Trophy className="h-3.5 w-3.5" />} label={t("nav_groups")} value={fmtNumber(12, banglaNumerals)} />
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

function StatTile({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-md border border-border/60 bg-card/60 p-4">
      <div className="text-[10px] uppercase tracking-wider font-mono text-muted-foreground flex items-center gap-1.5">
        {icon} {label}
      </div>
      <div className="mt-1 text-2xl font-mono font-bold tabular-nums text-foreground">{value}</div>
    </div>
  );
}