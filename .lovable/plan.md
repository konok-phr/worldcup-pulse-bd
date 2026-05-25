
# World Cup 2026 Hub — v1 Plan

A bilingual (English / বাংলা), BST-first, teal-themed World Cup 2026 portal with a Live Match Center, fixtures, standings, teams, players, knockout bracket, stadiums, history archive, records, and search. Built on the Lovable stack (TanStack Start + Lovable Cloud) since Next.js/NestJS aren't supported here.

## v1 Scope (this build)

Included now:
1. Live Match Center (scores, status, timeline, lineups, basic stats, auto-refresh via Supabase Realtime)
2. Fixtures & Schedule (BST, filters, calendar, countdown)
3. Group Stage & Standings (live points table)
4. Teams (squad, coach, ranking, fixtures, results, WC history)
5. Players (profile, stats, top scorers, Golden Boot/Glove trackers)
6. Knockout Bracket (R32 → Final, dynamic)
7. Stadiums & Host Cities (list, capacity, map, matches)
8. World Cup History Archive (1930–2022)
9. Records Center
10. Global Search
11. Bilingual EN/বাংলা toggle, BST everywhere
12. SEO-friendly routes (per team, player, match, stadium, WC edition)
13. Dark + light mode, teal World Cup atmosphere, mobile-first

Deferred to v2 (separate iterations after v1 lands):
- News & Updates (needs editorial source)
- Predictions Center + community voting (needs auth + writes)
- Browser push notifications
- Advanced analytics (xG/xA/heatmaps — not in free APIs)
- Player/team comparison tools (basic compare only in v1)

## Design

I'll generate 3 visual directions (teal + stadium-lights aesthetic, glassmorphism, sports-broadcast feel) and let you pick before building.

## Data Strategy

Hybrid as you requested:
- **OpenFootball** (github.com/openfootball/world-cup.json) → seed fixtures, teams, groups, stadiums, full 1930–2022 history into Lovable Cloud Postgres
- **Football-Data.org free tier** → live scores, current standings, match details for WC 2026 (cached server-side to respect rate limits)
- Database is source of truth; API is a refresh layer. Falls back to seeded data if the API is rate-limited or down.

## Bilingual & Time

- `i18n` with two locales (`en`, `bn`); language toggle persisted in localStorage
- All times stored UTC in DB, rendered in `Asia/Dhaka` (BST, UTC+6) by default with a small timezone toggle
- Bangla numerals option for scores/dates

## Routes (file-based)

```
/                          Home (live now, today's fixtures, group snapshot)
/live                      Live Match Center
/match/$id                 Match detail (timeline, lineups, stats)
/fixtures                  Schedule + calendar + filters
/groups                    All groups + standings
/groups/$letter            Single group
/knockout                  Bracket
/teams                     Team index
/teams/$code               Team detail
/players                   Top scorers / Golden Boot / Glove
/players/$id               Player detail
/stadiums                  Stadium index + map
/stadiums/$slug            Stadium detail
/history                   WC archive index
/history/$year             Single edition
/records                   Records center
/search                    Search
/sitemap.xml + robots.txt  SEO
```

Each leaf route gets its own `head()` (title, description, og:*, canonical) and relevant JSON-LD (`SportsEvent`, `SportsTeam`, `Person`, `Place`).

## Technical Approach

- **Stack**: TanStack Start (SSR), Tailwind v4, shadcn/ui, Framer Motion, TanStack Query
- **Backend**: Lovable Cloud (Postgres + Realtime + Edge for sync jobs)
- **Realtime**: Supabase Realtime channels per live match (replaces Socket.io)
- **Live updates**: scheduled server function polls Football-Data.org every ~60s for in-play matches, writes to DB, Realtime fans out to subscribers
- **Caching**: TanStack Query + server-side response cache; static-ish data (history, stadiums) revalidates daily
- **SEO**: per-route `head()`, dynamic sitemap from DB, JSON-LD, canonical, og:image from team crest / stadium photo
- **Perf**: SSR + streaming, lazy routes, image format conversion, preload hero image per route
- **Design tokens**: teal-based palette in `oklch`, glass surfaces, stadium-light gradient accents, dark + light variants

### Database (high level)
`teams`, `players`, `squads`, `stadiums`, `tournaments` (1930–2026), `groups`, `matches`, `match_events` (goals/cards/subs), `lineups`, `standings`, `records`, `translations` (bn strings for entity names where needed). RLS: public read on all hub tables; no user-data tables in v1.

### Secret needed
`FOOTBALL_DATA_API_KEY` — I'll prompt for it after enabling Lovable Cloud. Free tier from football-data.org (signup is free).

## Build Order

1. Enable Lovable Cloud, design tokens, i18n + BST utilities, base shell (nav, language toggle, theme toggle)
2. Generate 3 design directions → you pick one
3. Schema + seed importer for OpenFootball (history + WC26 fixtures/teams/stadiums)
4. Static pages first: History, Stadiums, Teams, Groups, Knockout, Records
5. Players + Top Scorers
6. Live Match Center: detail page, Realtime channel, polling job, live list
7. Search
8. SEO polish (sitemap, JSON-LD, og:image), perf pass

## Honest Expectations

- v1 is large; expect 1 long build pass for foundation + design + static sections, then follow-up passes for live, search, and SEO polish.
- "Real" live data depends entirely on Football-Data.org's free tier coverage of WC 2026 once the tournament approaches. Until matches are scheduled in their feed, "live" will run on realistic sample data so the UI is fully exercised.
- Advanced analytics (xG, heatmaps) are not available on any free API — those stay deferred unless you add a paid key later.
