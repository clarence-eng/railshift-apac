"use client";

import { useState, useCallback } from "react";
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
      className="max-w-none
        [&_h1]:text-base [&_h1]:font-semibold [&_h1]:tracking-tight [&_h1]:mb-4 [&_h1]:leading-snug
        [&_h2]:text-xs [&_h2]:font-semibold [&_h2]:uppercase [&_h2]:tracking-widest [&_h2]:mt-7 [&_h2]:mb-2.5 [&_h2]:pl-2 [&_h2]:border-l-[2px] [&_h2]:border-l-[var(--ix-primary)]
        [&_p]:text-sm [&_p]:leading-relaxed [&_p]:mb-3
        [&_hr]:my-5 [&_hr]:border-0 [&_hr]:h-px [&_hr]:bg-[var(--theme-color-x-weak-bdr)]
        [&_strong]:font-semibold [&_li]:mb-1 [&_ul]:pl-4 [&_li]:text-sm [&_em]:italic
        [&_a]:underline [&_a]:text-[var(--theme-color-primary)]"
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
      <div className="h-[4px] w-full" style={{ background: "var(--ix-gradient)" }} aria-hidden="true" />
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
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    if (!result?.markdown) return;
    try {
      await navigator.clipboard.writeText(result.markdown);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard API unavailable (non-https dev) — silently ignore
    }
  }, [result?.markdown]);

  function handleProjectChange(id: string) {
    setProjectId(id);
    setResult(null);
    setError(null);
    const proj = PROJECTS.find((proj) => proj.id === id);
    if (proj) setGridCountry(projectGridCountry(proj.country));
  }

  const selectedProject = PROJECTS.find((p) => p.id === projectId)!;
  const calcOutputs = buildCalcOutputs(gridCountry, dailyRidership, carbonPrice);

  const fmt = (n: number) => n.toLocaleString("en-SG", { maximumFractionDigits: 0 });
  const fmtSGD = (n: number) =>
    Math.abs(n) >= 1_000_000 ? `S$${(n / 1_000_000).toFixed(1)}m` : `S$${fmt(n)}`;

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
      <div className="pl-3 border-l-2" style={{ borderColor: "var(--ix-primary)" }}>
        <h1 className="text-2xl font-semibold tracking-tight" style={{ color: "var(--theme-color-std-text)" }}>Brief</h1>
        <p className="mt-0.5 text-sm" style={{ color: "var(--theme-color-soft-text)" }}>
          AI-generated executive strategy memo. All figures are sourced from the verified dataset — Gemini is instructed not to invent data.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_1fr]">
        {/* Controls */}
        <div
          className="rounded-sm border overflow-hidden"
          style={{ background: "var(--theme-color-2)", borderColor: "var(--theme-color-std-bdr)", boxShadow: "0 2px 8px rgba(0,0,0,0.18)" }}
        >
          <div className="h-[4px] w-full" style={{ background: "var(--ix-gradient)" }} aria-hidden="true" />
          <div className="p-4 space-y-4">

          {/* Project select */}
          <div className="space-y-1.5">
            <p className="text-xs uppercase tracking-wider" style={{ color: "var(--theme-color-soft-text)" }}>Project</p>
            <IxSelect
              value={projectId}
              onValueChange={(e) => handleProjectChange((e.detail as string) ?? "")}
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
              onValueChange={(e) => setGridCountry((e.detail as string) ?? "")}
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
              onValueChange={(e) => setDailyRidership(e.detail ?? 300_000)}
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
              onValueChange={(e) => setCarbonPrice(e.detail ?? CALC_DEFAULTS.carbonPriceSGD)}
              style={{ width: "100%" }}
            />
          </div>

          {/* Figures preview */}
          <div
            className="rounded-sm border px-3 py-3 space-y-2"
            style={{ background: "var(--theme-color-2)", borderColor: "var(--theme-color-std-bdr)", boxShadow: "0 1px 4px rgba(0,0,0,0.14)" }}
          >
            <p className="text-xs uppercase tracking-wider" style={{ color: "var(--theme-color-soft-text)" }}>
              Scenario inputs
            </p>
            <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
              <span style={{ color: "var(--theme-color-soft-text)" }}>Avoided tCO₂/yr</span>
              <span className="font-mono text-right tabular-nums" style={{ color: "var(--theme-color-primary)" }}>{fmt(calcOutputs.avoidedTCO2PerYear)}</span>
              <span style={{ color: "var(--theme-color-soft-text)" }}>Carbon value/yr</span>
              <span className="font-mono text-right tabular-nums" style={{ color: "var(--theme-color-primary)" }}>{fmtSGD(calcOutputs.carbonValueSGDPerYear)}</span>
              <span style={{ color: "var(--theme-color-soft-text)" }}>Lifetime value</span>
              <span className="font-mono text-right tabular-nums" style={{ color: "var(--theme-color-primary)" }}>{fmtSGD(calcOutputs.lifetimeValueSGD)}</span>
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
          </div>{/* end p-4 space-y-4 */}
        </div>{/* end controls card */}

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
              style={{
                background: "var(--theme-color-2)",
                borderColor: "var(--theme-color-std-bdr)",
                boxShadow: "0 2px 12px rgba(0,0,0,0.22)",
              }}
            >
              <div className="h-[4px] w-full" style={{ background: "var(--ix-gradient)" }} aria-hidden="true" />
              <div className="flex items-center justify-between px-5 pt-4 pb-1 sm:px-6">
                <p className="text-xs uppercase tracking-widest" style={{ color: "var(--theme-color-soft-text)" }}>
                  Executive Memo
                </p>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="text-xs border rounded-sm px-2 py-1 transition-colors duration-150"
                  style={{
                    borderColor: copied ? "var(--ix-primary)" : "var(--theme-color-std-bdr)",
                    color: copied ? "var(--ix-primary)" : "var(--theme-color-soft-text)",
                    background: "transparent",
                  }}
                  aria-label="Copy memo to clipboard"
                >
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>
              <div className="px-5 pb-5 sm:px-6">
                <MemoBody markdown={result.markdown} />
              </div>
            </div>
          ) : !error ? (
            <div
              className="overflow-hidden rounded-sm border min-h-[280px] flex flex-col"
              style={{ borderColor: "var(--theme-color-std-bdr)", boxShadow: "0 2px 8px rgba(0,0,0,0.12)" }}
            >
              <div className="h-[4px] w-full" style={{ background: "var(--ix-gradient)" }} aria-hidden="true" />
              <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center px-8">
                <div className="space-y-1">
                  <p className="text-sm font-semibold" style={{ color: "var(--theme-color-std-text)" }}>Executive Strategy Memo</p>
                  <p className="text-xs leading-relaxed" style={{ color: "var(--theme-color-soft-text)" }}>
                    Select a project, set scenario parameters, and press{" "}
                    <span style={{ color: "var(--theme-color-primary)" }}>Generate brief</span>{" "}
                    to produce a four-section strategy memo covering market opportunity, competitive context, DEGREE alignment, and recommendation.
                  </p>
                </div>
                <p className="text-xs" style={{ color: "var(--theme-color-weak-text)" }}>
                  ★ projects include a saved example that works without an API key
                </p>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {/* Project quick-ref */}
      <div
        className="rounded-sm border overflow-hidden"
        style={{
          background: "var(--theme-color-2)",
          borderColor: "var(--theme-color-std-bdr)",
          boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
        }}
      >
        <div className="h-[4px] w-full" style={{ background: "var(--ix-gradient)" }} aria-hidden="true" />
        <div className="px-4 py-3 text-xs" style={{ color: "var(--theme-color-soft-text)" }}>
          <span className="font-semibold text-sm" style={{ color: "var(--theme-color-std-text)" }}>{selectedProject.name}</span>
          <span className="mx-1.5 opacity-30">·</span>
          <span>{selectedProject.status}</span>
          <span className="mx-1.5 opacity-30">·</span>
          <span>{selectedProject.country}</span>
          {selectedProject.value && <><span className="mx-1.5 opacity-30">·</span><span>{selectedProject.value}</span></>}
          {selectedProject.keyDate && <><span className="mx-1.5 opacity-30">·</span><span>{selectedProject.keyDate}</span></>}
          {selectedProject.note && <p className="mt-1.5 leading-relaxed" style={{ color: "var(--theme-color-weak-text)" }}>{selectedProject.note}</p>}
        </div>
      </div>
    </div>
  );
}
