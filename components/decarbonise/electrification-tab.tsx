"use client";

import { useState, useMemo } from "react";
import dynamic from "next/dynamic";
import { IxSelect, IxSelectItem } from "@siemens/ix-react";
import { GRID_FACTORS, CALC_DEFAULTS } from "@/data/seed";
import {
  electrificationAvoided,
  electrificationByCountry,
  gridDependencyTakeaway,
} from "@/lib/calc";
import { SliderRow, OutputCard, Disclosure, CalcRow, SectionDivider, fmt, fmtSGD } from "./primitives";

const ElectrificationChart = dynamic(() => import("./electrification-chart"), {
  ssr: false,
  loading: () => (
    <div
      className="rounded-sm border animate-pulse"
      style={{ height: 248, background: "var(--theme-color-3)", borderColor: "var(--theme-color-std-bdr)", opacity: 0.4 }}
    />
  ),
});

const COMPARISON_GRIDS = GRID_FACTORS.filter((g) =>
  ["Singapore", "India", "Indonesia", "Australia", "Malaysia"].includes(g.country)
);

export default function ElectrificationTab() {
  const [gridCountry, setGridCountry] = useState("Singapore");
  const gridFactor =
    GRID_FACTORS.find((g) => g.country === gridCountry)?.gCO2ePerKWh ??
    CALC_DEFAULTS.eeaRailAvgFactor;

  const [annualPkmBn, setAnnualPkmBn] = useState(1);
  const annualPkm = annualPkmBn * 1_000_000_000;
  const [railEnergy, setRailEnergy] = useState(CALC_DEFAULTS.railEnergyIntensity);
  const [dieselFactor, setDieselFactor] = useState(CALC_DEFAULTS.dieselRailFactor);
  const [carbonPrice, setCarbonPrice] = useState(CALC_DEFAULTS.carbonPriceSGD);
  const [assetLife, setAssetLife] = useState(CALC_DEFAULTS.assetLifeYears);

  const result = useMemo(
    () => electrificationAvoided({ annualPkm, dieselRailFactor: dieselFactor, gridFactor, railEnergyIntensity: railEnergy, carbonPriceSGD: carbonPrice, assetLifeYears: assetLife }),
    [annualPkm, dieselFactor, gridFactor, railEnergy, carbonPrice, assetLife]
  );

  const comparisonRows = useMemo(
    () => electrificationByCountry(
      COMPARISON_GRIDS.map((g) => ({ country: g.country, gridFactor: g.gCO2ePerKWh })),
      { railEnergyIntensity: railEnergy, dieselRailFactor: dieselFactor }
    ),
    [railEnergy, dieselFactor]
  );

  const takeaway = useMemo(() => gridDependencyTakeaway(comparisonRows), [comparisonRows]);

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[260px_1fr]">
      {/* Controls */}
      <div className="space-y-3">
        <div
          className="rounded-sm border p-3 space-y-3"
          style={{ background: "var(--theme-color-2)", borderColor: "var(--theme-color-std-bdr)", boxShadow: "0 1px 4px rgba(0,0,0,0.14)" }}
        >
          <SectionDivider label="Grid" />
          <div className="space-y-1.5">
            <span className="text-xs" style={{ color: "var(--theme-color-soft-text)" }}>Country grid</span>
            <IxSelect value={gridCountry} onValueChange={(e) => setGridCountry((e.detail as string) ?? "")} style={{ width: "100%" }}>
              {GRID_FACTORS.map((g) => (
                <IxSelectItem key={g.country} value={g.country} label={`${g.country} (${g.gCO2ePerKWh} gCO₂e/kWh)`} />
              ))}
            </IxSelect>
          </div>
        </div>

        <div
          className="rounded-sm border p-3 space-y-3"
          style={{ background: "var(--theme-color-2)", borderColor: "var(--theme-color-std-bdr)", boxShadow: "0 1px 4px rgba(0,0,0,0.14)" }}
        >
          <SectionDivider label="Line assumptions" />
          <div className="space-y-3">
            <SliderRow label="Annual line pkm" value={annualPkmBn} min={0.1} max={10} step={0.1} format={(v) => `${v.toFixed(1)}bn pkm/yr`} onChange={setAnnualPkmBn} />
            <SliderRow label="Diesel rail factor" value={dieselFactor} min={30} max={150} step={1} format={(v) => `${v} gCO₂e/pkm`} onChange={setDieselFactor} note="MED confidence; varies by engine + load" />
            <SliderRow label="Electric energy intensity" value={railEnergy} min={CALC_DEFAULTS.railEnergyIntensityRange[0]} max={CALC_DEFAULTS.railEnergyIntensityRange[1]} step={0.005} format={(v) => `${v.toFixed(3)} kWh/pkm`} onChange={setRailEnergy} />
            <SliderRow label="Carbon price" value={carbonPrice} min={CALC_DEFAULTS.carbonPriceRangeSGD[0]} max={CALC_DEFAULTS.carbonPriceRangeSGD[1]} step={1} format={(v) => `S$${v}/tCO₂e`} onChange={setCarbonPrice} note="SG carbon tax 2026–27" />
            <SliderRow label="Asset life" value={assetLife} min={10} max={60} step={5} format={(v) => `${v} years`} onChange={setAssetLife} />
          </div>
        </div>
      </div>

      {/* Outputs */}
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <OutputCard
            label="Avoided tCO₂ / year"
            value={fmt(result.avoidedTCO2PerYear)}
            sub={result.reductionFraction != null ? `${Math.round(result.reductionFraction * 100)}% reduction vs diesel` : "diesel factor is zero"}
          />
          <OutputCard label="Carbon value / year" value={fmtSGD(result.carbonValueSGDPerYear)} sub={`at S$${carbonPrice}/tCO₂e`} />
          <OutputCard label={`Lifetime value (${assetLife}yr)`} value={fmtSGD(result.lifetimeValueSGD)} sub="undiscounted" />
        </div>

        {/* Chart — lazy loaded */}
        <ElectrificationChart rows={comparisonRows} dieselFactor={dieselFactor} railEnergy={railEnergy} />

        {/* Grid dependency insight */}
        <div
          className="rounded-sm border overflow-hidden"
          style={{
            background: "var(--theme-color-2)",
            borderColor: "var(--theme-color-std-bdr)",
            boxShadow: "0 1px 4px rgba(0,0,0,0.14)",
          }}
        >
          <div className="h-[4px] w-full" style={{ background: "var(--ix-gradient)" }} aria-hidden="true" />
          <div className="px-4 py-3 space-y-1">
            <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--ix-primary)" }}>
              Grid dependency insight
            </p>
            <p className="text-sm leading-relaxed" style={{ color: "var(--theme-color-soft-text)" }}>{takeaway}</p>
          </div>
        </div>

        {/* Show calculation */}
        <Disclosure label="Show calculation">
          <CalcRow label="Annual pkm" value={`${annualPkmBn.toFixed(1)}bn pkm/yr (${fmt(annualPkm)} pkm)`} />
          <CalcRow label="Diesel factor" value={`${dieselFactor} gCO₂e/pkm`} />
          <CalcRow label="Electric factor" value={`${result.electricFactor.toFixed(2)} gCO₂e/pkm (${railEnergy} kWh/pkm × ${gridFactor} gCO₂e/kWh)`} />
          <CalcRow label="Net saving / pkm" value={`${result.netFactorSaving.toFixed(2)} gCO₂e/pkm`} />
          {result.reductionFraction != null && (
            <CalcRow label="Reduction fraction" value={`${(result.reductionFraction * 100).toFixed(1)}% vs diesel`} />
          )}
          <CalcRow label="Avoided tCO₂ / year" value={`${fmt(result.avoidedTCO2PerYear, 0)} tCO₂e`} />
          <CalcRow label="× carbon price" value={`S$${carbonPrice}/tCO₂e`} />
          <CalcRow label="Carbon value / year" value={fmtSGD(result.carbonValueSGDPerYear)} />
          <CalcRow label="× asset life" value={`${assetLife} years (undiscounted)`} />
          <CalcRow label="Lifetime value" value={fmtSGD(result.lifetimeValueSGD)} />
        </Disclosure>
      </div>
    </div>
  );
}
