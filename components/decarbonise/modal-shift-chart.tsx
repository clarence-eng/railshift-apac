"use client";

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { useChartColors } from "@/lib/use-chart-colors";

interface Props {
  data: { sharePct: number; tCO2: number }[];
  currentShare: number;
}

function fmt(n: number) {
  return n.toLocaleString("en-SG", { maximumFractionDigits: 0 });
}

export default function ModalShiftChart({ data, currentShare }: Props) {
  const ch = useChartColors();

  return (
    <div
      className="rounded-sm border p-4 space-y-2"
      style={{ background: "var(--theme-color-2)", borderColor: "var(--theme-color-std-bdr)" }}
    >
      <p className="text-xs uppercase tracking-wider" style={{ color: "var(--theme-color-soft-text)" }}>
        Avoided tCO₂/yr vs modal-shift %
      </p>
      <p className="text-xs" style={{ color: "var(--theme-color-soft-text)" }}>
        Current diverted-from-car share: {Math.round(currentShare * 100)}%
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
            strokeWidth={1.5}
            dot={false}
            activeDot={{ r: 4, fill: ch.c1 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
