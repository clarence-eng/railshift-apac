import type { Project } from "@/data/seed";
import MarketCard from "./market-card";
import { isSiemensIncumbent, hasSiemensPresence } from "@/lib/project-utils";

interface Props { projects: Project[]; }

// Derive competitor presence from note + project characteristics.
// We never fabricate — only note text and project type heuristics.
interface CompetitorPresence {
  siemens: "incumbent" | "likely" | "possible" | "unclear";
  alstom: "present" | "likely" | "possible" | "unclear";
  hitachi: "present" | "likely" | "possible" | "unclear";
  crrc: "present" | "likely" | "possible" | "unclear";
  rationale: string;
}

function assessCompetitors(p: Project): CompetitorPresence {
  const note = (p.note ?? "").toLowerCase();
  const name = p.name.toLowerCase();
  const combined = `${note} ${name}`;

  // Siemens position
  const siemens: CompetitorPresence["siemens"] =
    isSiemensIncumbent(p.note) ? "incumbent" :
    hasSiemensPresence(p.note) ? "likely" :
    /cbtc|trainguard|sirius|goA 4/i.test(p.note ?? "") ? "likely" :
    "possible";

  // Alstom — strong in metro CBTC and HSR (Urbalis, Citalis)
  const alstom: CompetitorPresence["alstom"] =
    /alstom/i.test(combined) ? "present" :
    /cbtc|metro|mrt|urban/i.test(combined) ? "likely" :
    /hsr|high.speed/i.test(combined) ? "likely" :
    "possible";

  // Hitachi Rail — Singapore (NSL/EWL history), Australia (Downer)
  const hitachi: CompetitorPresence["hitachi"] =
    /hitachi/i.test(combined) ? "present" :
    p.country.includes("Singapore") || p.country.includes("Australia") ? "likely" :
    /metro|urban|subway/i.test(combined) ? "possible" :
    "unclear";

  // CRRC — rolling stock dominant; signalling emerging in China-influenced projects
  const crrc: CompetitorPresence["crrc"] =
    /crrc|china.*exim|chinese.*funded/i.test(combined) ? "likely" :
    /tcr|thai.china|ecrl|whoosh/i.test(combined) ? "likely" :
    /freight|mainline/i.test(combined) ? "possible" :
    "unclear";

  const rationale = p.note ?? "Assessed from project type and geography.";

  return { siemens, alstom, hitachi, crrc, rationale };
}

const PRESENCE_STYLE: Record<string, { label: string; color: string; bg: string }> = {
  incumbent: { label: "INCUMBENT", color: "#fff",                    bg: "var(--ix-primary)" },
  present:   { label: "PRESENT",   color: "#fff",                    bg: "var(--theme-color-success)" },
  likely:    { label: "LIKELY",    color: "var(--theme-color-std-text)", bg: "var(--theme-color-warning)" },
  possible:  { label: "POSSIBLE",  color: "var(--theme-color-soft-text)", bg: "var(--theme-color-3)" },
  unclear:   { label: "—",         color: "var(--theme-color-weak-text)", bg: "transparent" },
};

function PresenceBadge({ level }: { level: string }) {
  const s = PRESENCE_STYLE[level] ?? PRESENCE_STYLE.unclear;
  return (
    <span style={{
      background: s.bg,
      color: s.color,
      fontSize: "9px",
      fontWeight: 700,
      padding: "2px 5px",
      borderRadius: "2px",
      letterSpacing: "0.4px",
      display: "inline-block",
    }}>
      {s.label}
    </span>
  );
}

// Summary stats
function buildSummary(data: Array<{ p: Project; comp: CompetitorPresence }>) {
  return {
    siemensIncumbent: data.filter((d) => d.comp.siemens === "incumbent").length,
    siemensLikely:    data.filter((d) => d.comp.siemens === "likely").length,
    alstomPresent:    data.filter((d) => d.comp.alstom === "present" || d.comp.alstom === "likely").length,
    hitachiPresent:   data.filter((d) => d.comp.hitachi === "present" || d.comp.hitachi === "likely").length,
    crrcPresent:      data.filter((d) => d.comp.crrc === "present" || d.comp.crrc === "likely").length,
  };
}

