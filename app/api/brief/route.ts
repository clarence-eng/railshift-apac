/**
 * POST /api/brief
 *
 * Accepts: { projectId, calcOutputs }
 * Returns: { markdown, isFallback, fallbackReason? }
 *
 * Security:
 *   - Origin check: rejects requests from foreign origins
 *   - Rate limit: in-process per-IP map (resets on cold start; good enough for Hobby/demo)
 *   - API key: read from process.env.GEMINI_API_KEY — never exposed to the client
 *
 * Gemini model preference: gemini-2.5-flash-lite, fallback to gemini-2.0-flash
 * Response cache: in-process Map keyed on projectId + JSON-stable calc hash (TTL 1 h)
 */

import { NextRequest, NextResponse } from "next/server";
import { PROJECTS } from "@/data/seed";
import { PRECOMPUTED_BY_ID } from "@/data/precomputed-briefs";

export const runtime = "nodejs";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface CalcOutputs {
  avoidedTCO2PerYear: number;
  carbonValueSGDPerYear: number;
  lifetimeValueSGD: number;
  railFactor?: number;
  netFactorSaving?: number;
  annualPkmShifted?: number;
  carbonPriceSGD?: number;
  assetLifeYears?: number;
  gridCountry?: string;
  gridFactor?: number;
}

interface BriefRequest {
  projectId: string;
  calcOutputs: CalcOutputs;
}

interface BriefResponse {
  markdown: string;
  isFallback: boolean;
  fallbackReason?: string;
}

// ---------------------------------------------------------------------------
// In-process rate limiter — per IP, sliding 60-second window
// Resets on Vercel cold start; sufficient for demo / Hobby tier.
// ---------------------------------------------------------------------------

const RATE_WINDOW_MS = 60_000;
const RATE_MAX_REQUESTS = 5;

const ipMap = new Map<string, { count: number; windowStart: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();

  // Prune expired entries to prevent unbounded growth on long-running instances
  for (const [key, val] of ipMap) {
    if (now - val.windowStart > RATE_WINDOW_MS) ipMap.delete(key);
  }

  const entry = ipMap.get(ip);
  if (!entry || now - entry.windowStart > RATE_WINDOW_MS) {
    ipMap.set(ip, { count: 1, windowStart: now });
    return true;
  }
  if (entry.count >= RATE_MAX_REQUESTS) return false;
  entry.count += 1;
  return true;
}

// ---------------------------------------------------------------------------
// In-process response cache — keyed by projectId + stable calc hash, TTL 1 h
// ---------------------------------------------------------------------------

const CACHE_TTL_MS = 60 * 60 * 1000;

interface CacheEntry {
  markdown: string;
  storedAt: number;
}

const responseCache = new Map<string, CacheEntry>();

function cacheKey(projectId: string, outputs: CalcOutputs): string {
  // Stable key: round floats to avoid floating-point drift
  const parts = [
    projectId,
    Math.round(outputs.avoidedTCO2PerYear),
    Math.round(outputs.carbonValueSGDPerYear),
    Math.round(outputs.lifetimeValueSGD),
    outputs.gridCountry ?? "",
    Math.round((outputs.gridFactor ?? 0)),
  ];
  return parts.join("|");
}

function getCached(key: string): string | null {
  const entry = responseCache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.storedAt > CACHE_TTL_MS) {
    responseCache.delete(key);
    return null;
  }
  return entry.markdown;
}

function setCached(key: string, markdown: string): void {
  // Prune stale entries before inserting
  const now = Date.now();
  for (const [k, v] of responseCache) {
    if (now - v.storedAt > CACHE_TTL_MS) responseCache.delete(k);
  }
  responseCache.set(key, { markdown, storedAt: now });
}

// ---------------------------------------------------------------------------
// Gemini call — try preferred model, fall back to alternate
// ---------------------------------------------------------------------------

const GEMINI_MODELS = ["gemini-2.5-flash-lite", "gemini-2.0-flash"];
const GEMINI_BASE = "https://generativelanguage.googleapis.com/v1beta/models";

function buildPrompt(project: (typeof PROJECTS)[number], outputs: CalcOutputs): string {
  const valueStr = project.value ?? "not publicly confirmed";
  const lengthStr = project.lengthKm != null ? `${project.lengthKm} km` : "not confirmed";
  const stationsStr = project.stations != null ? String(project.stations) : "not confirmed";

  return `You are a senior railway strategy analyst writing an executive memo for a B2B audience.

Write a one-page executive strategy memo for the following APAC rail project. Use ONLY the figures provided below — do not invent any numbers, dates, or facts. If a figure is missing, write "n/a". Use markdown (##, **, ---). Write in a restrained, credible, executive register — no bullet-point padding, no hype.

The memo must cover exactly four sections:
1. Market Opportunity
2. Competitive Context (compare Siemens, Alstom, and Hitachi/CRRC based on the project type and geography — be specific, not generic)
3. DEGREE Decarbonisation Alignment (Siemens' sustainability framework; use the emission figures supplied)
4. Recommendation (one clear strategic action)

---

PROJECT DATA (from seed.ts, cite confidence levels where relevant):
- Name: ${project.name}
- Country: ${project.country}
- Status: ${project.status}
- Contract value: ${valueStr}
- Length: ${lengthStr}
- Stations: ${stationsStr}
- Key date: ${project.keyDate ?? "not confirmed"}
- Confidence: ${project.confidence}
- Analyst note: ${project.note ?? "none"}

CALCULATOR OUTPUTS (pre-computed — use these figures exactly, do not recalculate):
- Annual avoided tCO2e: ${Math.round(outputs.avoidedTCO2PerYear).toLocaleString()}
- Annual carbon value: S$${Math.round(outputs.carbonValueSGDPerYear).toLocaleString()}
- Lifetime value (${outputs.assetLifeYears ?? 40} yrs, undiscounted): S$${Math.round(outputs.lifetimeValueSGD).toLocaleString()}
- Rail emission factor used: ${outputs.railFactor != null ? outputs.railFactor.toFixed(2) + " gCO2e/pkm" : "n/a"}
- Net saving vs car: ${outputs.netFactorSaving != null ? outputs.netFactorSaving.toFixed(2) + " gCO2e/pkm" : "n/a"}
- Grid country: ${outputs.gridCountry ?? "n/a"}
- Grid factor: ${outputs.gridFactor != null ? outputs.gridFactor + " gCO2e/kWh" : "n/a"}
- Carbon price used: S$${outputs.carbonPriceSGD ?? 45}/tCO2e

Start with: # Executive Strategy Memo — ${project.name}
End with: *All figures sourced from verified primary data.*`;
}

