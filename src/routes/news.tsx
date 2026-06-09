import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { getNews, type NewsItem } from "@/lib/news.functions";
import { useI18n } from "@/lib/i18n";
import { buildHead } from "@/lib/seo";
import { Newspaper, Globe, ExternalLink } from "lucide-react";
import newsPlaceholder from "@/assets/news-placeholder.jpg";

const newsQO = queryOptions({
  queryKey: ["news"],
  queryFn: () => getNews(),
  staleTime: 5 * 60_000,
});

export const Route = createFileRoute("/news")({
  head: () => ({
    ...buildHead({
      title: "News — FIFA World Cup 2026 | WC26 Hub",
      description: "Latest FIFA World Cup 2026 news in English and বাংলা — aggregated from BBC, Goal.com, Prothom Alo, BDNews24 and more.",
      path: "/news",
    }),
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(newsQO),
  component: NewsPage,
  errorComponent: ({ reset }) => (
    <div className="mx-auto max-w-3xl px-4 py-10 text-center">
      <p className="text-muted-foreground mb-4">Failed to load news.</p>
      <button onClick={reset} className="text-primary underline">Try again</button>
    </div>
  ),
});

function NewsPage() {
  const { t, locale } = useI18n();
  const { data } = useSuspenseQuery(newsQO);
  const [filter, setFilter] = useState<"all" | "bn" | "en">("all");
  const filtered = filter === "all" ? data.items : data.items.filter((i) => i.lang === filter);
  const counts = {
    all: data.items.length,
    bn: data.items.filter((i) => i.lang === "bn").length,
    en: data.items.filter((i) => i.lang === "en").length,
  };
  const tabs: { key: "all" | "bn" | "en"; label: string }[] = [
    { key: "all", label: locale === "bn" ? `সব (${counts.all})` : `All (${counts.all})` },
    { key: "bn", label: locale === "bn" ? `বাংলা (${counts.bn})` : `Bangla (${counts.bn})` },
    { key: "en", label: locale === "bn" ? `আন্তর্জাতিক (${counts.en})` : `International (${counts.en})` },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.25em] text-primary mb-2">
            <Newspaper className="h-3.5 w-3.5" /> {t("nav_news")}
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
            {locale === "bn" ? "ফুটবল ও বিশ্বকাপ ২০২৬ খবর" : "Football & World Cup 2026 News"}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {locale === "bn"
              ? "বাংলা ও আন্তর্জাতিক উৎস থেকে সর্বশেষ ফুটবল খবর।"
              : "Latest football news from Bangla and international sources."}
          </p>
        </div>
      </header>

      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-3 py-1.5 rounded-full text-xs font-mono uppercase tracking-wider border transition-colors ${
              filter === tab.key
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card/40 border-border/60 text-muted-foreground hover:text-foreground hover:border-primary/50"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-md border border-border/60 bg-card/40 p-8 text-center text-muted-foreground font-mono text-sm">
          {locale === "bn" ? "এই মুহূর্তে কোনো খবর পাওয়া যায়নি।" : "No news available right now."}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((item) => <NewsCard key={item.id} item={item} locale={locale} />)}
        </div>
      )}

      <footer className="text-[10px] uppercase tracking-wider font-mono text-muted-foreground/70 text-center pt-4">
        {locale === "bn" ? "সর্বশেষ আপডেট" : "Last updated"} ·{" "}
        {new Date(data.updatedAt).toLocaleString(locale === "bn" ? "bn-BD" : "en-GB")}
      </footer>
    </div>
  );
}

function NewsCard({ item, locale }: { item: NewsItem; locale: "en" | "bn" }) {
  const ago = timeAgo(item.pubDate, locale);
  const [isPlaceholder, setIsPlaceholder] = useState(!item.image);
  return (
    <a
      href={item.link}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex flex-col rounded-lg border border-border/60 bg-card/60 overflow-hidden hover:border-primary/50 hover:bg-card/80 transition-colors"
    >
      <div className="aspect-video w-full overflow-hidden bg-[#0a1929]">
        <img
          src={item.image || newsPlaceholder}
          alt=""
          loading="lazy"
          referrerPolicy="no-referrer"
          className={
            isPlaceholder
              ? "w-full h-full object-contain object-center group-hover:scale-[1.03] transition-transform duration-300"
              : "w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
          }
          onError={(e) => {
            const img = e.currentTarget as HTMLImageElement;
            if (!img.src.endsWith(newsPlaceholder)) {
              img.src = newsPlaceholder;
              setIsPlaceholder(true);
            }
          }}
        />
      </div>
      <div className="p-4 flex flex-col gap-2 flex-1">
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider font-mono text-muted-foreground">
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-primary/10 text-primary">
            <Globe className="h-3 w-3" /> {item.lang === "bn" ? "বাংলা" : "EN"}
          </span>
          <span className="truncate">{item.source}</span>
          <span className="ml-auto shrink-0">{ago}</span>
        </div>
        <h2 className="font-semibold text-sm md:text-base leading-snug line-clamp-3 group-hover:text-primary transition-colors">
          {item.title}
        </h2>
        {item.description && (
          <p className="text-xs text-muted-foreground line-clamp-3">{item.description}</p>
        )}
        <span className="mt-auto inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-mono text-primary opacity-0 group-hover:opacity-100 transition-opacity">
          {locale === "bn" ? "পড়ুন" : "Read"} <ExternalLink className="h-3 w-3" />
        </span>
      </div>
    </a>
  );
}

function timeAgo(iso: string, locale: "en" | "bn"): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  const h = Math.floor(m / 60);
  const d = Math.floor(h / 24);
  if (locale === "bn") {
    if (m < 1) return "এখন";
    if (m < 60) return `${m} মি আগে`;
    if (h < 24) return `${h} ঘ আগে`;
    return `${d} দি আগে`;
  }
  if (m < 1) return "now";
  if (m < 60) return `${m}m ago`;
  if (h < 24) return `${h}h ago`;
  return `${d}d ago`;
}