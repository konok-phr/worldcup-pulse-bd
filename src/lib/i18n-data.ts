// Static Bangla translations for data values (team names, country names,
// stadium names, cities, stages, etc.). Keep keys EXACTLY as stored in DB.

export const BN_COUNTRIES: Record<string, string> = {
  "Algeria": "আলজেরিয়া",
  "Argentina": "আর্জেন্টিনা",
  "Australia": "অস্ট্রেলিয়া",
  "Belgium": "বেলজিয়াম",
  "Brazil": "ব্রাজিল",
  "Cameroon": "ক্যামেরুন",
  "Canada": "কানাডা",
  "Chile": "চিলি",
  "Colombia": "কলম্বিয়া",
  "Costa Rica": "কোস্টা রিকা",
  "Croatia": "ক্রোয়েশিয়া",
  "Denmark": "ডেনমার্ক",
  "Ecuador": "ইকুয়েডর",
  "Egypt": "মিশর",
  "England": "ইংল্যান্ড",
  "France": "ফ্রান্স",
  "Germany": "জার্মানি",
  "Ghana": "ঘানা",
  "Iran": "ইরান",
  "Iraq": "ইরাক",
  "Italy": "ইতালি",
  "Ivory Coast": "আইভরি কোস্ট",
  "Japan": "জাপান",
  "Jordan": "জর্ডান",
  "Mexico": "মেক্সিকো",
  "Morocco": "মরক্কো",
  "Netherlands": "নেদারল্যান্ডস",
  "New Zealand": "নিউজিল্যান্ড",
  "Nigeria": "নাইজেরিয়া",
  "Norway": "নরওয়ে",
  "Panama": "পানামা",
  "Paraguay": "প্যারাগুয়ে",
  "Peru": "পেরু",
  "Poland": "পোল্যান্ড",
  "Portugal": "পর্তুগাল",
  "Saudi Arabia": "সৌদি আরব",
  "Scotland": "স্কটল্যান্ড",
  "Senegal": "সেনেগাল",
  "Slovakia": "স্লোভাকিয়া",
  "South Korea": "দক্ষিণ কোরিয়া",
  "Spain": "স্পেন",
  "Switzerland": "সুইজারল্যান্ড",
  "Tunisia": "তিউনিসিয়া",
  "Turkey": "তুরস্ক",
  "United States": "যুক্তরাষ্ট্র",
  "Uruguay": "উরুগুয়ে",
  "Uzbekistan": "উজবেকিস্তান",
  "Venezuela": "ভেনেজুয়েলা",
  "West Germany": "পশ্চিম জার্মানি",
  "South Africa": "দক্ষিণ আফ্রিকা",
  "Sweden": "সুইডেন",
  "Qatar": "কাতার",
  "Russia": "রাশিয়া",
};

export const BN_STAGES: Record<string, string> = {
  "Group Stage": "গ্রুপ পর্ব",
  "Round of 32": "শেষ ৩২",
  "Round of 16": "শেষ ১৬",
  "Quarter-finals": "কোয়ার্টার ফাইনাল",
  "Semi-finals": "সেমিফাইনাল",
  "Third-place": "তৃতীয় স্থান নির্ধারণী",
  "Final": "ফাইনাল",
};

export const BN_STADIUMS: Record<string, string> = {
  "MetLife Stadium": "মেটলাইফ স্টেডিয়াম",
  "SoFi Stadium": "সোফাই স্টেডিয়াম",
  "AT&T Stadium": "এটিঅ্যান্ডটি স্টেডিয়াম",
  "Mercedes-Benz Stadium": "মার্সিডিজ-বেঞ্জ স্টেডিয়াম",
  "GEHA Field at Arrowhead Stadium": "অ্যারোহেড স্টেডিয়াম",
  "Gillette Stadium": "জিলেট স্টেডিয়াম",
  "NRG Stadium": "এনআরজি স্টেডিয়াম",
  "Hard Rock Stadium": "হার্ড রক স্টেডিয়াম",
  "Lincoln Financial Field": "লিংকন ফিনান্সিয়াল ফিল্ড",
  "Levi's Stadium": "লেভিস স্টেডিয়াম",
  "Lumen Field": "লুমেন ফিল্ড",
  "BMO Field": "বিএমও ফিল্ড",
  "BC Place": "বিসি প্লেস",
  "Estadio Akron": "এস্তাদিও আক্রন",
  "Estadio Azteca": "এস্তাদিও আস্তেকা",
  "Estadio BBVA": "এস্তাদিও বিবিভিএ",
};

export const BN_CITIES: Record<string, string> = {
  "Toronto, ON": "টরন্টো",
  "Vancouver, BC": "ভ্যাঙ্কুভার",
  "Guadalajara": "গুয়াদালাহারা",
  "Mexico City": "মেক্সিকো সিটি",
  "Monterrey": "মন্টেরে",
  "Arlington, TX": "আর্লিংটন",
  "Atlanta, GA": "আটলান্টা",
  "East Rutherford, NJ": "ইস্ট রাদারফোর্ড",
  "Foxborough, MA": "ফক্সবরো",
  "Houston, TX": "হিউস্টন",
  "Inglewood, CA": "ইংলউড",
  "Kansas City, MO": "কানসাস সিটি",
  "Miami Gardens, FL": "মিয়ামি গার্ডেনস",
  "Philadelphia, PA": "ফিলাডেলফিয়া",
  "Santa Clara, CA": "সান্তা ক্লারা",
  "Seattle, WA": "সিয়াটল",
};

export const BN_CONFEDERATIONS: Record<string, string> = {
  "UEFA": "উয়েফা",
  "CONMEBOL": "কনমেবল",
  "CONCACAF": "কনকাকাফ",
  "AFC": "এএফসি",
  "CAF": "ক্যাফ",
  "OFC": "ওএফসি",
};

export type DataEntity =
  | "country"
  | "stage"
  | "stadium"
  | "city"
  | "confederation"
  | "team";

const MAPS: Record<DataEntity, Record<string, string>> = {
  country: BN_COUNTRIES,
  stage: BN_STAGES,
  stadium: BN_STADIUMS,
  city: BN_CITIES,
  confederation: BN_CONFEDERATIONS,
  // Team names use the country mapping (team.name === country name for nations).
  team: BN_COUNTRIES,
};

/** Translate a data value. Returns input unchanged when locale!=bn or no mapping found. */
export function translateData(
  entity: DataEntity,
  value: string | null | undefined,
  locale: "en" | "bn",
): string {
  if (!value) return value ?? "";
  if (locale !== "bn") return value;
  return MAPS[entity][value] ?? value;
}