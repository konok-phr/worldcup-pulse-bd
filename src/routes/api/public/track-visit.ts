import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

function pickHeader(request: Request, names: string[]): string | null {
  for (const n of names) {
    const v = request.headers.get(n);
    if (v) return v.split(",")[0].trim();
  }
  return null;
}

async function lookupCountryByIp(ip: string | null): Promise<string | null> {
  if (!ip) return null;
  // Skip private / loopback
  if (/^(10\.|127\.|192\.168\.|172\.(1[6-9]|2\d|3[0-1])\.|::1|fe80:)/i.test(ip)) return null;
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 1500);
    const res = await fetch(`https://ipapi.co/${encodeURIComponent(ip)}/country/`, {
      signal: ctrl.signal,
      headers: { "User-Agent": "wc26-hub/1.0" },
    });
    clearTimeout(t);
    if (!res.ok) return null;
    const txt = (await res.text()).trim().toUpperCase();
    if (/^[A-Z]{2}$/.test(txt)) return txt;
    return null;
  } catch {
    return null;
  }
}

export const Route = createFileRoute("/api/public/track-visit")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = (await request.json().catch(() => ({}))) as {
            path?: string;
            session_id?: string;
          };
          let country_code =
            pickHeader(request, [
              "cf-ipcountry",
              "x-vercel-ip-country",
              "x-country-code",
            ]) || null;
          if (country_code && (country_code === "XX" || country_code === "T1")) {
            country_code = null; // Cloudflare placeholders for Tor / unknown
          }
          if (!country_code) {
            const ip = pickHeader(request, [
              "cf-connecting-ip",
              "x-real-ip",
              "x-forwarded-for",
            ]);
            country_code = await lookupCountryByIp(ip);
          }
          const user_agent = request.headers.get("user-agent")?.slice(0, 255) || null;
          const path = typeof body?.path === "string" ? body.path.slice(0, 255) : null;
          const session_id =
            typeof body?.session_id === "string" ? body.session_id.slice(0, 64) : null;

          await supabaseAdmin.from("page_visits").insert({
            country_code,
            country: country_code,
            path,
            user_agent,
            session_id,
          });

          // best-effort cleanup (older than 30 days)
          if (Math.random() < 0.05) {
            await supabaseAdmin.rpc("cleanup_old_page_visits");
          }

          return new Response(JSON.stringify({ ok: true }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          });
        } catch (err) {
          console.error("track-visit error", err);
          return new Response(JSON.stringify({ ok: false }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          });
        }
      },
    },
  },
});