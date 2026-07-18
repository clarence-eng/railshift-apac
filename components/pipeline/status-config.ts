import type { ProjectStatus } from "@/data/seed";

export const STATUS_LABEL: Record<ProjectStatus, string> = {
  operational:          "Operational",
  "under-construction": "Under Construction",
  approved:             "Approved",
  undecided:            "Undecided",
};

export const STATUS_COLOR_VAR: Record<ProjectStatus, string> = {
  operational:          "var(--ix-success)",
  "under-construction": "var(--ix-warning)",
  approved:             "var(--ix-info)",
  undecided:            "var(--ix-neutral)",
};

export const STATUS_COLOR_FALLBACK: Record<ProjectStatus, string> = {
  operational:          "#44cc00",
  "under-construction": "#ffbb00",
  approved:             "#357fff",
  undecided:            "#b6b8b9",
};

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
