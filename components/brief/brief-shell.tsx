"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import {
  IxSelect, IxSelectItem, IxSlider, IxButton, IxMessageBar,
} from "@siemens/ix-react";
import { PROJECTS, GRID_FACTORS, CALC_DEFAULTS } from "@/data/seed";
import { modalShiftAvoided } from "@/lib/calc";
import { PRECOMPUTED_BY_ID } from "@/data/precomputed-briefs";

const ReactMarkdown = dynamic(() => import("react-markdown"), { ssr: false });

const hasFallback = (id: string) => id in PRECOMPUTED_BY_ID;

// Resolve the best available grid country for a project country string
function projectGridCountry(projectCountry: string): string {
  const available = new Set(GRID_FACTORS.map((g) => g.country));
  for (const token of projectCountry.split(/\s*\/\s*/)) {
    if (available.has(token.trim())) return token.trim();
  }
  return "World avg";
}

interface BriefResponse {
  markdown: string;
  isFallback: boolean;
  fallbackReason?: string;
}

function buildCalcOutputs(gridCountry: string, dailyRidership: number, carbonPriceSGD: number) {
  const gridFactor =
    GRID_FACTORS.find((g) => g.country === gridCountry)?.gCO2ePerKWh ??
    CALC_DEFAULTS.eeaRailAvgFactor;
  const result = modalShiftAvoided({
    dailyRidership,
    avgTripKm: CALC_DEFAULTS.avgTripKm,
    shareDivertedFromCar: 0.30, // conservative mid-range: ITDP empirical 15–35%
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
    <div
      className="prose prose-sm max-w-none
        [&_h1]:text-base [&_h1]:font-semibold [&_h1]:tracking-tight [&_h1]:mb-3
        [&_h2]:text-xs [&_h2]:font-semibold [&_h2]:uppercase [&_h2]:tracking-wider [&_h2]:mt-6 [&_h2]:mb-2
        [&_p]:text-sm [&_p]:leading-relaxed [&_p]:mb-3
        [&_hr]:my-4 [&_strong]:font-semibold [&_li]:mb-1"
      style={{ color: "var(--theme-color-std-text)" }}
    >
      <ReactMarkdown>{markdown}</ReactMarkdown>
    </div>
  );
}

function MemoSkeleton() {
  return (
    <div
      className="rounded-sm border overflow-hidden animate-pulse"
      style={{ background: "var(--theme-color-2)", borderColor: "var(--theme-color-std-bdr)" }}
    >
      <div className="h-[3px] w-full" style={{ background: "var(--ix-gradient)" }} aria-hidden="true" />
      <div className="px-5 py-5 space-y-4">
        <div className="h-4 rounded-sm w-2/3" style={{ background: "var(--theme-color-3)" }} />
        <div className="space-y-1.5">
          <div className="h-2 rounded-sm w-1/5" style={{ background: "var(--theme-color-3)" }} />
          <div className="h-2.5 rounded-sm w-full" style={{ background: "var(--theme-color-3)" }} />
          <div className="h-2.5 rounded-sm w-5/6" style={{ background: "var(--theme-color-4)" }} />
          <div className="h-2.5 rounded-sm w-4/6" style={{ background: "var(--theme-color-4)" }} />
        </div>
        <div className="space-y-1.5">
          <div className="h-2 rounded-sm w-1/5" style={{ background: "var(--theme-color-3)" }} />
          <div className="h-2.5 rounded-sm w-full" style={{ background: "var(--theme-color-3)" }} />
          <div className="h-2.5 rounded-sm w-3/4" style={{ background: "var(--theme-color-4)" }} />
        </div>
        <div className="space-y-1.5">
          <div className="h-2 rounded-sm w-1/5" style={{ background: "var(--theme-color-3)" }} />
          <div className="h-2.5 rounded-sm w-full" style={{ background: "var(--theme-color-3)" }} />
          <div className="h-2.5 rounded-sm w-2/3" style={{ background: "var(--theme-color-4)" }} />
        </div>
      </div>
    </div>
  );
}

export default function BriefShell() {
  const [projectId, setProjectId] = useState(PROJECTS[0].id);
  const [gridCountry, setGridCountry] = useState(() => projectGridCountry(PROJECTS[0].country));
  const [dailyRidership, setDailyRidership] = useState(300_000);
  const [carbonPrice, setCarbonPrice] = useState(CALC_DEFAULTS.carbonPriceSGD);
  const [result, setResult] = useState<BriefResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleProjectChange(id: string) {
    setProjectId(id);
    setResult(null);
    setError(null);
    const p = PROJECTS.find((p) => p.id === id);
    if (p) setGridCountry(projectGridCountry(p.country));
  }

  const selectedProject = PROJECTS.find((p) => p.id === projectId)!;
  const calcOutputs = buildCalcOutputs(gridCountry, dailyRidership, carbonPrice);

  const fmt = (n: number) => n.toLocaleString("en-SG", { maximumFractionDigits: 0 });
  const fmtSGD = (n: number) =>
    n >= 1_000_000 ? `S$${(n / 1_000_000).toFixed(1)}m` : `S$${fmt(n)}`;

  async function handleGenerate() {
    setLoading(true); setError(null); setResult(null);
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
      setResult((await res.json()) as BriefResponse);
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
        <h1 className="text-2xl font-semibold tracking-tight" style={{ color: "var(--theme-color-std-text)" }}>Brief</h1>
        <p className="mt-1 text-sm" style={{ color: "var(--theme-color-soft-text)" }}>
          AI-generated executive strategy memo. Figures from{" "}
          <code className="font-mono text-xs">data/seed.ts</code> and{" "}
          <code className="font-mono text-xs">lib/calc.ts</code> — Gemini is instructed not to invent data.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_1fr]">
        {/* Controls */}
        <div className="space-y-4">

          {/* Project select */}
          <div className="space-y-1.5">
            <p className="text-xs uppercase tracking-wider" style={{ color: "var(--theme-color-soft-text)" }}>Project</p>
            <IxSelect
              value={projectId}
              onValueChange={(e) => handleProjectChange(e.detail as string)}
              style={{ width: "100%" }}
            >
              {PROJECTS.map((p) => (
                <IxSelectItem
                  key={p.id}
                  value={p.id}
                  label={`${hasFallback(p.id) ? "★ " : ""}${p.country} — ${p.name}`}
                />
              ))}
            </IxSelect>
            <p className="text-xs" style={{ color: "var(--theme-color-soft-text)" }}>
              {hasFallback(projectId)
                ? "★ Saved example available if AI is unavailable."
                : "No saved example — requires a live Gemini API key."}
            </p>
          </div>

          {/* Grid select */}
          <div className="space-y-1.5">
            <p className="text-xs uppercase tracking-wider" style={{ color: "var(--theme-color-soft-text)" }}>Country grid</p>
            <IxSelect
              value={gridCountry}
              onValueChange={(e) => setGridCountry(e.detail as string)}
              style={{ width: "100%" }}
            >
              {GRID_FACTORS.map((g) => (
                <IxSelectItem
                  key={g.country}
                  value={g.country}
                  label={`${g.country} (${g.gCO2ePerKWh} gCO₂e/kWh)`}
                />
              ))}
            </IxSelect>
          </div>

          {/* Ridership slider */}
          <div className="space-y-0.5">
            <div className="flex justify-between text-xs">
              <span style={{ color: "var(--theme-color-soft-text)" }}>Daily ridership</span>
              <span className="font-mono tabular-nums" style={{ color: "var(--theme-color-std-text)" }}>
                {(dailyRidership / 1000).toFixed(0)}k pax/day
              </span>
            </div>
            <IxSlider
              min={10_000} max={2_000_000} step={10_000}
              value={dailyRidership}
              onValueChange={(e) => setDailyRidership(e.detail)}
              style={{ width: "100%" }}
            />
          </div>

          {/* Carbon price slider */}
          <div className="space-y-0.5">
            <div className="flex justify-between text-xs">
              <span style={{ color: "var(--theme-color-soft-text)" }}>Carbon price</span>
              <span className="font-mono tabular-nums" style={{ color: "var(--theme-color-std-text)" }}>
                S${carbonPrice}/tCO₂e
              </span>
            </div>
            <IxSlider
              min={CALC_DEFAULTS.carbonPriceRangeSGD[0]}
              max={CALC_DEFAULTS.carbonPriceRangeSGD[1]}
              step={1}
              value={carbonPrice}
              onValueChange={(e) => setCarbonPrice(e.detail)}
              style={{ width: "100%" }}
            />
          </div>

          {/* Figures preview */}
          <div
            className="rounded-sm border px-3 py-3 space-y-2"
            style={{ background: "var(--theme-color-2)", borderColor: "var(--theme-color-std-bdr)" }}
          >
            <p className="text-xs uppercase tracking-wider" style={{ color: "var(--theme-color-soft-text)" }}>
              Figures sent to Gemini
            </p>
            <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
              <span style={{ color: "var(--theme-color-soft-text)" }}>Avoided tCO₂/yr</span>
              <span className="font-mono text-right tabular-nums" style={{ color: "var(--theme-color-std-text)" }}>{fmt(calcOutputs.avoidedTCO2PerYear)}</span>
              <span style={{ color: "var(--theme-color-soft-text)" }}>Carbon value/yr</span>
              <span className="font-mono text-right tabular-nums" style={{ color: "var(--theme-color-std-text)" }}>{fmtSGD(calcOutputs.carbonValueSGDPerYear)}</span>
              <span style={{ color: "var(--theme-color-soft-text)" }}>Lifetime value</span>
              <span className="font-mono text-right tabular-nums" style={{ color: "var(--theme-color-std-text)" }}>{fmtSGD(calcOutputs.lifetimeValueSGD)}</span>
            </div>
          </div>

          {/* Generate button */}
          <IxButton
            variant="primary"
            onClick={handleGenerate}
            disabled={loading}
            style={{ width: "100%" }}
          >
            {loading ? "Generating…" : "Generate brief"}
          </IxButton>

          {/* Privacy note */}
          <p className="text-xs leading-relaxed" style={{ color: "var(--theme-color-weak-text)" }}>
            Project id and calculator outputs are sent to Gemini server-side. No personal data is transmitted. Responses are cached 1 hour per unique input set.
          </p>
        </div>

        {/* Output panel */}
        <div className="space-y-3">
          {error && (
            <IxMessageBar type="alarm" persistent>
              {error}
            </IxMessageBar>
          )}

          {result?.isFallback && result.fallbackReason && (
            <IxMessageBar type="warning" persistent>
              {result.fallbackReason}
            </IxMessageBar>
          )}

          {loading ? (
            <MemoSkeleton />
          ) : result ? (
            <div
              className="rounded-sm border overflow-hidden"
              style={{ background: "var(--theme-color-2)", borderColor: "var(--theme-color-std-bdr)" }}
            >
              <div className="h-[3px] w-full" style={{ background: "var(--ix-gradient)" }} aria-hidden="true" />
              <div className="px-5 py-5 sm:px-6">
                <MemoBody markdown={result.markdown} />
              </div>
            </div>
          ) : !error ? (
            <div
              className="flex min-h-[240px] flex-col items-center justify-center rounded-sm border gap-2 text-center px-6"
              style={{ borderColor: "var(--theme-color-x-weak-bdr)" }}
            >
              <p className="text-xs uppercase tracking-widest" style={{ color: "var(--theme-color-weak-text)" }}>Executive Brief</p>
              <p className="text-sm" style={{ color: "var(--theme-color-soft-text)" }}>Configure inputs and press &ldquo;Generate brief&rdquo;</p>
            </div>
          ) : null}
        </div>
      </div>

      {/* Project quick-ref */}
      <div
        className="rounded-sm border px-4 py-3 text-xs"
        style={{ background: "var(--theme-color-2)", borderColor: "var(--theme-color-std-bdr)", color: "var(--theme-color-soft-text)" }}
      >
        <span className="font-medium" style={{ color: "var(--theme-color-std-text)" }}>{selectedProject.name}</span>
        {" — "}
        <span>{selectedProject.status} · {selectedProject.country}</span>
        {selectedProject.value && <span> · {selectedProject.value}</span>}
        {selectedProject.keyDate && <span> · {selectedProject.keyDate}</span>}
        {selectedProject.note && <p className="mt-1 italic leading-relaxed">{selectedProject.note}</p>}
      </div>
    </div>
  );
}
