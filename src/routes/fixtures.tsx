import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import * as React from "react";
import { getAllFixtures, getAllTeams } from "@/lib/data.functions";
import { MatchCard, type MatchRow } from "@/components/site/MatchCard";
import { dateKeyBST, formatDateLabel } from "@/lib/time";
import { useI18n } from "@/lib/i18n";
import { buildHead } from "@/lib/seo";
import { cn } from "@/lib/utils";
import { Calendar as CalendarIcon, Search, Clock, RotateCcw, X } from "lucide-react";
import { translateData } from "@/lib/i18n-data";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";

const fixturesQO = queryOptions({ queryKey: ["fixtures"], queryFn: () => getAllFixtures(), staleTime: 300_000 });
const teamsQO = queryOptions({ queryKey: ["teams-all"], queryFn: () => getAllTeams(), staleTime: 600_000 });

export const Route = createFileRoute("/fixtures")({
  head: () => ({ ...buildHead({ title: "Fixtures — FIFA World Cup 2026 (BST) | WC26 Hub", description: "Complete FIFA World Cup 2026 fixtures and schedule in Bangladesh time (BST).", path: "/fixtures" }) }),
  loader: ({ context }) => Promise.all([context.queryClient.ensureQueryData(fixturesQO), context.queryClient.ensureQueryData(teamsQO)]),
  component: FixturesPage,
});

