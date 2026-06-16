import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { buildHead } from "@/lib/seo";
import { Trophy, Lock, Check } from "lucide-react";
import { toast } from "sonner";

type Match = {
  id: number;
  home_team_code: string | null;
  away_team_code: string | null;
  home_team_name: string | null;
  away_team_name: string | null;
  home_score: number | null;
  away_score: number | null;
  kickoff_utc: string | null;
  status: string | null;
  stage: string | null;
  group_letter: string | null;
};

type Prediction = {
  id: string;
  username: string;
  match_id: number;
  predicted_home: number;
  predicted_away: number;
  points: number;
  scored: boolean;
};

const USERNAME_KEY = "wc26_predict_username";

export const Route = createFileRoute("/predictions")({
  head: () => ({
    ...buildHead({
      title: "Match Predictions — FIFA World Cup 2026 | WC26 Hub",
      description: "Predict World Cup 2026 match scores and climb the leaderboard. Free, no sign-up.",
      path: "/predictions",
    }),
  }),
  component: PredictionsPage,
});

function PredictionsPage() {
  const qc = useQueryClient();
  const [username, setUsername] = React.useState<string>("");
  const [nameInput, setNameInput] = React.useState("");

  React.useEffect(() => {
    const saved = localStorage.getItem(USERNAME_KEY);
    if (saved) setUsername(saved);
  }, []);

  const saveUsername = () => {
    const clean = nameInput.trim().slice(0, 30);
    if (clean.length < 2) {
      toast.error("Name must be at least 2 characters");
      return;
    }
    localStorage.setItem(USERNAME_KEY, clean);
    setUsername(clean);
  };

  const { data: matches, isLoading } = useQuery({
    queryKey: ["predictions-matches"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("matches")
        .select("id, home_team_code, away_team_code, home_team_name, away_team_name, home_score, away_score, kickoff_utc, status, stage, group_letter")
        .eq("tournament_year", 2026)
        .order("kickoff_utc", { ascending: true });
      if (error) throw error;
      return (data ?? []) as Match[];
    },
    staleTime: 30_000,
  });

  const { data: myPreds } = useQuery({
    queryKey: ["my-predictions", username],
    enabled: !!username,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("predictions")
        .select("*")
        .eq("username", username);
      if (error) throw error;
      return (data ?? []) as Prediction[];
    },
  });

  // Recompute points whenever we visit
  React.useEffect(() => {
    supabase.rpc("recompute_prediction_points").then(() => {
      qc.invalidateQueries({ queryKey: ["my-predictions"] });
      qc.invalidateQueries({ queryKey: ["leaderboard"] });
    });
  }, [qc]);

  const predMap = React.useMemo(() => {
    const m = new Map<number, Prediction>();
    (myPreds ?? []).forEach((p) => m.set(p.match_id, p));
    return m;
  }, [myPreds]);

  const upsert = useMutation({
    mutationFn: async (p: { match_id: number; home: number; away: number }) => {
      const { error } = await supabase
        .from("predictions")
        .upsert(
          {
            username,
            match_id: p.match_id,
            predicted_home: p.home,
            predicted_away: p.away,
          },
          { onConflict: "username,match_id" },
        );
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["my-predictions", username] });
      toast.success("Prediction saved");
    },
    onError: (e: any) => toast.error(e.message ?? "Failed to save"),
  });

  const now = Date.now();
  const upcoming = (matches ?? []).filter((m) => {
    const ko = m.kickoff_utc ? new Date(m.kickoff_utc).getTime() : 0;
    return ko > now && m.home_score === null;
  });
  const finished = (matches ?? []).filter((m) => m.home_score !== null && m.away_score !== null);

  if (!username) {
    return (
      <div className="mx-auto max-w-md px-4 py-16">
        <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
          <Trophy className="h-10 w-10 text-primary" />
          <h1 className="text-2xl font-black">Join the Prediction Game</h1>
          <p className="text-sm text-muted-foreground">
            Pick a display name to start predicting World Cup 2026 match scores. No password — your name is saved on this device.
          </p>
          <div className="space-y-2">
            <input
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && saveUsername()}
              placeholder="Your name"
              maxLength={30}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
            />
            <button
              onClick={saveUsername}
              className="w-full rounded-lg bg-primary px-4 py-2 text-sm font-bold uppercase tracking-wider text-primary-foreground hover:bg-primary/90"
            >
              Start Predicting
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 space-y-6">
      <header className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <div className="inline-flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.2em] text-primary">
            <Trophy className="h-3 w-3" /> Predictions
          </div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight">Predict & Win</h1>
          <p className="text-sm text-muted-foreground">
            Playing as <span className="font-bold text-foreground">{username}</span> ·{" "}
            <button
              onClick={() => {
                localStorage.removeItem(USERNAME_KEY);
                setUsername("");
              }}
              className="underline hover:text-primary"
            >
              change name
            </button>
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card px-4 py-2 text-xs font-mono">
          <div className="text-muted-foreground uppercase tracking-wider">Scoring</div>
          <div className="text-foreground">Exact: <b className="text-primary">5</b> · Winner: <b className="text-primary">2</b></div>
        </div>
      </header>

      <section>
        <h2 className="text-xs font-mono uppercase tracking-[0.2em] text-muted-foreground mb-3">
          Upcoming ({upcoming.length})
        </h2>
        {isLoading ? (
          <div className="h-32 animate-pulse rounded-xl bg-card" />
        ) : upcoming.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
            No upcoming matches to predict.
          </div>
        ) : (
          <div className="space-y-2">
            {upcoming.map((m) => (
              <MatchRow
                key={m.id}
                match={m}
                existing={predMap.get(m.id)}
                onSave={(home, away) => upsert.mutate({ match_id: m.id, home, away })}
                saving={upsert.isPending}
              />
            ))}
          </div>
        )}
      </section>

      {finished.length > 0 && (
        <section>
          <h2 className="text-xs font-mono uppercase tracking-[0.2em] text-muted-foreground mb-3">
            Finished — your results
          </h2>
          <div className="space-y-2">
            {finished.slice(0, 30).map((m) => {
              const p = predMap.get(m.id);
              return (
                <div key={m.id} className="flex items-center justify-between rounded-xl border border-border bg-card/60 px-4 py-3">
                  <div className="flex-1 text-sm">
                    <div className="font-semibold">
                      {m.home_team_name ?? m.home_team_code} {m.home_score}–{m.away_score} {m.away_team_name ?? m.away_team_code}
                    </div>
                    <div className="text-xs text-muted-foreground font-mono uppercase tracking-wider">
                      {m.stage}{m.group_letter ? ` · Group ${m.group_letter}` : ""}
                    </div>
                  </div>
                  {p ? (
                    <div className="text-right">
                      <div className="text-sm font-mono">{p.predicted_home}–{p.predicted_away}</div>
                      <div className={`text-xs font-bold ${p.points > 0 ? "text-primary" : "text-muted-foreground"}`}>
                        +{p.points} pts
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs text-muted-foreground">no pick</div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}

function MatchRow({
  match,
  existing,
  onSave,
  saving,
}: {
  match: Match;
  existing?: Prediction;
  onSave: (home: number, away: number) => void;
  saving: boolean;
}) {
  const [home, setHome] = React.useState<string>(existing?.predicted_home?.toString() ?? "");
  const [away, setAway] = React.useState<string>(existing?.predicted_away?.toString() ?? "");

  React.useEffect(() => {
    if (existing) {
      setHome(existing.predicted_home.toString());
      setAway(existing.predicted_away.toString());
    }
  }, [existing]);

  const ko = match.kickoff_utc ? new Date(match.kickoff_utc) : null;
  const locked = ko ? ko.getTime() - Date.now() < 5 * 60 * 1000 : false;

  const submit = () => {
    const h = parseInt(home, 10);
    const a = parseInt(away, 10);
    if (isNaN(h) || isNaN(a) || h < 0 || a < 0 || h > 20 || a > 20) {
      toast.error("Enter scores 0–20");
      return;
    }
    onSave(h, a);
  };

  return (
    <div className="rounded-xl border border-border bg-card p-3 flex items-center gap-3 flex-wrap">
      <div className="flex-1 min-w-[180px]">
        <div className="font-semibold text-sm">
          {match.home_team_name ?? match.home_team_code} vs {match.away_team_name ?? match.away_team_code}
        </div>
        <div className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider">
          {ko?.toLocaleString("en-GB", { timeZone: "Asia/Dhaka", day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })} BST
          {match.group_letter ? ` · Group ${match.group_letter}` : ""}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <input
          type="number"
          min={0}
          max={20}
          value={home}
          disabled={locked}
          onChange={(e) => setHome(e.target.value)}
          className="w-14 rounded-md border border-border bg-background px-2 py-1.5 text-center text-sm font-mono disabled:opacity-50"
          placeholder="0"
        />
        <span className="text-muted-foreground">–</span>
        <input
          type="number"
          min={0}
          max={20}
          value={away}
          disabled={locked}
          onChange={(e) => setAway(e.target.value)}
          className="w-14 rounded-md border border-border bg-background px-2 py-1.5 text-center text-sm font-mono disabled:opacity-50"
          placeholder="0"
        />
        {locked ? (
          <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-1.5 text-xs text-muted-foreground">
            <Lock className="h-3 w-3" /> Locked
          </span>
        ) : (
          <button
            onClick={submit}
            disabled={saving}
            className="inline-flex items-center gap-1 rounded-md bg-primary px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            {existing ? <><Check className="h-3 w-3" /> Update</> : "Save"}
          </button>
        )}
      </div>
    </div>
  );
}