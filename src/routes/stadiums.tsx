import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { getAllStadiums } from "@/lib/data.functions";
import { useI18n, fmtNumber } from "@/lib/i18n";
import { buildHead } from "@/lib/seo";

const stadiumsQO = queryOptions({ queryKey: ["stadiums"], queryFn: () => getAllStadiums(), staleTime: 600_000 });

export const Route = createFileRoute("/stadiums")({
  head: () => ({ ...buildHead({ title: "Stadiums & Host Cities — FIFA World Cup 2026 | WC26 Hub", description: "All 16 FIFA World Cup 2026 host stadiums across USA, Canada and Mexico — capacity, cities and matches.", path: "/stadiums" }) }),
  loader: ({ context }) => context.queryClient.ensureQueryData(stadiumsQO),
  component: StadiumsPage,
});

function StadiumsPage() {
  const { t, banglaNumerals } = useI18n();
  const { data: stadiums } = useSuspenseQuery(stadiumsQO);
  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <header className="mb-5">
        <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-primary mb-1">▸ {t("nav_stadiums")}</div>
        <h1 className="text-2xl font-bold">Stadiums · 16 Host Venues</h1>
      </header>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {stadiums.map((s) => (
          <Link key={s.slug} to="/stadiums/$slug" params={{ slug: s.slug }} className="rounded-lg border border-border/60 bg-card hover:border-primary/60 transition-colors p-4">
            <div className="text-[10px] font-mono uppercase tracking-wider text-primary">{s.country}</div>
            <div className="mt-1 font-bold text-lg">{s.name}</div>
            <div className="text-sm text-muted-foreground">{s.city}</div>
            {s.capacity != null && <div className="mt-2 font-mono text-xs text-muted-foreground">{t("capacity")}: {fmtNumber(s.capacity, banglaNumerals)}</div>}
          </Link>
        ))}
      </div>
    </div>
  );
}