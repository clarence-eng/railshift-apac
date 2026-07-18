# RailShift APAC — project context for Claude Code

## What this is
An independent analytical prototype: a rail strategy + decarbonisation cockpit
for Asia-Pacific. A job-application work sample. Must be public, free to run,
and always functional even when the AI layer is rate-limited.

## Hard rules
1. NEVER fabricate data. Every figure comes from /data/seed.ts (already built and
   tested). If a value is missing, use null and render "n/a". Do not invent
   contract values, dates, or emission factors.
2. The core app (map + calculator) MUST work with zero API calls. Gemini powers
   only the "brief" feature and is always optional + gracefully degrading.
3. The Gemini API key lives ONLY in process.env.GEMINI_API_KEY, read only inside
   server route handlers. Never expose it to the client. No NEXT_PUBLIC prefix.
4. Everything must run on Vercel Hobby and use only free libraries. No Mapbox,
   no Google Maps, no paid tiles, no paid storage.
5. Every displayed figure links to its source in a Methodology drawer.

## Files that already exist — do NOT rewrite them
- /data/seed.ts        typed, cited dataset (projects, emission/grid factors, SOURCES)
- /lib/calc.ts         pure calculator functions
- /lib/calc.test.ts    Vitest tests (15 passing). Run: npx vitest run
Build features ON TOP of these. If you think one needs changing, ask first.

## Stack
Next.js App Router, TypeScript, Tailwind + shadcn/ui, Recharts,
MapLibre GL JS + OpenFreeMap tiles, Upstash Redis (free) for cache + rate limit.

## Tone of the product
Executive, restrained, credible. Think "tool a strategy director would use",
not "hackathon demo". Dense tables, clear hierarchy, no emoji.

## Definition of done for any feature
- Typechecks, builds clean (npm run build).
- Works with JS-only, no network, for the core.
- Responsive down to 375px.
- No hardcoded secrets. No console errors.
