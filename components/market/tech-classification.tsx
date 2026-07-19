"use client";

import { useMemo } from "react";
import type { Project } from "@/data/seed";

interface Props { projects: Project[]; }

// Classify projects into technology categories based on name/note keywords
function classifyTech(p: Project): string {
  const text = `${p.name} ${p.note ?? ""}`.toLowerCase();
  if (/cbtc|trainguard|sirius|goA|driverless|automated/i.test(text)) return "CBTC / Automation";
  if (/hsr|high.speed|320\s*km|bullet/i.test(text)) return "High-Speed Rail";
  if (/freight|inland rail/i.test(text)) return "Freight Rail";
  if (/metro|subway|mrt|lrt/i.test(text)) return "Metro / Urban Rail";
  if (/etcs|mainline|mainline signal/i.test(text)) return "Mainline Signalling";
  return "Other / Mixed";
}

const TECH_ORDER = [
  "CBTC / Automation",
  "High-Speed Rail",
  "Metro / Urban Rail",
  "Mainline Signalling",
  "Freight Rail",
  "Other / Mixed",
];

const TECH_COLOR: Record<string, string> = {
  "CBTC / Automation":    "var(--ix-primary)",
  "High-Speed Rail":      "var(--theme-color-warning)",
  "Metro / Urban Rail":   "var(--theme-color-info)",
  "Mainline Signalling":  "var(--theme-color-success)",
  "Freight Rail":         "var(--theme-color-neutral)",
  "Other / Mixed":        "var(--theme-color-soft-text)",
};

const TECH_DESC: Record<string, string> = {
  "CBTC / Automation":    "Driverless / GoA4 urban metro — Siemens' strongest differentiation",
  "High-Speed Rail":      "300+ km/h intercity — ETCS/CTCS signalling; systems integration",
  "Metro / Urban Rail":   "Urban mass transit — signalling, platform screen doors, systems",
  "Mainline Signalling":  "Conventional mainline — ETCS, interlocking, traffic management",
  "Freight Rail":         "Freight electrification and capacity — decarbonisation angle",
  "Other / Mixed":        "Multi-modal or early-stage",
};

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-sm border overflow-hidden" style={{ background: "var(--theme-color-2)", borderColor: "var(--theme-color-std-bdr)", boxShadow: "0 2px 8px rgba(0,0,0,0.18)" }}>
      <div className="h-[4px] w-full" style={{ background: "var(--ix-gradient)" }} aria-hidden="true" />
      <div className="px-4 py-3 border-b" style={{ borderColor: "var(--theme-color-std-bdr)" }}>
        <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--ix-primary)" }}>{title}</p>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

export default function TechClassification({ projects }: Props) {
  const byTech = useMemo(() => {
    const map = new Map<string, Project[]>();
    for (const p of projects) {
      const t = classifyTech(p);
      if (!map.has(t)) map.set(t, []);
      map.get(t)!.push(p);
    }
    return TECH_ORDER
      .filter((t) => map.has(t))
      .map((t) => ({ tech: t, projects: map.get(t)!, color: TECH_COLOR[t], desc: TECH_DESC[t] }));
  }, [projects]);

  const total = projects.length;

  return (
    <div className="space-y-6">
      {/* Overview tiles */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        {byTech.map(({ tech, projects: ps, color }) => (
          <div key={tech} className="rounded-sm border overflow-hidden" style={{ background: "var(--theme-color-2)", borderColor: "var(--theme-color-std-bdr)", boxShadow: "0 1px 4px rgba(0,0,0,0.14)" }}>
            <div className="h-[3px] w-full" style={{ background: color }} aria-hidden="true" />
            <div className="px-4 pt-3 pb-4 space-y-1">
              <p className="text-xs uppercase tracking-widest leading-4" style={{ color: "var(--theme-color-soft-text)" }}>{tech}</p>
              <p className="font-mono text-2xl font-semibold tabular-nums leading-7" style={{ color }}>{ps.length}</p>
              <p className="text-xs" style={{ color: "var(--theme-color-weak-text)" }}>{Math.round(ps.length / total * 100)}% of pipeline</p>
            </div>
          </div>
        ))}
      </div>

      {/* Proportional bar */}
      <SectionCard title="Technology mix — proportional view">
        <div className="space-y-3">
          {byTech.map(({ tech, projects: ps, color, desc }) => {
            const pct = Math.round(ps.length / total * 100);
            return (
              <div key={tech}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium" style={{ color: "var(--theme-color-std-text)" }}>{tech}</span>
                  <span className="font-mono text-xs tabular-nums" style={{ color }}>{ps.length} project{ps.length !== 1 ? "s" : ""} · {pct}%</span>
                </div>
                <div className="w-full rounded-full overflow-hidden" style={{ height: "8px", background: "var(--theme-color-x-weak-bdr)" }}>
                  <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: "9999px", transition: "width 0.4s ease" }} />
                </div>
                <p className="text-xs mt-1" style={{ color: "var(--theme-color-weak-text)" }}>{desc}</p>
              </div>
            );
          })}
        </div>
      </SectionCard>

      {/* Project list by tech */}
      <SectionCard title="Projects by technology">
        <div className="space-y-4">
          {byTech.map(({ tech, projects: ps, color }) => (
            <div key={tech}>
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-block w-2 h-2 rounded-full shrink-0" style={{ background: color }} aria-hidden="true" />
                <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--theme-color-std-text)" }}>{tech}</span>
              </div>
              <div className="pl-4 space-y-1">
                {ps.map((p) => (
                  <div key={p.id} className="flex items-start justify-between gap-4 text-xs py-1 border-b last:border-0" style={{ borderColor: "var(--theme-color-x-weak-bdr)" }}>
                    <div>
                      <span style={{ color: "var(--theme-color-std-text)" }}>{p.name}</span>
                      <span className="ml-1.5" style={{ color: "var(--theme-color-soft-text)" }}>· {p.country}</span>
                    </div>
                    <span className="shrink-0" style={{ color: "var(--theme-color-weak-text)" }}>{p.keyDate ?? "n/a"}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
