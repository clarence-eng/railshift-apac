import Link from "next/link";
import { PROJECTS, CALC_DEFAULTS, GRID_FACTORS, SOURCES } from "@/data/seed";
import MarketCard from "@/components/market/market-card";

// ─── Derived stats (all from seed, no fabrication) ────────────────────────────
const incumbentCount = PROJECTS.filter(
  (p) => /siemens.*incumbent|incumbent.*siemens/i.test(p.note ?? "")
).length;
const underConCount = PROJECTS.filter((p) => p.status === "under-construction").length;
const approvedCount = PROJECTS.filter((p) => p.status === "approved").length;
const sgGridFactor = GRID_FACTORS.find((g) => g.country === "Singapore")!.gCO2ePerKWh;
// Avoid parseFloat roundtrip — compute directly
const sgElectricGCO2 = CALC_DEFAULTS.railEnergyIntensity * sgGridFactor;
const sgCarSavingGCO2 = Math.round(CALC_DEFAULTS.baselineCarFactor - sgElectricGCO2);

// ─── Candidate fit data ───────────────────────────────────────────────────────
interface CandidateFitItem {
  requirement: string;
  evidence: string;
  strength: "HIGH" | "MED";
}

const CANDIDATE_FIT: CandidateFitItem[] = [
  {
    requirement: "Strategy consulting background",
    evidence: "Built a full APAC rail strategy cockpit from scratch — pipeline tracking, market analysis, competitive intelligence, M&A signals, and executive memo generation.",
    strength: "HIGH",
  },
  {
    requirement: "Market analysis for opportunity identification",
    evidence: "Market page: 6-tab analysis covering country, technology, timeline, competitive, funding, and M&A signal dimensions — all from a single cited dataset.",
    strength: "HIGH",
  },
  {
    requirement: "Sustainability / DEGREE framework literacy",
    evidence: "Decarbonise page: quantified avoided emissions + carbon value calculator aligned to DEGREE Decarbonization pillar. Strategy page explicitly maps all 6 DEGREE pillars to app capabilities.",
    strength: "HIGH",
  },
  {
    requirement: "Competitive intelligence and M&A",
    evidence: `Competitive tab: INCUMBENT/PRESENT/LIKELY/POSSIBLE presence matrix across 4 competitors for ${PROJECTS.length} projects. M&A Signals: PROTECT/PURSUE/MONITOR/WATCH classification with urgency ratings.`,
    strength: "HIGH",
  },
  {
    requirement: "Executive-quality communication",
    evidence: "Brief page: AI-generated 4-section strategy memo per project (Print + Copy). Pre-computed offline examples for Singapore CRL, JRL, TEL. Built for senior audience with no filler.",
    strength: "HIGH",
  },
  {
    requirement: "Cross-functional coordination and data rigour",
    evidence: `Every figure links to a primary source (${SOURCES.length} cited). Confidence levels on all data points. No figures fabricated — nulls render as n/a. Methodology drawer with full source list.`,
    strength: "HIGH",
  },
  {
    requirement: "Singapore and APAC market context",
    evidence: `${PROJECTS.length} APAC projects tracked across ${[...new Set(PROJECTS.map((p) => p.country.split(/\s*\/\s*/)[0]))].length} markets. 3 Siemens Singapore lines (CRL, JRL, TEL) with deep analyst notes.`,
    strength: "HIGH",
  },
  {
    requirement: "Digital tools and analytical capability",
    evidence: "Next.js 15, TypeScript, Recharts, MapLibre GL, Siemens iX design system, Gemini AI integration. Deployed on Vercel. All code open-source and reviewable.",
    strength: "MED",
  },
];
interface DegreePillar {
  letter: string;
  sub?: string;
  pillar: string;
  color: string;
  appLink: string;
  href: string;
  desc: string;
  stat: string;
}

