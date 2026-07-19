"use client";

import { useState, useMemo } from "react";
import dynamic from "next/dynamic";
import { IxSelect, IxSelectItem, IxCheckbox, IxMessageBar } from "@siemens/ix-react";
import { PROJECTS, GRID_FACTORS, CALC_DEFAULTS } from "@/data/seed";
import { modalShiftAvoided } from "@/lib/calc";
import { SliderRow, OutputCard, Disclosure, CalcRow, SectionDivider } from "./primitives";

const ModalShiftChart = dynamic(() => import("./modal-shift-chart"), {
  ssr: false,
  loading: () => (
    <div
      className="rounded-sm border animate-pulse"
      style={{ height: 264, background: "var(--theme-color-3)", borderColor: "var(--theme-color-std-bdr)", opacity: 0.4 }}
    />
  ),
});

// Build a map from the primary country word (first token before " /") to grid country
const COUNTRY_TO_GRID: Record<string, string> = {};
GRID_FACTORS.forEach((g) => { COUNTRY_TO_GRID[g.country] = g.country; });

function projectGridCountry(projectCountry: string): string {
  // "Malaysia / Singapore" → try "Malaysia" first, then "Singapore"
  const tokens = projectCountry.split(/\s*\/\s*/);
  for (const t of tokens) {
    if (COUNTRY_TO_GRID[t.trim()]) return t.trim();
  }
  return "World avg";
}

const LINE_OPTIONS = PROJECTS.map((p) => ({
  id: p.id,
  label: `${p.country} — ${p.name}`,
  country: p.country,
  lengthKm: p.lengthKm,
  status: p.status,
}));

function fmt(n: number, dec = 0) {
  return n.toLocaleString("en-SG", { minimumFractionDigits: dec, maximumFractionDigits: dec });
}
function fmtSGD(n: number) {
  if (Math.abs(n) >= 1_000_000)
    return `S$${(n / 1_000_000).toLocaleString("en-SG", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}m`;
  return `S$${fmt(n)}`;
}

