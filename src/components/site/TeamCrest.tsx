import { cn } from "@/lib/utils";

// Convert a regional-indicator flag emoji (🇺🇸) to its ISO-3166 alpha-2 code (us).
function emojiToIso2(emoji?: string | null): string | null {
  if (!emoji) return null;
  // Subdivision flags (England, Scotland, Wales) use tag sequences.
  if (emoji.includes("\u{E0067}\u{E0062}\u{E0065}\u{E006E}\u{E0067}")) return "gb-eng";
  if (emoji.includes("\u{E0067}\u{E0062}\u{E0073}\u{E0063}\u{E0074}")) return "gb-sct";
  if (emoji.includes("\u{E0067}\u{E0062}\u{E0077}\u{E006C}\u{E0073}")) return "gb-wls";
  const cps = Array.from(emoji).map((ch) => ch.codePointAt(0) ?? 0);
  if (cps.length < 2) return null;
  const base = 0x1f1e6;
  const a = cps[0] - base;
  const b = cps[1] - base;
  if (a < 0 || a > 25 || b < 0 || b > 25) return null;
  return String.fromCharCode(65 + a, 65 + b).toLowerCase();
}

export function TeamCrest({
  code,
  emoji,
  size = 24,
  className,
}: {
  code?: string | null;
  emoji?: string | null;
  size?: number;
  className?: string;
}) {
  const iso2 = emojiToIso2(emoji);
  const flagW = size <= 24 ? 40 : size <= 48 ? 80 : 160;
  const flagSrc = iso2 ? `https://flagcdn.com/w${flagW}/${iso2}.png` : null;
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-sm bg-secondary/40 border border-border/60 font-mono font-semibold text-[10px] uppercase tracking-wider text-muted-foreground overflow-hidden shrink-0",
        className,
      )}
      style={{ width: size, height: size, fontSize: Math.max(9, size * 0.35) }}
      aria-hidden
    >
      {flagSrc ? (
        <img
          src={flagSrc}
          alt=""
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover"
        />
      ) : emoji ? (
        <span style={{ fontSize: size * 0.7, lineHeight: 1 }}>{emoji}</span>
      ) : (
        code ?? "?"
      )}
    </span>
  );
}