## Next Build Phase — World Cup 2026 Hub

Foundation (DB + design tokens) is done. This phase delivers the bilingual app shell and all static-data routes so the site is fully usable end-to-end, then layers in Live.

### 1. App shell & infrastructure
- `src/lib/i18n.tsx` — EN/বাংলা context + `useT()` hook, localStorage persistence, Bangla numeral helper.
- `src/lib/time.ts` — UTC → Asia/Dhaka (BST) formatters, countdown, matchday grouping.
- `src/lib/seo.ts` — shared `head()` builder (title, description, og:*, canonical, JSON-LD).
- `src/routes/__root.tsx` — Precision Dashboard chrome: top broadcast bar, scrolling live-score rail, primary nav, language + theme + timezone toggles, footer. QueryClientProvider + Supabase `onAuthStateChange` invalidation.
- Components: `LiveScoreRail`, `NavBar`, `LanguageToggle`, `ThemeToggle`, `TeamCrest`, `MatchCard`, `CountdownPill`, `StatTile`.

### 2. Server functions (data layer)
Under `src/lib/*.functions.ts` using `supabaseAdmin` (public read data):
- `matches.functions.ts` — `getLiveMatches`, `getFixtures({ stage, group, team, date })`, `getMatchById`, `getMatchEvents`.
- `teams.functions.ts` — `getTeams`, `getTeamByCode` (+ squad + fixtures + results).
- `players.functions.ts` — `getTopScorers`, `getPlayerById`.
- `standings.functions.ts` — `getStandings({ group })`.
- `stadiums.functions.ts` — `getStadiums`, `getStadiumBySlug`.
- `history.functions.ts` — `getTournaments`, `getTournamentByYear`.
- `records.functions.ts` — `getRecords({ category })`.
- `search.functions.ts` — `globalSearch(q)` across teams/players/stadiums/matches.

All routes use the canonical `ensureQueryData` + `useSuspenseQuery` shape, with per-route `head()` (title, description, og:*, canonical) and JSON-LD where applicable.

### 3. Routes
```
/                Home — live now, today's fixtures (BST), group snapshot, countdown to opener
/live            Live Match Center (auto-refresh via Realtime)
/match/$id       Match detail (timeline, lineups, stats)
/fixtures        Schedule + filters + calendar (BST)
/groups          All 12 groups overview
/groups/$letter  Single group + standings table
/knockout        Bracket (R32 → Final)
/teams           Team index (48)
/teams/$code     Team detail (squad, fixtures, WC history)
/players         Top scorers / Golden Boot / Glove
/players/$id     Player detail
/stadiums        Stadium index + grid
/stadiums/$slug  Stadium detail
/history         WC archive 1930–2022
/history/$year   Single edition
/records         Records center
/search          Global search
```
Plus `public/robots.txt` and a generated `sitemap.xml` server route.

### 4. Live Match Center
- Supabase Realtime channels on `matches` + `match_events` tables; auto-update score rail, live page, and match detail.
- Football-Data.org poller: `src/routes/api/public/sync-live.ts` server route (signature/secret guarded), upserts in-play matches + events. Requires `FOOTBALL_DATA_API_KEY` + `LIVE_SYNC_SECRET` secrets — I'll request both after this phase via add_secret.
- Until WC26 fixtures appear in the free feed, the UI runs on seeded fixtures so every screen is exercised; live rail shows a "no live matches" state cleanly.

### 5. Bilingual & BST
- Every label routed through `useT()`; team/stadium/city names pulled from `translations` table when locale=bn.
- All times rendered with `formatBST()` (default) with timezone toggle to UTC.
- Bangla numeral toggle for scores/dates.

### 6. SEO & perf
- Per-route `head()` with unique title/description; og:image from team crest / stadium photo / generic for index.
- JSON-LD: `SportsEvent` (match), `SportsTeam` (team), `Person` (player), `Place` (stadium).
- Dynamic `sitemap.xml` from DB.
- `defaultPreloadStaleTime: 0`, `staleTime` per query (history = 1d, live = 15s).
- Lazy components for heavy bracket SVG and stadium map.

### Build order this phase
1. i18n + BST + SEO utilities, design components, root shell + nav.
2. Server-fn data layer.
3. Static routes: Home, Fixtures, Groups, Knockout, Teams, Players, Stadiums, History, Records.
4. Search.
5. Live Match Center + Realtime + sync route (request secrets).
6. SEO polish: sitemap, JSON-LD, robots.txt.

### Honest expectations
Big phase — I'll ship it as one long pass and verify build + key routes before handing off. Maps render as static images (no Mapbox key needed). "Live" data only becomes real once Football-Data.org publishes WC26 fixtures; until then it's wired and waiting.

Approve and I'll start with the app shell.
