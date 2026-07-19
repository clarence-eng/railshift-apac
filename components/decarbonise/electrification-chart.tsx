"use client";

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Cell,
} from "recharts";
import { useChartColors } from "@/lib/use-chart-colors";
import type { CountryElectrificationRow } from "@/lib/calc";

interface Props {
  rows: CountryElectrificationRow[];
  dieselFactor: number;
  railEnergy: number;
}

function reductionColor(pct: number, ch: { success: string; warning: string; error: string }) {
  if (pct >= 50) return ch.success;
  if (pct >= 25) return ch.warning;
  return ch.error;
}

export default function ElectrificationChart({ rows, dieselFactor, railEnergy }: Props) {
  const ch = useChartColors();

  return (
    <div
      className="rounded-sm border overflow-hidden"
      style={{
        background: "var(--theme-color-2)",
        borderColor: "var(--theme-color-std-bdr)",
        boxShadow: "0 2px 8px rgba(0,0,0,0.18)",
      }}
    >
      <div className="h-[4px] w-full border-b" style={{ background: "var(--ix-gradient)", borderColor: "var(--theme-color-std-bdr)" }} aria-hidden="true" />
      <div className="p-4 space-y-2">
        <p className="text-xs uppercase tracking-widest" style={{ color: "var(--theme-color-soft-text)" }}>
          Electrification reduction vs diesel — by country grid
        </p>
        <p className="text-xs tracking-wide" style={{ color: "var(--theme-color-soft-text)" }}>
          Diesel: {dieselFactor} gCO₂e/pkm · Rail energy: {railEnergy.toFixed(3)} kWh/pkm
        </p>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={rows} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={ch.grid} vertical={false} />
            <XAxis dataKey="country" tick={{ fontSize: 11, fill: ch.muted }} tickLine={false} />
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
              {rows.map((row) => (
                <Cell key={row.country} fill={reductionColor(row.reductionPct, ch)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
