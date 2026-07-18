"use client";

import { useEffect, useRef } from "react";
import type { Map as MLMap } from "maplibre-gl";
import type { Project } from "@/data/seed";
import { STATUS_COLOR } from "./status-config";

const OPENFREE_STYLE =
  "https://tiles.openfreemap.org/styles/liberty";
const CARTO_FALLBACK =
  "https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json";

interface Props {
  projects: Project[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export default function PipelineMap({ projects, selectedId, onSelect }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MLMap | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    let map: MLMap;

    async function initMap(style: string) {
      const { Map, NavigationControl } = await import("maplibre-gl");
      await import("maplibre-gl/dist/maplibre-gl.css");

      map = new Map({
        container: containerRef.current!,
        style,
        center: [108, 5],
        zoom: 3.2,
        attributionControl: false,
      });

      mapRef.current = map;

      map.addControl(
        new NavigationControl({ showCompass: false }),
        "top-right"
      );

      // Custom attribution
      const { AttributionControl } = await import("maplibre-gl");
      map.addControl(
        new AttributionControl({
          customAttribution:
            '© <a href="https://openfreemap.org" target="_blank">OpenFreeMap</a> © <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap contributors</a>',
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
          el.className = "railshift-marker";
          const color = STATUS_COLOR[project.status];
          el.style.cssText = `
            width: 13px; height: 13px;
            background: ${color};
            border: 2px solid rgba(255,255,255,0.85);
            border-radius: 50%;
            cursor: pointer;
            box-shadow: 0 1px 4px rgba(0,0,0,0.5);
            transition: transform 0.15s;
          `;
          el.title = project.name;

          el.addEventListener("mouseenter", () => {
            el.style.transform = "scale(1.5)";
          });
          el.addEventListener("mouseleave", () => {
            el.style.transform = "scale(1)";
          });
          el.addEventListener("click", () => onSelect(project.id));

          new Marker({ element: el })
            .setLngLat([project.lng, project.lat])
            .addTo(map);
        }
      });
    }

    // Try OpenFreeMap, fall back to Carto on style-load failure
    initMap(OPENFREE_STYLE).catch(() => initMap(CARTO_FALLBACK));

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      className="w-full rounded-sm overflow-hidden"
      style={{ height: "clamp(300px, 50vw, 420px)" }}
      aria-label="APAC rail project map"
    />
  );
}
