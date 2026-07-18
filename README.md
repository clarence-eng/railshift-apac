# RailShift APAC

**Independent analytical prototype — job-application work sample.**
Not affiliated with or endorsed by Siemens Mobility or any other company named in the dataset.

---

## What it is

A rail strategy and decarbonisation cockpit for Asia-Pacific, built as a demonstration of product thinking, data discipline, and full-stack engineering. It covers:

- **Pipeline** — 14 APAC rail projects plotted on an interactive map, filterable and sortable, with a per-project detail panel. Every figure is cited.
- **Decarbonise** — a two-tab calculator (modal shift / electrification) backed by pure TypeScript functions, using EEA and Ember emission factors and Singapore's carbon tax. Live-updating outputs, an intermediate-value disclosure panel, and Recharts visualisations. Zero network calls.
- **Brief** — an AI-generated one-page executive strategy memo per project, powered by Gemini 2.5 Flash Lite (falls back to Gemini 2.0 Flash). Gracefully degrades to precomputed examples for the three Singapore projects when the API is unavailable.
- **Methodology & Sources drawer** — every figure traced to a primary source with confidence ratings.

---

## Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 App Router, TypeScript |
| Styling | Tailwind CSS v4, shadcn/ui |
| Map | MapLibre GL JS + OpenFreeMap liberty tiles (no API key), Carto Voyager fallback |
| Charts | Recharts |
| AI | Google Gemini REST API (server-side only) |
| Testing | Vitest (15 tests, all passing) |
| Deployment | Vercel Hobby (free) |

---

## Design principles

1. **Never fabricate data.** Every figure in the app originates in `data/seed.ts`, which carries a source ID and confidence rating. If a value is unknown, the UI renders "n/a".
2. **Core works with zero API calls.** The map, calculator, and table function entirely offline. Only the Brief feature calls Gemini, and it degrades gracefully.
3. **Executive register.** Dense tables, clear hierarchy, no emoji. Built for a strategy director, not a hackathon demo.
4. **Responsive to 375 px.** Tested at iPhone SE width.

---

## Local development

```bash
git clone https://github.com/YOUR_USERNAME/railshift-apac.git
cd railshift-apac
npm install
```

Copy the environment file and add your Gemini key (optional — the app works without it):

```bash
cp .env.example .env.local
# Edit .env.local and paste your GEMINI_API_KEY
```

Get a free Gemini API key at <https://aistudio.google.com/app/apikey>.

```bash
npm run dev        # http://localhost:3000
npm test           # run 15 Vitest unit tests
npm run build      # production build check
```

---

## Environment variables

| Variable | Required | Description |
|---|---|---|
| `GEMINI_API_KEY` | No | Google Gemini API key. Read only in the `/api/brief` server route handler. Never exposed to the browser — no `NEXT_PUBLIC` prefix. Without it, the Brief page serves precomputed fallback examples for the Singapore projects. |

---

## Deploy to Vercel

See the step-by-step instructions at the bottom of this file, or follow the quick path:

1. Push this repository to GitHub.
2. Import the repo at <https://vercel.com/new>.
3. Add `GEMINI_API_KEY` in **Settings → Environment Variables**.
4. Deploy. No build configuration needed — Vercel detects Next.js automatically.

---

## Data sources

All figures are documented in the Methodology drawer (top-right nav) and in `data/seed.ts`. Key sources:

- **EEA** — EU-27 transport emission factors, well-to-wheel, 2018
- **Ember** — Carbon intensity of electricity 2024, lifecycle
- **NCCS** — Singapore carbon tax 2026–27 (verified 18 Jul 2026)
- **LTA, Siemens press releases, MRL, MRT Corp, JICA** — project data

---

## Project structure

```
app/
  page.tsx                  Pipeline page
  decarbonise/page.tsx      Decarbonise page
  brief/page.tsx            Brief page
  api/brief/route.ts        Gemini server route (Node runtime)
components/
  pipeline/                 Map, project panel, table
  decarbonise/              Tab shell, modal-shift tab, electrification tab
  brief/                    Brief shell
  top-nav.tsx               Global nav + Methodology drawer trigger
  methodology-drawer.tsx    Sources drawer
  confidence-badge.tsx      Reusable confidence badge
data/
  seed.ts                   Single source of truth for all figures
  precomputed-briefs.ts     Fallback AI briefs for Singapore projects
lib/
  calc.ts                   Pure calculator functions
  calc.test.ts              Vitest tests (15 tests)
```

---

## Disclaimer

Independent analytical prototype. Data is compiled from public sources for illustrative purposes only. Not affiliated with or endorsed by Siemens Mobility, Alstom, Hitachi Rail, CRRC, or any other entity named in the dataset. Built as a job-application work sample.
