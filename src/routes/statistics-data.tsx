import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getVisitStats } from "@/lib/stats.functions";
import { buildHead } from "@/lib/seo";
import { useMemo } from "react";

const COUNTRY_NAMES: Record<string, string> = {
  BD: "Bangladesh", IN: "India", PK: "Pakistan", US: "United States", GB: "United Kingdom",
  CA: "Canada", AU: "Australia", DE: "Germany", FR: "France", BR: "Brazil", AR: "Argentina",
  JP: "Japan", CN: "China", RU: "Russia", SA: "Saudi Arabia", AE: "UAE", QA: "Qatar",
  MY: "Malaysia", SG: "Singapore", ID: "Indonesia", TR: "Turkey", IT: "Italy", ES: "Spain",
  NL: "Netherlands", PT: "Portugal", MX: "Mexico", KR: "South Korea", NP: "Nepal",
  LK: "Sri Lanka", TH: "Thailand", VN: "Vietnam", PH: "Philippines", EG: "Egypt", ZA: "South Africa",
};

function Flag({ cc, size = 20 }: { cc?: string | null; size?: number }) {
  if (!cc || cc.length !== 2) {
    return (
      <span
        className="inline-flex items-center justify-center rounded-sm bg-secondary/40 border border-border/60 text-[10px] text-muted-foreground shrink-0"
        style={{ width: size * 1.4, height: size }}
        aria-hidden
      >
        ?
      </span>
    );
  }
  const w = size <= 20 ? 40 : 80;
  return (
    <img
      src={`https://flagcdn.com/w${w}/${cc.toLowerCase()}.png`}
      alt={cc}
      loading="lazy"
      decoding="async"
      width={size * 1.4}
      height={size}
      className="inline-block rounded-sm border border-border/60 object-cover shrink-0"
      style={{ width: size * 1.4, height: size }}
    />
  );
}

const statsQO = queryOptions({
  queryKey: ["visit-stats"],
  queryFn: () => getVisitStats(),
  staleTime: 15_000,
  refetchInterval: 20_000,
});

