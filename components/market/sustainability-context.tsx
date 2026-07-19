import type { Project } from "@/data/seed";
import { GRID_FACTORS, CALC_DEFAULTS } from "@/data/seed";
import MarketCard from "./market-card";
import { isSiemensIncumbent } from "@/lib/project-utils";

interface Props { projects: Project[]; }

// Sustainability context data — sourced from publicly available figures.
// Figures are indicative/reference-level; see Methodology drawer for sources.
const CARBON_PRICE_TRAJECTORY = [
  { year: "2024", sgd: 25, note: "Singapore carbon tax (actual)" },
  { year: "2026", sgd: 45, note: "Current rate — NCCS verified" },
  { year: "2030", sgd: 80, note: "Target ceiling S$50–80 by 2030 (NCCS)" },
];

const REGULATORY_CONTEXT = [
  {
    market: "Singapore",
    headline: "Singapore Green Plan 2030",
    relevance: "Mandates EV charging, solar, net-zero public sector. LTA's Land Transport Master Plan 2040 targets 9-in-10 peak journeys on rail/active transport by 2040.",
    implication: "Direct demand driver for CRL, JRL, TEL expansions. Carbon tax escalation strengthens rail's commercial decarbonisation case.",
    signal: "HIGH",
  },
  {
    market: "Vietnam",
    headline: "Net-zero by 2050 (COP26 pledge)",
    relevance: "US$67.6bn North-South HSR approved Nov 2024. Government committed to 15.5% renewable electricity by 2030.",
    implication: "Largest single pipeline item. State-led procurement favours open competition; Siemens ETCS/mainline signalling positioning window open.",
    signal: "HIGH",
  },
  {
    market: "Indonesia",
    headline: "Whoosh HSR + Jakarta MRT expansion",
    relevance: "Whoosh Jakarta-Bandung HSR operational Oct 2023 — first HSR in SE Asia. China EXIM financed. Government targeting 23% renewable energy by 2025.",
    implication: "Ridership vs operating loss tension creates service/upgrade opportunity. China EXIM financing typically involves tied procurement; monitor for systems scope available to Western suppliers.",
    signal: "MED",
  },
  {
    market: "Malaysia",
    headline: "National Energy Transition Roadmap (NETR)",
    relevance: "NETR targets 70% renewable electricity by 2050. MRT3 Circle Line approved — open competitive tender for signalling/systems.",
    implication: "MRT3 is the live pursuit window: approved, pre-tender, no confirmed incumbent. Grid decarbonisation improves electric rail's emission story.",
    signal: "HIGH",
  },
  {
    market: "Australia",
    headline: "Net-zero 2050 + Safeguard Mechanism",
    relevance: "Legislated net-zero 2050. Safeguard Mechanism reformed 2023 — industrial emitters face declining carbon budgets. Melbourne Metro Tunnel opened Nov 2025.",
    implication: "Services/upgrade market on Melbourne Metro Tunnel. Inland Rail freight electrification angle as carbon cost rises for heavy transport.",
    signal: "MED",
  },
  {
    market: "India",
    headline: "Indian Railways net-zero 2030 + national net-zero 2070",
    relevance: "Indian Railways has a sector-level net-zero 2030 target and is pushing towards 100% electric traction on broad gauge. Mumbai-Ahmedabad HSR is JICA-financed.",
    implication: "MAHSR is the flagship HSR reference in the region. Indian Railways' electrification ambition aligns strongly with Siemens DEGREE Decarbonization narrative.",
    signal: "HIGH",
  },
  {
    market: "Thailand",
    headline: "National EV/clean energy push + Thai-China HSR",
    relevance: "Thai-China HSR Phase 1 under construction (Bangkok–Nakhon Ratchasima, ~US$5.5bn). Thailand targeting 30% renewable electricity by 2030 under Power Development Plan.",
    implication: "ETCS-relevant mainline opportunity. HSR is Chinese-designed; monitor for systems integration scope in later phases. Carbon narrative supports rail electrification positioning.",
    signal: "MED",
  },
  {
    market: "Philippines",
    headline: "Renewable Energy Act + Metro Manila Subway",
    relevance: "Metro Manila Subway under construction (JICA-financed, ~PHP 488bn, 33km). Philippines targeting 35% renewable energy by 2030.",
    implication: "JICA financing favours open competitive procurement. Siemens should register interest for signalling/systems on subsequent subway phases.",
    signal: "MED",
  },
];

const SIGNAL_COLOR: Record<string, string> = {
  HIGH: "var(--theme-color-success)",
  MED:  "var(--theme-color-warning)",
};

