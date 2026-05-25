import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { getStadiumBySlug, getAllTeams } from "@/lib/data.functions";
import { MatchCard, type MatchRow } from "@/components/site/MatchCard";
import { useI18n, fmtNumber } from "@/lib/i18n";
import { buildHead } from "@/lib/seo";
import { ArrowLeft } from "lucide-react";

const stadiumQO = (slug: string) => queryOptions({ queryKey: ["stadium", slug], queryFn: () => getStadiumBySlug({ data: { slug } }), staleTime: 600_000 });
const teamsQO = queryOptions({ queryKey: ["teams-all"], queryFn: () => getAllTeams(), staleTime: 600_000 });

export const Route = createFileRoute("/stadiums/$slug")({
  loader: ({ context, params }) => Promise.all([context.queryClient.ensureQueryData(stadiumQO(params.slug)), context.queryClient.ensureQueryData(teamsQO)]).then(() => ({ slug: params.slug })),
  head: ({ loaderData }) => ({ ...buildHead({ title: `${loaderData?.slug ?? ""} — FIFA World Cup 2026 Stadium | WC26 Hub`, description: `Stadium info, capacity and matches for ${loaderData?.slug ?? ""} at the FIFA World Cup 2026.`, path: `/stadiums/${loaderData?.slug ?? ""}` }) }),
  component: StadiumDetail,
});

function StadiumDetail() {
  const { t, banglaNumerals } = useI18n();
  const { slug } = Route.useLoaderData();
  const { data } = useSuspenseQuery(stadiumQO(slug));
  const { data: teams } = useSuspenseQuery(teamsQO);
  const emojiMap = Object.fromEntries(teams.map((tm) => [tm.code, tm.flag_emoji]));
  const s = data.stadium;
  if (!s) return <div className="mx-auto max-w-3xl px-4 py-16 text-center text-muted-foreground">Stadium not found.</div>;
  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <Link to="/stadiums" className="inline-flex items-center gap-1 text-xs font-mono uppercase tracking-wider text-muted-foreground hover:text-primary mb-3"><ArrowLeft className="h-3 w-3" /> {t("nav_stadiums")}</Link>
      {s.image_url && (
        <div className="relative aspect-[21/9] w-full overflow-hidden rounded-lg border border-border/60 mb-5">
          <img src={s.image_url} alt={s.name} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-5">
            <div className="text-[10px] font-mono uppercase tracking-wider text-primary">{s.country}</div>
            <h1 className="text-4xl font-bold mt-1 drop-shadow">{s.name}</h1>
            <div className="text-muted-foreground">{s.city}</div>
          </div>
        </div>
      )}
      {!s.image_url && (
        <header className="mb-6">
          <div className="text-[10px] font-mono uppercase tracking-wider text-primary">{s.country}</div>
          <h1 className="text-3xl font-bold mt-1">{s.name}</h1>
          <div className="text-muted-foreground">{s.city}</div>
        </header>
      )}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
        <div className="rounded-md border border-border/60 bg-card/60 p-3"><div className="text-[10px] uppercase tracking-wider font-mono text-muted-foreground">{t("capacity")}</div><div className="mt-0.5 font-mono font-semibold">{s.capacity != null ? fmtNumber(s.capacity, banglaNumerals) : "—"}</div></div>
        <div className="rounded-md border border-border/60 bg-card/60 p-3"><div className="text-[10px] uppercase tracking-wider font-mono text-muted-foreground">{t("city")}</div><div className="mt-0.5 font-mono font-semibold">{s.city}</div></div>
        <div className="rounded-md border border-border/60 bg-card/60 p-3"><div className="text-[10px] uppercase tracking-wider font-mono text-muted-foreground">{t("country")}</div><div className="mt-0.5 font-mono font-semibold">{s.country}</div></div>
      </div>
      {s.description && <p className="text-sm text-muted-foreground mb-6">{s.description}</p>}
      <h2 className="text-xs uppercase tracking-[0.2em] font-mono text-muted-foreground mb-3"><span className="text-primary">▸</span> Matches</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">{data.matches.map((m) => <MatchCard key={m.id} match={m as MatchRow} emojiMap={emojiMap} />)}</div>
    </div>
  );
}