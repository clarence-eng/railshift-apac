"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import type { Map as MLMap } from "maplibre-gl";
import type { Project } from "@/data/seed";
import { getResolvedStatusColor } from "./status-config";

// Dark → Carto dark-matter; Light → OpenFreeMap liberty (Carto positron fallback)
const STYLE_DARK         = "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json";
const STYLE_LIGHT        = "https://tiles.openfreemap.org/styles/liberty";
const STYLE_LIGHT_FALLBACK = "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json";

// Read data-ix-color-schema from <html> — set by IxAppShell's themeSwitcher listener.
// useSyncExternalStore re-renders when the attribute changes (theme toggle).
function useIxColorSchema() {
  return useSyncExternalStore(
    (cb) => {
      if (typeof window === "undefined") return () => {};
      const obs = new MutationObserver(cb);
      obs.observe(document.documentElement, { attributes: true, attributeFilter: ["data-ix-color-schema"] });
      return () => obs.disconnect();
    },
    () => document.documentElement.getAttribute("data-ix-color-schema") ?? "dark",
    () => "dark" // SSR snapshot
  );
}

interface Props {
  projects: Project[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export default function PipelineMap({ projects, selectedId, onSelect }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MLMap | null>(null);
  const markerEls = useRef<Map<string, HTMLDivElement>>(new Map());
  const colorSchema = useIxColorSchema();
  // Refs so map init closure always sees current values without re-running the effect
  const onSelectRef = useRef(onSelect);
  const selectedIdRef = useRef(selectedId);
  useEffect(() => { onSelectRef.current = onSelect; }, [onSelect]);
  useEffect(() => { selectedIdRef.current = selectedId; }, [selectedId]);

  // Destroy and rebuild when theme flips so basemap changes
  useEffect(() => {
    if (!containerRef.current) return;

    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
      markerEls.current.clear();
    }

    const isDark = colorSchema !== "light";
    const primaryStyle = isDark ? STYLE_DARK : STYLE_LIGHT;
    const fallbackStyle = isDark ? STYLE_DARK : STYLE_LIGHT_FALLBACK;

    async function initMap(style: string) {
      const { Map, NavigationControl, AttributionControl, Marker } = await import("maplibre-gl");
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

      map.on("load", () => addMarkers(map, Marker));
    }

    function addMarkers(map: MLMap, Marker: typeof import("maplibre-gl").Marker) {
      for (const project of projects) {
        const color = getResolvedStatusColor(project.status);
        const isDarkMap = colorSchema !== "light";

        // Outer container — sized to accommodate the scaled dot without layout shift.
        // MapLibre positions this element; we never transform it.
        const container = document.createElement("div");
        container.style.cssText = `
          width: 24px; height: 24px;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer;
          background: transparent;
        `;
        container.title = project.name;
        container.setAttribute("aria-label", project.name);

        // Inner dot — this is the only element we scale/style.
        // transform-origin: center ensures scale expands from the dot's own centre.
        const dot = document.createElement("div");
        dot.style.cssText = `
          width: 12px; height: 12px;
          background: ${color};
          border: 1.5px solid ${isDarkMap ? "rgba(15,22,25,0.9)" : "rgba(255,255,255,0.9)"};
          border-radius: 50%;
          box-shadow: 0 1px 3px rgba(0,0,0,0.5);
          transition: transform 0.12s, box-shadow 0.12s;
          transform-origin: center center;
        `;
        container.appendChild(dot);

        container.addEventListener("mouseenter", () => {
          if (dot.dataset.selected !== "1") dot.style.transform = "scale(1.5)";
        });
        container.addEventListener("mouseleave", () => {
          if (dot.dataset.selected !== "1") dot.style.transform = "scale(1)";
        });
        container.addEventListener("click", () => onSelectRef.current(project.id));

        // Store the dot (not the container) in markerEls for highlight updates
        markerEls.current.set(project.id, dot);

        // anchor:'center' ensures the container's centre aligns with the coordinate
        new Marker({ element: container, anchor: "center" })
          .setLngLat([project.lng, project.lat])
          .addTo(map);
      }

      // Re-apply selection highlight for any marker selected before rebuild
      const sel = selectedIdRef.current;
      if (sel) {
        const dot = markerEls.current.get(sel);
        if (dot) {
          dot.dataset.selected = "1";
          dot.style.transform = "scale(1.6)";
          dot.style.boxShadow = "0 0 0 3px var(--ix-primary, #009999), 0 1px 3px rgba(0,0,0,0.5)";
        }
      }
    }

    initMap(primaryStyle).catch(() => initMap(fallbackStyle));

    // Capture refs in local variables so the cleanup function uses the values
    // from the time the effect ran, not the (potentially changed) ref values.
    const mapToClean = mapRef;
    const markersToClean = markerEls;
    return () => {
      mapToClean.current?.remove();
      mapToClean.current = null;
      markersToClean.current.clear();
    };
  // Projects is intentionally excluded: the map is only rebuilt on theme
  // changes (colorSchema). Project marker updates happen via the separate
  // selectedId effect below. Adding projects here would tear down and
  // rebuild the entire map on every data change.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [colorSchema]);

  // Fly to selected project with context-aware zoom
  useEffect(() => {
    if (!mapRef.current || !selectedId) return;
    const project = projects.find((p) => p.id === selectedId);
    if (!project) return;
    const map = mapRef.current;
    const currentZoom = map.getZoom();
    // If currently zoomed in close (>5.5), zoom out slightly to give geographic context
    // If zoomed out wide (<4), zoom in enough to see the marker clearly
    const targetZoom = currentZoom > 5.5
      ? Math.max(currentZoom - 0.8, 4.5)
      : Math.max(currentZoom, 4.5);
    map.flyTo({
      center: [project.lng, project.lat],
      zoom: targetZoom,
      duration: 800,
    });
  }, [selectedId, projects]);

  // Highlight selected marker — operates on the inner dot stored in markerEls
  useEffect(() => {
    markerEls.current.forEach((dot, id) => {
      if (id === selectedId) {
        dot.dataset.selected = "1";
        dot.style.transform = "scale(1.6)";
        dot.style.boxShadow = "0 0 0 3px var(--ix-primary, #009999), 0 1px 3px rgba(0,0,0,0.5)";
      } else {
        dot.dataset.selected = "";
        dot.style.transform = "scale(1)";
        dot.style.boxShadow = "0 1px 3px rgba(0,0,0,0.5)";
      }
    });
  }, [selectedId]);

  return (
    <div
      ref={containerRef}
      className="w-full rounded-sm overflow-hidden border border-border"
      style={{
        height: "clamp(300px, 50vw, 420px)",
        boxShadow: "0 2px 10px rgba(0,0,0,0.22)",
      }}
      aria-label="APAC rail project map"
    />
  );
}
