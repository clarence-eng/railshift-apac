"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { PROJECTS, GRID_FACTORS, CALC_DEFAULTS } from "@/data/seed";
import { modalShiftAvoided } from "@/lib/calc";
import { PRECOMPUTED_BY_ID } from "@/data/precomputed-briefs";

const hasFallback = (id: string) => id in PRECOMPUTED_BY_ID;

interface BriefResponse {
  markdown: string;
  isFallback: boolean;
  fallbackReason?: string;
}

function buildCalcOutputs(
  gridCountry: string,
  dailyRidership: number,
  carbonPriceSGD: number
) {
  const gridFactor =
    GRID_FACTORS.find((g) => g.country === gridCountry)?.gCO2ePerKWh ??
    CALC_DEFAULTS.eeaRailAvgFactor;

  const result = modalShiftAvoided({
    dailyRidership,
    avgTripKm: CALC_DEFAULTS.avgTripKm,
    shareDivertedFromCar: CALC_DEFAULTS.shareDivertedFromCar,
    gridFactor,
    railEnergyIntensity: CALC_DEFAULTS.railEnergyIntensity,
    baselineCarFactor: CALC_DEFAULTS.baselineCarFactor,
    carbonPriceSGD,
    assetLifeYears: CALC_DEFAULTS.assetLifeYears,
  });

  return {
    avoidedTCO2PerYear: result.avoidedTCO2PerYear,
    carbonValueSGDPerYear: result.carbonValueSGDPerYear,
    lifetimeValueSGD: result.lifetimeValueSGD,
    railFactor: result.railFactor,
    netFactorSaving: result.netFactorSaving,
    annualPkmShifted: result.annualPkmShifted,
    carbonPriceSGD,
    assetLifeYears: CALC_DEFAULTS.assetLifeYears,
    gridCountry,
    gridFactor,
  };
}

function MemoBody({ markdown }: { markdown: string }) {
  return (
    <div className="prose prose-invert prose-sm max-w-none
      [&_h1]:text-base [&_h1]:font-semibold [&_h1]:tracking-tight [&_h1]:mb-3
      [&_h2]:text-xs [&_h2]:font-semibold [&_h2]:uppercase [&_h2]:tracking-wider
      [&_h2]:text-muted-foreground [&_h2]:mt-6 [&_h2]:mb-2
      [&_p]:text-sm [&_p]:leading-relaxed [&_p]:text-foreground [&_p]:mb-3
      [&_hr]:border-border [&_hr]:my-4
      [&_strong]:text-foreground [&_em]:text-muted-foreground
      [&_ul]:text-sm [&_ul]:text-foreground [&_li]:mb-1">
      <ReactMarkdown>{markdown}</ReactMarkdown>
    </div>
  );
}

function MemoSkeleton() {
  return (
    <div className="rounded-sm border border-border bg-surface-1 overflow-hidden animate-pulse">
      <div className="h-[3px] w-full" style={{ background: "var(--ix-gradient)" }} aria-hidden="true" />
      <div className="px-5 py-5 space-y-4 sm:px-6">
        <div className="h-4 bg-border rounded-sm w-2/3" />
        <div className="space-y-1.5">
          <div className="h-2 bg-border-soft rounded-sm w-1/5" />
          <div className="h-2.5 bg-border rounded-sm w-full" />
          <div className="h-2.5 bg-border-soft rounded-sm w-5/6" />
          <div className="h-2.5 bg-border-hair rounded-sm w-4/6" />
        </div>
        <div className="space-y-1.5">
          <div className="h-2 bg-border-soft rounded-sm w-1/5" />
          <div className="h-2.5 bg-border rounded-sm w-full" />
          <div className="h-2.5 bg-border-soft rounded-sm w-3/4" />
        </div>
        <div className="space-y-1.5">
          <div className="h-2 bg-border-soft rounded-sm w-1/5" />
          <div className="h-2.5 bg-border rounded-sm w-full" />
          <div className="h-2.5 bg-border-soft rounded-sm w-5/6" />
          <div className="h-2.5 bg-border-hair rounded-sm w-2/3" />
        </div>
      </div>
    </div>
  );
}

