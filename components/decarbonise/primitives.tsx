"use client";

import { useState } from "react";
import { IxKpi, IxBlind, IxSlider, IxCheckbox } from "@siemens/ix-react";

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
    <div className="space-y-0.5">
      <div className="flex justify-between text-xs">
        <span style={{ color: "var(--theme-color-soft-text)" }}>{label}</span>
        <span className="font-mono tabular-nums" style={{ color: "var(--theme-color-std-text)" }}>
          {format(value)}
        </span>
      </div>
      <IxSlider
        min={min}
        max={max}
        step={step}
        value={value}
        onValueChange={(e) => onChange(e.detail)}
        style={{ width: "100%" }}
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
// OutputCard — IxKpi tile
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
      style={{ background: "var(--theme-color-2)", borderColor: "var(--theme-color-std-bdr)" }}
    >
      {/* 3px petrol gradient accent */}
      <div className="h-[3px] w-full" style={{ background: "var(--ix-gradient)" }} aria-hidden="true" />
      <div className="px-3 py-2.5">
        <IxKpi label={label} unit={sub ?? ""}>
          <span slot="number" className="font-mono text-lg font-semibold tabular-nums">
            {value}
          </span>
        </IxKpi>
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
      <span className="font-mono tabular-nums" style={{ color: "var(--theme-color-std-text)" }}>{value}</span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// SectionDivider — hairline with label
// ---------------------------------------------------------------------------

export function SectionDivider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 pt-1">
      <span className="text-xs font-semibold uppercase tracking-wider whitespace-nowrap" style={{ color: "var(--theme-color-soft-text)" }}>
        {label}
      </span>
      <div className="flex-1 border-t" style={{ borderColor: "var(--theme-color-x-weak-bdr)" }} />
    </div>
  );
}
