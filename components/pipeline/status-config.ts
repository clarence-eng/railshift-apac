import type { ProjectStatus } from "@/data/seed";

export const STATUS_LABEL: Record<ProjectStatus, string> = {
  operational: "Operational",
  "under-construction": "Under Construction",
  approved: "Approved",
  undecided: "Undecided",
};

// Hex colours used for map markers and table badges
export const STATUS_COLOR: Record<ProjectStatus, string> = {
  operational: "#22c55e",       // green-500
  "under-construction": "#f59e0b", // amber-500
  approved: "#3b82f6",          // blue-500
  undecided: "#9ca3af",         // gray-400
};

// Tailwind badge classes (bg + text, dark-compatible)
export const STATUS_BADGE: Record<ProjectStatus, string> = {
  operational: "bg-green-900/60 text-green-300 border border-green-700",
  "under-construction": "bg-amber-900/60 text-amber-300 border border-amber-700",
  approved: "bg-blue-900/60 text-blue-300 border border-blue-700",
  undecided: "bg-zinc-800 text-zinc-400 border border-zinc-600",
};

