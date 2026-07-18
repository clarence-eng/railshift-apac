"use client";

import { useEffect, useRef } from "react";
import { useTheme } from "next-themes";
import type { Map as MLMap } from "maplibre-gl";
import type { Project } from "@/data/seed";
import { getResolvedStatusColor } from "./status-config";

// Dark → Carto dark-matter; Light → OpenFreeMap liberty (Carto positron fallback)
const STYLE_DARK        = "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json";
const STYLE_LIGHT       = "https://tiles.openfreemap.org/styles/liberty";
const STYLE_LIGHT_FALLBACK = "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json";

interface Props {
  projects: Project[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export default function PipelineMap({ projects, selectedId, onSelect }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MLMap | null>(null);
  const { resolvedTheme } = useTheme();

  // Destroy and rebuild when theme flips so basemap changes
  useEffect(() => {
    if (!containerRef.current) return;

    // Clean up any prior instance
    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }

    const isDark = resolvedTheme !== "light";
    const primaryStyle = isDark ? STYLE_DARK : STYLE_LIGHT;
    const fallbackStyle = isDark ? STYLE_DARK : STYLE_LIGHT_FALLBACK;

    async function initMap(style: string) {
      const { Map, NavigationControl, AttributionControl } = await import("maplibre-gl");
      await import("maplibre-gl/dist/maplibre-gl.css");

      if (!containerRef.current) return;

      const map = new Map({
        container: containerRef.current,
        style,
        center: [108, 5],
        zoom: 3.2,
        attributionControl: false,
      });

      mapRef.current = map;

      map.addControl(new NavigationControl({ showCompass: false }), "top-right");

      map.addControl(
        new AttributionControl({
          customAttribution: isDark
            ? '© <a href="https://carto.com/attributions" target="_blank">CARTO</a> © <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap contributors</a>'
            : '© <a href="https://openfreemap.org" target="_blank">OpenFreeMap</a> © <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap contributors</a>',
          compact: true,
        }),
        "bottom-right"
      );

      map.on("load", () => addMarkers(map));
    }

    function addMarkers(map: MLMap) {
      import("maplibre-gl").then(({ Marker }) => {
        for (const project of projects) {
          const el = document.createElement("div");
          // Read live token value — correct for current theme
          const color = getResolvedStatusColor(project.status);
          const isDarkMap = resolvedTheme !== "light";
          el.style.cssText = `
            width: 12px; height: 12px;
            background: ${color};
            border: 1.5px solid ${isDarkMap ? "rgba(15,22,25,0.9)" : "rgba(255,255,255,0.9)"};
            border-radius: 50%;
            cursor: pointer;
            box-shadow: 0 1px 3px rgba(0,0,0,0.5);
            transition: transform 0.12s;
          `;
          el.title = project.name;
          el.setAttribute("aria-label", project.name);

          el.addEventListener("mouseenter", () => { el.style.transform = "scale(1.6)"; });
          el.addEventListener("mouseleave", () => { el.style.transform = "scale(1)"; });
          el.addEventListener("click",      () => onSelect(project.id));

          new Marker({ element: el })
            .setLngLat([project.lng, project.lat])
            .addTo(map);
        }
      });
    }

    initMap(primaryStyle).catch(() => initMap(fallbackStyle));

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resolvedTheme]);

  // Fly to selected project
  useEffect(() => {
    if (!mapRef.current || !selectedId) return;
    const project = projects.find((p) => p.id === selectedId);
    if (!project) return;
    mapRef.current.flyTo({
      center: [project.lng, project.lat],
      zoom: Math.max(mapRef.current.getZoom(), 5),
      duration: 800,
    });
  }, [selectedId, projects]);

  return (
    <div
      ref={containerRef}
      className="w-full rounded-sm overflow-hidden border border-border"
      style={{ height: "clamp(300px, 50vw, 420px)" }}
      aria-label="APAC rail project map"
    />
  );
}
