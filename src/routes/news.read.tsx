import { createFileRoute, Link } from "@tanstack/react-router";
import { ExternalLink, ArrowLeft } from "lucide-react";
import { z } from "zod";
import { buildHead } from "@/lib/seo";
import { useI18n } from "@/lib/i18n";

const searchSchema = z.object({
  url: z.string().url(),
  title: z.string().optional(),
  source: z.string().optional(),
});

export const Route = createFileRoute("/news/read")({
  validateSearch: searchSchema,
  head: ({ match }) => ({
    ...buildHead({
      title: (match.search as { title?: string }).title
        ? `${(match.search as { title?: string }).title} | WC26 Hub`
        : "News | WC26 Hub",
      description: "Read news on WC26 Hub",
      path: "/news/read",
    }),
  }),
  component: ReaderPage,
});

function ReaderPage() {
  const { url, title, source } = Route.useSearch();
  const { locale } = useI18n();

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      <div className="border-b border-border/60 bg-card/60 px-4 py-3 flex items-center gap-3">
        <Link
          to="/news"
          className="inline-flex items-center gap-1 text-xs font-mono uppercase tracking-wider text-muted-foreground hover:text-primary transition-colors shrink-0"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          {locale === "bn" ? "ফিরে যান" : "Back"}
        </Link>
        <div className="flex-1 min-w-0">
          {title && <p className="text-sm font-semibold truncate">{title}</p>}
          {source && (
            <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground truncate">
              {source}
            </p>
          )}
        </div>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs font-mono uppercase tracking-wider text-primary hover:underline shrink-0"
        >
          {locale === "bn" ? "মূল সাইটে খুলুন" : "Open original"}
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>
      <div className="flex-1 relative bg-muted/20">
        <iframe
          src={url}
          title={title || "News"}
          className="absolute inset-0 w-full h-full border-0"
          sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
          referrerPolicy="no-referrer"
        />
        <div className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 text-[10px] font-mono uppercase tracking-wider text-muted-foreground bg-card/90 border border-border/60 rounded px-2 py-1">
          {locale === "bn"
            ? "খবরটি না দেখালে \"মূল সাইটে খুলুন\" চাপুন"
            : "If the article doesn't load, tap \"Open original\""}
        </div>
      </div>
    </div>
  );
}