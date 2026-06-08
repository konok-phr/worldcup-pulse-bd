import { useEffect, useRef } from "react";
import { useRouterState } from "@tanstack/react-router";

export function VisitTracker() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const last = useRef<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (pathname.startsWith("/api/")) return;
    if (last.current === pathname) return;
    last.current = pathname;
    const ctrl = new AbortController();
    fetch("/api/public/track-visit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: pathname }),
      signal: ctrl.signal,
      keepalive: true,
    }).catch(() => {});
    return () => ctrl.abort();
  }, [pathname]);

  return null;
}