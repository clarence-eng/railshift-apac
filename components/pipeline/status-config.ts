import type { ProjectStatus } from "@/data/seed";

export const STATUS_LABEL: Record<ProjectStatus, string> = {
  operational:          "Operational",
  "under-construction": "Under Construction",
  approved:             "Approved",
  undecided:            "Undecided",
};

// CSS variable references for map markers and legend dots
export const STATUS_COLOR_VAR: Record<ProjectStatus, string> = {
  operational:          "var(--ix-success)",
  "under-construction": "var(--ix-warning)",
  approved:             "var(--ix-info)",
  undecided:            "var(--ix-neutral)",
};

// Fallback hex for MapLibre (needs resolved color before CSS vars work)
export const STATUS_COLOR_FALLBACK: Record<ProjectStatus, string> = {
  operational:          "#44cc00",
  "under-construction": "#ffbb00",
  approved:             "#357fff",
  undecided:            "#b6b8b9",
};

// IxChip background — custom variant pointing at iX semantic tokens
export const STATUS_CHIP_BG: Record<ProjectStatus, string> = {
  operational:          "var(--theme-color-success)",
  "under-construction": "var(--theme-color-warning)",
  approved:             "var(--theme-color-info)",
  undecided:            "var(--theme-color-neutral)",
};

export function getResolvedStatusColor(status: ProjectStatus): string {
  if (typeof window === "undefined") return STATUS_COLOR_FALLBACK[status];
  return (
    getComputedStyle(document.documentElement)
      .getPropertyValue(
        status === "operational"          ? "--ix-success"  :
        status === "under-construction"   ? "--ix-warning"  :
        status === "approved"             ? "--ix-info"     :
                                            "--ix-neutral"
      )
      .trim() || STATUS_COLOR_FALLBACK[status]
  );
}

// Legacy — kept for project-panel STATUS_BADGE usage (plain CSS classes)
export const STATUS_BADGE: Record<ProjectStatus, string> = {
  operational:          "bg-success/15 text-success border border-success/30",
  "under-construction": "bg-warning/15 text-warning border border-warning/30",
  approved:             "bg-info/15 text-info border border-info/30",
  undecided:            "bg-neutral/15 text-neutral border border-neutral/30",
};
