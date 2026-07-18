"use client";

import { useState, useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
} from "recharts";
import { GRID_FACTORS, CALC_DEFAULTS } from "@/data/seed";
import {
  electrificationAvoided,
  electrificationByCountry,
  gridDependencyTakeaway,
} from "@/lib/calc";
import { useChartColors } from "@/lib/use-chart-colors";
import {
  SliderRow,
  OutputCard,
  Disclosure,
  CalcRow,
  SectionDivider,
} from "./primitives";

function fmt(n: number, dec = 0) {
  return n.toLocaleString("en-SG", {
    minimumFractionDigits: dec,
    maximumFractionDigits: dec,
  });
}

function fmtSGD(n: number) {
  if (Math.abs(n) >= 1_000_000)
    return `S$${(n / 1_000_000).toLocaleString("en-SG", {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    })}m`;
  return `S$${fmt(n)}`;
}

// Colour ramp using iX status tokens — reads live from DOM
function reductionColor(pct: number, ch: { success: string; warning: string; error: string }): string {
  if (pct >= 50) return ch.success;
  if (pct >= 25) return ch.warning;
  return ch.error;
}

const COMPARISON_GRIDS = GRID_FACTORS.filter((g) =>
  ["Singapore", "India", "Indonesia", "Australia", "Malaysia"].includes(g.country)
);

