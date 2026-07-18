"use client";

import { useEffect } from "react";
import { useTheme } from "next-themes";

export function ThemeSync() {
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    const schema = resolvedTheme === "light" ? "light" : "dark";
    document.documentElement.setAttribute("data-ix-color-schema", schema);
    document.documentElement.classList.toggle("dark", schema === "dark");
    document.documentElement.classList.toggle("light", schema === "light");
  }, [resolvedTheme]);

  return null;
}
