import { createServerFn } from "@tanstack/react-start";
import { setResponseHeader } from "@tanstack/react-start/server";

export type NewsItem = {
  id: string;
  title: string;
  link: string;
  source: string;
  lang: "en" | "bn";
  pubDate: string; // ISO
  description: string;
  image: string | null;
};

type Feed = { name: string; url: string; lang: "en" | "bn" };

const FEEDS: Feed[] = [
  // English
  { name: "BBC Football", url: "https://feeds.bbci.co.uk/sport/football/rss.xml", lang: "en" },
  { name: "Goal.com", url: "https://www.goal.com/feeds/news?fmt=rss", lang: "en" },
  { name: "Sky Sports Football", url: "https://www.skysports.com/rss/12040", lang: "en" },
  { name: "The Daily Star Sports", url: "https://www.thedailystar.net/sports/rss.xml", lang: "en" },
  { name: "TBS Sports", url: "https://www.tbsnews.net/sports/rss.xml", lang: "en" },
  { name: "Prothom Alo English", url: "https://en.prothomalo.com/feed", lang: "en" },
  // Bangla
  { name: "Prothom Alo", url: "https://www.prothomalo.com/feed", lang: "bn" },
  { name: "Jago News Sports", url: "https://www.jagonews24.com/rss/sports.xml", lang: "bn" },
  { name: "Jago News", url: "https://www.jagonews24.com/rss/rss.xml", lang: "bn" },
  { name: "Bangladesh Pratidin", url: "https://www.bd-pratidin.com/rss.xml", lang: "bn" },
];

// Keywords to identify football / World Cup news
const KEYWORDS = [
  // English
  "world cup", "fifa", "world-cup", "worldcup", "2026", "football", "soccer",
  "messi", "ronaldo", "neymar", "mbappe", "haaland", "vinicius",
  "argentina", "brazil", "france", "germany", "spain", "england", "portugal",
  "premier league", "la liga", "champions league", "uefa", "concacaf", "conmebol",
  "bundesliga", "serie a", "ligue 1", "transfer", "matchday",
  // Bangla
  "বিশ্বকাপ", "ফিফা", "২০২৬", "ফুটবল", "ফুটবলার",
  "মেসি", "রোনালদো", "নেইমার", "এমবাপে", "হালান্ড", "ভিনিসিয়ুস",
  "ব্রাজিল", "আর্জেন্টিনা", "ফ্রান্স", "জার্মানি", "স্পেন", "ইংল্যান্ড", "পর্তুগাল",
  "প্রিমিয়ার লিগ", "লা লিগা", "চ্যাম্পিয়নস লিগ", "উয়েফা", "কনমেবল",
  "বুন্দেসলিগা", "বার্সেলোনা", "রিয়াল মাদ্রিদ", "ম্যানচেস্টার", "লিভারপুল",
  "গোল", "ম্যাচ", "ক্লাব", "কোচ", "লিগ", "টুর্নামেন্ট", "বাফুফে", "হামজা",
];

function decodeEntities(s: string): string {
  return s
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, n) => String.fromCharCode(parseInt(n, 16)));
}

function stripHtml(s: string): string {
  return decodeEntities(s.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim());
}

function pick(block: string, tag: string): string {
  const re = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i");
  const m = block.match(re);
  return m ? decodeEntities(m[1]).trim() : "";
}

function findImage(block: string): string | null {
  const enclosure = block.match(/<enclosure[^>]*url=["']([^"']+\.(?:jpg|jpeg|png|webp)[^"']*)["']/i);
  if (enclosure) return enclosure[1];
  const mediaContent = block.match(/<media:content[^>]*url=["']([^"']+)["']/i);
  if (mediaContent) return mediaContent[1];
  const mediaThumb = block.match(/<media:thumbnail[^>]*url=["']([^"']+)["']/i);
  if (mediaThumb) return mediaThumb[1];
  const imgInDesc = block.match(/<img[^>]*src=["']([^"']+)["']/i);
  if (imgInDesc) return imgInDesc[1];
  return null;
}

function parseRss(xml: string, feed: Feed): NewsItem[] {
  const items: NewsItem[] = [];
  const blocks = xml.match(/<item[\s>][\s\S]*?<\/item>/gi) || [];
  for (const block of blocks) {
    const title = stripHtml(pick(block, "title"));
    const link = stripHtml(pick(block, "link")) || (block.match(/<link[^>]*href=["']([^"']+)["']/i)?.[1] ?? "");
    const descRaw = pick(block, "description") || pick(block, "content:encoded") || pick(block, "summary");
    const description = stripHtml(descRaw).slice(0, 280);
    const pubRaw = pick(block, "pubDate") || pick(block, "dc:date") || pick(block, "published") || pick(block, "updated");
    const pubDate = pubRaw ? new Date(pubRaw).toISOString() : new Date().toISOString();
    const image = findImage(block) || findImage(descRaw);
    if (!title || !link) continue;
    items.push({
      id: `${feed.name}::${link}`,
      title,
      link,
      source: feed.name,
      lang: feed.lang,
      pubDate,
      description,
      image,
    });
  }
  return items;
}

function isFootballRelated(item: NewsItem): boolean {
  const hay = (item.title + " " + item.description).toLowerCase();
  return KEYWORDS.some((k) => hay.includes(k.toLowerCase()));
}

async function fetchFeed(feed: Feed): Promise<NewsItem[]> {
  try {
    const res = await fetch(feed.url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; WC26Hub/1.0; +https://wc26.app)",
        Accept: "application/rss+xml, application/xml, text/xml, */*",
      },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) {
      console.error(`[news] ${feed.name} failed: ${res.status}`);
      return [];
    }
    const xml = await res.text();
    return parseRss(xml, feed);
  } catch (e) {
    console.error(`[news] ${feed.name} error:`, (e as Error).message);
    return [];
  }
}

export const getNews = createServerFn({ method: "GET" }).handler(async () => {
  // Cache at the CDN/edge for 10 min, allow stale for an hour while revalidating
  setResponseHeader("cache-control", "public, max-age=600, s-maxage=600, stale-while-revalidate=3600");

  const results = await Promise.all(FEEDS.map(fetchFeed));
  const all = results.flat().filter(isFootballRelated);

  // Dedupe by link
  const seen = new Set<string>();
  const unique = all.filter((i) => {
    if (seen.has(i.link)) return false;
    seen.add(i.link);
    return true;
  });

  unique.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());

  return { items: unique.slice(0, 60), updatedAt: new Date().toISOString() };
});