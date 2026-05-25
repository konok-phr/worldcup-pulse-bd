import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import * as React from "react";
import { globalSearch } from "@/lib/data.functions";
import { TeamCrest } from "@/components/site/TeamCrest";
import { useI18n } from "@/lib/i18n";
import { buildHead } from "@/lib/seo";
import { Search as SearchIcon } from "lucide-react";

export const Route = createFileRoute("/search")({
  head: () => ({ ...buildHead({ title: "Search — WC26 Hub", description: "Search teams, stadiums and tournaments across the FIFA World Cup archive.", path: "/search" }) }),
  component: SearchPage,
});

function SearchPage() {
  const { t } = useI18n();
  const [q, setQ] = React.useState("");
  const { data } = useQuery({
    queryKey: ["search", q],
    queryFn: () => globalSearch({ data: { q } }),
    enabled: q.length >= 2,
    staleTime: 30_000,
  });
  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <header className="mb-5">
        <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-primary mb-1">▸ {t("nav_search")}</div>
        <h1 className="text-2xl font-bold">Search</h1>
      </header>
      <div className="flex items-center gap-2 rounded-md border border-border/60 bg-card px-3 py-2 mb-6">
        <SearchIcon className="h-4 w-4 text-muted-foreground" />
        <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("search_placeholder")} className="flex-1 bg-transparent outline-none text-sm" />
      </div>
      {q.length < 2 ? (
        <div className="text-sm text-muted-foreground font-mono">Type at least 2 characters.</div>
      ) : !data ? (
        <div className="text-sm text-muted-foreground font-mono">{t("loading")}</div>
      ) : (
        <div className="space-y-6">
          <Section title={t("nav_teams")} count={data.teams.length}>
            {data.teams.map((tm) => (
              <Link key={tm.code} to="/teams/$code" params={{ code: tm.code }} className="flex items-center gap-2 rounded border border-border/60 bg-card hover:border-primary/60 p-2">
                <TeamCrest code={tm.code} emoji={tm.flag_emoji} size={20} /><span className="text-sm">{tm.name}</span>
                {tm.group_letter && <span className="ml-auto text-[10px] font-mono text-muted-foreground">{t("group")} {tm.group_letter}</span>}
              </Link>
            ))}
          </Section>
          <Section title={t("nav_players")} count={data.players?.length ?? 0}>
            {(data.players ?? []).map((p) => (
              <Link
                key={p.id}
                to="/teams/$code"
                params={{ code: p.team_code ?? "" }}
                disabled={!p.team_code}
                className="flex items-center gap-2 rounded border border-border/60 bg-card hover:border-primary/60 p-2"
              >
                <span className="text-sm font-semibold">{p.name}</span>
                {p.jersey_number != null && (
                  <span className="text-[10px] font-mono text-muted-foreground">#{p.jersey_number}</span>
                )}
                <span className="ml-auto text-[10px] font-mono text-muted-foreground">
                  {[p.position, p.team_code, p.club].filter(Boolean).join(" · ")}
                </span>
              </Link>
            ))}
          </Section>
          <Section title={t("nav_stadiums")} count={data.stadiums.length}>
            {data.stadiums.map((s) => (
              <Link key={s.slug} to="/stadiums/$slug" params={{ slug: s.slug }} className="block rounded border border-border/60 bg-card hover:border-primary/60 p-2">
                <div className="text-sm font-semibold">{s.name}</div>
                <div className="text-xs text-muted-foreground">{s.city}, {s.country}</div>
              </Link>
            ))}
          </Section>
          <Section title={t("nav_history")} count={data.tournaments.length}>
            {data.tournaments.map((tn) => (
              <Link key={tn.year} to="/history/$year" params={{ year: String(tn.year) }} className="block rounded border border-border/60 bg-card hover:border-primary/60 p-2">
                <div className="text-sm font-semibold">FIFA World Cup {tn.year}</div>
                <div className="text-xs text-muted-foreground">{(tn.host_countries ?? []).join(", ")}</div>
              </Link>
            ))}
          </Section>
        </div>
      )}
    </div>
  );
}

function Section({ title, count, children }: { title: string; count: number; children: React.ReactNode }) {
  if (count === 0) return null;
  return (
    <section>
      <h2 className="text-xs uppercase tracking-[0.2em] font-mono text-muted-foreground mb-2"><span className="text-primary">◆</span> {title} ({count})</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">{children}</div>
    </section>
  );
}