export default function CompetitiveAnalysis({ projects }: Props) {
  const data = projects.map((p) => ({ p, comp: assessCompetitors(p) }));
  const summary = buildSummary(data);

  return (
    <div className="space-y-6">
      {/* Summary KPIs */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { label: "Siemens incumbent", value: summary.siemensIncumbent, sub: "confirmed by press release", color: "var(--ix-primary)" },
          { label: "Siemens likely", value: summary.siemensIncumbent + summary.siemensLikely, sub: "incumbent + strong prospect", color: "var(--ix-primary)" },
          { label: "Alstom presence", value: summary.alstomPresent, sub: "present or likely", color: "var(--theme-color-info)" },
          { label: "CRRC / Hitachi", value: Math.max(summary.crrcPresent, summary.hitachiPresent), sub: "highest of the two", color: "var(--theme-color-neutral)" },
        ].map(({ label, value, sub, color }) => (
          <div key={label} className="rounded-sm border overflow-hidden" style={{ background: "var(--theme-color-2)", borderColor: "var(--theme-color-std-bdr)", boxShadow: "0 1px 4px rgba(0,0,0,0.14)" }}>
            <div className="h-[4px] w-full" style={{ background: "var(--ix-gradient)" }} aria-hidden="true" />
            <div className="px-4 pt-3 pb-4 space-y-1">
              <p className="text-xs uppercase tracking-widest leading-4" style={{ color: "var(--theme-color-soft-text)" }}>{label}</p>
              <p className="font-mono text-3xl font-semibold tabular-nums leading-8" style={{ color }}>{value}</p>
              <p className="text-xs" style={{ color: "var(--theme-color-weak-text)" }}>{sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Competitor matrix */}
      <MarketCard
        title="Competitor presence matrix"
        note="Derived from analyst notes and project characteristics. Not a confirmed competitive intelligence source — treat as indicative."
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b" style={{ borderColor: "var(--theme-color-std-bdr)", background: "var(--theme-color-2)" }}>
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider" style={{ color: "var(--theme-color-soft-text)" }}>Project</th>
                <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider" style={{ color: "var(--theme-color-soft-text)" }}>Country</th>
                <th className="px-3 py-2 text-center text-xs font-medium uppercase tracking-wider" style={{ color: "var(--ix-primary)" }}>Siemens</th>
                <th className="px-3 py-2 text-center text-xs font-medium uppercase tracking-wider" style={{ color: "var(--theme-color-soft-text)" }}>Alstom</th>
                <th className="px-3 py-2 text-center text-xs font-medium uppercase tracking-wider" style={{ color: "var(--theme-color-soft-text)" }}>Hitachi</th>
                <th className="px-3 py-2 text-center text-xs font-medium uppercase tracking-wider" style={{ color: "var(--theme-color-soft-text)" }}>CRRC</th>
                <th className="hidden lg:table-cell px-3 py-2 text-left text-xs font-medium uppercase tracking-wider" style={{ color: "var(--theme-color-soft-text)" }}>Analyst note</th>
              </tr>
            </thead>
            <tbody>
              {data.map(({ p, comp }, i) => (
                <tr
                  key={p.id}
                  className="border-b last:border-0"
                  style={{
                    borderColor: "var(--theme-color-x-weak-bdr)",
                    background: i % 2 === 1 ? "var(--theme-color-3)" : undefined,
                  }}
                >
                  <td className="px-3 py-2.5" style={{ color: "var(--theme-color-std-text)" }}>
                    <span className="font-medium text-xs">{p.name}</span>
                    {comp.siemens === "incumbent" && (
                      <span className="ml-1.5" style={{ background: "var(--ix-primary)", color: "#fff", fontSize: "8px", fontWeight: 700, padding: "1px 4px", borderRadius: "2px" }}>S</span>
                    )}
                  </td>
                  <td className="px-3 py-2.5 text-xs" style={{ color: "var(--theme-color-soft-text)" }}>{p.country}</td>
                  <td className="px-3 py-2.5 text-center"><PresenceBadge level={comp.siemens} /></td>
                  <td className="px-3 py-2.5 text-center"><PresenceBadge level={comp.alstom} /></td>
                  <td className="px-3 py-2.5 text-center"><PresenceBadge level={comp.hitachi} /></td>
                  <td className="px-3 py-2.5 text-center"><PresenceBadge level={comp.crrc} /></td>
                  <td className="hidden lg:table-cell px-3 py-2.5 text-xs max-w-[240px]" style={{ color: "var(--theme-color-soft-text)" }}>{comp.rationale}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </MarketCard>

      {/* Legend */}
      <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs" style={{ color: "var(--theme-color-soft-text)" }}>
        {Object.entries(PRESENCE_STYLE).filter(([k]) => k !== "unclear").map(([key, s]) => (
          <span key={key} className="flex items-center gap-1.5">
            <span style={{ display: "inline-block", background: s.bg, width: "28px", height: "14px", borderRadius: "2px" }} />
            {s.label}
          </span>
        ))}
        <span className="flex items-center gap-1.5">
          <span style={{ display: "inline-block", width: "28px", height: "14px" }} />
          — = No signal
        </span>
      </div>
    </div>
  );
}
