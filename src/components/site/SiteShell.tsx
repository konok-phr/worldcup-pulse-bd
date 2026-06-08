import * as React from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { useI18n } from "@/lib/i18n";
import { LiveScoreRail } from "./LiveScoreRail";
import { cn } from "@/lib/utils";
import { Menu, Search as SearchIcon, X, Facebook, Linkedin } from "lucide-react";
import wc26Logo from "@/assets/wc26-logo.png";
import { ThemeToggle } from "./ThemeToggle";

const NAV = [
  { to: "/", key: "nav_home" as const },
  { to: "/live", key: "nav_live" as const },
  { to: "/fixtures", key: "nav_fixtures" as const },
  { to: "/groups", key: "nav_groups" as const },
  { to: "/knockout", key: "nav_knockout" as const },
  { to: "/simulator", key: "simulator" as const },
  { to: "/teams", key: "nav_teams" as const },
  { to: "/stadiums", key: "nav_stadiums" as const },
  { to: "/history", key: "nav_history" as const },
  { to: "/records", key: "nav_records" as const },
  { to: "/news", key: "nav_news" as const },
];

export function SiteShell({ children }: { children: React.ReactNode }) {
  const { t } = useI18n();
  const [openMobile, setOpenMobile] = React.useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  React.useEffect(() => {
    setOpenMobile(false);
  }, [pathname]);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* Top broadcast bar */}
      <div className="h-7 bg-primary/10 border-b border-primary/20 text-primary text-[10px] uppercase tracking-[0.2em] font-mono flex items-center justify-center px-3">
        <span className="truncate">★ FIFA World Cup 2026 · USA · Canada · Mexico · June 11 – July 19 · Bangladesh Time (BST)</span>
      </div>

      <LiveScoreRail />

      <header className="border-b border-border/60 bg-background/95 backdrop-blur sticky top-0 z-40">
        <div className="mx-auto max-w-7xl px-4 h-14 flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2 shrink-0" aria-label="WC26 Home">
            <img
              src={wc26Logo}
              alt="WC26 — FIFA World Cup 2026 logo"
              width={36}
              height={36}
              className="h-9 w-9 object-contain drop-shadow-[0_0_8px_rgba(var(--primary-rgb,59_130_246)/0.35)]"
            />
            <span className="font-mono font-bold tracking-tight text-sm hidden sm:inline">
              {t("brand")}
            </span>
          </Link>

          <nav className="hidden lg:flex items-center gap-1 ml-2 font-mono text-xs uppercase tracking-wider">
            {NAV.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                className="px-2.5 py-1.5 rounded hover:bg-secondary/60 hover:text-foreground text-muted-foreground transition-colors"
                activeProps={{ className: "px-2.5 py-1.5 rounded bg-secondary text-primary" }}
                activeOptions={{ exact: n.to === "/" }}
              >
                {t(n.key)}
              </Link>
            ))}
          </nav>

          <div className="flex-1" />

          <Link
            to="/search"
            className="hidden sm:inline-flex items-center gap-2 px-2 py-1 rounded border border-border/60 hover:border-primary/60 hover:text-primary text-xs font-mono text-muted-foreground"
          >
            <SearchIcon className="h-3.5 w-3.5" />
            <span>{t("nav_search")}</span>
          </Link>

          <ThemeToggle />

          <button
            className="lg:hidden inline-flex items-center justify-center h-9 w-9 rounded border border-border/60"
            onClick={() => setOpenMobile(!openMobile)}
            aria-label="Open menu"
          >
            {openMobile ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>

        {openMobile && (
          <nav className="lg:hidden border-t border-border/60 bg-background">
            <div className="px-4 py-2 flex flex-col font-mono text-sm uppercase tracking-wider">
              {NAV.map((n) => (
                <Link
                  key={n.to}
                  to={n.to}
                  className="py-2 px-2 text-muted-foreground hover:text-primary"
                  activeProps={{ className: "py-2 px-2 text-primary" }}
                  activeOptions={{ exact: n.to === "/" }}
                >
                  {t(n.key)}
                </Link>
              ))}
              <Link to="/search" className="py-2 px-2 text-muted-foreground">
                {t("nav_search")}
              </Link>
            </div>
          </nav>
        )}
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-border/60 mt-12">
        <div className="mx-auto max-w-7xl px-4 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <img
              src={wc26Logo}
              alt="WC26"
              width={28}
              height={28}
              className="h-7 w-7 object-contain drop-shadow-[0_0_6px_rgba(var(--primary-rgb,59_130_246)/0.3)]"
            />
            <span className="font-mono text-xs font-bold tracking-tight text-foreground">{t("brand")}</span>
          </div>
          <div className="flex items-center gap-2 font-mono text-xs text-muted-foreground/80">
            <span>Made with care by</span>
            <span className="text-foreground/90 font-semibold">Khaled Saifullah Sadi</span>
            <span className="mx-1">·</span>
            <a
              href="https://facebook.com/mdsadi100"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary transition-colors"
              aria-label="Facebook"
            >
              <Facebook className="h-4 w-4" />
            </a>
            <a
              href="https://linkedin.com/in/kssadi"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary transition-colors"
              aria-label="LinkedIn"
            >
              <Linkedin className="h-4 w-4" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export { cn };