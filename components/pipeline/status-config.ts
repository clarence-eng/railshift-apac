import type { ProjectStatus } from "@/data/seed";

export const STATUS_LABEL: Record<ProjectStatus, string> = {
  operational: "Operational",
  "under-construction": "Under Construction",
  approved: "Approved",
  undecided: "Undecided",
};

// CSS variable references — resolve correctly in both themes at paint time.
// Used for MapLibre marker fills (DOM style) and legend dots (inline style).
export const STATUS_COLOR_VAR: Record<ProjectStatus, string> = {
  operational:         "var(--ix-success)",
  "under-construction":"var(--ix-warning)",
  approved:            "var(--ix-info)",
  undecided:           "var(--ix-neutral)",
};

// Resolved hex for MapLibre (needs a concrete colour, not a CSS var).
// These mirror the dark-theme token values from globals.css and are used
// only when getComputedStyle is unavailable (SSR guard). At runtime
// getResolvedStatusColor() reads the live token instead.
export const STATUS_COLOR_FALLBACK: Record<ProjectStatus, string> = {
  operational:         "#44cc00",
  "under-construction":"#ffbb00",
  approved:            "#357fff",
  undecided:           "#b6b8b9",
};

/** Read the live CSS variable value from the document root at call time. */
export function getResolvedStatusColor(status: ProjectStatus): string {
  if (typeof window === "undefined") return STATUS_COLOR_FALLBACK[status];
  return getComputedStyle(document.documentElement)
    .getPropertyValue(
      status === "operational"          ? "--ix-success"  :
      status === "under-construction"   ? "--ix-warning"  :
      status === "approved"             ? "--ix-info"     :
                                          "--ix-neutral"
    )
    .trim() || STATUS_COLOR_FALLBACK[status];
}

// Tailwind badge classes — use iX semantic tokens mapped through Tailwind
export const STATUS_BADGE: Record<ProjectStatus, string> = {
  operational:          "bg-success/15 text-success border border-success/30",
  "under-construction": "bg-warning/15 text-warning border border-warning/30",
  approved:             "bg-info/15 text-info border border-info/30",
  undecided:            "bg-neutral/15 text-neutral border border-neutral/30",
};