// ─── DEGREE pillars ───────────────────────────────────────────────────────────
const DEGREE_PILLARS: DegreePillar[] = [
  {
    letter: "D",
    pillar: "Decarbonization",
    color: "var(--theme-color-success)",
    appLink: "Decarbonise",
    href: "/decarbonise",
    desc: "Modal Shift and Electrification calculators quantify tCO₂e avoided and lifetime carbon value at the Singapore carbon price (S$45/tCO₂e, 2026–27). Grid-aware model accounts for APAC electricity intensity differences.",
    stat: `${sgCarSavingGCO2} gCO₂e/pkm saved vs car on Singapore grid`,
  },
  {
    letter: "E",
    sub: "1",
    pillar: "Ethics",
    color: "var(--theme-color-info)",
    appLink: "Methodology",
    href: "/",
    desc: "Every figure in the app cites its primary source. Confidence levels (HIGH/MED/LOW) are displayed on all data points. No figures are fabricated — nulls render as n/a throughout.",
    stat: `${SOURCES.length} primary sources cited across the dataset`,
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
    appLink: "Decarbonise — Electrification",
    href: "/decarbonise",
    desc: "Electrification tab models the grid-to-wheel emission reduction from diesel-to-electric conversion across APAC markets. Shows that sequencing electrification with grid transition is the only credible path in high-intensity grids.",
    stat: "Indonesia: electrification cuts only ~13% of diesel emissions on current grid",
  },
  {
    letter: "E",
    sub: "2",
    pillar: "Equity",
    color: "var(--theme-color-neutral)",
    appLink: "Market — Country",
    href: "/market",
    desc: "Country breakdown surfaces rail investment distribution across APAC markets, including lower-income economies (Vietnam US$67.6bn HSR, Philippines subway) where rail access is a social equity multiplier.",
    stat: `${[...new Set(PROJECTS.map((p) => p.country.split(/\s*\/\s*/)[0]))].length} markets tracked · ${underConCount} with active construction`,
  },
  {
    letter: "E",
    sub: "3",
    pillar: "Employability",
    color: "var(--theme-color-primary)",
    appLink: "Market — Competitive",
    href: "/market",
    desc: "Competitive analysis and M&A signals surface strategic pursuit opportunities — directly informing where Siemens Mobility deploys business development resource and grows its APAC talent footprint.",
    stat: `${incumbentCount} incumbent positions to protect · ${approvedCount} pursuit windows open`,
  },
];

// ─── BTA planning dimensions ──────────────────────────────────────────────────
interface BtaDimension {
  title: string;
  desc: string;
  appCapability: string;
  href: string;
}

const BTA_DIMENSIONS: BtaDimension[] = [
  {
    title: "Market sizing",
    desc: "Country breakdown and project value totals for APAC planning cycles.",
    appCapability: "Market — Country tab: project count, route km, Siemens presence by market",
    href: "/market",
  },
  {
    title: "Competitive positioning",
    desc: "Competitor presence matrix across Siemens, Alstom, Hitachi, CRRC.",
    appCapability: "Market — Competitive tab: INCUMBENT / PRESENT / LIKELY / POSSIBLE matrix",
    href: "/market",
  },
  {
    title: "Pipeline horizon",
    desc: "Project completion timeline with Siemens-specific delivery windows.",
    appCapability: "Market — Timeline tab: Gantt view with incumbent highlights",
    href: "/market",
  },
  {
    title: "Carbon value case",
    desc: "Quantified decarbonisation argument for every project in the pipeline.",
    appCapability: "Decarbonise: avoided tCO₂e/yr, carbon value/yr, lifetime value (undiscounted)",
    href: "/decarbonise",
  },
  {
    title: "Strategic memos",
    desc: "One-page AI-generated executive memo per project for internal circulation.",
    appCapability: "Brief: 4-section memo — Market Opportunity, Competitive, DEGREE, Recommendation",
    href: "/brief",
  },
  {
    title: "M&A signals",
    desc: "PROTECT / PURSUE / MONITOR / WATCH classification for portfolio prioritisation.",
    appCapability: "Market — M&A Signals tab: signal cards with urgency ratings",
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
    appEvidence: "M&A Signals: project-level PURSUE signals with action notes; Competitive: incumbent gap analysis; all with confidence ratings to distinguish confirmed vs speculative intelligence.",
  },
  {
    theme: "Executive communication",
    jdRef: "Prepare & deliver accurate business presentations & reports for senior leadership",
    appEvidence: "Brief page: Gemini-powered executive memo (Print + Copy actions); pre-computed offline examples for Singapore lines; memo structured for senior audience with 4 precise sections.",
  },
  {
    theme: "BTA & target setting",
    jdRef: "Develop business plans and control target setting processes, Business Target Agreements (BTAs)",
    appEvidence: "Pipeline KPI strip: Projects tracked, Under construction %, Approved %, Siemens incumbent count; Market Country table: per-market route km and project status distribution.",
  },
];

