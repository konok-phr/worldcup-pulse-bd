import * as React from "react";
import { translateData, type DataEntity } from "./i18n-data";

export type Locale = "en" | "bn";

type Dict = Record<string, { en: string; bn: string }>;

export const DICT: Dict = {
  brand: { en: "WC26 Hub", bn: "ডব্লিউসি২৬ হাব" },
  tagline: { en: "FIFA World Cup 2026", bn: "ফিফা বিশ্বকাপ ২০২৬" },
  nav_home: { en: "Home", bn: "হোম" },
  nav_live: { en: "Live", bn: "লাইভ" },
  nav_fixtures: { en: "Fixtures", bn: "সূচি" },
  nav_groups: { en: "Groups", bn: "গ্রুপ" },
  nav_knockout: { en: "Knockout", bn: "নকআউট" },
  nav_teams: { en: "Teams", bn: "দল" },
  nav_players: { en: "Players", bn: "খেলোয়াড়" },
  nav_stadiums: { en: "Stadiums", bn: "স্টেডিয়াম" },
  nav_history: { en: "History", bn: "ইতিহাস" },
  nav_records: { en: "Records", bn: "রেকর্ড" },
  nav_search: { en: "Search", bn: "অনুসন্ধান" },
  live_now: { en: "Live Now", bn: "এখন লাইভ" },
  no_live: { en: "No live matches right now", bn: "এই মুহূর্তে কোনো লাইভ ম্যাচ নেই" },
  today: { en: "Today", bn: "আজ" },
  tomorrow: { en: "Tomorrow", bn: "আগামীকাল" },
  upcoming: { en: "Upcoming", bn: "আসন্ন" },
  finished: { en: "Finished", bn: "সমাপ্ত" },
  scheduled: { en: "Scheduled", bn: "নির্ধারিত" },
  vs: { en: "vs", bn: "বনাম" },
  group: { en: "Group", bn: "গ্রুপ" },
  pos: { en: "#", bn: "#" },
  team: { en: "Team", bn: "দল" },
  played: { en: "P", bn: "খ" },
  won: { en: "W", bn: "জ" },
  drawn: { en: "D", bn: "ড্র" },
  lost: { en: "L", bn: "হা" },
  gf: { en: "GF", bn: "গপ" },
  ga: { en: "GA", bn: "গবি" },
  gd: { en: "GD", bn: "গপা" },
  pts: { en: "Pts", bn: "পয়েন্ট" },
  view_all: { en: "View all", bn: "সব দেখুন" },
  countdown_to_kickoff: { en: "Kickoff in", bn: "কিকঅফ" },
  opener: { en: "Tournament opener", bn: "টুর্নামেন্টের উদ্বোধন" },
  final: { en: "Final", bn: "ফাইনাল" },
  stadium: { en: "Stadium", bn: "স্টেডিয়াম" },
  capacity: { en: "Capacity", bn: "ধারণক্ষমতা" },
  city: { en: "City", bn: "শহর" },
  country: { en: "Country", bn: "দেশ" },
  coach: { en: "Coach", bn: "কোচ" },
  ranking: { en: "FIFA Ranking", bn: "ফিফা র‍্যাঙ্কিং" },
  appearances: { en: "WC Appearances", bn: "বিশ্বকাপে অংশগ্রহণ" },
  titles: { en: "Titles", bn: "শিরোপা" },
  best_finish: { en: "Best Finish", bn: "সেরা ফলাফল" },
  winner: { en: "Winner", bn: "চ্যাম্পিয়ন" },
  runner_up: { en: "Runner-up", bn: "রানার্স-আপ" },
  third: { en: "Third", bn: "তৃতীয়" },
  top_scorer: { en: "Top scorer", bn: "শীর্ষ গোলদাতা" },
  golden_ball: { en: "Golden Ball", bn: "গোল্ডেন বল" },
  golden_glove: { en: "Golden Glove", bn: "গোল্ডেন গ্লাভ" },
  search_placeholder: { en: "Search teams, players, stadiums…", bn: "দল, খেলোয়াড়, স্টেডিয়াম খুঁজুন…" },
  results_for: { en: "Results for", bn: "ফলাফল" },
  no_results: { en: "No results found", bn: "কোনো ফলাফল পাওয়া যায়নি" },
  bst: { en: "BST", bn: "বিএসটি" },
  utc: { en: "UTC", bn: "ইউটিসি" },
  matchday: { en: "Matchday", bn: "ম্যাচডে" },
  filter_all: { en: "All", bn: "সব" },
  back: { en: "Back", bn: "ফিরে যান" },
  loading: { en: "Loading…", bn: "লোড হচ্ছে…" },
  error_title: { en: "Something went wrong", bn: "কিছু একটা ভুল হয়েছে" },
  error_retry: { en: "Try again", bn: "আবার চেষ্টা করুন" },
  not_found: { en: "Not found", bn: "পাওয়া যায়নি" },
  squad: { en: "Squad", bn: "স্কোয়াড" },
  fixtures_results: { en: "Fixtures & Results", bn: "সূচি ও ফলাফল" },
  edition: { en: "Edition", bn: "আসর" },
  hosts: { en: "Hosts", bn: "আয়োজক" },
  champions: { en: "Champions", bn: "চ্যাম্পিয়ন" },
  total_goals: { en: "Total goals", bn: "মোট গোল" },
  matches_played: { en: "Matches played", bn: "ম্যাচ অনুষ্ঠিত" },
  teams_count: { en: "Teams", bn: "দল সংখ্যা" },
  about: { en: "The premier hub for FIFA World Cup 2026 — live scores, fixtures, standings, teams, stadiums, history, and records. Bangladesh time (BST) and bilingual.", bn: "ফিফা বিশ্বকাপ ২০২৬-এর শীর্ষ হাব — লাইভ স্কোর, সূচি, পয়েন্ট তালিকা, দল, স্টেডিয়াম, ইতিহাস ও রেকর্ড। বাংলাদেশ সময় (বিএসটি) ও দ্বিভাষিক।" },
  timeline: { en: "Timeline", bn: "টাইমলাইন" },
  no_events: { en: "No events yet.", bn: "এখনো কোনো ঘটনা নেই।" },
  head_to_head: { en: "Head to head", bn: "মুখোমুখি লড়াই" },
  no_h2h: { en: "No prior meetings on record.", bn: "আগের কোনো সাক্ষাৎ নেই।" },
  lineups: { en: "Lineups", bn: "একাদশ" },
  lineups_tba: { en: "Lineups will appear here ~1 hour before kickoff.", bn: "একাদশ কিকঅফের প্রায় ১ ঘন্টা আগে দেখা যাবে।" },
  match_info: { en: "Match info", bn: "ম্যাচের তথ্য" },
  referee: { en: "Referee", bn: "রেফারি" },
  attendance: { en: "Attendance", bn: "দর্শক সংখ্যা" },
  simulator: { en: "Simulator", bn: "সিমুলেটর" },
  simulator_desc: { en: "Predict scores and watch the standings recompute instantly.", bn: "স্কোর ভবিষ্যদ্বাণী করুন এবং সাথে সাথে পয়েন্ট তালিকা দেখুন।" },
  reset: { en: "Reset", bn: "রিসেট" },
  bracket: { en: "Bracket", bn: "ব্র্যাকেট" },
  tbd: { en: "TBD", bn: "টিবিডি" },
  predicted: { en: "Predicted", bn: "ভবিষ্যদ্বাণী" },
  actual: { en: "Actual", bn: "প্রকৃত" },
  days: { en: "Days", bn: "দিন" },
  hours: { en: "Hours", bn: "ঘণ্টা" },
  minutes: { en: "Minutes", bn: "মিনিট" },
  seconds: { en: "Seconds", bn: "সেকেন্ড" },
};

