"use client";

import { useEffect, useState } from "react";

function cssVar(name: string): string {
  if (typeof window === "undefined") return "";
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

export interface ChartColors {
  c1: string; c2: string; c3: string; c4: string;
  grid: string; card: string; border: string;
  foreground: string; muted: string; primary: string;
  success: string; warning: string; error: string; info: string; neutral: string;
}

const DARK_FALLBACK: ChartColors = {
  c1: "#00ffe7", c2: "#94ffc9", c3: "#00c2cc", c4: "#a3eeff",
  grid: "rgba(255,255,255,0.1)",
  card: "#283236", border: "rgba(211,236,248,0.55)",
  foreground: "rgba(245,252,255,0.9)", muted: "rgba(229,247,255,0.65)",
  primary: "#00bde3",
  success: "#44cc00", warning: "#ffbb00", error: "#ff2453",
  info: "#357fff", neutral: "#b6b8b9",
};

export function useChartColors(): ChartColors {
  const [colors, setColors] = useState<ChartColors>(DARK_FALLBACK);

  useEffect(() => {
    function read() {
      setColors({
        c1:         cssVar("--ix-chart-1")    || DARK_FALLBACK.c1,
        c2:         cssVar("--ix-chart-2")    || DARK_FALLBACK.c2,
        c3:         cssVar("--ix-chart-3")    || DARK_FALLBACK.c3,
        c4:         cssVar("--ix-chart-4")    || DARK_FALLBACK.c4,
        grid:       cssVar("--ix-chart-grid") || DARK_FALLBACK.grid,
        card:       cssVar("--ix-surface-1")  || DARK_FALLBACK.card,
        border:     cssVar("--ix-border")     || DARK_FALLBACK.border,
        foreground: cssVar("--ix-text")       || DARK_FALLBACK.foreground,
        muted:      cssVar("--ix-text-soft")  || DARK_FALLBACK.muted,
        primary:    cssVar("--ix-primary")    || DARK_FALLBACK.primary,
        success:    cssVar("--ix-success")    || DARK_FALLBACK.success,
        warning:    cssVar("--ix-warning")    || DARK_FALLBACK.warning,
        error:      cssVar("--ix-error")      || DARK_FALLBACK.error,
        info:       cssVar("--ix-info")       || DARK_FALLBACK.info,
        neutral:    cssVar("--ix-neutral")    || DARK_FALLBACK.neutral,
      });
    }
    read();
    // Re-read when iX color schema attribute changes on <html> (covers theme toggle)
    const observer = new MutationObserver(read);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-ix-color-schema", "class"],
    });
    return () => observer.disconnect();
  }, []);

  return colors;
}
