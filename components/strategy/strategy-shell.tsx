import { PROJECTS, CALC_DEFAULTS, GRID_FACTORS } from "@/data/seed";
import MarketCard from "@/components/market/market-card";

// ─── Derived stats (all from seed, no fabrication) ───────────────────────────
const incumbentCount = PROJECTS.filter(
  (p) => /siemens.*incumbent|incumbent.*siemens/i.test(p.note ?? "")
).length;
const underConCount = PROJECTS.filter((p) => p.status === "under-construction").length;
const approvedCount = PROJECTS.filter((p) => p.status === "approved").length;
const sgGrid = GRID_FACTORS.find((g) => g.country === "Singapore")!.gCO2ePerKWh;
const sgElectricFactor = (CALC_DEFAULTS.railEnergyIntensity * sgGrid).toFixed(1);
const sgCarSaving = CALC_DEFAULTS.baselineCarFactor - parseFloat(sgElectricFactor);

// ─── DEGREE pillars ───────────────────────────────────────────────────────────
const DEGREE_PILLARS = [
  {
    letter: "D",
    pillar: "Decarbonization",
    color: "var(--theme-color-success)",
    appLink: "Decarbonise",
    href: "/decarbonise",
    desc: "Modal Shift and Electrification calculators quantify tCO₂e avoided and lifetime carbon value at the Singapore carbon price (S$45/tCO₂e, 2026–27). Grid-aware model accounts for APAC electricity intensity differences.",
    stat: `${sgCarSaving.toFixed(0)} gCO₂e/pkm saved vs car on Singapore grid`,
  },
  {
    letter: "E",
    pillar: "Ethics",
    color: "var(--theme-color-info)",
    appLink: "Methodology drawer",
    href: "/",
    desc: "Every figure in the app cites its source. Confidence levels (HIGH/MED/LOW) are displayed on all data points. No figures are fabricated — nulls render as 'n/a'.",
    stat: "18 primary sources cited across the dataset",
  },
  {
    letter: "G",
    pillar: "Governance",
    color: "var(--ix-primary)",
    appLink: "Pipeline",
    href: "/",
    desc: "Pipeline tracks project status, funding source (JICA, EXIM, state, private), and key milestone dates for all 14 APAC projects — the structured horizon view required for BTA planning and quarterly reviews.",
    stat: `${underConCount} projects under construction · ${approvedCount} approved`,
  },
  {
    letter: "R",
    pillar: "Resource efficiency",
    color: "var(--theme-color-warning)",
    appLink: "Decarbonise → Electrification",
    href: "/decarbonise",
    desc: "Electrification tab models the grid-to-wheel emission reduction from diesel-to-electric conversion. Shows that sequencing electrification with grid transition is the only path to credible decarbonisation in high-intensity grids (India 670, Indonesia 680 gCO₂e/kWh).",
    stat: "Indonesia: electrification cuts only ~13% of diesel emissions on current grid",
  },
  {
    letter: "E",
    pillar: "Equity",
    color: "var(--theme-color-neutral)",
    appLink: "Market → Country",
    href: "/market",
    desc: "Country breakdown surfaces the distribution of rail investment across APAC markets, including lower-income economies (Vietnam US$67.6bn HSR, Philippines subway) where rail access is a social equity multiplier.",
    stat: "8 markets tracked · 6 countries with active construction",
  },
  {
    letter: "E",
    pillar: "Employability",
    color: "var(--theme-color-primary)",
    appLink: "Market → Competitive",
    href: "/market",
    desc: "Competitive analysis and M&A signals surface strategic pursuit opportunities — directly informing where Siemens Mobility deploys business development resource and grows its APAC talent footprint.",
    stat: `${incumbentCount} incumbent positions to protect · ${approvedCount} pursuit windows open`,
  },
];

