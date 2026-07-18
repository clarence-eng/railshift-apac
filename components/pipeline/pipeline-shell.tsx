"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import type { Project } from "@/data/seed";
import ProjectPanel from "./project-panel";
import ProjectTable from "./project-table";
import { STATUS_COLOR, STATUS_LABEL } from "./status-config";
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
      className="w-full rounded-sm bg-muted/20 border border-border animate-pulse flex items-center justify-center text-muted-foreground text-sm"
      style={{ height: "420px" }}
    >
      Loading map…
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

  function handleSelect(id: string) {
    setSelectedId((prev) => (prev === id ? null : id));
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Pipeline</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {projects.length} APAC rail projects — select a marker or row for details
          </p>
        </div>
        {/* Legend — wraps gracefully on narrow screens */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
          {STATUSES.map((s) => (
            <span key={s} className="flex items-center gap-1.5">
              <span
                className="inline-block w-2.5 h-2.5 rounded-full shrink-0"
                style={{ background: STATUS_COLOR[s] }}
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
            <div className="hidden lg:flex h-full items-center justify-center rounded-sm border border-dashed border-border text-sm text-muted-foreground min-h-[120px]">
              Select a marker to view details
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

      {/* Table */}
      <ProjectTable
        projects={projects}
        selectedId={selectedId}
        onSelect={handleSelect}
      />
    </div>
  );
}