type Ctx = {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (k: keyof typeof DICT) => string;
  tn: (entity: DataEntity, value: string | null | undefined) => string;
  banglaNumerals: boolean;
  setBanglaNumerals: (b: boolean) => void;
};

const I18nContext = React.createContext<Ctx | null>(null);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = React.useState<Locale>("en");
  const [banglaNumerals, setBNState] = React.useState(false);

  React.useEffect(() => {
    const l = localStorage.getItem("wc26.locale") as Locale | null;
    if (l === "en" || l === "bn") setLocaleState(l);
    const b = localStorage.getItem("wc26.bn-numerals");
    if (b === "1") setBNState(true);
  }, []);

  const setLocale = (l: Locale) => {
    setLocaleState(l);
    if (typeof window !== "undefined") localStorage.setItem("wc26.locale", l);
    if (l === "bn") setBanglaNumerals(true);
  };
  const setBanglaNumerals = (b: boolean) => {
    setBNState(b);
    if (typeof window !== "undefined") localStorage.setItem("wc26.bn-numerals", b ? "1" : "0");
  };
  const t = (k: keyof typeof DICT) => DICT[k]?.[locale] ?? String(k);
  const tn = (entity: DataEntity, value: string | null | undefined) =>
    translateData(entity, value, locale);

  return (
    <I18nContext.Provider value={{ locale, setLocale, t, tn, banglaNumerals, setBanglaNumerals }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = React.useContext(I18nContext);
  if (!ctx) {
    // SSR / outside provider fallback
    return {
      locale: "en" as Locale,
      setLocale: () => {},
      t: (k: keyof typeof DICT) => DICT[k]?.en ?? String(k),
      tn: (_e: DataEntity, value: string | null | undefined) => value ?? "",
      banglaNumerals: false,
      setBanglaNumerals: () => {},
    };
  }
  return ctx;
}

const BN_DIGITS = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
export function toBanglaNumerals(input: string | number): string {
  return String(input).replace(/[0-9]/g, (d) => BN_DIGITS[Number(d)]);
}

export function fmtNumber(n: number | string, bn: boolean): string {
  const s = typeof n === "number" ? n.toLocaleString("en-US") : n;
  return bn ? toBanglaNumerals(s) : s;
}