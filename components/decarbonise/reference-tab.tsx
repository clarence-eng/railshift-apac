"use client";

import { EMISSION_FACTORS, GRID_FACTORS } from "@/data/seed";

// Max values for proportional bar scaling
const MODE_MAX = 143; // car
const GRID_MAX = 680; // Indonesia

function modeBarColor(gCO2e: number): string {
  if (gCO2e >= 120) return "var(--theme-color-alarm)";  // car / aviation
  if (gCO2e >= 60)  return "var(--theme-color-warning)"; // bus
  return "var(--theme-color-success)";                   // rail
}

function gridBarColor(gCO2e: number): string {
  if (gCO2e > 600) return "var(--theme-color-alarm)";
  if (gCO2e > 400) return "var(--theme-color-warning)";
  return "var(--theme-color-success)";
}

function BarRow({
  label,
  value,
  unit,
  max,
  barColor,
}: {
  label: string;
  value: number;
  unit: string;
  max: number;
  barColor: string;
}) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div className="py-2.5 border-b last:border-0" style={{ borderColor: "var(--theme-color-x-weak-bdr)" }}>
      <div className="flex items-center justify-between gap-4 mb-1.5">
        <span className="text-sm" style={{ color: "var(--theme-color-std-text)" }}>{label}</span>
        <span className="font-mono text-xs tabular-nums shrink-0" style={{ color: "var(--theme-color-primary)" }}>
          {value} {unit}
        </span>
      </div>
      <div
        className="w-full rounded-full overflow-hidden"
        style={{ height: "6px", background: "var(--theme-color-x-weak-bdr)" }}
      >
        <div
          style={{
            width: `${pct}%`,
            height: "100%",
            background: barColor,
            borderRadius: "9999px",
            transition: "width 0.3s ease",
          }}
        />
      </div>
    </div>
  );
}

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-sm overflow-hidden mb-4" style={{ border: "1px solid var(--theme-color-std-bdr)" }}>
      <div className="h-[3px] w-full" style={{ background: "var(--ix-gradient)" }} aria-hidden="true" />
      <div className="px-4 py-3" style={{ background: "var(--theme-color-2)" }}>
        <h3 className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--ix-primary)" }}>
          {children}
        </h3>
      </div>
    </div>
  );
}

export default function ReferenceTab() {
  return (
    <div className="space-y-8">
      {/* Mode comparison */}
      <section>
        <SectionHeader>Mode comparison — transport emission factors</SectionHeader>
        <p className="text-xs mb-4" style={{ color: "var(--theme-color-soft-text)" }}>
          Well-to-wheel gCO₂e per passenger-km. EEA EU-27 boundary, 2018. Bar proportional to max (car = {MODE_MAX} gCO₂e/pkm).
        </p>
        <div>
          {EMISSION_FACTORS.map((f) => (
            <BarRow
              key={f.mode}
              label={f.mode}
              value={f.gCO2ePerPkm}
              unit="gCO₂e/pkm"
              max={MODE_MAX}
              barColor={modeBarColor(f.gCO2ePerPkm)}
            />
          ))}
        </div>
        <p className="mt-2 text-xs" style={{ color: "var(--theme-color-weak-text)" }}>
          Source: EEA transport emission factors (EU-27, WtW, 2018)
        </p>
      </section>

      {/* Grid comparison */}
      <section>
        <SectionHeader>Grid comparison — electricity carbon intensity by country</SectionHeader>
        <p className="text-xs mb-4" style={{ color: "var(--theme-color-soft-text)" }}>
          Lifecycle gCO₂e per kWh. Ember 2024. Bar proportional to max (Indonesia = {GRID_MAX} gCO₂e/kWh).
        </p>
        <div>
          {GRID_FACTORS.map((g) => (
            <BarRow
              key={g.country}
              label={g.country}
              value={g.gCO2ePerKWh}
              unit="gCO₂e/kWh"
              max={GRID_MAX}
              barColor={gridBarColor(g.gCO2ePerKWh)}
            />
          ))}
        </div>
        <p className="mt-2 text-xs" style={{ color: "var(--theme-color-weak-text)" }}>
          Source: Ember / Our World in Data — carbon intensity of electricity 2024
        </p>
      </section>

      {/* Legend */}
      <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs pt-2 border-t" style={{ borderColor: "var(--theme-color-x-weak-bdr)", color: "var(--theme-color-soft-text)" }}>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-2 rounded-full shrink-0" style={{ background: "var(--theme-color-alarm)" }} />
          High intensity
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-2 rounded-full shrink-0" style={{ background: "var(--theme-color-warning)" }} />
          Medium
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-2 rounded-full shrink-0" style={{ background: "var(--theme-color-success)" }} />
          Low intensity (rail)
        </span>
      </div>
    </div>
  );
}
