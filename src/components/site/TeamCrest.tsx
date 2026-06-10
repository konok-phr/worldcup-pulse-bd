import { cn } from "@/lib/utils";

// FIFA 3-letter code → ISO-3166 alpha-2 fallback (for teams without flag_emoji).
const TLA_TO_ISO2: Record<string, string> = {
  ALG: "dz", ARG: "ar", AUS: "au", AUT: "at", BEL: "be", BIH: "ba", BRA: "br",
  CAN: "ca", CHI: "cl", CIV: "ci", CMR: "cm", COD: "cd", COL: "co", CPV: "cv",
  CRC: "cr", CRO: "hr", CUW: "cw", CZE: "cz", DEN: "dk", ECU: "ec", EGY: "eg",
  ENG: "gb-eng", ESP: "es", FRA: "fr", GER: "de", GHA: "gh", HAI: "ht",
  IRN: "ir", IRQ: "iq", ITA: "it", JOR: "jo", JPN: "jp", KOR: "kr", KSA: "sa",
  MAR: "ma", MEX: "mx", NED: "nl", NGA: "ng", NOR: "no", NZL: "nz", PAN: "pa",
  PAR: "py", PER: "pe", POL: "pl", POR: "pt", QAT: "qa", RSA: "za",
  SCO: "gb-sct", SEN: "sn", SUI: "ch", SVK: "sk", SWE: "se", TUN: "tn",
  TUR: "tr", URU: "uy", URY: "uy", USA: "us", UZB: "uz", VEN: "ve",
  WAL: "gb-wls", NIR: "gb-nir", IRL: "ie", RUS: "ru", UKR: "ua", SRB: "rs",
  GRE: "gr", ROU: "ro", HUN: "hu", BUL: "bg", FIN: "fi", ISL: "is", ALB: "al",
  MKD: "mk", MNE: "me", GEO: "ge", ARM: "am", AZE: "az", ISR: "il", LBN: "lb",
  SYR: "sy", PLE: "ps", KUW: "kw", BHR: "bh", OMA: "om", UAE: "ae", YEM: "ye",
  CHN: "cn", PRK: "kp", THA: "th", VIE: "vn", IDN: "id", MAS: "my", SGP: "sg",
  PHI: "ph", IND: "in", PAK: "pk", BAN: "bd", SRI: "lk", NEP: "np",
  HKG: "hk", TPE: "tw", MGL: "mn",
  TOG: "tg", BEN: "bj", BFA: "bf", MLI: "ml", NIG: "ne", GUI: "gn",
  GAM: "gm", SLE: "sl", LBR: "lr", LBY: "ly", ANG: "ao", ZAM: "zm",
  ZIM: "zw", MOZ: "mz", BOT: "bw", NAM: "na", LES: "ls", SWZ: "sz",
  MAD: "mg", MRI: "mu", SEY: "sc", COM: "km", DJI: "dj", SOM: "so",
  KEN: "ke", UGA: "ug", TAN: "tz", RWA: "rw", BDI: "bi", SDN: "sd", SSD: "ss",
  ETH: "et", ERI: "er", GNB: "gw", EQG: "gq", GAB: "ga", CTA: "cf", CHA: "td",
  CGO: "cg", STP: "st",
  BOL: "bo", JAM: "jm", TRI: "tt", CUB: "cu", DOM: "do", GUA: "gt", HON: "hn",
  ESA: "sv", NCA: "ni", BLZ: "bz", BAR: "bb", GUY: "gy", SUR: "sr",
  GRN: "gd", LCA: "lc", VIN: "vc", ATG: "ag", DMA: "dm", PUR: "pr", AIA: "ai",
  BER: "bm", CAY: "ky", TCA: "tc", BVI: "vg", VIR: "vi", SKN: "kn", SMN: "sx",
  ARU: "aw", MSR: "ms", GLP: "gp",
  SOL: "sb", FIJ: "fj", VAN: "vu", SAM: "ws", TGA: "to", TAH: "pf", PNG: "pg",
  COK: "ck", NCL: "nc", ASA: "as", GUM: "gu",
  EST: "ee", LAT: "lv", LTU: "lt", BLR: "by", MDA: "md", SVN: "si", LUX: "lu",
  CYP: "cy", MLT: "mt", AND: "ad", LIE: "li", SMR: "sm", GIB: "gi", FRO: "fo",
  KAZ: "kz", KGZ: "kg", TJK: "tj", TKM: "tm", AFG: "af", MYA: "mm", CAM: "kh",
  LAO: "la", BHU: "bt", BRU: "bn", MDV: "mv", TLS: "tl", MAC: "mo",
};

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
  const iso2 = emojiToIso2(emoji) ?? (code ? TLA_TO_ISO2[code.toUpperCase()] ?? null : null);
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