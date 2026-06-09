import { useEffect, useRef } from "react";
import { useRouterState } from "@tanstack/react-router";

function getSessionId(): string {
  try {
    const k = "wc26_sid";
    let v = sessionStorage.getItem(k);
    if (!v) {
      v =
        (crypto.randomUUID && crypto.randomUUID()) ||
        `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      sessionStorage.setItem(k, v);
    }
    return v;
  } catch {
    return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }
}

function ping(path: string, sessionId: string) {
  try {
    fetch("/api/public/track-visit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path, session_id: sessionId }),
      keepalive: true,
    }).catch(() => {});
  } catch {}
}

export function VisitTracker() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const last = useRef<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (pathname.startsWith("/api/")) return;
    const sid = getSessionId();
    if (last.current !== pathname) {
      last.current = pathname;
      ping(pathname, sid);
    }
    // Heartbeat every 60s so we know this user is still online on this page.
    const iv = window.setInterval(() => ping(pathname, sid), 60_000);
    return () => window.clearInterval(iv);
  }, [pathname]);

  return null;
}