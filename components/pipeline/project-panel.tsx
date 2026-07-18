import type { Project } from "@/data/seed";
import { SOURCES } from "@/data/seed";
import { STATUS_LABEL, STATUS_BADGE } from "./status-config";
import ConfidenceBadge from "@/components/confidence-badge";

interface Props {
  project: Project;
  onClose: () => void;
}

const sourceMap = Object.fromEntries(SOURCES.map((s) => [s.id, s]));

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[7rem_1fr] gap-x-2 py-2 border-b border-border last:border-0">
      <dt className="text-xs text-muted-foreground leading-5 pt-px">{label}</dt>
      <dd className="text-sm text-foreground leading-5 break-words">{value ?? <span className="text-muted-foreground">n/a</span>}</dd>
    </div>
  );
}

export default function ProjectPanel({ project, onClose }: Props) {
  const src = sourceMap[project.source];

  return (
    <aside className="flex flex-col h-full bg-card border border-border rounded-sm overflow-hidden">
      <div className="flex items-start justify-between gap-2 px-4 py-3 border-b border-border">
        <h2 className="text-sm font-semibold leading-5 text-foreground">
          {project.name}
        </h2>
        <button
          onClick={onClose}
          className="shrink-0 text-muted-foreground hover:text-foreground transition-colors text-lg leading-none"
          aria-label="Close panel"
        >
          ×
        </button>
      </div>

      <dl className="flex-1 overflow-y-auto px-4 py-1 text-sm">
        <Row label="Country" value={project.country} />
        <Row
          label="Status"
          value={
            <span className={`inline-flex items-center rounded px-1.5 py-0.5 text-xs font-medium ${STATUS_BADGE[project.status]}`}>
              {STATUS_LABEL[project.status]}
            </span>
          }
        />
        <Row label="Value" value={project.value} />
        <Row
          label="Length"
          value={project.lengthKm != null ? `${project.lengthKm.toLocaleString()} km` : null}
        />
        <Row
          label="Stations"
          value={project.stations != null ? project.stations : null}
        />
        <Row label="Key date" value={project.keyDate} />
        <Row
          label="Confidence"
          value={<ConfidenceBadge confidence={project.confidence} />}
        />
        {project.note && <Row label="Analyst note" value={project.note} />}
      </dl>

      {src && (
        <div className="px-4 py-2 border-t border-border text-xs text-muted-foreground">
          Source:{" "}
          <a
            href={src.url}
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-foreground transition-colors"
          >
            {src.label}
          </a>
        </div>
      )}
    </aside>
  );
}
