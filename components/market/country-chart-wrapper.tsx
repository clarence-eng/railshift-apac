"use client";

import dynamic from "next/dynamic";

interface DataRow {
  country: string;
  total: number;
  operational: number;
  underConstruction: number;
  approved: number;
  undecided: number;
  siemensCount: number;
  totalKm: number;
}

interface Props { data: DataRow[]; }

const CountryChart = dynamic(() => import("./country-chart"), {
  ssr: false,
  loading: () => (
    <div
      className="rounded-sm border animate-pulse"
      style={{ height: 300, background: "var(--theme-color-3)", borderColor: "var(--theme-color-x-weak-bdr)" }}
    />
  ),
});

export default function CountryChartWrapper({ data }: Props) {
  return <CountryChart data={data} />;
}
