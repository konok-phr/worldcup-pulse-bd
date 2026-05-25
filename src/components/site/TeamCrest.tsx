import { cn } from "@/lib/utils";

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
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-sm bg-secondary/40 border border-border/60 font-mono font-semibold text-[10px] uppercase tracking-wider text-muted-foreground overflow-hidden",
        className,
      )}
      style={{ width: size, height: size, fontSize: Math.max(9, size * 0.35) }}
      aria-hidden
    >
      {emoji ? (
        <span style={{ fontSize: size * 0.7, lineHeight: 1 }}>{emoji}</span>
      ) : (
        code ?? "?"
      )}
    </span>
  );
}