function FixturesPage() {
  const { t, locale } = useI18n();
  const { data: fixtures } = useSuspenseQuery(fixturesQO);
  const { data: teams } = useSuspenseQuery(teamsQO);
  const emojiMap = Object.fromEntries(teams.map((tm) => [tm.code, tm.flag_emoji]));
  
  const [stage, setStage] = React.useState<string>("all");
  const [searchTerm, setSearchTerm] = React.useState<string>("");
  const [selectedDate, setSelectedDate] = React.useState<string>("all");
  const [onlyToday, setOnlyToday] = React.useState<boolean>(false);
  const [popoverOpen, setPopoverOpen] = React.useState<boolean>(false);

  const todayBST = React.useMemo(() => {
    return new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Dhaka",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date());
  }, []);

  const stages = React.useMemo(() => ["all", ...Array.from(new Set(fixtures.map((f) => f.stage)))], [fixtures]);

  const filtered = React.useMemo(() => {
    return fixtures.filter((f) => {
      // 1. Stage filter
      if (stage !== "all" && f.stage !== stage) return false;
      
      const dateKey = f.kickoff_utc ? dateKeyBST(f.kickoff_utc) : "tbd";
      
      // 2. Date filter
      if (selectedDate !== "all" && dateKey !== selectedDate) return false;
      
      // 3. Today's matches filter
      if (onlyToday && dateKey !== todayBST) return false;
      
      // 4. Team/Country search filter
      if (searchTerm.trim() !== "") {
        const query = searchTerm.toLowerCase().trim();
        const homeNameEn = (f.home_team_name || "").toLowerCase();
        const awayNameEn = (f.away_team_name || "").toLowerCase();
        const homeNameBn = translateData("team", f.home_team_name, "bn").toLowerCase();
        const awayNameBn = translateData("team", f.away_team_name, "bn").toLowerCase();
        const homeCode = (f.home_team_code || "").toLowerCase();
        const awayCode = (f.away_team_code || "").toLowerCase();
        
        if (
          !homeNameEn.includes(query) &&
          !awayNameEn.includes(query) &&
          !homeNameBn.includes(query) &&
          !awayNameBn.includes(query) &&
          !homeCode.includes(query) &&
          !awayCode.includes(query)
        ) {
          return false;
        }
      }
      
      return true;
    });
  }, [fixtures, stage, selectedDate, onlyToday, searchTerm, todayBST]);

  const grouped = React.useMemo(() => {
    const map = new Map<string, MatchRow[]>();
    for (const f of filtered) {
      const k = dateKeyBST(f.kickoff_utc);
      if (!map.has(k)) map.set(k, []);
      map.get(k)!.push(f as MatchRow);
    }
    return Array.from(map.entries());
  }, [filtered]);

  const handleSelectDate = (date: Date | undefined) => {
    if (!date) {
      setSelectedDate("all");
    } else {
      const dateStr = new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Dhaka",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).format(date);
      setSelectedDate(dateStr);
    }
  };

  const handleResetFilters = () => {
    setStage("all");
    setSearchTerm("");
    setSelectedDate("all");
    setOnlyToday(false);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <header className="mb-5">
        <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-primary mb-1">▸ {t("nav_fixtures")}</div>
        <h1 className="text-2xl font-bold">Fixtures & Schedule</h1>
        <p className="text-sm text-muted-foreground mt-1">All times in Bangladesh time (BST, UTC+6).</p>
      </header>

      {/* Premium Filter Panel */}
      <div className="bg-card/30 border border-border/40 rounded-xl p-4 mb-6 backdrop-blur-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Team Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-primary/85 stroke-[2.5]" />
            <input
              type="text"
              placeholder={t("filter_search_teams")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-10 bg-background border border-border/60 rounded-lg pl-9 pr-8 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Date Selector Popover */}
          <div className="relative">
            <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full h-10 justify-start text-left font-normal border-border/60 hover:bg-accent/50 cursor-pointer px-3 py-2 rounded-lg text-sm transition-all pr-8 relative",
                    selectedDate !== "all" && "text-primary border-primary/45 bg-primary/5 font-semibold"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4.5 w-4.5 text-primary/85 stroke-[2.5]" />
                  {selectedDate === "all" ? (
                    <span>{t("filter_all_dates")}</span>
                  ) : (
                    <span>{formatDateLabel(`${selectedDate}T12:00:00Z`, "BST", locale)}</span>
                  )}
                  {selectedDate !== "all" && (
                    <span
                      role="button"
                      tabIndex={0}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setSelectedDate("all");
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          e.stopPropagation();
                          setSelectedDate("all");
                        }
                      }}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer z-10 p-0.5 rounded hover:bg-accent"
                    >
                      <X className="h-4 w-4" />
                    </span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate !== "all" ? new Date(`${selectedDate}T12:00:00Z`) : undefined}
                  onSelect={(date) => {
                    handleSelectDate(date);
                    setPopoverOpen(false);
                  }}
                  defaultMonth={new Date("2026-06-11")}
                  className="rounded-md border border-border/40"
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Today & Reset Action Row */}
          <div className="flex gap-2">
            <button
              onClick={() => setOnlyToday(!onlyToday)}
              className={cn(
                "flex-1 h-10 flex items-center justify-center gap-2 px-4 rounded-lg text-sm font-semibold border transition-all cursor-pointer",
                onlyToday
                  ? "bg-primary/10 border-primary text-primary"
                  : "bg-background border-border/60 text-muted-foreground hover:text-foreground hover:border-border"
              )}
            >
              <Clock className={cn("h-4.5 w-4.5 stroke-[2.5]", onlyToday ? "text-primary" : "text-primary/85")} />
              {t("filter_today")}
            </button>

            {(stage !== "all" || searchTerm !== "" || selectedDate !== "all" || onlyToday) && (
              <button
                onClick={handleResetFilters}
                className="h-10 flex items-center justify-center gap-2 px-4 rounded-lg text-sm font-semibold bg-secondary border border-border/60 text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-all cursor-pointer"
                title="Reset all filters"
              >
                <RotateCcw className="h-4.5 w-4.5 text-primary/85 stroke-[2.5]" />
                <span>{t("reset")}</span>
              </button>
            )}
          </div>
        </div>

        {/* Stage Filter Row */}
        <div className="flex flex-col gap-2 pt-2 border-t border-border/30">
          <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
            {t("filter_by_stage")}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {stages.map((s) => (
              <button
                key={s}
                onClick={() => setStage(s)}
                className={cn(
                  "px-3 py-1 rounded-full text-[11px] font-sans font-medium uppercase tracking-wider border transition-all cursor-pointer",
                  stage === s
                    ? "border-primary bg-primary/15 text-primary font-semibold"
                    : "border-border/60 bg-background/50 text-muted-foreground hover:text-foreground hover:border-border"
                )}
              >
                {s === "all" ? t("filter_all") : s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {grouped.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-border/60 rounded-xl bg-card/10">
          <p className="text-muted-foreground text-sm font-sans">{t("no_filtered_matches")}</p>
          {(stage !== "all" || searchTerm !== "" || selectedDate !== "all" || onlyToday) && (
            <button
              onClick={handleResetFilters}
              className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/95 transition-all cursor-pointer"
            >
              <RotateCcw className="h-4 w-4" />
              {t("reset")}
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {grouped.map(([day, list]) => (
            <section key={day}>
              <h2 className="text-xs uppercase tracking-[0.2em] font-mono text-muted-foreground mb-2">
                <span className="text-primary">◆</span>{" "}
                {day === "tbd" ? "TBD" : formatDateLabel(list[0]?.kickoff_utc, "BST", locale)}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {list.map((m) => (
                  <MatchCard key={m.id} match={m} emojiMap={emojiMap} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}