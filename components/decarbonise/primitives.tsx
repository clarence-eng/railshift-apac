"use client";

import { useState } from "react";

// ---------------------------------------------------------------------------
// SliderRow
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
    <div className="grid grid-cols-[1fr_auto] gap-x-3 gap-y-0.5 items-center">
      <label className="text-xs text-muted-foreground leading-4">{label}</label>
      <span className="text-xs font-mono text-foreground text-right tabular-nums w-24 leading-4">
        {format(value)}
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="col-span-2 h-1 accent-primary cursor-pointer mt-0.5"
      />
      {note && (
        <p className="col-span-2 text-xs text-text-weak leading-3 mt-0.5">{note}</p>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// OutputCard — KPI tile with JetBrains Mono number
// ---------------------------------------------------------------------------

interface OutputCardProps {
  label: string;
  value: string;
  sub?: string;
}

export function OutputCard({ label, value, sub }: OutputCardProps) {
  return (
    <div className="rounded-sm border border-border bg-surface-1 overflow-hidden">
      {/* 3px petrol accent — sole use of brand colour in content cards */}
      <div className="h-[3px] w-full" style={{ background: "var(--ix-gradient)" }} aria-hidden="true" />
      <div className="px-3 py-2.5 space-y-0.5">
        <p className="text-xs text-muted-foreground uppercase tracking-wider leading-4">{label}</p>
        <p className="text-xl font-mono font-semibold tabular-nums text-foreground leading-6">{value}</p>
        {sub && <p className="text-xs text-muted-foreground leading-4">{sub}</p>}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Disclosure — collapsible "Show calculation"
// ---------------------------------------------------------------------------

interface DisclosureProps {
  label: string;
  children: React.ReactNode;
}

export function Disclosure({ label, children }: DisclosureProps) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-border rounded-sm">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-3 py-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        <span>{label}</span>
        <span className="font-mono text-text-weak">{open ? "−" : "+"}</span>
      </button>
      {open && (
        <div className="border-t border-border px-3 py-2.5 space-y-1.5">{children}</div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// CalcRow — intermediate value row inside Disclosure
// ---------------------------------------------------------------------------

export function CalcRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[1fr_auto] text-xs gap-x-4">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-mono text-foreground tabular-nums">{value}</span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// SectionDivider
// ---------------------------------------------------------------------------

export function SectionDivider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 pt-1">
      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">
        {label}
      </span>
      <div className="flex-1 border-t border-border-hair" />
    </div>
  );
}
