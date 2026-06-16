import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { MessageSquare, Send } from "lucide-react";

type CommentaryRow = {
  id: number;
  match_id: number;
  username: string;
  message: string;
  minute: number | null;
  created_at: string;
};

async function fetchCommentary(matchId: number): Promise<CommentaryRow[]> {
  const { data, error } = await supabase
    .from("commentary")
    .select("*")
    .eq("match_id", matchId)
    .order("created_at", { ascending: false })
    .limit(200);
  if (error) throw error;
  return (data ?? []) as CommentaryRow[];
}

export function LiveCommentary({
  matchId,
  currentMinute,
}: {
  matchId: number;
  currentMinute?: number | null;
}) {
  const qc = useQueryClient();
  const [username, setUsername] = React.useState("");
  const [message, setMessage] = React.useState("");

  React.useEffect(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem("wc26_username") : null;
    if (saved) setUsername(saved);
  }, []);

  const { data: rows = [] } = useQuery({
    queryKey: ["commentary", matchId],
    queryFn: () => fetchCommentary(matchId),
    staleTime: 10_000,
  });

  React.useEffect(() => {
    const ch = supabase
      .channel(`commentary-${matchId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "commentary", filter: `match_id=eq.${matchId}` },
        (payload) => {
          qc.setQueryData<CommentaryRow[]>(["commentary", matchId], (prev) => {
            const next = payload.new as CommentaryRow;
            if (!prev) return [next];
            if (prev.find((r) => r.id === next.id)) return prev;
            return [next, ...prev];
          });
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [matchId, qc]);

  const mutation = useMutation({
    mutationFn: async () => {
      const u = username.trim();
      const msg = message.trim();
      if (!u) throw new Error("Please enter your name");
      if (!msg) throw new Error("Type something first");
      if (msg.length > 280) throw new Error("Max 280 characters");
      localStorage.setItem("wc26_username", u);
      const { error } = await supabase.from("commentary").insert({
        match_id: matchId,
        username: u,
        message: msg,
        minute: currentMinute ?? null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      setMessage("");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  return (
    <section className="mt-6">
      <h2 className="text-xs uppercase tracking-[0.2em] font-mono text-muted-foreground mb-3 flex items-center gap-2">
        <MessageSquare className="h-3.5 w-3.5 text-primary" />
        Live Commentary
      </h2>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          mutation.mutate();
        }}
        className="rounded-md border border-border/60 bg-card/60 p-3 mb-3 space-y-2"
      >
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            placeholder="Your name"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            maxLength={40}
            className="sm:w-40 px-3 py-2 rounded bg-background border border-border/60 text-sm focus:outline-none focus:border-primary"
          />
          <input
            type="text"
            placeholder="Share your reaction… (e.g. What a save!)"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            maxLength={280}
            className="flex-1 px-3 py-2 rounded bg-background border border-border/60 text-sm focus:outline-none focus:border-primary"
          />
          <button
            type="submit"
            disabled={mutation.isPending}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 disabled:opacity-50"
          >
            <Send className="h-3.5 w-3.5" />
            {mutation.isPending ? "Posting…" : "Post"}
          </button>
        </div>
        <div className="text-[10px] font-mono text-muted-foreground">
          {message.length}/280
        </div>
      </form>

      {rows.length === 0 ? (
        <div className="rounded-md border border-border/60 bg-card/40 p-6 text-sm text-muted-foreground font-mono text-center">
          No commentary yet — be the first to react!
        </div>
      ) : (
        <ul className="space-y-1.5 max-h-[480px] overflow-y-auto pr-1">
          {rows.map((c) => (
            <li
              key={c.id}
              className="rounded border border-border/40 bg-card/40 px-3 py-2 text-sm"
            >
              <div className="flex items-center gap-2 text-[11px] font-mono text-muted-foreground mb-0.5">
                {c.minute != null && (
                  <span className="text-primary tabular-nums">{c.minute}'</span>
                )}
                <span className="font-semibold text-foreground">{c.username}</span>
                <span className="ml-auto">
                  {new Date(c.created_at).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
              <p className="whitespace-pre-wrap break-words">{c.message}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}