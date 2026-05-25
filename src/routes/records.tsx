import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { getRecords } from "@/lib/data.functions";
import { useI18n, fmtNumber } from "@/lib/i18n";
import { buildHead } from "@/lib/seo";

const recordsQO = queryOptions({ queryKey: ["records"], queryFn: () => getRecords(), staleTime: 24 * 3600_000 });

export const Route = createFileRoute("/records")({
  head: () => ({ ...buildHead({ title: "FIFA World Cup Records | WC26 Hub", description: "All-time FIFA World Cup records — top scorers, fastest goals, most titles, biggest wins and more.", path: "/records" }) }),
  loader: ({ context }) => context.queryClient.ensureQueryData(recordsQO),
  component: RecordsPage,
});

function RecordsPage() {
  const { t, banglaNumerals } = useI18n();
  const { data: records } = useSuspenseQuery(recordsQO);
  const byCat = records.reduce<Record<string, typeof records>>((acc, r) => { (acc[r.category] = acc[r.category] ?? []).push(r); return acc; }, {});
  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <header className="mb-5">
        <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-primary mb-1">▸ {t("nav_records")}</div>
        <h1 className="text-2xl font-bold">World Cup Records</h1>
      </header>
      <div className="space-y-6">
        {Object.entries(byCat).map(([cat, list]) => (
          <section key={cat}>
            <h2 className="text-xs uppercase tracking-[0.2em] font-mono text-muted-foreground mb-2"><span className="text-primary">◆</span> {cat}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {list.map((r) => (
                <div key={r.id} className="rounded-md border border-border/60 bg-card p-4">
                  <div className="font-semibold">{r.title}</div>
                  <div className="mt-1 font-mono text-2xl text-primary tabular-nums">{r.value}</div>
                  <div className="text-xs text-muted-foreground mt-1">{r.holder} {r.year ? `· ${fmtNumber(r.year, banglaNumerals)}` : ""}</div>
                  {r.description && <p className="text-xs text-muted-foreground mt-2">{r.description}</p>}
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}