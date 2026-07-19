"use client";

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine,
} from "recharts";
import { useChartColors } from "@/lib/use-chart-colors";
import { fmt } from "@/components/decarbonise/primitives";

interface Props {
  data: { sharePct: number; tCO2: number }[];
  currentShare: number;
}

export default function ModalShiftChart({ data, currentShare }: Props) {
  const ch = useChartColors();
  const currentPct = Math.round(currentShare * 100);

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
          Avoided tCO₂/yr vs modal-shift %
        </p>
        <p className="text-xs tracking-wide" style={{ color: "var(--theme-color-soft-text)" }}>
          Current scenario: <span style={{ color: "var(--theme-color-primary)" }}>{currentPct}% diverted from car</span>
        </p>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={ch.grid} />
            <XAxis
              dataKey="sharePct"
              tickFormatter={(v) => `${v}%`}
              tick={{ fontSize: 11, fill: ch.muted }}
              tickLine={false}
            />
            <YAxis
              tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)}
              tick={{ fontSize: 11, fill: ch.muted }}
              tickLine={false}
              axisLine={false}
              width={44}
            />
            <ReferenceLine
              x={currentPct}
              stroke={ch.primary}
              strokeDasharray="4 3"
              strokeWidth={1.5}
              label={{ value: `${currentPct}%`, position: "insideTopRight", fontSize: 10, fill: ch.primary }}
            />
            <Tooltip
              contentStyle={{
                background: ch.card,
                border: `1px solid ${ch.border}`,
                borderRadius: "4px",
                fontSize: "12px",
                color: ch.foreground,
              }}
              formatter={(v) => [`${fmt(Number(v ?? 0))} tCO₂`, "Avoided"]}
              labelFormatter={(l) => `Modal shift: ${l}%`}
            />
            <Line
              type="monotone"
              dataKey="tCO2"
              stroke={ch.c1}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: ch.c1 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
