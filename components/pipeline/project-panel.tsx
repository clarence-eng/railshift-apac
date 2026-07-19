"use client";

import { IxChip, IxIconButton } from "@siemens/ix-react";
import type { Project } from "@/data/seed";
import { SOURCES } from "@/data/seed";
import { STATUS_LABEL, STATUS_CHIP_BG } from "./status-config";
import ConfidenceBadge from "@/components/confidence-badge";

interface Props {
  project: Project;
  onClose: () => void;
}

const sourceMap = Object.fromEntries(SOURCES.map((s) => [s.id, s]));

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-wrap gap-x-2 py-2 border-b last:border-0" style={{ borderColor: "var(--theme-color-x-weak-bdr)" }}>
      <dt className="text-xs font-medium uppercase tracking-wider pt-px shrink-0" style={{ color: "var(--theme-color-soft-text)", minWidth: "5.5rem" }}>{label}</dt>
      <dd className="text-sm break-words min-w-0 flex-1" style={{ color: "var(--theme-color-std-text)" }}>
        {value ?? <span style={{ color: "var(--theme-color-weak-text)" }}>n/a</span>}
      </dd>
    </div>
  );
}

export default function ProjectPanel({ project, onClose }: Props) {
  const src = sourceMap[project.source];

  return (
    <aside
      className="flex flex-col h-full rounded-sm border overflow-hidden"
      style={{
        background: "var(--theme-color-2)",
        borderColor: "var(--theme-color-std-bdr)",
        boxShadow: "0 2px 10px rgba(0,0,0,0.22)",
      }}
    >
      <div className="h-[4px] w-full shrink-0" style={{ background: "var(--ix-gradient)" }} aria-hidden="true" />
      <div className="flex items-start justify-between gap-2 px-4 py-3 border-b" style={{ borderColor: "var(--theme-color-std-bdr)" }}>
        <h2 className="text-sm font-semibold leading-5" style={{ color: "var(--theme-color-std-text)" }}>
          {project.name}
        </h2>
        <IxIconButton
          icon="close"
          variant="tertiary"
          size="16"
          onClick={onClose}
          aria-label="Close panel"
        />
      </div>

      <dl className="flex-1 overflow-y-auto px-4 py-1">
        <Row label="Country" value={project.country} />
        <Row
          label="Status"
          value={
            <IxChip variant="custom" background={STATUS_CHIP_BG[project.status]} style={{ fontSize: "11px" }}>
              {STATUS_LABEL[project.status]}
            </IxChip>
          }
        />
        <Row label="Value" value={project.value} />
        <Row label="Length" value={project.lengthKm != null ? `${project.lengthKm.toLocaleString("en-SG")} km` : null} />
        <Row label="Stations" value={project.stations != null ? project.stations : null} />
        <Row label="Key date" value={project.keyDate} />
        <Row label="Confidence" value={<ConfidenceBadge confidence={project.confidence} />} />
        {project.note && <Row label="Analyst note" value={project.note} />}
      </dl>

      {src && (
        <div className="px-4 py-2 border-t text-xs" style={{ borderColor: "var(--theme-color-std-bdr)", color: "var(--theme-color-soft-text)" }}>
          Source:{" "}
          <a
            href={src.url}
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:opacity-80 transition-opacity duration-150"
            style={{ color: "var(--theme-color-primary)" }}
          >
            {src.label}
          </a>
        </div>
      )}
    </aside>
  );
}
