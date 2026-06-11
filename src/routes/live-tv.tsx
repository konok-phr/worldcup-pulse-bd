import * as React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { HlsPlayer } from "@/components/site/HlsPlayer";
import { buildHead } from "@/lib/seo";
import { useI18n } from "@/lib/i18n";
import { Tv, Radio } from "lucide-react";
import { cn } from "@/lib/utils";

type Channel = {
  id: string;
  name: string;
  logo_url: string | null;
  stream_url: string;
  sort_order: number;
  is_active: boolean;
};

export const Route = createFileRoute("/live-tv")({
  head: () => ({
    ...buildHead({
      title: "Live TV — Watch FIFA World Cup 2026 Online | WC26 Hub",
      description: "Watch the FIFA World Cup 2026 live online. Multiple HD channels, switch with one tap.",
      path: "/live-tv",
    }),
  }),
  component: LiveTvPage,
});

function LiveTvPage() {
  const { locale } = useI18n();
  const { data: channels, isLoading } = useQuery({
    queryKey: ["live-tv-channels"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("live_tv_channels")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data ?? []) as Channel[];
    },
    staleTime: 30_000,
  });

  const [activeId, setActiveId] = React.useState<string | null>(null);
  React.useEffect(() => {
    if (!activeId && channels && channels.length > 0) setActiveId(channels[0].id);
  }, [channels, activeId]);

  const active = channels?.find((c) => c.id === activeId) ?? channels?.[0];

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 space-y-5">
      <header className="space-y-1">
        <div className="inline-flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.2em] text-rose-500">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-500 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-rose-500" />
          </span>
          {locale === "bn" ? "লাইভ টিভি" : "Live TV"}
        </div>
        <h1 className="text-2xl md:text-3xl font-black tracking-tight">
          {locale === "bn" ? "বিশ্বকাপ ২০২৬ লাইভ দেখুন" : "Watch FIFA World Cup 2026 Live"}
        </h1>
        <p className="text-sm text-muted-foreground">
          {locale === "bn"
            ? "নিচের চ্যানেল ট্যাব থেকে পছন্দের চ্যানেল বেছে নিন।"
            : "Pick a channel from the tabs below to start watching."}
        </p>
      </header>

      {isLoading ? (
        <div className="aspect-video w-full animate-pulse rounded-2xl border border-border bg-card" />
      ) : !channels || channels.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card/40 p-10 text-center">
          <Tv className="mx-auto h-10 w-10 text-muted-foreground" />
          <p className="mt-3 text-sm text-muted-foreground">
            {locale === "bn"
              ? "এখনো কোনো চ্যানেল যুক্ত করা হয়নি।"
              : "No channels have been added yet."}
          </p>
          <Link
            to="/live-tv-add-for-world-cup-2026-ad"
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-xs font-bold uppercase tracking-wider text-primary-foreground hover:bg-primary/90"
          >
            {locale === "bn" ? "চ্যানেল যুক্ত করুন" : "Add a channel"}
          </Link>
        </div>
      ) : (
        <>
          {active && <HlsPlayer key={active.id} src={active.stream_url} poster={active.logo_url ?? undefined} />}

          <div className="flex flex-wrap gap-2">
            {channels.map((c) => {
              const isActive = c.id === active?.id;
              return (
                <button
                  key={c.id}
                  onClick={() => setActiveId(c.id)}
                  className={cn(
                    "group inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-bold transition-all",
                    isActive
                      ? "border-primary bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                      : "border-border bg-card hover:border-primary/60 hover:bg-accent",
                  )}
                >
                  {c.logo_url ? (
                    <img
                      src={c.logo_url}
                      alt={c.name}
                      className="h-6 w-6 rounded object-cover bg-black/20"
                      loading="lazy"
                    />
                  ) : (
                    <Radio className="h-4 w-4" />
                  )}
                  <span className="whitespace-nowrap">{c.name}</span>
                </button>
              );
            })}
          </div>

          {active && (
            <div className="rounded-xl border border-border bg-card/60 p-4">
              <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground">
                {locale === "bn" ? "চলছে" : "Now playing"}
              </div>
              <div className="mt-1 text-lg font-bold">{active.name}</div>
            </div>
          )}
        </>
      )}

      <div className="pt-4 text-center text-xs text-muted-foreground">
        <Link to="/live-tv-add-for-world-cup-2026-ad" className="hover:text-primary underline-offset-4 hover:underline">
          {locale === "bn" ? "চ্যানেল যোগ/সম্পাদনা করুন" : "Add or edit channels"}
        </Link>
      </div>
    </div>
  );
}