"use client";

import { useMemo } from "react";
import type { Project } from "@/data/seed";
import { STATUS_COLOR_FALLBACK } from "@/components/pipeline/status-config";

interface Props { projects: Project[]; }

// Extract first 4-digit year from a keyDate string
function extractYear(keyDate: string | null): number | null {
  if (!keyDate) return null;
  const m = keyDate.match(/\b(202[0-9]|203[0-9]|204[0-9])\b/);
  return m ? parseInt(m[1], 10) : null;
}

function SectionCard({ title, note, children }: { title: string; note?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-sm border overflow-hidden" style={{ background: "var(--theme-color-2)", borderColor: "var(--theme-color-std-bdr)", boxShadow: "0 2px 8px rgba(0,0,0,0.18)" }}>
      <div className="h-[4px] w-full" style={{ background: "var(--ix-gradient)" }} aria-hidden="true" />
      <div className="px-4 py-3 border-b" style={{ borderColor: "var(--theme-color-std-bdr)" }}>
        <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--ix-primary)" }}>{title}</p>
        {note && <p className="text-xs mt-0.5" style={{ color: "var(--theme-color-weak-text)" }}>{note}</p>}
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

export default function PipelineTimeline({ projects }: Props) {
  const { datedProjects, undatedProjects, yearRange } = useMemo(() => {
    const dated = projects
      .map((p) => ({ ...p, year: extractYear(p.keyDate) }))
      .filter((p): p is typeof p & { year: number } => p.year !== null)
      .sort((a, b) => a.year - b.year);

    const undated = projects.filter((p) => extractYear(p.keyDate) === null);

    const years = dated.map((p) => p.year);
    const minYear = Math.min(...years);
    const maxYear = Math.max(...years);

    return { datedProjects: dated, undatedProjects: undated, yearRange: { min: minYear, max: maxYear } };
  }, [projects]);

  const yearSpan = yearRange.max - yearRange.min || 1;
  const years = Array.from({ length: yearRange.max - yearRange.min + 1 }, (_, i) => yearRange.min + i);

  return (
    <div className="space-y-6">
      {/* Gantt-style timeline */}
      <SectionCard
        title="Project completion timeline"
        note="Based on reported key dates. Extracted year only — actual delivery may vary."
      >
        {/* Year axis */}
        <div className="overflow-x-auto">
          <div style={{ minWidth: "600px" }}>
            {/* Year header */}
            <div className="flex border-b mb-3" style={{ borderColor: "var(--theme-color-x-weak-bdr)" }}>
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
            <div className="space-y-2">
              {datedProjects.map((p) => {
                const offset = ((p.year - yearRange.min) / yearSpan) * 100;
                const isIncumbent = /siemens/i.test(p.note ?? "") && /incumbent/i.test(p.note ?? "");
                return (
                  <div key={p.id} className="flex items-center gap-2">
                    <div className="w-52 shrink-0 text-xs leading-tight" style={{ color: "var(--theme-color-std-text)" }}>
                      <span className="line-clamp-1">{p.name}</span>
                      <span className="text-xs" style={{ color: "var(--theme-color-soft-text)" }}>{p.country}</span>
                    </div>
                    <div className="flex-1 relative h-6">
                      {/* Track */}
                      <div className="absolute inset-y-0 inset-x-0 rounded-full" style={{ background: "var(--theme-color-x-weak-bdr)" }} />
                      {/* Marker */}
                      <div
                        className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 flex items-center justify-center"
                        style={{ left: `${offset}%` }}
                        title={`${p.name} — ${p.keyDate}`}
                      >
                        <div
                          className="rounded-full flex items-center justify-center"
                          style={{
                            width: isIncumbent ? "20px" : "14px",
                            height: isIncumbent ? "20px" : "14px",
                            background: STATUS_COLOR_FALLBACK[p.status],
                            border: isIncumbent ? "2px solid var(--ix-primary)" : "1.5px solid rgba(0,0,0,0.3)",
                            boxShadow: isIncumbent ? "0 0 0 2px var(--ix-primary)" : "0 1px 3px rgba(0,0,0,0.4)",
                            zIndex: 10,
                            position: "relative",
                          }}
                        />
                      </div>
                      {/* Year label */}
                      <span
                        className="absolute top-1/2 -translate-y-1/2 font-mono text-xs ml-2"
                        style={{ left: `${offset}%`, marginLeft: "14px", color: "var(--theme-color-weak-text)", whiteSpace: "nowrap" }}
                      >
                        {p.year}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 mt-4 pt-3 border-t text-xs" style={{ borderColor: "var(--theme-color-x-weak-bdr)", color: "var(--theme-color-soft-text)" }}>
              <span className="flex items-center gap-1.5">
                <span className="inline-block w-3.5 h-3.5 rounded-full" style={{ background: "var(--theme-color-success)" }} />
                Operational
              </span>
              <span className="flex items-center gap-1.5">
                <span className="inline-block w-3.5 h-3.5 rounded-full" style={{ background: "var(--theme-color-warning)" }} />
                Under construction
              </span>
              <span className="flex items-center gap-1.5">
                <span className="inline-block w-3.5 h-3.5 rounded-full" style={{ background: "var(--theme-color-info)" }} />
                Approved
              </span>
              <span className="flex items-center gap-1.5">
                <span className="inline-block w-4 h-4 rounded-full" style={{ background: "var(--theme-color-warning)", border: "2px solid var(--ix-primary)", boxShadow: "0 0 0 2px var(--ix-primary)" }} />
                Siemens incumbent
              </span>
            </div>
          </div>
        </div>
      </SectionCard>

      {/* Year-by-year completions */}
      <SectionCard title="Completions by year" note="Number of projects reaching key milestone per year">
        <div className="space-y-3">
          {years.map((yr) => {
            const ps = datedProjects.filter((p) => p.year === yr);
            if (ps.length === 0) return null;
            return (
              <div key={yr} className="flex gap-4">
                <span className="font-mono text-sm font-semibold w-12 shrink-0 tabular-nums" style={{ color: "var(--theme-color-primary)" }}>{yr}</span>
                <div className="flex-1 space-y-1">
                  {ps.map((p) => (
                    <div key={p.id} className="flex items-center justify-between text-xs" >
                      <span style={{ color: "var(--theme-color-std-text)" }}>{p.name}</span>
                      <span style={{ color: "var(--theme-color-soft-text)" }}>{p.country}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </SectionCard>

      {/* Undated projects */}
      {undatedProjects.length > 0 && (
        <SectionCard title="No confirmed date" note="Projects with no extractable completion year">
          <div className="space-y-1">
            {undatedProjects.map((p) => (
              <div key={p.id} className="flex items-center justify-between text-xs py-1 border-b last:border-0" style={{ borderColor: "var(--theme-color-x-weak-bdr)" }}>
                <span style={{ color: "var(--theme-color-soft-text)" }}>{p.name} · {p.country}</span>
                <span style={{ color: "var(--theme-color-weak-text)" }}>{p.keyDate ?? "n/a"}</span>
              </div>
            ))}
          </div>
        </SectionCard>
      )}
    </div>
  );
}