export default function SustainabilityContext({ projects }: Props) {
  // Derive Siemens-incumbent projects with sustainability angle
  const incumbentProjects = projects.filter((p) => isSiemensIncumbent(p.note));

  // Carbon saving vs car on Singapore grid — derived from verified seed data
  const sgGrid = GRID_FACTORS.find((g) => g.country === "Singapore")?.gCO2ePerKWh ?? 497;
  const sgElectricGCO2 = CALC_DEFAULTS.railEnergyIntensity * sgGrid;
  const sgCarSaving = Math.round(CALC_DEFAULTS.baselineCarFactor - sgElectricGCO2);

  return (
    <div className="space-y-6">

      {/* Why this matters */}
      <MarketCard title="Why decarbonisation is a commercial argument for rail">
        <div className="space-y-3">
          <p className="text-sm leading-relaxed" style={{ color: "var(--theme-color-soft-text)" }}>
            Rail electrification saves <strong style={{ color: "var(--theme-color-primary)" }}>{sgCarSaving} gCO₂e per passenger-km</strong> versus the average car on Singapore&rsquo;s grid. At the 2026–27 carbon tax of S$45/tCO₂e, every tonne avoided has a quantified monetary value — and that value rises to S$80/tCO₂e by 2030 under the NCCS trajectory.
          </p>
          <p className="text-sm leading-relaxed" style={{ color: "var(--theme-color-soft-text)" }}>
            This means each new metro line Siemens wins is not just a signalling contract — it is a carbon abatement asset with a calculable lifetime value. That argument directly supports Siemens&rsquo; DEGREE Decarbonization pillar and strengthens the commercial case in BTA planning and procurement negotiations.
          </p>
          <p className="text-sm leading-relaxed" style={{ color: "var(--theme-color-soft-text)" }}>
            The <strong style={{ color: "var(--theme-color-std-text)" }}>Decarbonise</strong> page quantifies this for any line in the pipeline. The <strong style={{ color: "var(--theme-color-std-text)" }}>Brief</strong> page embeds the figures in a Siemens DEGREE-aligned executive memo.
          </p>
        </div>
      </MarketCard>

      {/* Singapore carbon price trajectory */}
      <MarketCard title="Singapore carbon price trajectory" note="Source: NCCS Singapore carbon tax schedule, verified July 2026.">
        <div className="space-y-3">
          {CARBON_PRICE_TRAJECTORY.map(({ year, sgd, note }) => {
            const pct = Math.round((sgd / 80) * 100);
            const isCurrent = sgd === CALC_DEFAULTS.carbonPriceSGD;
            return (
              <div key={year}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-semibold w-10 tabular-nums" style={{ color: "var(--theme-color-primary)" }}>{year}</span>
                    <span className="text-xs" style={{ color: "var(--theme-color-soft-text)" }}>{note}</span>
                    {isCurrent && <span style={{ background: "var(--ix-primary)", color: "#fff", fontSize: "8px", fontWeight: 700, padding: "1px 5px", borderRadius: "2px", letterSpacing: "0.4px" }}>CURRENT</span>}
                  </div>
                  <span className="font-mono text-sm font-semibold tabular-nums" style={{ color: "var(--theme-color-primary)" }}>S${sgd}/tCO₂e</span>
                </div>
                <div className="w-full rounded-full overflow-hidden" style={{ height: "6px", background: "var(--theme-color-x-weak-bdr)" }}>
                  <div style={{ width: `${pct}%`, height: "100%", background: "var(--ix-primary)", borderRadius: "9999px", transition: "width 0.4s ease" }} />
                </div>
              </div>
            );
          })}
          <p className="text-xs pt-1" style={{ color: "var(--theme-color-weak-text)" }}>
            Rising carbon price = rising monetary value of each tCO₂e avoided by rail. Lifetime carbon value of a metro line at S$80 is ~78% higher than at S$45.
          </p>
        </div>
      </MarketCard>

      {/* Market-level regulatory context */}
      <MarketCard
        title="Sustainability & regulatory context by market"
        note="Indicative overview. Verify with primary government and regulatory sources before use in proposals."
      >
        <div>
          {REGULATORY_CONTEXT.map(({ market, headline, relevance, implication, signal }) => (
            <div key={market} className="py-4 border-b last:border-0" style={{ borderColor: "var(--theme-color-x-weak-bdr)" }}>
              <div className="flex items-start justify-between gap-3 mb-2">
                <div>
                  <span className="text-sm font-semibold" style={{ color: "var(--theme-color-std-text)" }}>{market}</span>
                  <span className="ml-2 text-xs" style={{ color: "var(--theme-color-soft-text)" }}>{headline}</span>
                </div>
                <span style={{ background: SIGNAL_COLOR[signal], color: "#fff", fontSize: "8px", fontWeight: 700, padding: "2px 5px", borderRadius: "2px", flexShrink: 0, letterSpacing: "0.4px" }}>{signal}</span>
              </div>
              <p className="text-xs leading-relaxed mb-1" style={{ color: "var(--theme-color-soft-text)" }}>{relevance}</p>
              <p className="text-xs leading-relaxed" style={{ color: "var(--theme-color-primary)" }}>→ {implication}</p>
            </div>
          ))}
        </div>
      </MarketCard>

      {/* Incumbent fleet carbon value */}
      {incumbentProjects.length > 0 && (
        <MarketCard title="Siemens incumbent lines — sustainability narrative" note="Carbon value calculated using Modal Shift defaults. See Decarbonise page for per-line scenarios.">
          <div className="space-y-2">
            <p className="text-xs leading-relaxed" style={{ color: "var(--theme-color-soft-text)" }}>
              Each confirmed Siemens incumbent line represents not just a signalling contract, but a quantifiable carbon abatement asset. The carbon value argument — rising with the carbon tax trajectory — is a durable commercial anchor for lifecycle services negotiations.
            </p>
            <div className="space-y-1 mt-3">
              {incumbentProjects.map((p) => (
                <div key={p.id} className="flex items-center justify-between text-xs py-1.5 border-b last:border-0" style={{ borderColor: "var(--theme-color-x-weak-bdr)" }}>
                  <div>
                    <span className="font-medium" style={{ color: "var(--theme-color-std-text)" }}>{p.name}</span>
                    <span className="ml-1.5" style={{ color: "var(--theme-color-soft-text)" }}>· {p.country}</span>
                  </div>
                  <span style={{ color: "var(--theme-color-weak-text)" }}>{p.keyDate ?? "n/a"}</span>
                </div>
              ))}
            </div>
            <p className="text-xs pt-1" style={{ color: "var(--theme-color-weak-text)" }}>
              Use the Decarbonise → Modal Shift calculator to generate the carbon value case for any specific line.
            </p>
          </div>
        </MarketCard>
      )}
    </div>
  );
}