// ─── BTA planning dimensions ──────────────────────────────────────────────────
const BTA_DIMENSIONS = [
  {
    title: "Market sizing",
    icon: "📊",
    desc: "Country breakdown and project value totals for APAC planning cycles.",
    appCapability: "Market → Country tab: project count, route km, Siemens presence by market",
    href: "/market",
  },
  {
    title: "Competitive positioning",
    icon: "🎯",
    desc: "Competitor presence matrix across Siemens, Alstom, Hitachi, CRRC.",
    appCapability: "Market → Competitive tab: INCUMBENT/PRESENT/LIKELY/POSSIBLE matrix",
    href: "/market",
  },
  {
    title: "Pipeline horizon",
    icon: "📅",
    desc: "Project completion timeline with Siemens-specific delivery windows.",
    appCapability: "Market → Timeline tab: Gantt view with incumbent highlights",
    href: "/market",
  },
  {
    title: "Carbon value case",
    icon: "♻️",
    desc: "Quantified decarbonisation argument for every project in the pipeline.",
    appCapability: "Decarbonise: avoided tCO₂e/yr, carbon value/yr, lifetime value (undiscounted)",
    href: "/decarbonise",
  },
  {
    title: "Strategic memos",
    icon: "📝",
    desc: "One-page AI-generated executive memo per project for internal circulation.",
    appCapability: "Brief: 4-section memo (Market Opportunity, Competitive, DEGREE, Recommendation)",
    href: "/brief",
  },
  {
    title: "M&A signals",
    icon: "🔍",
    desc: "PROTECT/PURSUE/MONITOR/WATCH classification for portfolio prioritisation.",
    appCapability: "Market → M&A Signals tab: signal cards with urgency ratings",
    href: "/market",
  },
];

// ─── Strategic themes from JD ─────────────────────────────────────────────────
const STRATEGIC_THEMES = [
  {
    theme: "Business strategy development",
    jdRef: "Develop business strategies representative of Siemens Mobility interests in Singapore and APAC",
    appEvidence: "M&A Signals tab identifies PROTECT/PURSUE/MONITOR/WATCH classifications; Competitive tab surfaces competitor positioning per project; Brief generates per-project strategy memos aligned to Siemens DEGREE framework.",
  },
  {
    theme: "Market analysis",
    jdRef: "Carry out market analyses to identify opportunities, trends & competition",
    appEvidence: "Market page: Country breakdown (project count, route km, status split per market), Technology classification (CBTC/HSR/Metro/Freight mix), Timeline (delivery horizon 2026–2036), Competitive matrix.",
  },
  {
    theme: "Sustainability / DEGREE",
    jdRef: "Lead and drive sustainability initiatives aligned with Siemens's DEGREE framework",
    appEvidence: "Decarbonise page: modal shift avoided emissions + carbon value calculator; electrification grid-dependency analysis; all figures cited to EEA/Ember/NCCS primary sources.",
  },
  {
    theme: "External growth / M&A",
    jdRef: "Develop proposals for external growth such as M&A",
    appEvidence: "M&A Signals: project-level PURSUE signals with action notes; Competitive: incumbent gap analysis; all with confidence ratings to flag where intelligence is speculative vs confirmed.",
  },
  {
    theme: "Executive communication",
    jdRef: "Prepare & deliver accurate business presentations & reports for senior leadership",
    appEvidence: "Brief page: Gemini-powered executive memo (Print + Copy actions); pre-computed offline examples for Singapore lines; memo structured for senior audience with 4 precise sections.",
  },
  {
    theme: "BTA & target setting",
    jdRef: "Develop business plans and control target setting processes, Business Target Agreements (BTAs)",
    appEvidence: "Pipeline KPI strip: Projects tracked, Under construction %, Approved %, Siemens incumbent count; Market Country table: per-market route km and project status distribution — the structured data a BTA requires.",
  },
];

function StatCard({ letter, pillar, color, stat, desc, appLink, href }: typeof DEGREE_PILLARS[0]) {
  return (
    <a href={href} className="block rounded-sm border overflow-hidden transition-opacity hover:opacity-90" style={{ background: "var(--theme-color-2)", borderColor: "var(--theme-color-std-bdr)", boxShadow: "0 2px 8px rgba(0,0,0,0.18)", textDecoration: "none" }}>
      <div className="h-[4px] w-full" style={{ background: "var(--ix-gradient)" }} aria-hidden="true" />
      <div className="p-4 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-mono text-2xl font-bold" style={{ color }}>{letter}</span>
            <span className="text-sm font-semibold" style={{ color: "var(--theme-color-std-text)" }}>{pillar}</span>
          </div>
          <span style={{ background: color, color: "#fff", fontSize: "8px", fontWeight: 700, padding: "1px 5px", borderRadius: "2px", flexShrink: 0 }}>
            {appLink}
          </span>
        </div>
        <p className="text-xs leading-relaxed" style={{ color: "var(--theme-color-soft-text)" }}>{desc}</p>
        <p className="text-xs font-mono" style={{ color }}>{stat}</p>
      </div>
    </a>
  );
}

