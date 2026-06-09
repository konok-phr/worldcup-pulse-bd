import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { getNews, type NewsItem } from "@/lib/news.functions";
import { useI18n } from "@/lib/i18n";
import { Newspaper, Globe, ExternalLink, ArrowRight } from "lucide-react";
import newsPlaceholder from "@/assets/news-placeholder.jpg";

export function LandingNewsSection() {
  const { t, locale } = useI18n();
  const { data, isLoading } = useQuery({
    queryKey: ["news"],
    queryFn: () => getNews(),
    staleTime: 5 * 60_000,
  });

  const all = data?.items ?? [];
  const withImg = all.filter((i) => !!i.image);
  const rest = all.filter((i) => !i.image);
  const items = [...withImg, ...rest].slice(0, 4);

  return (
    <section>
      <div className="flex items-end justify-between mb-3">
        <h2 className="text-xs uppercase tracking-[0.2em] font-mono text-muted-foreground inline-flex items-center gap-2">
          <Newspaper className="h-3.5 w-3.5 text-primary" />
          <span className="text-primary">▸</span> {t("nav_news")}
        </h2>
        <Link to="/news" className="text-xs font-mono uppercase tracking-wider text-primary hover:underline inline-flex items-center gap-1">
          {locale === "bn" ? "সব দেখুন" : "Show all"} <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-lg border border-border/60 bg-card/40 overflow-hidden animate-pulse">
              <div className="aspect-video w-full bg-muted/30" />
              <div className="p-3 space-y-2">
                <div className="h-3 bg-muted/40 rounded w-1/3" />
                <div className="h-4 bg-muted/40 rounded w-5/6" />
                <div className="h-4 bg-muted/40 rounded w-2/3" />
              </div>
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-md border border-border/60 bg-card/40 p-6 text-sm text-muted-foreground font-mono">
          {locale === "bn" ? "কোনো খবর পাওয়া যায়নি।" : "No news available."}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {items.map((item) => <CompactNewsCard key={item.id} item={item} locale={locale} />)}
        </div>
      )}
    </section>
  );
}

function CompactNewsCard({ item, locale }: { item: NewsItem; locale: "en" | "bn" }) {
  const ago = timeAgo(item.pubDate, locale);
  return (
    <a
      href={item.link}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex flex-col rounded-lg border border-border/60 bg-card/60 overflow-hidden hover:border-primary/50 hover:bg-card/80 transition-colors"
    >
      {item.image ? (
        <div className="aspect-video w-full overflow-hidden bg-muted/30">
          <img
            src={item.image}
            alt=""
            loading="lazy"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
            onError={(e) => {
              (e.currentTarget.parentElement as HTMLElement).style.display = "none";
            }}
          />
        </div>
      ) : (
        <div className="aspect-video w-full bg-gradient-to-br from-primary/10 via-card to-card flex items-center justify-center">
          <Newspaper className="h-8 w-8 text-primary/30" />
        </div>
      )}
      <div className="p-3 flex flex-col gap-1.5 flex-1">
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider font-mono text-muted-foreground">
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-primary/10 text-primary">
            <Globe className="h-3 w-3" /> {item.lang === "bn" ? "বাং" : "EN"}
          </span>
          <span className="truncate">{item.source}</span>
          <span className="ml-auto shrink-0">{ago}</span>
        </div>
        <h3 className="font-semibold text-sm leading-snug line-clamp-3 group-hover:text-primary transition-colors">
          {item.title}
        </h3>
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
    if (m < 60) return `${m} মি`;
    if (h < 24) return `${h} ঘ`;
    return `${d} দি`;
  }
  if (m < 1) return "now";
  if (m < 60) return `${m}m`;
  if (h < 24) return `${h}h`;
  return `${d}d`;
}