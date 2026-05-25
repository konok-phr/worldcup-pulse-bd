import { toBanglaNumerals } from "./i18n";

const BST_TZ = "Asia/Dhaka";

export type TZ = "BST" | "UTC";

export function formatKickoff(utc: string | null | undefined, tz: TZ = "BST", locale: "en" | "bn" = "en"): string {
  if (!utc) return locale === "bn" ? "টিবিডি" : "TBD";
  const d = new Date(utc);
  const fmt = new Intl.DateTimeFormat("en-GB", {
    timeZone: tz === "BST" ? BST_TZ : "UTC",
    weekday: "short",
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  let s = fmt.format(d) + " " + tz;
  if (locale === "bn") s = toBanglaNumerals(s);
  return s;
}

export function formatTimeOnly(utc: string | null | undefined, tz: TZ = "BST", locale: "en" | "bn" = "en"): string {
  if (!utc) return locale === "bn" ? "টিবিডি" : "TBD";
  const d = new Date(utc);
  const s = new Intl.DateTimeFormat("en-GB", {
    timeZone: tz === "BST" ? BST_TZ : "UTC",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(d);
  return locale === "bn" ? toBanglaNumerals(s) : s;
}

export function formatDateLabel(utc: string | null | undefined, tz: TZ = "BST", locale: "en" | "bn" = "en"): string {
  if (!utc) return "";
  const d = new Date(utc);
  const s = new Intl.DateTimeFormat("en-GB", {
    timeZone: tz === "BST" ? BST_TZ : "UTC",
    weekday: "long",
    day: "2-digit",
    month: "long",
  }).format(d);
  return locale === "bn" ? toBanglaNumerals(s) : s;
}

export function dateKeyBST(utc: string | null | undefined): string {
  if (!utc) return "tbd";
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: BST_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(utc));
}

export function countdownTo(utc: string): { days: number; hours: number; minutes: number; seconds: number; past: boolean } {
  const ms = new Date(utc).getTime() - Date.now();
  const past = ms <= 0;
  const abs = Math.max(0, ms);
  return {
    days: Math.floor(abs / 86400000),
    hours: Math.floor((abs % 86400000) / 3600000),
    minutes: Math.floor((abs % 3600000) / 60000),
    seconds: Math.floor((abs % 60000) / 1000),
    past,
  };
}