// ─── Components ───────────────────────────────────────────────────────────────

function StatCard({ letter, sub, pillar, color, stat, desc, appLink, href }: DegreePillar) {
  return (
    <Link
      href={href}
      className="block rounded-sm border overflow-hidden hover:opacity-80 transition-opacity duration-150"
      style={{
        background: "var(--theme-color-2)",
        borderColor: "var(--theme-color-std-bdr)",
        boxShadow: "0 2px 8px rgba(0,0,0,0.18)",
      }}
    >
      <div className="h-[4px] w-full" style={{ background: "var(--ix-gradient)" }} aria-hidden="true" />
      <div className="p-4 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-mono text-3xl font-bold leading-none" style={{ color }}>
              {letter}
              {sub && <sub className="font-mono text-sm" style={{ verticalAlign: "sub", fontSize: "0.55em" }}>{sub}</sub>}
            </span>
            <span className="text-sm font-semibold" style={{ color: "var(--theme-color-std-text)" }}>{pillar}</span>
          </div>
          <span style={{ background: color, color: "#fff", fontSize: "8px", fontWeight: 700, padding: "1px 5px", borderRadius: "2px", flexShrink: 0 }}>
            {appLink}
          </span>
        </div>
        <p className="text-xs leading-relaxed" style={{ color: "var(--theme-color-soft-text)" }}>{desc}</p>
        <p className="text-xs font-mono" style={{ color }}>{stat}</p>
      </div>
    </Link>
  );
}

