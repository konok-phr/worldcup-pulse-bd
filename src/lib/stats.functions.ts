import { createServerFn } from "@tanstack/react-start";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export type DailyCountry = { day: string; country_code: string | null; count: number };
export type DailyTotal = { day: string; count: number };
export type CountryTotal = { country_code: string | null; count: number };

export const getVisitStats = createServerFn({ method: "GET" }).handler(async () => {
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const { data, error } = await supabaseAdmin
    .from("page_visits")
    .select("visit_date, country_code")
    .gte("visited_at", since)
    .limit(50000);

  if (error) {
    return { totalsByDay: [], totalsByCountry: [], dailyByCountry: [], total: 0 };
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

  return {
    totalsByDay,
    totalsByCountry,
    dailyByCountry,
    total: rows.length,
  };
});