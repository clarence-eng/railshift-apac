"use client";

import { useState } from "react";
import { IxBlind, IxSlider, IxCheckbox } from "@siemens/ix-react";

// ---------------------------------------------------------------------------
// SliderRow — wraps IxSlider
// ---------------------------------------------------------------------------

interface SliderRowProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  format: (v: number) => string;
  onChange: (v: number) => void;
  note?: string;
}

export function SliderRow({ label, value, min, max, step, format, onChange, note }: SliderRowProps) {
  return (
    <div className="space-y-0.5 min-w-0">
      <div className="flex justify-between text-xs min-w-0">
        <span className="truncate pr-2" style={{ color: "var(--theme-color-soft-text)" }}>{label}</span>
        <span className="font-mono tabular-nums shrink-0" style={{ color: "var(--theme-color-std-text)" }}>
          {format(value)}
        </span>
      </div>
      <IxSlider
        min={min}
        max={max}
        step={step}
        value={value}
        onValueChange={(e) => onChange(e.detail)}
        style={{ width: "100%", minWidth: 0 }}
      />
      {note && (
        <p className="text-xs" style={{ color: "var(--theme-color-weak-text)" }}>{note}</p>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// SimpleCheckbox — wraps IxCheckbox
// ---------------------------------------------------------------------------

interface CheckboxRowProps {
  checked: boolean;
  onChange: (v: boolean) => void;
  children: React.ReactNode;
}

export function CheckboxRow({ checked, onChange, children }: CheckboxRowProps) {
  return (
    <IxCheckbox
      checked={checked}
      label={typeof children === "string" ? children : undefined}
      onCheckedChange={(e) => onChange(e.detail)}
    >
      {typeof children !== "string" && children}
    </IxCheckbox>
  );
}

// ---------------------------------------------------------------------------
// OutputCard — KPI tile with iX token hierarchy (no IxKpi — unit prop is for
// short inline units like "kW", not multi-word subtitles)
// ---------------------------------------------------------------------------

interface OutputCardProps {
  label: string;
  value: string;
  sub?: string;
}

export function OutputCard({ label, value, sub }: OutputCardProps) {
  return (
    <div
      className="rounded-sm border overflow-hidden"
      style={{
        background: "var(--theme-color-2)",
        borderColor: "var(--theme-color-std-bdr)",
        boxShadow: "0 2px 8px rgba(0,0,0,0.18)",
      }}
    >
      <div className="h-[4px] w-full" style={{ background: "var(--ix-gradient)" }} aria-hidden="true" />
      <div className="px-4 pt-3 pb-4 space-y-1">
        <p className="text-xs uppercase tracking-widest leading-4" style={{ color: "var(--theme-color-soft-text)" }}>
          {label}
        </p>
        <p className="font-mono text-2xl font-semibold tabular-nums leading-7" style={{ color: "var(--theme-color-primary)" }}>
          {value}
        </p>
        {sub && (
          <p className="text-xs leading-4" style={{ color: "var(--theme-color-weak-text)" }}>
            {sub}
          </p>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Disclosure — IxBlind (collapsible)
// ---------------------------------------------------------------------------

interface DisclosureProps {
  label: string;
  children: React.ReactNode;
}

export function Disclosure({ label, children }: DisclosureProps) {
  const [collapsed, setCollapsed] = useState(true);
  return (
    <IxBlind
      label={label}
      collapsed={collapsed}
      onCollapsedChange={(e) => setCollapsed(e.detail)}
    >
      <div className="space-y-1.5 px-1 py-2">{children}</div>
    </IxBlind>
  );
}

// ---------------------------------------------------------------------------
// CalcRow — unchanged (pure layout)
// ---------------------------------------------------------------------------

export function CalcRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[1fr_auto] text-xs gap-x-4">
      <span style={{ color: "var(--theme-color-soft-text)" }}>{label}</span>
      <span className="font-mono tabular-nums" style={{ color: "var(--theme-color-primary)" }}>{value}</span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// SectionDivider — hairline with label
// ---------------------------------------------------------------------------

export function SectionDivider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 pt-1">
      <span
        className="inline-block w-1.5 h-1.5 rounded-full shrink-0"
        style={{ background: "var(--ix-primary)" }}
        aria-hidden="true"
      />
      <span className="text-xs font-semibold uppercase tracking-wider whitespace-nowrap" style={{ color: "var(--theme-color-std-text)" }}>
        {label}
      </span>
      <div className="flex-1 border-t" style={{ borderColor: "var(--theme-color-x-weak-bdr)" }} />
    </div>
  );
}
