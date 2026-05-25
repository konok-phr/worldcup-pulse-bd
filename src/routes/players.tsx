import { createFileRoute } from "@tanstack/react-router";
import { useI18n } from "@/lib/i18n";
import { buildHead } from "@/lib/seo";

export const Route = createFileRoute("/players")({
  head: () => ({ ...buildHead({ title: "Players & Top Scorers — FIFA World Cup 2026 | WC26 Hub", description: "Top scorers, Golden Boot and Golden Glove tracker for the FIFA World Cup 2026.", path: "/players" }) }),
  component: PlayersPage,
});

function PlayersPage() {
  const { t } = useI18n();
  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <header className="mb-5">
        <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-primary mb-1">▸ {t("nav_players")}</div>
        <h1 className="text-2xl font-bold">Top Scorers · Golden Boot</h1>
      </header>
      <div className="rounded-md border border-border/60 bg-card/40 p-10 text-center text-muted-foreground font-mono text-sm">
        Player stats populate live as the tournament progresses. Powered by football-data.org.
      </div>
    </div>
  );
}