export default function BriefShell() {
  const [projectId, setProjectId] = useState(PROJECTS[0].id);
  const [gridCountry, setGridCountry] = useState("Singapore");
  const [dailyRidership, setDailyRidership] = useState(500_000);
  const [carbonPrice, setCarbonPrice] = useState(CALC_DEFAULTS.carbonPriceSGD);

  const [result, setResult] = useState<BriefResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedProject = PROJECTS.find((p) => p.id === projectId)!;
  const calcOutputs = buildCalcOutputs(gridCountry, dailyRidership, carbonPrice);

  const fmt = (n: number) =>
    n.toLocaleString("en-SG", { maximumFractionDigits: 0 });
  const fmtSGD = (n: number) =>
    n >= 1_000_000
      ? `S$${(n / 1_000_000).toFixed(1)}m`
      : `S$${fmt(n)}`;

  async function handleGenerate() {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/brief", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, calcOutputs }),
      });
      if (!res.ok) {
        const text = await res.text().catch(() => "Unknown error");
        throw new Error(`HTTP ${res.status}: ${text}`);
      }
      const data = (await res.json()) as BriefResponse;
      setResult(data);
    } catch (err) {
      setError((err as Error).message ?? "Request failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Brief</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          AI-generated one-page executive strategy memo. Figures from{" "}
          <span className="font-mono text-xs">data/seed.ts</span> and{" "}
          <span className="font-mono text-xs">lib/calc.ts</span> — Gemini is
          instructed not to invent data.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_1fr]">
        {/* ---- Controls ---- */}
        <div className="space-y-4">
          {/* Project */}
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground uppercase tracking-wider">
              Project
            </label>
            <select
              value={projectId}
              onChange={(e) => {
                setProjectId(e.target.value);
                setResult(null);
                setError(null);
              }}
              className="w-full h-8 rounded border border-input bg-card px-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            >
              {PROJECTS.map((p) => (
                <option key={p.id} value={p.id}>
                  {hasFallback(p.id) ? "★ " : ""}
                  {p.country} — {p.name}
                </option>
              ))}
            </select>
            {hasFallback(projectId) ? (
              <p className="text-xs text-muted-foreground">
                ★ Saved example available if AI is unavailable.
              </p>
            ) : (
              <p className="text-xs text-muted-foreground">
                No saved example — requires a live Gemini API key.
              </p>
            )}
          </div>

          {/* Grid */}
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground uppercase tracking-wider">
              Country grid
            </label>
            <select
              value={gridCountry}
              onChange={(e) => setGridCountry(e.target.value)}
              className="w-full h-8 rounded border border-input bg-card px-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            >
              {GRID_FACTORS.map((g) => (
                <option key={g.country} value={g.country}>
                  {g.country} ({g.gCO2ePerKWh} gCO₂e/kWh)
                </option>
              ))}
            </select>
          </div>

          {/* Ridership */}
          <div className="space-y-1">
            <div className="flex justify-between">
              <label className="text-xs text-muted-foreground uppercase tracking-wider">
                Daily ridership
              </label>
              <span className="text-xs font-mono text-foreground tabular-nums">
                {(dailyRidership / 1000).toFixed(0)}k pax/day
              </span>
            </div>
            <input
              type="range"
              min={10_000}
              max={2_000_000}
              step={10_000}
              value={dailyRidership}
              onChange={(e) => setDailyRidership(Number(e.target.value))}
              className="w-full h-1.5 accent-primary cursor-pointer"
            />
          </div>

          {/* Carbon price */}
          <div className="space-y-1">
            <div className="flex justify-between">
              <label className="text-xs text-muted-foreground uppercase tracking-wider">
                Carbon price
              </label>
              <span className="text-xs font-mono text-foreground tabular-nums">
                S${carbonPrice}/tCO₂e
              </span>
            </div>
            <input
              type="range"
              min={CALC_DEFAULTS.carbonPriceRangeSGD[0]}
              max={CALC_DEFAULTS.carbonPriceRangeSGD[1]}
              step={1}
              value={carbonPrice}
              onChange={(e) => setCarbonPrice(Number(e.target.value))}
              className="w-full h-1.5 accent-primary cursor-pointer"
            />
          </div>

          {/* Figures preview */}
          <div className="rounded-sm border border-border bg-muted/20 px-3 py-3 space-y-2">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">
              Figures sent to Gemini
            </p>
            <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
              <span className="text-muted-foreground">Avoided tCO₂/yr</span>
              <span className="font-mono text-foreground text-right tabular-nums">
                {fmt(calcOutputs.avoidedTCO2PerYear)}
              </span>
              <span className="text-muted-foreground">Carbon value/yr</span>
              <span className="font-mono text-foreground text-right tabular-nums">
                {fmtSGD(calcOutputs.carbonValueSGDPerYear)}
              </span>
              <span className="text-muted-foreground">Lifetime value</span>
              <span className="font-mono text-foreground text-right tabular-nums">
                {fmtSGD(calcOutputs.lifetimeValueSGD)}
              </span>
            </div>
          </div>

          {/* Generate */}
          <button
            type="button"
            onClick={handleGenerate}
            disabled={loading}
            className="w-full h-9 rounded border border-primary bg-primary/10 text-sm font-medium text-primary hover:bg-primary/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? "Generating…" : "Generate brief"}
          </button>

          {/* Privacy note */}
          <p className="text-xs text-muted-foreground leading-relaxed">
            Project id and calculator outputs are sent to Gemini server-side. No personal data is transmitted. Responses are cached 1 hour per unique input set.
          </p>
        </div>

        {/* ---- Output panel ---- */}
        <div>
          {/* Error */}
          {error && (
            <div className="rounded-sm border border-error/30 bg-error/10 px-4 py-3 text-sm text-error mb-4">
              {error}
            </div>
          )}

          {/* Fallback banner */}
          {result?.isFallback && result.fallbackReason && (
            <div className="rounded-sm border border-warning/30 bg-warning/10 px-4 py-2 text-xs text-warning mb-4 flex items-start gap-2">
              <span className="shrink-0 mt-px" aria-hidden>⚠</span>
              <span>{result.fallbackReason}</span>
            </div>
          )}

          {/* States: idle / loading / result */}
          {loading ? (
            <MemoSkeleton />
          ) : result ? (
            <div className="rounded-sm border border-border bg-surface-1 overflow-hidden">
              <div className="h-[3px] w-full" style={{ background: "var(--ix-gradient)" }} aria-hidden="true" />
              <div className="px-5 py-5 sm:px-6">
                <MemoBody markdown={result.markdown} />
              </div>
            </div>
          ) : !error ? (
            <div className="flex min-h-[240px] flex-col items-center justify-center rounded-sm border border-border-hair gap-2 text-center px-6">
              <p className="text-xs text-text-weak uppercase tracking-widest">Executive Brief</p>
              <p className="text-sm text-muted-foreground">Configure inputs and press &ldquo;Generate brief&rdquo;</p>
            </div>
          ) : null}
        </div>
      </div>

      {/* Project quick-ref bar */}
      <div className="rounded-sm border border-border bg-muted/20 px-4 py-3 text-xs text-muted-foreground">
        <span className="font-medium text-foreground">{selectedProject.name}</span>
        {" — "}
        <span>{selectedProject.status} · {selectedProject.country}</span>
        {selectedProject.value && (
          <span> · {selectedProject.value}</span>
        )}
        {selectedProject.keyDate && (
          <span> · {selectedProject.keyDate}</span>
        )}
        {selectedProject.note && (
          <p className="mt-1 italic leading-relaxed">{selectedProject.note}</p>
        )}
      </div>
    </div>
  );
}