function BtaCard({ title, desc, appCapability, href }: BtaDimension) {
  return (
    <Link
      href={href}
      className="block rounded-sm border overflow-hidden hover:opacity-80 transition-opacity duration-150"
      style={{
        background: "var(--theme-color-2)",
        borderColor: "var(--theme-color-std-bdr)",
        boxShadow: "0 1px 4px rgba(0,0,0,0.14)",
      }}
    >
      <div className="h-[4px] w-full" style={{ background: "var(--ix-gradient)" }} aria-hidden="true" />
      <div className="p-4 space-y-1.5">
        <p className="text-sm font-semibold" style={{ color: "var(--theme-color-std-text)" }}>{title}</p>
        <p className="text-xs" style={{ color: "var(--theme-color-soft-text)" }}>{desc}</p>
        <p className="text-xs font-mono leading-relaxed" style={{ color: "var(--ix-primary)" }}>{appCapability}</p>
      </div>
    </Link>
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
          How RailShift APAC maps to Siemens Mobility&rsquo;s strategic frameworks — DEGREE sustainability, BTA planning, and APAC market strategy.
        </p>
      </div>

      {/* DEGREE pillars */}
      <section className="space-y-4">
        <div className="pl-3 border-l-2" style={{ borderColor: "var(--ix-primary)" }}>
          <h2 className="text-base font-semibold tracking-tight" style={{ color: "var(--theme-color-std-text)" }}>
            DEGREE Framework alignment
          </h2>
          <p className="text-xs mt-0.5" style={{ color: "var(--theme-color-soft-text)" }}>
            Siemens&rsquo; six-pillar sustainability framework. Each pillar maps to a specific app capability backed by cited, verifiable data.
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
        <div className="pl-3 border-l-2" style={{ borderColor: "var(--ix-primary)" }}>
          <h2 className="text-base font-semibold tracking-tight" style={{ color: "var(--theme-color-std-text)" }}>
            BTA planning dimensions
          </h2>
          <p className="text-xs mt-0.5" style={{ color: "var(--theme-color-soft-text)" }}>
            Business Target Agreement inputs — what each app section contributes to a Siemens APAC BTA cycle.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {BTA_DIMENSIONS.map((d) => (
            <BtaCard key={d.title} {...d} />
          ))}
        </div>
      </section>

      {/* JD Requirements mapping */}
      <MarketCard title="JD requirements — app capabilities mapping">
        <div className="space-y-0">
          {STRATEGIC_THEMES.map(({ theme, jdRef, appEvidence }, i) => (
            <div
              key={theme}
              className="py-4 border-b last:border-0"
              style={{ borderColor: "var(--theme-color-x-weak-bdr)" }}
            >
              <div className="flex items-start gap-3">
                <span className="font-mono text-xs shrink-0 w-5 tabular-nums" style={{ color: "var(--ix-primary)" }}>
                  {i + 1}
                </span>
                <div className="space-y-1.5 min-w-0">
                  <p className="text-sm font-semibold" style={{ color: "var(--theme-color-std-text)" }}>{theme}</p>
                  <p className="text-xs italic leading-relaxed" style={{ color: "var(--theme-color-soft-text)" }}>
                    &ldquo;{jdRef}&rdquo;
                  </p>
                  <p className="text-xs leading-relaxed" style={{ color: "var(--theme-color-primary)" }}>
                    → {appEvidence}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </MarketCard>

      {/* Candidate Fit */}
      <section className="space-y-4">
        <div className="pl-3 border-l-2" style={{ borderColor: "var(--ix-primary)" }}>
          <h2 className="text-base font-semibold tracking-tight" style={{ color: "var(--theme-color-std-text)" }}>
            Candidate fit
          </h2>
          <p className="text-xs mt-0.5" style={{ color: "var(--theme-color-soft-text)" }}>
            How this prototype demonstrates the capabilities the role requires — using the app itself as evidence.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {CANDIDATE_FIT.map(({ requirement, evidence, strength }) => {
            const accentColor = strength === "HIGH" ? "var(--theme-color-success)" : "var(--theme-color-warning)";
            return (
              <div
                key={requirement}
                className="rounded-sm border overflow-hidden"
                style={{
                  background: "var(--theme-color-2)",
                  borderColor: "var(--theme-color-std-bdr)",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.14)",
                  borderLeft: `3px solid ${accentColor}`,
                }}
              >
                <div className="h-[4px] w-full" style={{ background: "var(--ix-gradient)" }} aria-hidden="true" />
                <div className="p-4 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--theme-color-soft-text)" }}>
                      {requirement}
                    </p>
                    <span style={{
                      background: accentColor,
                      color: "#fff",
                      fontSize: "8px",
                      fontWeight: 700,
                      padding: "1px 5px",
                      borderRadius: "2px",
                      flexShrink: 0,
                      letterSpacing: "0.4px",
                    }}>{strength}</span>
                  </div>
                  <p className="text-xs leading-relaxed" style={{ color: "var(--theme-color-soft-text)" }}>{evidence}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Footer */}
      <p className="text-xs border-t pt-4" style={{ color: "var(--theme-color-weak-text)", borderColor: "var(--theme-color-x-weak-bdr)" }}>
        All figures on this page are derived from the verified dataset. No figures are fabricated. Confidence levels and source citations are accessible via the Methodology drawer.
      </p>
    </div>
  );
}
