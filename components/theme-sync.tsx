"use client";

import { useEffect } from "react";
import { useTheme } from "next-themes";

/**
 * Keeps [data-ix-color-schema] in sync with the next-themes resolved theme.
 * The iX CSS is scoped to [data-ix-theme=classic][data-ix-color-schema=dark|light],
 * so this attribute must be correct for iX --theme-color-* tokens to resolve.
 * Runs on every theme change; no visible output.
 */
export function ThemeSync() {
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    const schema = resolvedTheme === "light" ? "light" : "dark";
    document.documentElement.setAttribute("data-ix-color-schema", schema);
  }, [resolvedTheme]);

  return null;
}
