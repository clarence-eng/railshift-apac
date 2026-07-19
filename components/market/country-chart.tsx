"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell } from "recharts";
import { useChartColors } from "@/lib/use-chart-colors";

interface DataRow {
  country: string;
  operational: number;
  underConstruction: number;
  approved: number;
  undecided: number;
}

interface Props { data: DataRow[]; }

export default function CountryChart({ data }: Props) {
  const ch = useChartColors();
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: 0 }} barCategoryGap="30%">
        <CartesianGrid strokeDasharray="3 3" stroke={ch.grid} vertical={false} />
        <XAxis dataKey="country" tick={{ fontSize: 11, fill: ch.muted }} tickLine={false} />
        <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: ch.muted }} tickLine={false} axisLine={false} width={24} />
        <Tooltip
          contentStyle={{ background: ch.card, border: `1px solid ${ch.border}`, borderRadius: "4px", fontSize: "12px", color: ch.foreground }}
          cursor={{ fill: "rgba(255,255,255,0.04)" }}
        />
        <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "12px" }} />
        <Bar dataKey="operational"      name="Operational"       stackId="a" fill={ch.success}  radius={[0,0,0,0]} />
        <Bar dataKey="underConstruction" name="Under construction" stackId="a" fill={ch.warning}  radius={[0,0,0,0]} />
        <Bar dataKey="approved"         name="Approved"          stackId="a" fill={ch.info}     radius={[0,0,0,0]} />
        <Bar dataKey="undecided"        name="Undecided"         stackId="a" fill={ch.neutral}  radius={[2,2,0,0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
