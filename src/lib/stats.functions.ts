import { createServerFn } from "@tanstack/react-start";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export type DailyCountry = { day: string; country_code: string | null; count: number };
export type DailyTotal = { day: string; count: number };
export type CountryTotal = { country_code: string | null; count: number };
export type OnlinePage = { path: string; count: number };
export type OnlineCountry = { country_code: string | null; count: number };

export const getVisitStats = createServerFn({ method: "GET" }).handler(async () => {
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const { data, error } = await supabaseAdmin
    .from("page_visits")
    .select("visit_date, country_code")
    .gte("visited_at", since)
    .limit(50000);

  if (error) {
    return {
      totalsByDay: [],
      totalsByCountry: [],
      dailyByCountry: [],
      total: 0,
      online: { total: 0, byPage: [], byCountry: [] },
    };
  }

  const rows = data ?? [];
  const byDay = new Map<string, number>();
  const byCountry = new Map<string, number>();
  const byDayCountry = new Map<string, number>();

  for (const r of rows) {
    const day = String(r.visit_date);
    const cc = (r.country_code ?? "??") as string;
    byDay.set(day, (byDay.get(day) ?? 0) + 1);
    byCountry.set(cc, (byCountry.get(cc) ?? 0) + 1);
    const k = `${day}__${cc}`;
    byDayCountry.set(k, (byDayCountry.get(k) ?? 0) + 1);
  }

  const totalsByDay: DailyTotal[] = Array.from(byDay.entries())
    .map(([day, count]) => ({ day, count }))
    .sort((a, b) => a.day.localeCompare(b.day));

  const totalsByCountry: CountryTotal[] = Array.from(byCountry.entries())
    .map(([country_code, count]) => ({ country_code, count }))
    .sort((a, b) => b.count - a.count);

  const dailyByCountry: DailyCountry[] = Array.from(byDayCountry.entries())
    .map(([k, count]) => {
      const [day, country_code] = k.split("__");
      return { day, country_code, count };
    })
    .sort((a, b) => (a.day === b.day ? b.count - a.count : a.day.localeCompare(b.day)));

  // --- Online presence: distinct sessions active in the last 5 minutes ---
  const onlineSince = new Date(Date.now() - 5 * 60 * 1000).toISOString();
  const { data: liveRows } = await supabaseAdmin
    .from("page_visits")
    .select("session_id, path, country_code, visited_at")
    .gte("visited_at", onlineSince)
    .order("visited_at", { ascending: false })
    .limit(5000);

  const latestBySession = new Map<
    string,
    { path: string | null; country_code: string | null }
  >();
  for (const r of liveRows ?? []) {
    const sid = (r.session_id ?? "") as string;
    if (!sid) continue;
    if (latestBySession.has(sid)) continue; // first = most recent due to order
    latestBySession.set(sid, {
      path: (r.path as string | null) ?? null,
      country_code: (r.country_code as string | null) ?? null,
    });
  }

  const pageMap = new Map<string, number>();
  const ccMap = new Map<string, number>();
  for (const v of latestBySession.values()) {
    const p = v.path ?? "(unknown)";
    pageMap.set(p, (pageMap.get(p) ?? 0) + 1);
    const cc = v.country_code ?? "??";
    ccMap.set(cc, (ccMap.get(cc) ?? 0) + 1);
  }

  const byPage: OnlinePage[] = Array.from(pageMap.entries())
    .map(([path, count]) => ({ path, count }))
    .sort((a, b) => b.count - a.count);
  const onlineByCountry: OnlineCountry[] = Array.from(ccMap.entries())
    .map(([country_code, count]) => ({
      country_code: country_code === "??" ? null : country_code,
      count,
    }))
    .sort((a, b) => b.count - a.count);

  return {
    totalsByDay,
    totalsByCountry,
    dailyByCountry,
    total: rows.length,
    online: {
      total: latestBySession.size,
      byPage,
      byCountry: onlineByCountry,
    },
  };
});