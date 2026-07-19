"use client";

import { useEffect, useRef } from "react";
import {
  EMISSION_FACTORS,
  GRID_FACTORS,
  PROJECTS,
  SOURCES,
  CALC_DEFAULTS,
} from "@/data/seed";
import ConfidenceBadge from "@/components/confidence-badge";

const sourceMap = Object.fromEntries(SOURCES.map((s) => [s.id, s]));

function SourceLink({ id }: { id: string }) {
  const src = sourceMap[id];
  if (!src) return <span style={{ color: "var(--ix-text-soft)" }}>{id}</span>;
  return (
    <a
      href={src.url}
      target="_blank"
      rel="noopener noreferrer"
      className="underline transition-colors"
      style={{ color: "var(--ix-text-soft)" }}
      onMouseEnter={(e) => ((e.target as HTMLElement).style.color = "var(--ix-text)")}
      onMouseLeave={(e) => ((e.target as HTMLElement).style.color = "var(--ix-text-soft)")}
    >
      {src.label}
    </a>
  );
}

function SectionHead({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-xs font-semibold uppercase tracking-wider pt-5 pb-2 border-b" style={{ color: "var(--ix-primary)", borderColor: "var(--ix-border)" }}>
      {children}
    </h3>
  );
}

function DataRow({
  label,
  value,
  confidence,
  sourceId,
  note,
}: {
  label: string;
  value: string;
  confidence?: string;
  sourceId?: string;
  note?: string;
}) {
  return (
    <div className="py-2.5 border-b last:border-0 space-y-0.5" style={{ borderColor: "var(--ix-border)" }}>
      <div className="flex items-start justify-between gap-3">
        <span className="font-medium text-sm leading-5" style={{ color: "var(--ix-text)" }}>{label}</span>
        <div className="flex items-center gap-2 shrink-0">
          {confidence && (
            <ConfidenceBadge confidence={confidence as "HIGH" | "MED" | "LOW"} />
          )}
          <span className="font-mono font-semibold text-sm tabular-nums" style={{ color: "var(--ix-text)" }}>{value}</span>
        </div>
      </div>
      {note && <p className="text-xs" style={{ color: "var(--ix-text-soft)" }}>{note}</p>}
      {sourceId && (
        <p className="text-xs">
          <SourceLink id={sourceId} />
        </p>
      )}
    </div>
  );
}

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function MethodologyDrawer({ open, onClose }: Props) {
  const panelRef = useRef<HTMLElement>(null);

  // Lock body scroll while open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  // Close on Escape + focus trap
  useEffect(() => {
    if (!open) return;

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") { onClose(); return; }
      if (e.key !== "Tab") return;

      const panel = panelRef.current;
      if (!panel) return;
      const focusable = Array.from(
        panel.querySelectorAll<HTMLElement>(
          'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])'
        )
      ).filter((el) => !el.closest("[aria-hidden]"));

      if (focusable.length === 0) return;
      const first = focusable[0];
      const last  = focusable[focusable.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus(); }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    }

    window.addEventListener("keydown", onKey);
    // Move focus into the panel on open
    const panel = panelRef.current;
    if (panel) {
      const first = panel.querySelector<HTMLElement>(
        'button:not([disabled]),a[href],[tabindex]:not([tabindex="-1"])'
      );
      first?.focus();
    }
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 backdrop-blur-sm"
        style={{ background: "var(--theme-color-backdrop, rgba(0,0,0,0.85))" }}
        aria-hidden="true"
        onClick={onClose}
      />

      {/* Drawer panel */}
      <aside
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Methodology & Sources"
        className="fixed inset-y-0 right-0 z-50 flex w-full max-w-xl flex-col overflow-hidden shadow-2xl ix-drawer-enter"
        style={{ background: "var(--ix-surface-1)", borderLeft: "1px solid var(--ix-border)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 shrink-0" style={{ borderBottom: "1px solid var(--ix-border)" }}>
          <h2 className="text-sm font-semibold tracking-tight" style={{ color: "var(--ix-text)" }}>
            Methodology &amp; Sources
          </h2>
          <button
            onClick={onClose}
            aria-label="Close drawer"
            className="text-xl leading-none transition-colors"
            style={{ color: "var(--ix-text-soft)" }}
            onMouseEnter={(e) => ((e.target as HTMLElement).style.color = "var(--ix-text)")}
            onMouseLeave={(e) => ((e.target as HTMLElement).style.color = "var(--ix-text-soft)")}
          >
            ×
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-6 pb-10">

          {/* Preamble */}
          <p className="mt-4 text-xs leading-relaxed" style={{ color: "var(--ix-text-soft)" }}>
            Every figure in this tool is drawn from the sources below.
            Confidence levels: <strong style={{ color: "var(--ix-text)" }}>HIGH</strong> = primary
            official or statutory source; <strong style={{ color: "var(--ix-text)" }}>MED</strong> = secondary
            or corroborated press; <strong style={{ color: "var(--ix-text)" }}>LOW</strong> = single
            source, unverified. All emission calculations use well-to-wheel (WtW)
            boundaries per EEA convention.
          </p>

          {/* ---- Mode emission factors ---- */}
          <SectionHead>Mode emission factors (gCO₂e / pkm, WtW)</SectionHead>
          {EMISSION_FACTORS.map((f) => (
            <DataRow
              key={f.mode}
              label={f.mode}
              value={`${f.gCO2ePerPkm} gCO₂e/pkm`}
              confidence={f.confidence}
              sourceId={f.source}
            />
          ))}

          {/* ---- Grid emission factors ---- */}
          <SectionHead>Grid emission factors (gCO₂e / kWh, lifecycle)</SectionHead>
          {GRID_FACTORS.map((g) => (
            <DataRow
              key={g.country}
              label={g.country}
              value={`${g.gCO2ePerKWh} gCO₂e/kWh`}
              confidence={g.confidence}
              sourceId={g.source}
              note={
                g.altGCO2ePerKWh != null
                  ? `Alt: ${g.altGCO2ePerKWh} gCO₂e/kWh — ${g.altNote}`
                  : undefined
              }
            />
          ))}

          {/* ---- Calculator defaults ---- */}
          <SectionHead>Calculator defaults</SectionHead>
          <DataRow
            label="Baseline car emission factor"
            value={`${CALC_DEFAULTS.baselineCarFactor} gCO₂e/pkm`}
            confidence="HIGH"
            sourceId="eea"
            note="EEA EU-27 average car at 1.6 occupancy, WtW 2018"
          />
          <DataRow
            label="EEA rail average (simple mode)"
            value={`${CALC_DEFAULTS.eeaRailAvgFactor} gCO₂e/pkm`}
            confidence="HIGH"
            sourceId="eea"
            note="All rail services average, WtW 2018"
          />
          <DataRow
            label="Electric rail energy intensity"
            value={`${CALC_DEFAULTS.railEnergyIntensity} kWh/pkm`}
            confidence="MED"
            note={`Range: ${CALC_DEFAULTS.railEnergyIntensityRange[0]}–${CALC_DEFAULTS.railEnergyIntensityRange[1]} kWh/pkm. Varies by rolling stock, load factor, and gradient.`}
          />
          <DataRow
            label="Diesel rail factor"
            value={`${CALC_DEFAULTS.dieselRailFactor} gCO₂e/pkm`}
            confidence="MED"
            note="Indicative for regional diesel services; user-tunable."
          />
          <DataRow
            label="Share diverted from car"
            value={`${CALC_DEFAULTS.shareDivertedFromCar * 100}%`}
            confidence="MED"
            note="CALC_DEFAULTS reference value; UI default is 30% (ITDP empirical mid-range for new urban metro). Empirical range: 15–35%."
          />
          <DataRow
            label="Average trip length"
            value={`${CALC_DEFAULTS.avgTripKm} km`}
            confidence="MED"
            note="Indicative urban metro trip; user-tunable."
          />
          <DataRow
            label="Singapore carbon tax (2026–27)"
            value={`S$${CALC_DEFAULTS.carbonPriceSGD}/tCO₂e`}
            confidence="HIGH"
            sourceId="nccs-tax"
            note={`Slider range S$${CALC_DEFAULTS.carbonPriceRangeSGD[0]}–${CALC_DEFAULTS.carbonPriceRangeSGD[1]}/tCO₂e, reflecting S$50–80 target by 2030.`}
          />
          <DataRow
            label="Asset life"
            value={`${CALC_DEFAULTS.assetLifeYears} years`}
            confidence="MED"
            note="Typical design life for heavy rail infrastructure. Lifetime value is undiscounted."
          />

          {/* ---- Pipeline data ---- */}
          <SectionHead>Pipeline — source by project</SectionHead>
          {PROJECTS.map((p) => (
            <DataRow
              key={p.id}
              label={p.name}
              value={p.country}
              confidence={p.confidence}
              sourceId={p.source}
              note={
                "Lat/lng are approximate centroids — flagged for verification before shipping."
              }
            />
          ))}

          {/* ---- All sources list ---- */}
          <SectionHead>All sources</SectionHead>
          <div className="space-y-2 pt-1">
            {SOURCES.map((s) => (
              <div key={s.id} className="text-xs pb-2 border-b last:border-0" style={{ borderColor: "var(--ix-border)" }}>
                <span className="font-mono mr-2" style={{ color: "var(--ix-text-soft)" }}>[{s.id}]</span>
                <a
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline transition-colors"
                  style={{ color: "var(--ix-text)" }}
                  onMouseEnter={(e) => ((e.target as HTMLElement).style.color = "var(--ix-text-soft)")}
                  onMouseLeave={(e) => ((e.target as HTMLElement).style.color = "var(--ix-text)")}
                >
                  {s.label}
                </a>
              </div>
            ))}
          </div>
        </div>
      </aside>
    </>
  );
}