export const Route = createFileRoute("/statistics-data")({
  head: () => ({
    ...buildHead({
      title: "Visitor Statistics — WC26 Hub",
      description: "Daily visitor statistics by country for the past 30 days.",
      path: "/statistics-data",
    }),
    meta: [{ name: "robots", content: "noindex, nofollow" }],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(statsQO),
  component: StatisticsPage,
  errorComponent: ({ error }) => (
    <div className="mx-auto max-w-3xl px-4 py-16 text-center text-muted-foreground">
      Failed to load statistics: {error.message}
    </div>
  ),
});

function StatisticsPage() {
  const fetcher = useServerFn(getVisitStats);
  const { data } = useSuspenseQuery({ ...statsQO, queryFn: () => fetcher() });

  // Hide rows with no country detected.
  const totalsByCountry = useMemo(
    () => data.totalsByCountry.filter((c) => c.country_code),
    [data.totalsByCountry],
  );
  const dailyByCountry = useMemo(
    () => data.dailyByCountry.filter((r) => r.country_code),
    [data.dailyByCountry],
  );
  const maxDay = useMemo(
    () => Math.max(1, ...data.totalsByDay.map((d) => d.count)),
    [data.totalsByDay],
  );
  const maxCountry = useMemo(
    () => Math.max(1, ...totalsByCountry.map((c) => c.count)),
    [totalsByCountry],
  );

  const today = new Date().toISOString().slice(0, 10);
  const todayCount = data.totalsByDay.find((d) => d.day === today)?.count ?? 0;
  const online = data.online ?? { total: 0, byPage: [], byCountry: [] };
  const onlineByCountry = online.byCountry.filter((c) => c.country_code);
  const maxOnlinePage = Math.max(1, ...online.byPage.map((p) => p.count));

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <header className="mb-8">
        <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-primary mb-2">
          ▸ ANALYTICS · LAST 30 DAYS
        </div>
        <h1 className="text-3xl font-bold">Visitor Statistics</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Daily visitor counts grouped by country. Data is retained for 30 days.
        </p>
      </header>

      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
        <KpiCard label="Online now" value={online.total} accent />
        <KpiCard label="Total visits (30d)" value={data.total} />
        <KpiCard label="Today" value={todayCount} />
        <KpiCard label="Countries" value={totalsByCountry.length} />
        <KpiCard label="Active days" value={data.totalsByDay.length} />
      </div>

      {/* Live presence */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <section className="rounded-xl border border-border/60 bg-card/60 p-5">
          <h2 className="text-sm font-mono uppercase tracking-wider text-muted-foreground mb-4 flex items-center gap-2">
            <span className="relative inline-flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75 animate-ping" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            Online now · by page
          </h2>
          {online.byPage.length === 0 ? (
            <p className="text-sm text-muted-foreground">No one online right now.</p>
          ) : (
            <ul className="space-y-2">
              {online.byPage.slice(0, 20).map((p) => (
                <li key={p.path} className="flex items-center gap-3 text-xs font-mono">
                  <a
                    href={p.path || "#"}
                    className="w-48 shrink-0 truncate text-foreground hover:text-primary"
                  >
                    {p.path || "(unknown)"}
                  </a>
                  <div className="flex-1 h-2 rounded-full bg-secondary/40 overflow-hidden">
                    <div
                      className="h-full bg-emerald-500"
                      style={{ width: `${(p.count / maxOnlinePage) * 100}%` }}
                    />
                  </div>
                  <span className="w-10 text-right font-semibold">{p.count}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-xl border border-border/60 bg-card/60 p-5">
          <h2 className="text-sm font-mono uppercase tracking-wider text-muted-foreground mb-4 flex items-center gap-2">
            <span className="relative inline-flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75 animate-ping" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            Online now · by country
          </h2>
          {onlineByCountry.length === 0 ? (
            <p className="text-sm text-muted-foreground">No one online right now.</p>
          ) : (
            <ul className="space-y-2">
              {onlineByCountry.slice(0, 20).map((c) => (
                <li
                  key={c.country_code ?? "unk"}
                  className="flex items-center gap-3 text-xs"
                >
                  <Flag cc={c.country_code} />
                  <span className="w-40 shrink-0 truncate">
                    {COUNTRY_NAMES[c.country_code ?? ""] ?? c.country_code ?? "Unknown"}
                  </span>
                  <span className="ml-auto font-mono font-semibold">{c.count}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily totals */}
        <section className="rounded-xl border border-border/60 bg-card/60 p-5">
          <h2 className="text-sm font-mono uppercase tracking-wider text-muted-foreground mb-4">
            <span className="text-primary">▸</span> Daily visits
          </h2>
          {data.totalsByDay.length === 0 ? (
            <p className="text-sm text-muted-foreground">No visits recorded yet.</p>
          ) : (
            <ul className="space-y-2">
              {[...data.totalsByDay].reverse().map((d) => (
                <li key={d.day} className="flex items-center gap-3 text-xs font-mono">
                  <span className="w-24 shrink-0 text-muted-foreground">{d.day}</span>
                  <div className="flex-1 h-2 rounded-full bg-secondary/40 overflow-hidden">
                    <div
                      className="h-full bg-primary"
                      style={{ width: `${(d.count / maxDay) * 100}%` }}
                    />
                  </div>
                  <span className="w-10 text-right font-semibold">{d.count}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* By country */}
        <section className="rounded-xl border border-border/60 bg-card/60 p-5">
          <h2 className="text-sm font-mono uppercase tracking-wider text-muted-foreground mb-4">
            <span className="text-primary">▸</span> Top countries
          </h2>
          {totalsByCountry.length === 0 ? (
            <p className="text-sm text-muted-foreground">No visits recorded yet.</p>
          ) : (
            <ul className="space-y-2">
              {totalsByCountry.slice(0, 20).map((c) => (
                <li key={c.country_code ?? "unk"} className="flex items-center gap-3 text-xs">
                  <Flag cc={c.country_code} />
                  <span className="w-40 shrink-0 truncate">
                    {COUNTRY_NAMES[c.country_code ?? ""] ?? c.country_code ?? "Unknown"}
                  </span>
                  <div className="flex-1 h-2 rounded-full bg-secondary/40 overflow-hidden">
                    <div
                      className="h-full bg-emerald-500"
                      style={{ width: `${(c.count / maxCountry) * 100}%` }}
                    />
                  </div>
                  <span className="w-10 text-right font-mono font-semibold">{c.count}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {/* Per-day per-country matrix */}
      <section className="mt-6 rounded-xl border border-border/60 bg-card/60 p-5">
        <h2 className="text-sm font-mono uppercase tracking-wider text-muted-foreground mb-4">
          <span className="text-primary">▸</span> Daily breakdown by country
        </h2>
        {dailyByCountry.length === 0 ? (
          <p className="text-sm text-muted-foreground">No data yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs font-mono">
              <thead>
                <tr className="text-left text-muted-foreground border-b border-border/60">
                  <th className="py-2 pr-4">Date</th>
                  <th className="py-2 pr-4">Country</th>
                  <th className="py-2 pr-4 text-right">Visits</th>
                </tr>
              </thead>
              <tbody>
                {dailyByCountry.slice(0, 200).map((row, i) => (
                  <tr key={i} className="border-b border-border/30">
                    <td className="py-1.5 pr-4">{row.day}</td>
                    <td className="py-1.5 pr-4">
                      <span className="inline-flex items-center gap-2">
                        <Flag cc={row.country_code} size={16} />
                        {COUNTRY_NAMES[row.country_code ?? ""] ?? row.country_code ?? "Unknown"}
                      </span>
                    </td>
                    <td className="py-1.5 pr-4 text-right font-semibold">{row.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function KpiCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent?: boolean;
}) {
  return (
    <div
      className={
        accent
          ? "rounded-xl border border-emerald-500/40 bg-emerald-500/5 p-4"
          : "rounded-xl border border-border/60 bg-card/60 p-4"
      }
    >
      <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div
        className={
          accent
            ? "mt-1 text-2xl font-bold font-mono text-emerald-500"
            : "mt-1 text-2xl font-bold font-mono"
        }
      >
        {value.toLocaleString()}
      </div>
    </div>
  );
}