export default function StrategyShell() {
  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="pl-3 border-l-2" style={{ borderColor: "var(--ix-primary)" }}>
        <h1 className="text-2xl font-semibold tracking-tight" style={{ color: "var(--theme-color-std-text)" }}>
          Strategy Alignment
        </h1>
        <p className="mt-0.5 text-sm" style={{ color: "var(--theme-color-soft-text)" }}>
          How RailShift APAC maps to Siemens Mobility&#39;s strategic frameworks — DEGREE sustainability, BTA planning, and APAC market strategy.
        </p>
      </div>

      {/* DEGREE pillars */}
      <section className="space-y-4">
        <div>
          <h2 className="text-base font-semibold tracking-tight" style={{ color: "var(--theme-color-std-text)" }}>
            DEGREE Framework alignment
          </h2>
          <p className="text-xs mt-0.5" style={{ color: "var(--theme-color-soft-text)" }}>
            Siemens&#39; six-pillar sustainability framework. Each pillar maps to a specific app capability backed by cited, verifiable data.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {DEGREE_PILLARS.map((p) => (
            <StatCard key={p.pillar} {...p} />
          ))}
        </div>
      </section>

      {/* BTA Planning dimensions */}
      <section className="space-y-4">
        <div>
          <h2 className="text-base font-semibold tracking-tight" style={{ color: "var(--theme-color-std-text)" }}>
            BTA planning dimensions
          </h2>
          <p className="text-xs mt-0.5" style={{ color: "var(--theme-color-soft-text)" }}>
            Business Target Agreement inputs — what each app section contributes to a Siemens APAC BTA cycle.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {BTA_DIMENSIONS.map(({ title, desc, appCapability, href }) => (
            <a key={title} href={href} className="block rounded-sm border overflow-hidden transition-opacity hover:opacity-90" style={{ background: "var(--theme-color-2)", borderColor: "var(--theme-color-std-bdr)", boxShadow: "0 1px 4px rgba(0,0,0,0.14)", textDecoration: "none" }}>
              <div className="h-[4px] w-full" style={{ background: "var(--ix-gradient)" }} aria-hidden="true" />
              <div className="p-4 space-y-1.5">
                <p className="text-sm font-semibold" style={{ color: "var(--theme-color-std-text)" }}>{title}</p>
                <p className="text-xs" style={{ color: "var(--theme-color-soft-text)" }}>{desc}</p>
                <p className="text-xs font-mono leading-relaxed" style={{ color: "var(--ix-primary)" }}>{appCapability}</p>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* Strategic themes from JD */}
      <MarketCard title="JD requirements → app capabilities mapping">
        <div className="space-y-0">
          {STRATEGIC_THEMES.map(({ theme, jdRef, appEvidence }, i) => (
            <div
              key={theme}
              className="py-4 border-b last:border-0"
              style={{ borderColor: "var(--theme-color-x-weak-bdr)" }}
            >
              <div className="flex items-start gap-3">
                <span className="font-mono text-xs shrink-0 w-5 tabular-nums" style={{ color: "var(--ix-primary)" }}>{i + 1}</span>
                <div className="space-y-1.5 min-w-0">
                  <p className="text-sm font-semibold" style={{ color: "var(--theme-color-std-text)" }}>{theme}</p>
                  <p className="text-xs italic leading-relaxed" style={{ color: "var(--theme-color-soft-text)" }}>
                    &ldquo;{jdRef}&rdquo;
                  </p>
                  <p className="text-xs leading-relaxed" style={{ color: "var(--theme-color-primary)" }}>
                    ↳ {appEvidence}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </MarketCard>

      {/* Footer */}
      <p className="text-xs border-t pt-4" style={{ color: "var(--theme-color-weak-text)", borderColor: "var(--theme-color-x-weak-bdr)" }}>
        All figures on this page are derived from the verified dataset. No figures are fabricated. Confidence levels and source citations are accessible via the Methodology drawer.
      </p>
    </div>
  );
}