export default function ModalShiftTab() {
  const [lineId, setLineId] = useState(PROJECTS[0].id);

  // When a project is selected, auto-set the grid country to match
  const selectedLine = LINE_OPTIONS.find((l) => l.id === lineId) ?? LINE_OPTIONS[0];
  const [gridCountry, setGridCountry] = useState(() => projectGridCountry(PROJECTS[0].country));

  function handleLineChange(id: string) {
    setLineId(id);
    const line = LINE_OPTIONS.find((l) => l.id === id);
    if (line) setGridCountry(projectGridCountry(line.country));
  }

  const gridFactor =
    GRID_FACTORS.find((g) => g.country === gridCountry)?.gCO2ePerKWh ??
    CALC_DEFAULTS.eeaRailAvgFactor;

  const [dailyRidership, setDailyRidership] = useState(300_000);
  const [avgTripKm, setAvgTripKm] = useState(CALC_DEFAULTS.avgTripKm);
  const [share, setShare] = useState(0.30);
  const [railEnergy, setRailEnergy] = useState(CALC_DEFAULTS.railEnergyIntensity);
  const [carFactor, setCarFactor] = useState(CALC_DEFAULTS.baselineCarFactor);
  const [carbonPrice, setCarbonPrice] = useState(CALC_DEFAULTS.carbonPriceSGD);
  const [assetLife, setAssetLife] = useState(CALC_DEFAULTS.assetLifeYears);
  const [simpleMode, setSimpleMode] = useState(false);

  const result = useMemo(
    () => modalShiftAvoided({
      dailyRidership, avgTripKm, shareDivertedFromCar: share,
      gridFactor, railEnergyIntensity: railEnergy,
      baselineCarFactor: carFactor, carbonPriceSGD: carbonPrice,
      assetLifeYears: assetLife, simpleMode,
      eeaRailAvgFactor: CALC_DEFAULTS.eeaRailAvgFactor,
    }),
    [dailyRidership, avgTripKm, share, gridFactor, railEnergy, carFactor, carbonPrice, assetLife, simpleMode]
  );

  const chartData = useMemo(() => {
    const points: { sharePct: number; tCO2: number }[] = [];
    for (let pct = 0; pct <= 100; pct += 5) {
      const r = modalShiftAvoided({
        dailyRidership, avgTripKm, shareDivertedFromCar: pct / 100,
        gridFactor, railEnergyIntensity: railEnergy,
        baselineCarFactor: carFactor, carbonPriceSGD: carbonPrice,
        assetLifeYears: assetLife, simpleMode,
        eeaRailAvgFactor: CALC_DEFAULTS.eeaRailAvgFactor,
      });
      points.push({ sharePct: pct, tCO2: Math.round(r.avoidedTCO2PerYear) });
    }
    return points;
  }, [dailyRidership, avgTripKm, gridFactor, railEnergy, carFactor, carbonPrice, assetLife, simpleMode]);

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[260px_1fr]">
      {/* Controls */}
      <div className="space-y-3">
        <div
          className="rounded-sm border p-3 space-y-3"
          style={{ background: "var(--theme-color-2)", borderColor: "var(--theme-color-std-bdr)", boxShadow: "0 1px 4px rgba(0,0,0,0.14)" }}
        >
          <SectionDivider label="Project" />
          <div className="space-y-1.5">
            <span className="text-xs" style={{ color: "var(--theme-color-soft-text)" }}>Line</span>
            <IxSelect value={lineId} onValueChange={(e) => handleLineChange((e.detail as string) ?? "")} style={{ width: "100%" }}>
              {LINE_OPTIONS.map((l) => (
                <IxSelectItem key={l.id} value={l.id} label={l.label} />
              ))}
            </IxSelect>
            {selectedLine.lengthKm != null && (
              <p className="text-xs" style={{ color: "var(--theme-color-weak-text)" }}>
                {selectedLine.lengthKm} km · {selectedLine.status}
              </p>
            )}
          </div>
        </div>

        <div
          className="rounded-sm border p-3 space-y-3"
          style={{ background: "var(--theme-color-2)", borderColor: "var(--theme-color-std-bdr)", boxShadow: "0 1px 4px rgba(0,0,0,0.14)" }}
        >
          <SectionDivider label="Grid" />
          <div className="space-y-2">
            <span className="text-xs" style={{ color: "var(--theme-color-soft-text)" }}>Country grid</span>
            <IxSelect value={gridCountry} onValueChange={(e) => setGridCountry((e.detail as string) ?? "")} style={{ width: "100%" }}>
              {GRID_FACTORS.map((g) => (
                <IxSelectItem key={g.country} value={g.country} label={`${g.country} (${g.gCO2ePerKWh} gCO₂e/kWh)`} />
              ))}
            </IxSelect>
            <IxCheckbox
              checked={simpleMode}
              label={`Simple mode — EEA rail avg ${CALC_DEFAULTS.eeaRailAvgFactor} gCO₂e/pkm`}
              onCheckedChange={(e) => setSimpleMode(e.detail ?? false)}
            />
            {simpleMode && (
              <p className="text-xs" style={{ color: "var(--theme-color-weak-text)" }}>
                Caution: EEA 2018 EU-27 avg — not calibrated to APAC grids.
              </p>
            )}
          </div>
        </div>

        <div
          className="rounded-sm border p-3 space-y-3"
          style={{ background: "var(--theme-color-2)", borderColor: "var(--theme-color-std-bdr)", boxShadow: "0 1px 4px rgba(0,0,0,0.14)" }}
        >
          <SectionDivider label="Scenario assumptions" />
          <p className="text-xs" style={{ color: "var(--theme-color-weak-text)" }}>
            Adjust to model a specific scenario. Defaults are indicative — not line-specific.
          </p>
          <div className="space-y-3">
            <SliderRow
              label="Daily ridership (scenario)"
              value={dailyRidership}
              min={10_000} max={2_000_000} step={10_000}
              format={(v) => `${(v / 1000).toFixed(0)}k pax/day`}
              onChange={setDailyRidership}
              note="Set to line's projected demand for a meaningful result"
            />
            <SliderRow
              label="Avg trip length"
              value={avgTripKm}
              min={1} max={60} step={0.5}
              format={(v) => `${v} km`}
              onChange={setAvgTripKm}
            />
            <SliderRow
              label="Diverted from car"
              value={share}
              min={0.05} max={1} step={0.05}
              format={(v) => `${Math.round(v * 100)}%`}
              onChange={setShare}
              note="Empirical range 15–35% for new urban metro (ITDP 2022)"
            />
            {!simpleMode && (
              <SliderRow
                label="Rail energy intensity"
                value={railEnergy}
                min={CALC_DEFAULTS.railEnergyIntensityRange[0]}
                max={CALC_DEFAULTS.railEnergyIntensityRange[1]}
                step={0.005}
                format={(v) => `${v.toFixed(3)} kWh/pkm`}
                onChange={setRailEnergy}
                note="MED confidence; varies by rolling stock & load"
              />
            )}
            <SliderRow
              label="Baseline car factor"
              value={carFactor}
              min={80} max={250} step={1}
              format={(v) => `${v} gCO₂e/pkm`}
              onChange={setCarFactor}
            />
            <SliderRow
              label="Carbon price"
              value={carbonPrice}
              min={CALC_DEFAULTS.carbonPriceRangeSGD[0]}
              max={CALC_DEFAULTS.carbonPriceRangeSGD[1]}
              step={1}
              format={(v) => `S$${v}/tCO₂e`}
              onChange={setCarbonPrice}
              note="SG carbon tax 2026–27; target S$50–80 by 2030"
            />
            <SliderRow
              label="Asset life"
              value={assetLife}
              min={10} max={60} step={5}
              format={(v) => `${v} years`}
              onChange={setAssetLife}
            />
          </div>
        </div>
      </div>

      {/* Outputs */}
      <div className="space-y-6">
        {result.degenerate && (
          <IxMessageBar type="warning" persistent>
            Ridership is zero — all outputs are zero.
          </IxMessageBar>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <OutputCard label="Avoided tCO₂ / year" value={fmt(result.avoidedTCO2PerYear)} sub="tCO₂e — modal shift only" />
          <OutputCard label="Carbon value / year" value={fmtSGD(result.carbonValueSGDPerYear)} sub={`at S$${carbonPrice}/tCO₂e`} />
          <OutputCard label={`Lifetime value (${assetLife}yr)`} value={fmtSGD(result.lifetimeValueSGD)} sub="undiscounted, no NPV" />
        </div>

        <ModalShiftChart data={chartData} currentShare={share} />

        <Disclosure label="Show calculation">
          <CalcRow label="Daily ridership (scenario)" value={`${fmt(dailyRidership)} pax/day`} />
          <CalcRow label="Avg trip length" value={`${avgTripKm} km`} />
          <CalcRow label="Annual pkm shifted" value={`${fmt(result.annualPkmShifted)} pkm`} />
          <CalcRow label="Rail emission factor" value={`${result.railFactor.toFixed(2)} gCO₂e/pkm${simpleMode ? " (EEA EU-27 avg, 2018 — see caveat)" : ` (${railEnergy} kWh/pkm × ${gridFactor} gCO₂e/kWh)`}`} />
          <CalcRow label="Baseline car factor" value={`${carFactor} gCO₂e/pkm (EEA EU-27, 2018)`} />
          <CalcRow label="Net saving / pkm" value={`${result.netFactorSaving.toFixed(2)} gCO₂e/pkm`} />
          <CalcRow label="Avoided grams / year" value={`${fmt(result.netFactorSaving * result.annualPkmShifted)} gCO₂e`} />
          <CalcRow label="Avoided tCO₂ / year" value={`${fmt(result.avoidedTCO2PerYear, 1)} tCO₂e`} />
          <CalcRow label="× carbon price" value={`S$${carbonPrice}/tCO₂e`} />
          <CalcRow label="Carbon value / year" value={fmtSGD(result.carbonValueSGDPerYear)} />
          <CalcRow label="× asset life" value={`${assetLife} years (undiscounted, no NPV)`} />
          <CalcRow label="Lifetime value" value={fmtSGD(result.lifetimeValueSGD)} />
        </Disclosure>
      </div>
    </div>
  );
}
