import type { Project } from "@/data/seed";
import MarketCard from "./market-card";

interface Props { projects: Project[]; }

type FundingSource = "JICA" | "China EXIM" | "State / Public" | "Private / Consortium" | "Multilateral" | "Unknown";

function classifyFunding(p: Project): FundingSource {
  const text = `${p.note ?? ""} ${p.value ?? ""}`.toLowerCase();
  // Note-based checks run first — these are explicit in the dataset
  if (/jica/i.test(text))                                          return "JICA";
  if (/china exim|exim.*china/i.test(text))                       return "China EXIM";
  if (/private.*fund|private.bid|consortium/i.test(text))         return "Private / Consortium";
  if (/multilateral|adb\b|world bank/i.test(text))                return "Multilateral";
  // Source-prefix fallback — project authority implies state procurement
  const src = p.source;
  if (src.startsWith("siemens-") || src === "lta" ||
      src.startsWith("my-") || src.startsWith("th-") ||
      src.startsWith("vn-") || src.startsWith("ph-") ||
      src.startsWith("au-") || src.startsWith("id-") ||
      src.startsWith("pib"))                                       return "State / Public";
  return "Unknown";
}

const FUNDING_COLOR: Record<FundingSource, string> = {
  "JICA":                "var(--theme-color-success)",
  "China EXIM":          "var(--theme-color-alarm)",
  "State / Public":      "var(--ix-primary)",
  "Private / Consortium":"var(--theme-color-warning)",
  "Multilateral":        "var(--theme-color-info)",
  "Unknown":             "var(--theme-color-neutral)",
};

const FUNDING_NOTE: Record<FundingSource, string> = {
  "JICA":                "Japan International Cooperation Agency — concessional yen loans. Strong Siemens/Hitachi supply chain alignment.",
  "China EXIM":          "China EXIM Bank financing — typically tied procurement favouring CRRC/CRIG. Monitor for systems scope carve-outs.",
  "State / Public":      "National government budget or dedicated agency. Open competitive tender expected — priority pursuit market.",
  "Private / Consortium":"Private or consortium financing — faster procurement cycle, risk-adjusted return requirements.",
  "Multilateral":        "ADB, World Bank or similar — open competitive procurement required. Strong due diligence standards.",
  "Unknown":             "Financing source not publicly confirmed in dataset.",
};

const FUNDING_ORDER: FundingSource[] = [
  "State / Public", "JICA", "Private / Consortium", "China EXIM", "Multilateral", "Unknown",
];

export default function FundingAnalysis({ projects }: Props) {
  const classified = projects.map((p) => ({ ...p, funding: classifyFunding(p) }));

  const byFunding = FUNDING_ORDER
    .map((f) => ({ source: f, projects: classified.filter((p) => p.funding === f) }))
    .filter((g) => g.projects.length > 0);

  const total = projects.length;

  return (
    <div className="space-y-6">
      {/* Summary tiles */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        {byFunding.map(({ source, projects: ps }) => (
          <div key={source} className="rounded-sm border overflow-hidden" style={{ background: "var(--theme-color-2)", borderColor: "var(--theme-color-std-bdr)", boxShadow: "0 1px 4px rgba(0,0,0,0.14)" }}>
            <div className="h-[4px] w-full" style={{ background: "var(--ix-gradient)" }} aria-hidden="true" />
            <div className="h-[4px] w-full" style={{ background: FUNDING_COLOR[source] }} aria-hidden="true" />
            <div className="px-4 pt-3 pb-4 space-y-1">
              <p className="text-xs uppercase tracking-widest leading-4" style={{ color: "var(--theme-color-soft-text)" }}>{source}</p>
              <p className="font-mono text-3xl font-semibold tabular-nums leading-8" style={{ color: FUNDING_COLOR[source] }}>{ps.length}</p>
              <p className="text-xs" style={{ color: "var(--theme-color-weak-text)" }}>{Math.round(ps.length / total * 100)}% of pipeline</p>
            </div>
          </div>
        ))}
      </div>

      {/* Proportional bar */}
      <MarketCard title="Funding source mix">
        <div className="space-y-4">
          {byFunding.map(({ source, projects: ps }) => {
            const pct = Math.round(ps.length / total * 100);
            const color = FUNDING_COLOR[source];
            return (
              <div key={source}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium" style={{ color: "var(--theme-color-std-text)" }}>{source}</span>
                  <span className="font-mono text-xs tabular-nums" style={{ color }}>
                    {ps.length} project{ps.length !== 1 ? "s" : ""} · {pct}%
                  </span>
                </div>
                <div className="w-full rounded-full overflow-hidden" style={{ height: "8px", background: "var(--theme-color-x-weak-bdr)" }}>
                  <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: "9999px", transition: "width 0.4s ease" }} />
                </div>
                <p className="text-xs mt-1" style={{ color: "var(--theme-color-weak-text)" }}>{FUNDING_NOTE[source]}</p>
              </div>
            );
          })}
        </div>
      </MarketCard>

      {/* Project breakdown by funding source */}
      <MarketCard title="Projects by funding source" note="Classified from analyst notes and project value fields. Verify with primary sources before use in proposals.">
        <div className="space-y-5">
          {byFunding.map(({ source, projects: ps }) => (
            <div key={source}>
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-block w-2 h-2 rounded-full shrink-0" style={{ background: FUNDING_COLOR[source] }} aria-hidden="true" />
                <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--theme-color-std-text)" }}>{source}</span>
              </div>
              <div className="pl-4 space-y-1">
                {ps.map((p) => (
                  <div key={p.id} className="flex items-start justify-between text-xs py-1.5 border-b last:border-0" style={{ borderColor: "var(--theme-color-x-weak-bdr)" }}>
                    <div className="min-w-0 pr-4">
                      <span className="font-medium" style={{ color: "var(--theme-color-std-text)" }}>{p.name}</span>
                      <span className="ml-1.5" style={{ color: "var(--theme-color-soft-text)" }}>· {p.country}</span>
                    </div>
                    <div className="shrink-0 text-right space-y-0.5">
                      <p style={{ color: "var(--theme-color-soft-text)" }}>{p.value ?? "n/a"}</p>
                      <p style={{ color: "var(--theme-color-weak-text)" }}>{p.keyDate ?? "n/a"}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </MarketCard>

      {/* Strategic implications */}
      <MarketCard title="Procurement implications by funding source">
        <div className="space-y-0">
          {byFunding.map(({ source, projects: ps }) => {
            const color = FUNDING_COLOR[source];
            return (
              <div key={source} className="py-3 border-b last:border-0" style={{ borderColor: "var(--theme-color-x-weak-bdr)" }}>
                <div className="flex items-start gap-3">
                  <span style={{ background: color, color: "#fff", fontSize: "9px", fontWeight: 700, padding: "2px 5px", borderRadius: "2px", flexShrink: 0, marginTop: "2px", letterSpacing: "0.4px" }}>
                    {ps.length}
                  </span>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: "var(--theme-color-std-text)" }}>{source}</p>
                    <p className="text-xs mt-0.5 leading-relaxed" style={{ color: "var(--theme-color-soft-text)" }}>{FUNDING_NOTE[source]}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </MarketCard>
    </div>
  );
}