export default function ElectrificationTab() {
  const ch = useChartColors();
  // Grid selector for the primary calculation
  const [gridCountry, setGridCountry] = useState("Singapore");
  const gridFactor =
    GRID_FACTORS.find((g) => g.country === gridCountry)?.gCO2ePerKWh ??
    CALC_DEFAULTS.eeaRailAvgFactor;

  // Sliders
  const [annualPkmBn, setAnnualPkmBn] = useState(1); // stored as billions
  const annualPkm = annualPkmBn * 1_000_000_000;
  const [railEnergy, setRailEnergy] = useState(CALC_DEFAULTS.railEnergyIntensity);
  const [dieselFactor, setDieselFactor] = useState(CALC_DEFAULTS.dieselRailFactor);
  const [carbonPrice, setCarbonPrice] = useState(CALC_DEFAULTS.carbonPriceSGD);
  const [assetLife, setAssetLife] = useState(CALC_DEFAULTS.assetLifeYears);

  const result = useMemo(
    () =>
      electrificationAvoided({
        annualPkm,
        dieselRailFactor: dieselFactor,
        gridFactor,
        railEnergyIntensity: railEnergy,
        carbonPriceSGD: carbonPrice,
        assetLifeYears: assetLife,
      }),
    [annualPkm, dieselFactor, gridFactor, railEnergy, carbonPrice, assetLife]
  );

  // Three-country comparison — always uses all comparison grids
  const comparisonRows = useMemo(
    () =>
      electrificationByCountry(
        COMPARISON_GRIDS.map((g) => ({ country: g.country, gridFactor: g.gCO2ePerKWh })),
        { railEnergyIntensity: railEnergy, dieselRailFactor: dieselFactor }
      ),
    [railEnergy, dieselFactor]
  );

  const takeaway = useMemo(
    () => gridDependencyTakeaway(comparisonRows),
    [comparisonRows]
  );

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[260px_1fr]">
      {/* ---- Controls ---- */}
      <div className="space-y-4">
        <SectionDivider label="Grid" />
        <div className="space-y-2">
          <label className="text-xs text-muted-foreground">Country grid</label>
          <select
            value={gridCountry}
            onChange={(e) => setGridCountry(e.target.value)}
            className="w-full h-8 rounded border border-input bg-card px-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          >
            {GRID_FACTORS.map((g) => (
              <option key={g.country} value={g.country}>
                {g.country} ({g.gCO2ePerKWh} gCO₂e/kWh)
              </option>
            ))}
          </select>
        </div>

        <SectionDivider label="Line assumptions" />
        <div className="space-y-3">
          <SliderRow
            label="Annual line pkm"
            value={annualPkmBn}
            min={0.1}
            max={10}
            step={0.1}
            format={(v) => `${v.toFixed(1)}bn pkm/yr`}
            onChange={setAnnualPkmBn}
          />
          <SliderRow
            label="Diesel rail factor"
            value={dieselFactor}
            min={30}
            max={150}
            step={1}
            format={(v) => `${v} gCO₂e/pkm`}
            onChange={setDieselFactor}
            note="MED confidence; varies by engine + load"
          />
          <SliderRow
            label="Electric energy intensity"
            value={railEnergy}
            min={CALC_DEFAULTS.railEnergyIntensityRange[0]}
            max={CALC_DEFAULTS.railEnergyIntensityRange[1]}
            step={0.005}
            format={(v) => `${v.toFixed(3)} kWh/pkm`}
            onChange={setRailEnergy}
          />
          <SliderRow
            label="Carbon price"
            value={carbonPrice}
            min={CALC_DEFAULTS.carbonPriceRangeSGD[0]}
            max={CALC_DEFAULTS.carbonPriceRangeSGD[1]}
            step={1}
            format={(v) => `S$${v}/tCO₂e`}
            onChange={setCarbonPrice}
            note="SG carbon tax 2026–27"
          />
          <SliderRow
            label="Asset life"
            value={assetLife}
            min={10}
            max={60}
            step={5}
            format={(v) => `${v} years`}
            onChange={setAssetLife}
          />
        </div>
      </div>

      {/* ---- Outputs ---- */}
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <OutputCard
            label="Avoided tCO₂ / year"
            value={fmt(result.avoidedTCO2PerYear)}
            sub={
              result.reductionFraction != null
                ? `${Math.round(result.reductionFraction * 100)}% reduction vs diesel`
                : "diesel factor is zero"
            }
          />
          <OutputCard
            label="Carbon value / year"
            value={fmtSGD(result.carbonValueSGDPerYear)}
            sub={`at S$${carbonPrice}/tCO₂e`}
          />
          <OutputCard
            label={`Lifetime value (${assetLife}yr)`}
            value={fmtSGD(result.lifetimeValueSGD)}
            sub="undiscounted"
          />
        </div>

        {/* Three-country comparison chart */}
        <div className="rounded-sm border border-border bg-card p-4 space-y-2">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">
            Electrification reduction vs diesel — by country grid
          </p>
          <p className="text-xs text-muted-foreground">
            Diesel: {dieselFactor} gCO₂e/pkm · Rail energy: {railEnergy.toFixed(3)} kWh/pkm
          </p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart
              data={comparisonRows}
              margin={{ top: 4, right: 8, bottom: 0, left: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={ch.grid} vertical={false} />
              <XAxis
                dataKey="country"
                tick={{ fontSize: 11, fill: ch.muted }}
                tickLine={false}
              />
              <YAxis
                tickFormatter={(v) => `${v}%`}
                tick={{ fontSize: 11, fill: ch.muted }}
                tickLine={false}
                axisLine={false}
                domain={[0, 100]}
                width={38}
              />
              <ReferenceLine y={0} stroke={ch.border} />
              <Tooltip
                contentStyle={{
                  background: ch.card,
                  border: `1px solid ${ch.border}`,
                  borderRadius: "4px",
                  fontSize: "12px",
                  color: ch.foreground,
                }}
                formatter={(v, _name, entry) => {
                  const ef = (entry.payload as { electricFactor: number }).electricFactor;
                  return [`${v ?? 0}% (electric: ${ef.toFixed(1)} gCO₂e/pkm)`, "Reduction"];
                }}
              />
              <Bar dataKey="reductionPct" radius={[2, 2, 0, 0]}>
                {comparisonRows.map((row) => (
                  <Cell key={row.country} fill={reductionColor(row.reductionPct, ch)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Takeaway sentence */}
        <div className="rounded-sm border border-warning/30 bg-warning/10 px-4 py-3">
          <p className="text-xs font-semibold text-warning uppercase tracking-wider mb-1">
            Grid dependency insight
          </p>
          <p className="text-sm text-foreground leading-relaxed">{takeaway}</p>
        </div>

        {/* Show calculation */}
        <Disclosure label="Show calculation">
          <CalcRow
            label="Annual pkm"
            value={`${fmt(annualPkm)} pkm`}
          />
          <CalcRow
            label="Diesel factor"
            value={`${dieselFactor} gCO₂e/pkm`}
          />
          <CalcRow
            label="Electric factor"
            value={`${result.electricFactor.toFixed(2)} gCO₂e/pkm (${railEnergy} kWh/pkm × ${gridFactor} gCO₂e/kWh)`}
          />
          <CalcRow
            label="Net saving / pkm"
            value={`${result.netFactorSaving.toFixed(2)} gCO₂e/pkm`}
          />
          {result.reductionFraction != null && (
            <CalcRow
              label="Reduction fraction"
              value={`${(result.reductionFraction * 100).toFixed(1)}% vs diesel`}
            />
          )}
          <CalcRow
            label="Avoided tCO₂ / year"
            value={`${fmt(result.avoidedTCO2PerYear, 0)} tCO₂e`}
          />
          <CalcRow
            label="× carbon price"
            value={`S$${carbonPrice}/tCO₂e`}
          />
          <CalcRow
            label="Carbon value / year"
            value={fmtSGD(result.carbonValueSGDPerYear)}
          />
          <CalcRow
            label={`× asset life`}
            value={`${assetLife} years (undiscounted)`}
          />
          <CalcRow
            label="Lifetime value"
            value={fmtSGD(result.lifetimeValueSGD)}
          />
        </Disclosure>
      </div>
    </div>
  );
}
