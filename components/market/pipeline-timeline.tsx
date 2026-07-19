import type { Project } from "@/data/seed";
import { STATUS_COLOR_FALLBACK } from "@/components/pipeline/status-config";
import MarketCard from "./market-card";

interface Props { projects: Project[]; }

function extractYear(keyDate: string | null): number | null {
  if (!keyDate) return null;
  const m = keyDate.match(/\b(20[2-4][0-9])\b/);
  return m ? parseInt(m[1], 10) : null;
}

export default function PipelineTimeline({ projects }: Props) {
  const dated = projects
    .map((p) => ({ ...p, year: extractYear(p.keyDate) }))
    .filter((p): p is typeof p & { year: number } => p.year !== null)
    .sort((a, b) => a.year - b.year);

  const undated = projects.filter((p) => extractYear(p.keyDate) === null);

  if (dated.length === 0) return <p style={{ color: "var(--theme-color-soft-text)" }}>No dated projects found.</p>;

  const minYear = Math.min(...dated.map((p) => p.year));
  const maxYear = Math.max(...dated.map((p) => p.year));
  const yearSpan = maxYear - minYear || 1;
  const years = Array.from({ length: maxYear - minYear + 1 }, (_, i) => minYear + i);

  return (
    <div className="space-y-6">
      {/* Gantt-style timeline */}
      <MarketCard
        title="Project completion timeline"
        note="Based on reported key dates. Extracted year only — actual delivery may vary."
      >
        <div className="overflow-x-auto">
          <div style={{ minWidth: "600px" }}>
            {/* Year header */}
            <div className="flex border-b mb-4" style={{ borderColor: "var(--theme-color-x-weak-bdr)" }}>
              <div className="w-52 shrink-0" />
              <div className="flex-1 flex">
                {years.map((yr) => (
                  <div key={yr} className="flex-1 text-center text-xs pb-2 font-mono" style={{ color: "var(--theme-color-soft-text)" }}>
                    {yr}
                  </div>
                ))}
              </div>
            </div>

            {/* Project rows */}
            <div className="space-y-3">
              {dated.map((p) => {
                const offset = ((p.year - minYear) / yearSpan) * 100;
                const isIncumbent = /siemens/i.test(p.note ?? "") && /incumbent/i.test(p.note ?? "");
                return (
                  <div key={p.id} className="flex items-center gap-2">
                    <div className="w-52 shrink-0">
                      <p className="text-xs font-medium leading-tight line-clamp-1" style={{ color: "var(--theme-color-std-text)" }}>{p.name}</p>
                      <p className="text-xs" style={{ color: "var(--theme-color-soft-text)" }}>{p.country}</p>
                    </div>
                    <div className="flex-1 relative" style={{ height: "24px" }}>
                      {/* Track */}
                      <div className="absolute rounded-full" style={{ background: "var(--theme-color-x-weak-bdr)", top: "50%", left: 0, right: 0, height: "2px", transform: "translateY(-50%)" }} />
                      {/* Year grid lines */}
                      {years.map((yr, i) => (
                        <div
                          key={yr}
                          className="absolute top-0 bottom-0 w-px"
                          style={{ left: `${(i / (years.length - 1 || 1)) * 100}%`, background: "var(--theme-color-x-weak-bdr)" }}
                        />
                      ))}
                      {/* Marker */}
                      <div
                        className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2"
                        style={{ left: `${offset}%`, zIndex: 10 }}
                        title={`${p.name} — ${p.keyDate}`}
                      >
                        <div style={{
                          width: isIncumbent ? "20px" : "12px",
                          height: isIncumbent ? "20px" : "12px",
                          borderRadius: "50%",
                          background: STATUS_COLOR_FALLBACK[p.status],
                          border: isIncumbent ? "2px solid var(--ix-primary)" : "1.5px solid rgba(0,0,0,0.3)",
                          boxShadow: isIncumbent ? "0 0 0 2px var(--ix-primary)" : "0 1px 3px rgba(0,0,0,0.4)",
                        }} />
                      </div>
                    </div>
                    <span className="font-mono text-xs shrink-0 w-10 text-right" style={{ color: "var(--theme-color-weak-text)" }}>{p.year}</span>
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex flex-wrap items-center gap-4 mt-5 pt-4 border-t text-xs" style={{ borderColor: "var(--theme-color-x-weak-bdr)", color: "var(--theme-color-soft-text)" }}>
              <span className="flex items-center gap-1.5">
                <span className="inline-block w-3 h-3 rounded-full" style={{ background: "var(--theme-color-success)" }} />
                Operational
              </span>
              <span className="flex items-center gap-1.5">
                <span className="inline-block w-3 h-3 rounded-full" style={{ background: "var(--theme-color-warning)" }} />
                Under construction
              </span>
              <span className="flex items-center gap-1.5">
                <span className="inline-block w-3 h-3 rounded-full" style={{ background: "var(--theme-color-info)" }} />
                Approved
              </span>
              <span className="flex items-center gap-1.5">
                <span className="inline-block w-3.5 h-3.5 rounded-full" style={{ background: "var(--theme-color-warning)", border: "2px solid var(--ix-primary)", boxShadow: "0 0 0 2px var(--ix-primary)" }} />
                Siemens incumbent
              </span>
            </div>
          </div>
        </div>
      </MarketCard>

      {/* Year-by-year completions */}
      <MarketCard title="Completions by year" note="Projects reaching key milestone per year">
        <div className="space-y-3">
          {years.map((yr) => {
            const ps = dated.filter((p) => p.year === yr);
            if (ps.length === 0) return null;
            return (
              <div key={yr} className="flex gap-4">
                <span className="font-mono text-sm font-semibold w-12 shrink-0 tabular-nums" style={{ color: "var(--theme-color-primary)" }}>{yr}</span>
                <div className="flex-1 space-y-1">
                  {ps.map((p) => (
                    <div key={p.id} className="flex items-center justify-between text-xs">
                      <span style={{ color: "var(--theme-color-std-text)" }}>{p.name}</span>
                      <span style={{ color: "var(--theme-color-soft-text)" }}>{p.country}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </MarketCard>

      {/* Undated projects */}
      {undated.length > 0 && (
        <MarketCard title="No confirmed date" note="Projects with no extractable completion year">
          <div className="space-y-1">
            {undated.map((p) => (
              <div key={p.id} className="flex items-center justify-between text-xs py-1 border-b last:border-0" style={{ borderColor: "var(--theme-color-x-weak-bdr)" }}>
                <span style={{ color: "var(--theme-color-soft-text)" }}>{p.name} · {p.country}</span>
                <span style={{ color: "var(--theme-color-weak-text)" }}>{p.keyDate ?? "n/a"}</span>
              </div>
            ))}
          </div>
        </MarketCard>
      )}
    </div>
  );
}
