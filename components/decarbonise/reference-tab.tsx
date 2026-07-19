import { EMISSION_FACTORS, GRID_FACTORS, CALC_DEFAULTS } from "@/data/seed";

const MODE_MAX = 143;
const GRID_MAX = 680;

function modeBarColor(gCO2e: number): string {
  if (gCO2e >= 120) return "var(--theme-color-alarm)";
  if (gCO2e >= 60)  return "var(--theme-color-warning)";
  return "var(--theme-color-success)";
}

function gridBarColor(gCO2e: number): string {
  if (gCO2e > 600) return "var(--theme-color-alarm)";
  if (gCO2e > 400) return "var(--theme-color-warning)";
  return "var(--theme-color-success)";
}

function BarRow({ label, value, unit, max, barColor }: {
  label: string; value: number; unit: string; max: number; barColor: string;
}) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div className="px-4 py-2.5 border-b last:border-0" style={{ borderColor: "var(--theme-color-x-weak-bdr)" }}>
      <div className="flex items-center justify-between gap-4 mb-1.5">
        <span className="text-sm" style={{ color: "var(--theme-color-std-text)" }}>{label}</span>
        <span className="font-mono text-xs tabular-nums shrink-0" style={{ color: "var(--theme-color-primary)" }}>
          {value} {unit}
        </span>
      </div>
      <div className="w-full rounded-full overflow-hidden" style={{ height: "6px", background: "var(--theme-color-x-weak-bdr)" }}>
        <div style={{ width: `${pct}%`, height: "100%", background: barColor, borderRadius: "9999px", transition: "width 0.3s ease" }} />
      </div>
    </div>
  );
}

function SectionCard({ title, children, note }: { title: string; children: React.ReactNode; note?: string }) {
  return (
    <section>
      <div className="rounded-sm overflow-hidden mb-4" style={{ border: "1px solid var(--theme-color-std-bdr)", boxShadow: "0 1px 4px rgba(0,0,0,0.14)" }}>
        <div className="h-[4px] w-full" style={{ background: "var(--ix-gradient)" }} aria-hidden="true" />
        <div className="px-4 py-2.5" style={{ background: "var(--theme-color-2)" }}>
          <h3 className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--ix-primary)" }}>
            {title}
          </h3>
        </div>
      </div>
      {children}
      {note && <p className="mt-2 text-xs" style={{ color: "var(--theme-color-weak-text)" }}>{note}</p>}
    </section>
  );
}

function DefRow({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div className="px-4 py-2 border-b last:border-0" style={{ borderColor: "var(--theme-color-x-weak-bdr)" }}>
      <div className="flex items-start justify-between gap-4">
        <span className="text-sm" style={{ color: "var(--theme-color-soft-text)" }}>{label}</span>
        <span className="font-mono text-xs tabular-nums shrink-0 font-semibold" style={{ color: "var(--theme-color-primary)" }}>{value}</span>
      </div>
      {note && <p className="text-xs mt-0.5" style={{ color: "var(--theme-color-weak-text)" }}>{note}</p>}
    </div>
  );
}

export default function ReferenceTab() {
  return (
    <div className="space-y-8">

      {/* Mode comparison */}
      <SectionCard
        title="Mode comparison — transport emission factors"
        note="Well-to-wheel gCO₂e per passenger-km. EEA EU-27 boundary, 2018. Bar proportional to car baseline (143 gCO₂e/pkm)."
      >
        <div
          className="rounded-sm border overflow-hidden"
          style={{ borderColor: "var(--theme-color-std-bdr)", boxShadow: "0 1px 4px rgba(0,0,0,0.14)", background: "var(--theme-color-2)" }}
        >
          {EMISSION_FACTORS.map((f) => (
            <BarRow key={f.mode} label={f.mode} value={f.gCO2ePerPkm} unit="gCO₂e/pkm" max={MODE_MAX} barColor={modeBarColor(f.gCO2ePerPkm)} />
          ))}
        </div>
      </SectionCard>

      {/* Grid comparison */}
      <SectionCard
        title="Grid comparison — electricity carbon intensity by country"
        note="Lifecycle gCO₂e per kWh. Ember 2024. Bar proportional to Indonesia (680 gCO₂e/kWh)."
      >
        <div
          className="rounded-sm border overflow-hidden"
          style={{ borderColor: "var(--theme-color-std-bdr)", boxShadow: "0 1px 4px rgba(0,0,0,0.14)", background: "var(--theme-color-2)" }}
        >
          {GRID_FACTORS.map((g) => (
            <BarRow key={g.country} label={g.country} value={g.gCO2ePerKWh} unit="gCO₂e/kWh" max={GRID_MAX} barColor={gridBarColor(g.gCO2ePerKWh)} />
          ))}
        </div>
      </SectionCard>

      {/* Calculator defaults */}
      <SectionCard
        title="Calculator defaults"
        note="Default values used in Modal Shift and Electrification calculators. All user-tunable via sliders."
      >
        <div
          className="rounded-sm border overflow-hidden"
          style={{ borderColor: "var(--theme-color-std-bdr)", boxShadow: "0 1px 4px rgba(0,0,0,0.14)", background: "var(--theme-color-2)" }}
        >
          <DefRow label="Baseline car factor" value={`${CALC_DEFAULTS.baselineCarFactor} gCO₂e/pkm`} note="EEA EU-27 average car, 1.6 occupancy, WtW 2018" />
          <DefRow label="Rail energy intensity" value={`${CALC_DEFAULTS.railEnergyIntensity} kWh/pkm`} note={`Range ${CALC_DEFAULTS.railEnergyIntensityRange[0]}–${CALC_DEFAULTS.railEnergyIntensityRange[1]} kWh/pkm`} />
          <DefRow label="EEA rail avg (simple mode)" value={`${CALC_DEFAULTS.eeaRailAvgFactor} gCO₂e/pkm`} note="All services avg, WtW 2018. Not calibrated to APAC grids." />
          <DefRow label="Diesel rail factor" value={`${CALC_DEFAULTS.dieselRailFactor} gCO₂e/pkm`} note="Indicative for regional diesel; MED confidence" />
          <DefRow label="Share diverted from car" value={`${CALC_DEFAULTS.shareDivertedFromCar * 100}%`} note="ITDP empirical range 15–35% for new urban metro" />
          <DefRow label="Avg trip length" value={`${CALC_DEFAULTS.avgTripKm} km`} note="Indicative urban metro trip" />
          <DefRow label="Singapore carbon tax 2026–27" value={`S$${CALC_DEFAULTS.carbonPriceSGD}/tCO₂e`} note="NCCS verified 2026. Target S$50–80 by 2030." />
          <DefRow label="Asset life" value={`${CALC_DEFAULTS.assetLifeYears} years`} note="Typical heavy rail infrastructure design life" />
        </div>
      </SectionCard>

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
          Low intensity
        </span>
      </div>
    </div>
  );
}
