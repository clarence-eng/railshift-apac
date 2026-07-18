"use client";

import { useState, useMemo } from "react";
import { IxChip, IxSelect, IxSelectItem, IxIconButton } from "@siemens/ix-react";
import type { Project, ProjectStatus } from "@/data/seed";
import { STATUS_LABEL, STATUS_CHIP_BG } from "./status-config";
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
  if (!dir) return <span className="opacity-20 select-none">↕</span>;
  return <span className="select-none">{dir === "asc" ? "↑" : "↓"}</span>;
}

// Hoisted outside the component — avoids react-hooks/static-components error.
// Receives sort state and callback as plain props (no closures over component state).
function TH({
  col, children, sortKey, sortDir, onSort,
}: {
  col: SortKey;
  children: React.ReactNode;
  sortKey: SortKey;
  sortDir: SortDir;
  onSort: (col: SortKey) => void;
}) {
  return (
    <th
      onClick={() => onSort(col)}
      className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider cursor-pointer select-none whitespace-nowrap"
      style={{ color: "var(--theme-color-soft-text)" }}
    >
      {children} <SortIcon dir={sortKey === col ? sortDir : null} />
    </th>
  );
}

export default function ProjectTable({ projects, selectedId, onSelect }: Props) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("asc"); }
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return projects
      .filter((p) => {
        if (statusFilter && p.status !== statusFilter) return false;
        if (q) return (
          p.name.toLowerCase().includes(q) ||
          p.country.toLowerCase().includes(q) ||
          (p.value?.toLowerCase().includes(q) ?? false)
        );
        return true;
      })
      .sort((a, b) => {
        const dir = sortDir === "asc" ? 1 : -1;
        const av = a[sortKey], bv = b[sortKey];
        if (av == null && bv == null) return 0;
        if (av == null) return 1;
        if (bv == null) return -1;
        if (typeof av === "number" && typeof bv === "number") return (av - bv) * dir;
        return String(av).localeCompare(String(bv)) * dir;
      });
  }, [projects, query, statusFilter, sortKey, sortDir]);

  const thProps = { sortKey, sortDir, onSort: toggleSort };

  return (
    <section className="space-y-3">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        <input
          type="search"
          placeholder="Search projects…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="h-8 w-full sm:w-52 rounded-sm border px-3 text-sm placeholder:opacity-50 focus:outline-none"
          style={{
            background: "var(--theme-color-2)",
            borderColor: "var(--theme-color-std-bdr)",
            color: "var(--theme-color-std-text)",
          }}
        />

        <IxSelect
          value={statusFilter || undefined}
          i18nPlaceholder="All statuses"
          onValueChange={(e) => setStatusFilter((e.detail as string) ?? "")}
          style={{ width: "160px" }}
        >
          {ALL_STATUSES.map((s) => (
            <IxSelectItem key={s} value={s} label={STATUS_LABEL[s]} />
          ))}
        </IxSelect>

        {statusFilter && (
          <IxIconButton
            icon="close"
            variant="tertiary"
            size="16"
            onClick={() => setStatusFilter("")}
            aria-label="Clear filter"
          />
        )}

        <span className="ml-auto text-xs" style={{ color: "var(--theme-color-soft-text)" }}>
          {filtered.length} of {projects.length}
        </span>
      </div>

      {/* Table */}
      <div
        className="overflow-x-auto rounded-sm border"
        style={{
          borderColor: "var(--theme-color-std-bdr)",
          boxShadow: "0 2px 8px rgba(0,0,0,0.18)",
        }}
      >
        <div className="h-[3px] w-full" style={{ background: "var(--ix-gradient)" }} aria-hidden="true" />
        <table className="w-full text-sm">
          <thead
            className="border-b"
            style={{
              background: "var(--theme-color-2)",
              borderColor: "var(--theme-color-std-bdr)",
            }}
          >
            <tr>
              <TH col="name" {...thProps}>Project</TH>
              <TH col="country" {...thProps}>Country</TH>
              <TH col="status" {...thProps}>Status</TH>
              <th className="hidden md:table-cell px-3 py-2 text-left text-xs font-medium uppercase tracking-wider whitespace-nowrap" style={{ color: "var(--theme-color-soft-text)" }}>Value</th>
              <TH col="lengthKm" {...thProps}>km</TH>
              <th
                className="hidden sm:table-cell px-3 py-2 text-left text-xs font-medium uppercase tracking-wider cursor-pointer select-none whitespace-nowrap"
                style={{ color: "var(--theme-color-soft-text)" }}
                onClick={() => toggleSort("keyDate")}
              >
                Key date <SortIcon dir={sortKey === "keyDate" ? sortDir : null} />
              </th>
              <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider" style={{ color: "var(--theme-color-soft-text)" }}>Conf.</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr
                key={p.id}
                onClick={() => onSelect(p.id)}
                className="border-b cursor-pointer transition-colors last:border-0"
                style={{
                  borderColor: "var(--theme-color-x-weak-bdr)",
                  background: selectedId === p.id ? "var(--theme-color-ghost--selected)" : undefined,
                }}
                onMouseEnter={(e) => {
                  if (selectedId !== p.id)
                    (e.currentTarget as HTMLTableRowElement).style.background = "var(--theme-color-ghost--hover)";
                }}
                onMouseLeave={(e) => {
                  if (selectedId !== p.id)
                    (e.currentTarget as HTMLTableRowElement).style.background = "";
                }}
              >
                <td
                  className="px-3 py-2.5 font-medium"
                  style={{
                    color: "var(--theme-color-std-text)",
                    borderLeft: selectedId === p.id ? "2px solid var(--theme-color-primary)" : "2px solid transparent",
                  }}
                >
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="line-clamp-2">{p.name}</span>
                    {/siemens/i.test(p.note ?? "") && /incumbent/i.test(p.note ?? "") && (
                      <span
                        className="hidden sm:inline shrink-0"
                        style={{ background: "var(--ix-primary)", color: "#fff", fontSize: "9px", fontWeight: 700, padding: "1px 4px", borderRadius: "2px", letterSpacing: "0.5px" }}
                      >
                        SIEMENS
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-3 py-2.5 text-xs whitespace-nowrap" style={{ color: "var(--theme-color-soft-text)" }}>{p.country}</td>
                <td className="px-3 py-2.5 whitespace-nowrap">
                  <IxChip variant="custom" background={STATUS_CHIP_BG[p.status]} style={{ fontSize: "11px" }}>
                    {STATUS_LABEL[p.status]}
                  </IxChip>
                </td>
                <td className="hidden md:table-cell px-3 py-2.5 text-xs max-w-[160px]" style={{ color: "var(--theme-color-soft-text)" }}>
                  {p.value ?? <span style={{ color: "var(--theme-color-weak-text)" }}>n/a</span>}
                </td>
                <td className="px-3 py-2.5 text-xs whitespace-nowrap" style={{ color: "var(--theme-color-soft-text)" }}>
                  {p.lengthKm != null ? p.lengthKm.toLocaleString() : <span style={{ color: "var(--theme-color-weak-text)" }}>n/a</span>}
                </td>
                <td className="hidden sm:table-cell px-3 py-2.5 text-xs max-w-[130px]" style={{ color: "var(--theme-color-soft-text)" }}>
                  {p.keyDate ?? <span style={{ color: "var(--theme-color-weak-text)" }}>n/a</span>}
                </td>
                <td className="px-3 py-2.5 whitespace-nowrap">
                  <ConfidenceBadge confidence={p.confidence} />
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="px-3 py-8 text-center text-sm" style={{ color: "var(--theme-color-soft-text)" }}>
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
