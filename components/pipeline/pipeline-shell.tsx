"use client";

import { useState, useMemo } from "react";
import dynamic from "next/dynamic";
import type { Project } from "@/data/seed";
import ProjectPanel from "./project-panel";
import ProjectTable from "./project-table";
import { STATUS_COLOR_VAR, STATUS_LABEL } from "./status-config";
import type { ProjectStatus } from "@/data/seed";

const STATUSES: ProjectStatus[] = [
  "operational",
  "under-construction",
  "approved",
  "undecided",
];

function MapSkeleton() {
  return (
    <div
      className="w-full rounded-sm border border-border bg-surface-1 overflow-hidden animate-pulse relative"
      style={{ height: "clamp(300px, 50vw, 420px)", background: "var(--theme-color-2)" }}
      aria-label="Map loading"
    >
      {/* Horizontal grid lines */}
      {[20, 38, 56, 74].map((pct) => (
        <div
          key={pct}
          className="absolute left-0 right-0 h-px"
          style={{ top: `${pct}%`, background: "var(--theme-color-x-weak-bdr)" }}
        />
      ))}
      {/* Vertical grid lines */}
      {[18, 36, 54, 72].map((pct) => (
        <div
          key={pct}
          className="absolute top-0 bottom-0 w-px"
          style={{ left: `${pct}%`, background: "var(--theme-color-x-weak-bdr)" }}
        />
      ))}
      {/* Nav control placeholder — top right */}
      <div className="absolute top-3 right-3 flex flex-col gap-0.5">
        <div className="w-6 h-6 rounded-sm" style={{ background: "var(--theme-color-3)" }} />
        <div className="w-6 h-6 rounded-sm" style={{ background: "var(--theme-color-3)" }} />
      </div>
      {/* Attribution placeholder — bottom right */}
      <div className="absolute bottom-2 right-2 h-3 w-36 rounded-sm" style={{ background: "var(--theme-color-3)" }} />
      {/* Centre label */}
      <div className="absolute inset-0 flex items-center justify-center">
        <p className="text-xs uppercase tracking-widest" style={{ color: "var(--theme-color-weak-text)" }}>
          Loading map…
        </p>
      </div>
    </div>
  );
}

const PipelineMap = dynamic(() => import("./pipeline-map"), {
  ssr: false,
  loading: MapSkeleton,
});

interface Props {
  projects: Project[];
}

export default function PipelineShell({ projects }: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selectedProject = projects.find((p) => p.id === selectedId) ?? null;

  const kpis = useMemo(() => {
    const total = projects.length;
    const underCon = projects.filter((p) => p.status === "under-construction").length;
    const approved = projects.filter((p) => p.status === "approved").length;
    const incumbent = projects.filter((p) => /siemens/i.test(p.note ?? "") && /incumbent/i.test(p.note ?? "")).length;
    return [
      { label: "Projects tracked",   value: String(total),     sub: null },
      { label: "Under construction",  value: String(underCon),  sub: `${Math.round(underCon / total * 100)}% of pipeline` },
      { label: "Approved",           value: String(approved),  sub: `${Math.round(approved / total * 100)}% of pipeline` },
      { label: "Siemens incumbent",  value: String(incumbent), sub: `${incumbent} of ${total} projects` },
    ];
  }, [projects]);

  function handleSelect(id: string) {
    setSelectedId((prev) => (prev === id ? null : id));
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <div className="pl-3 border-l-2" style={{ borderColor: "var(--ix-primary)" }}>
          <h1 className="text-2xl font-semibold tracking-tight">Pipeline</h1>
          <p className="mt-0.5 text-sm" style={{ color: "var(--theme-color-soft-text)" }}>
            {projects.length} active APAC rail projects — total identified value exceeding US$200bn
          </p>
        </div>
        {/* Legend — wraps gracefully on narrow screens */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs" style={{ color: "var(--theme-color-soft-text)" }}>
          {STATUSES.map((s) => (
            <span key={s} className="flex items-center gap-1.5">
              <span
                className="inline-block w-2 h-2 rounded-full shrink-0"
                style={{ background: STATUS_COLOR_VAR[s] }}
              />
              {STATUS_LABEL[s]}
            </span>
          ))}
        </div>
      </div>

      {/* Map + Panel — stacks on mobile, side-by-side on lg */}
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-[1fr_300px]">
        <PipelineMap
          projects={projects}
          selectedId={selectedId}
          onSelect={handleSelect}
        />

        {/* Detail panel — always rendered on lg, conditional on mobile */}
        <div className="lg:max-h-[420px]">
          {selectedProject ? (
            <ProjectPanel
              project={selectedProject}
              onClose={() => setSelectedId(null)}
            />
          ) : (
            <div
              className="hidden lg:flex h-full flex-col items-center justify-center rounded-sm border min-h-[120px] gap-2"
              style={{
                borderColor: "var(--theme-color-x-weak-bdr)",
                background: "var(--theme-color-2)",
              }}
            >
              <span
                className="inline-block w-2 h-2 rounded-full"
                style={{ background: "var(--ix-primary)", opacity: 0.5 }}
                aria-hidden="true"
              />
              <p className="text-xs tracking-widest uppercase" style={{ color: "var(--theme-color-weak-text)" }}>
                Select a project
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Mobile selected project — shows below map when something is selected */}
      {selectedProject && (
        <div className="lg:hidden">
          <ProjectPanel
            project={selectedProject}
            onClose={() => setSelectedId(null)}
          />
        </div>
      )}

      {/* KPI strip */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {kpis.map((kpi) => (
          <div
            key={kpi.label}
            className="rounded-sm border overflow-hidden"
            style={{
              background: "var(--theme-color-2)",
              borderColor: "var(--theme-color-std-bdr)",
              boxShadow: "0 1px 4px rgba(0,0,0,0.14)",
            }}
          >
            <div className="h-[4px] w-full" style={{ background: "var(--ix-gradient)" }} aria-hidden="true" />
            <div className="px-4 pt-3 pb-4 space-y-1">
              <p className="text-xs uppercase tracking-widest leading-4" style={{ color: "var(--theme-color-soft-text)" }}>
                {kpi.label}
              </p>
              <p className="font-mono text-2xl font-semibold tabular-nums leading-7" style={{ color: "var(--theme-color-primary)" }}>
                {kpi.value}
              </p>
              {kpi.sub && (
                <p className="text-xs leading-4" style={{ color: "var(--theme-color-weak-text)" }}>
                  {kpi.sub}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      <ProjectTable
        projects={projects}
        selectedId={selectedId}
        onSelect={handleSelect}
      />
    </div>
  );
}
