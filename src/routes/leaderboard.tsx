import * as React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { buildHead } from "@/lib/seo";
import { Trophy, Medal } from "lucide-react";

type Row = { username: string; total_points: number; predictions: number; exact: number };

export const Route = createFileRoute("/leaderboard")({
  head: () => ({
    ...buildHead({
      title: "Predictions Leaderboard — FIFA World Cup 2026 | WC26 Hub",
      description: "Top predictors for FIFA World Cup 2026 match scores. Climb the leaderboard.",
      path: "/leaderboard",
    }),
  }),
  component: LeaderboardPage,
});

function LeaderboardPage() {
  const me = typeof window !== "undefined" ? localStorage.getItem("wc26_predict_username") : null;

  const { data: rows, isLoading } = useQuery({
    queryKey: ["leaderboard"],
    queryFn: async () => {
      // Recompute first so the board is fresh
      await supabase.rpc("recompute_prediction_points");
      const { data, error } = await supabase
        .from("predictions")
        .select("username, points, scored")
        .limit(5000);
      if (error) throw error;
      const map = new Map<string, Row>();
      for (const p of data ?? []) {
        const r = map.get(p.username) ?? { username: p.username, total_points: 0, predictions: 0, exact: 0 };
        r.predictions += 1;
        r.total_points += p.points ?? 0;
        if ((p.points ?? 0) === 5) r.exact += 1;
        map.set(p.username, r);
      }
      return Array.from(map.values()).sort((a, b) => b.total_points - a.total_points || b.exact - a.exact);
    },
    staleTime: 15_000,
  });

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 space-y-5">
      <header>
        <div className="inline-flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.2em] text-primary">
          <Trophy className="h-3 w-3" /> Leaderboard
        </div>
        <h1 className="text-2xl md:text-3xl font-black tracking-tight">Top Predictors</h1>
        <p className="text-sm text-muted-foreground">
          Exact score = 5 pts · Correct winner = 2 pts ·{" "}
          <Link to="/predictions" className="text-primary underline">Make your picks</Link>
        </p>
      </header>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-12 animate-pulse rounded-xl bg-card" />
          ))}
        </div>
      ) : !rows || rows.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-10 text-center">
          <p className="text-sm text-muted-foreground">No predictions yet. Be the first!</p>
          <Link
            to="/predictions"
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-xs font-bold uppercase tracking-wider text-primary-foreground"
          >
            Start predicting
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <table className="w-full text-sm">
            <thead className="bg-muted/30 text-[10px] font-mono uppercase tracking-[0.15em] text-muted-foreground">
              <tr>
                <th className="px-4 py-2 text-left">#</th>
                <th className="px-4 py-2 text-left">Player</th>
                <th className="px-4 py-2 text-right">Picks</th>
                <th className="px-4 py-2 text-right">Exact</th>
                <th className="px-4 py-2 text-right">Points</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => {
                const isMe = me && r.username === me;
                const medal = i === 0 ? "text-yellow-500" : i === 1 ? "text-zinc-400" : i === 2 ? "text-amber-700" : "";
                return (
                  <tr key={r.username} className={`border-t border-border ${isMe ? "bg-primary/10" : ""}`}>
                    <td className="px-4 py-3 font-mono">
                      {i < 3 ? <Medal className={`inline h-4 w-4 ${medal}`} /> : null} {i + 1}
                    </td>
                    <td className="px-4 py-3 font-semibold">
                      {r.username} {isMe && <span className="text-xs text-primary">(you)</span>}
                    </td>
                    <td className="px-4 py-3 text-right font-mono">{r.predictions}</td>
                    <td className="px-4 py-3 text-right font-mono">{r.exact}</td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-primary">{r.total_points}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}