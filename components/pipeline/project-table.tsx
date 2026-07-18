"use client";

import { useState, useMemo } from "react";
import type { Project, ProjectStatus } from "@/data/seed";
import { STATUS_LABEL, STATUS_BADGE } from "./status-config";
import ConfidenceBadge from "@/components/confidence-badge";

type SortKey = "name" | "country" | "status" | "lengthKm" | "keyDate";
type SortDir = "asc" | "desc";

const ALL_STATUSES: ProjectStatus[] = [
  "operational",
  "under-construction",
  "approved",
  "undecided",
];

interface Props {
  projects: Project[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

function SortIcon({ dir }: { dir: SortDir | null }) {
  if (!dir) return <span className="opacity-20">↕</span>;
  return <span>{dir === "asc" ? "↑" : "↓"}</span>;
}

export default function ProjectTable({ projects, selectedId, onSelect }: Props) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | "">("");
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return projects
      .filter((p) => {
        if (statusFilter && p.status !== statusFilter) return false;
        if (q) {
          return (
            p.name.toLowerCase().includes(q) ||
            p.country.toLowerCase().includes(q) ||
            (p.value?.toLowerCase().includes(q) ?? false)
          );
        }
        return true;
      })
      .sort((a, b) => {
        const dir = sortDir === "asc" ? 1 : -1;
        const av = a[sortKey];
        const bv = b[sortKey];
        if (av == null && bv == null) return 0;
        if (av == null) return 1;
        if (bv == null) return -1;
        if (typeof av === "number" && typeof bv === "number") return (av - bv) * dir;
        return String(av).localeCompare(String(bv)) * dir;
      });
  }, [projects, query, statusFilter, sortKey, sortDir]);

  const TH = ({
    col,
    children,
  }: {
    col: SortKey;
    children: React.ReactNode;
  }) => (
    <th
      onClick={() => toggleSort(col)}
      className="px-3 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer select-none whitespace-nowrap hover:text-foreground transition-colors"
    >
      {children}{" "}
      <SortIcon dir={sortKey === col ? sortDir : null} />
    </th>
  );

  return (
    <section className="space-y-3">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        <input
          type="search"
          placeholder="Search projects…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="h-8 w-full sm:w-52 rounded border border-input bg-card px-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as ProjectStatus | "")}
          className="h-8 rounded border border-input bg-card px-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
        >
          <option value="">All statuses</option>
          {ALL_STATUSES.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABEL[s]}
            </option>
          ))}
        </select>
        <span className="ml-auto text-xs text-muted-foreground whitespace-nowrap">
          {filtered.length} of {projects.length}
        </span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-sm border border-border">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 border-b border-border">
            <tr>
              <TH col="name">Project</TH>
              <TH col="country">Country</TH>
              <TH col="status">Status</TH>
              <th className="hidden md:table-cell px-3 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider whitespace-nowrap">Value</th>
              <TH col="lengthKm">km</TH>
              <th className="hidden sm:table-cell px-3 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer select-none whitespace-nowrap hover:text-foreground transition-colors" onClick={() => toggleSort("keyDate")}>
                Key date <SortIcon dir={sortKey === "keyDate" ? sortDir : null} />
              </th>
              <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Conf.</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr
                key={p.id}
                onClick={() => onSelect(p.id)}
                className={[
                  "border-b border-border cursor-pointer transition-colors last:border-0",
                  selectedId === p.id
                    ? "bg-muted/60"
                    : "hover:bg-muted/30",
                ].join(" ")}
              >
                <td className="px-3 py-2.5 font-medium text-foreground">
                  <span className="line-clamp-2">{p.name}</span>
                </td>
                <td className="px-3 py-2.5 text-muted-foreground whitespace-nowrap text-xs">{p.country}</td>
                <td className="px-3 py-2.5 whitespace-nowrap">
                  <span className={`inline-flex items-center rounded px-1.5 py-0.5 text-xs font-medium ${STATUS_BADGE[p.status]}`}>
                    {STATUS_LABEL[p.status]}
                  </span>
                </td>
                <td className="hidden md:table-cell px-3 py-2.5 text-muted-foreground text-xs max-w-[160px]">
                  {p.value ?? <span className="text-zinc-600">n/a</span>}
                </td>
                <td className="px-3 py-2.5 text-muted-foreground whitespace-nowrap text-xs">
                  {p.lengthKm != null ? p.lengthKm.toLocaleString() : <span className="text-zinc-600">n/a</span>}
                </td>
                <td className="hidden sm:table-cell px-3 py-2.5 text-muted-foreground text-xs max-w-[130px]">
                  {p.keyDate ?? <span className="text-zinc-600">n/a</span>}
                </td>
                <td className="px-3 py-2.5 whitespace-nowrap">
                  <ConfidenceBadge confidence={p.confidence} />
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="px-3 py-8 text-center text-muted-foreground text-sm">
                  No projects match the current filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
