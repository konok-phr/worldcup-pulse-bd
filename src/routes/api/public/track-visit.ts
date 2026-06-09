import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const Route = createFileRoute("/api/public/track-visit")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = (await request.json().catch(() => ({}))) as {
            path?: string;
            session_id?: string;
          };
          const country_code = request.headers.get("cf-ipcountry") || null;
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