async function callGemini(
  apiKey: string,
  model: string,
  prompt: string
): Promise<string> {
  const url = `${GEMINI_BASE}/${model}:generateContent?key=${apiKey}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.4,
        maxOutputTokens: 1200,
      },
    }),
  });

  if (!res.ok) {
    const err = await res.text().catch(() => res.status.toString());
    throw Object.assign(new Error(`Gemini ${model} HTTP ${res.status}`), {
      status: res.status,
      body: err,
    });
  }

  const data = await res.json();
  const text: string | undefined =
    data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("Empty Gemini response");
  return text;
}

async function generateWithFallbackModel(
  apiKey: string,
  prompt: string
): Promise<string> {
  let lastErr: Error | null = null;
  for (const model of GEMINI_MODELS) {
    try {
      return await callGemini(apiKey, model, prompt);
    } catch (err) {
      lastErr = err as Error;
      // On 429 don't bother trying the next model (same quota)
      if ((err as { status?: number }).status === 429) break;
    }
  }
  throw lastErr ?? new Error("All Gemini models failed");
}

// ---------------------------------------------------------------------------
// Allowed origins — same origin + Vercel preview URLs
// ---------------------------------------------------------------------------

function isAllowedOrigin(origin: string | null, host: string | null): boolean {
  if (!origin) return true; // server-to-server / same-origin (no Origin header)
  try {
    const o = new URL(origin);
    // Same host
    if (host && o.host === host) return true;
    // Vercel preview deploy pattern
    if (o.hostname.endsWith(".vercel.app")) return true;
    // localhost for development
    if (o.hostname === "localhost" || o.hostname === "127.0.0.1") return true;
    return false;
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// Route handler
// ---------------------------------------------------------------------------

export async function POST(req: NextRequest): Promise<NextResponse> {
  // Origin check
  const origin = req.headers.get("origin");
  const host = req.headers.get("host");
  if (!isAllowedOrigin(origin, host)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Parse body
  let body: BriefRequest;
  try {
    body = (await req.json()) as BriefRequest;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { projectId, calcOutputs } = body;
  if (!projectId || typeof projectId !== "string") {
    return NextResponse.json({ error: "Missing projectId" }, { status: 400 });
  }

  const project = PROJECTS.find((p) => p.id === projectId);
  if (!project) {
    return NextResponse.json({ error: "Unknown projectId" }, { status: 400 });
  }

  // IP rate limit
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    req.headers.get("x-real-ip") ??
    "unknown";
  if (!checkRateLimit(ip)) {
    return fallbackResponse(
      projectId,
      "Rate limit reached — max 5 requests per minute per IP. Showing a saved example."
    );
  }

  // Cache check
  const key = cacheKey(projectId, calcOutputs);
  const cached = getCached(key);
  if (cached) {
    const resp: BriefResponse = { markdown: cached, isFallback: false };
    return NextResponse.json(resp);
  }

  // Gemini API key check
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return fallbackResponse(
      projectId,
      "GEMINI_API_KEY not configured — showing a saved example."
    );
  }

  // Call Gemini
  const prompt = buildPrompt(project, calcOutputs);
  try {
    const markdown = await generateWithFallbackModel(apiKey, prompt);
    setCached(key, markdown);
    const resp: BriefResponse = { markdown, isFallback: false };
    return NextResponse.json(resp);
  } catch (err) {
    const status = (err as { status?: number }).status;
    const reason =
      status === 429
        ? "Live AI rate-limited — showing a saved example."
        : "Gemini unavailable — showing a saved example.";
    return fallbackResponse(projectId, reason);
  }
}

function fallbackResponse(
  projectId: string,
  fallbackReason: string
): NextResponse {
  const precomputed = PRECOMPUTED_BY_ID[projectId];
  if (precomputed) {
    const resp: BriefResponse = {
      markdown: precomputed.markdown,
      isFallback: true,
      fallbackReason,
    };
    return NextResponse.json(resp);
  }
  // No precomputed brief for this project
  const resp: BriefResponse = {
    markdown: `# Brief unavailable\n\nNo precomputed brief exists for this project and the AI service is currently unavailable. Please try again later or select one of the Singapore projects (Cross Island Line, Jurong Region Line, Thomson-East Coast Line) to see a saved example.`,
    isFallback: true,
    fallbackReason,
  };
  return NextResponse.json(resp);
}
