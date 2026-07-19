"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";

interface TourStep {
  page: string;
  href: string;
  headline: string;
  body: string;
  tip: string;
}

const TOUR_STEPS: TourStep[] = [
  {
    page: "Pipeline",
    href: "/",
    headline: "Start here — 14 APAC rail projects",
    body: "The Pipeline page is your market map. Each marker on the map represents a live project. Click any marker or table row to open the project detail panel. Use the search bar to filter by name, country, or keyword — try typing 'siemens' or 'CBTC'.",
    tip: "The KPI strip shows Siemens incumbent count and pipeline split at a glance.",
  },
  {
    page: "Market",
    href: "/market",
    headline: "Seven-tab market intelligence dashboard",
    body: "Country → size the market by geography. Technology → CBTC/HSR/Metro mix. Timeline → delivery horizon. Competitive → where Siemens, Alstom, Hitachi and CRRC stand. Funding → tied vs open procurement. Sustainability → carbon price trajectory and regulatory context per market. M&A Signals → PROTECT/PURSUE/MONITOR/WATCH classifications.",
    tip: "The Sustainability tab shows Singapore's carbon price rising to S$80/tCO₂e by 2030 — each year it rises, the commercial case for rail decarbonisation strengthens.",
  },
  {
    page: "Decarbonise",
    href: "/decarbonise",
    headline: "Quantify the carbon value Siemens creates",
    body: "Two distinct calculators. Modal Shift: when a metro line opens, people switch from cars to rail — this calculates how many tonnes of CO₂ are avoided per year and what that is worth at Singapore's carbon price. Electrification: when a diesel line goes electric, how much does it reduce emissions — and how dependent is the answer on the local grid intensity?",
    tip: "Try Cross Island Line on Modal Shift: 500k riders/day, Singapore grid. Lifetime carbon value ~S$193m undiscounted — a powerful anchor for lifecycle services negotiations.",
  },
  {
    page: "Brief",
    href: "/brief",
    headline: "AI-generated executive strategy memo",
    body: "Select a project, adjust the ridership and carbon price scenario, then press Generate brief (or ⌘Enter). Gemini writes a four-section memo: Market Opportunity, Competitive Context, DEGREE Alignment, Recommendation. Use Print or Copy to share it. Projects marked ★ have saved examples that work without an API key.",
    tip: "The Singapore lines (CRL, JRL, TEL) are pre-computed offline — ideal for a live demo with no internet.",
  },
  {
    page: "Strategy",
    href: "/strategy",
    headline: "DEGREE, BTA planning, and JD alignment",
    body: "Strategy maps this prototype to Siemens' frameworks. DEGREE: 6 clickable pillars showing which app capability serves each sustainability dimension. BTA planning: 6 dimensions that feed a Business Target Agreement cycle. JD requirements: direct mapping from each role requirement to specific app evidence.",
    tip: "Each DEGREE card is a clickable link — click Decarbonization to go straight to the carbon calculator.",
  },
];

// Shared key — imported by top-nav to read and by TourDrawer to write
export const TOUR_DISMISSED_KEY = "railshift-tour-dismissed";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function TourDrawer({ open, onClose }: Props) {
  const [step, setStep] = useState(0);
  const panelRef = useRef<HTMLElement>(null);

  // Reset to first step when reopened — intentional setState inside effect
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { if (open) setStep(0); }, [open]);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  // Escape + focus trap
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") { onClose(); return; }
      if (e.key !== "Tab") return;
      const panel = panelRef.current;
      if (!panel) return;
      const els = Array.from(panel.querySelectorAll<HTMLElement>(
        'button:not([disabled]),a[href],[tabindex]:not([tabindex="-1"])'
      ));
      if (!els.length) return;
      const first = els[0], last = els[els.length - 1];
      if (e.shiftKey) { if (document.activeElement === first) { e.preventDefault(); last.focus(); } }
      else { if (document.activeElement === last) { e.preventDefault(); first.focus(); } }
    }
    window.addEventListener("keydown", onKey);
    const first = panelRef.current?.querySelector<HTMLElement>("button:not([disabled])");
    first?.focus();
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const handleDismiss = useCallback(() => {
    localStorage.setItem(TOUR_DISMISSED_KEY, "1");
    onClose();
  }, [onClose]);

  if (!open) return null;

  const current = TOUR_STEPS[step];
  const isFirst = step === 0;
  const isLast = step === TOUR_STEPS.length - 1;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 backdrop-blur-sm"
        style={{ background: "var(--theme-color-backdrop, rgba(0,0,0,0.75))" }}
        aria-hidden="true"
        onClick={onClose}
      />

      {/* Panel */}
      <aside
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="How to use RailShift APAC"
        className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col overflow-hidden shadow-2xl ix-drawer-enter"
        style={{ background: "var(--ix-surface-1)", borderLeft: "1px solid var(--ix-border)" }}
      >
        {/* Gradient band */}
        <div className="h-[4px] w-full shrink-0" style={{ background: "var(--ix-gradient)" }} aria-hidden="true" />

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 shrink-0" style={{ borderBottom: "1px solid var(--ix-border)" }}>
          <div>
            <h2 className="text-sm font-semibold tracking-tight" style={{ color: "var(--ix-text)" }}>
              How to use RailShift APAC
            </h2>
            <p className="text-xs mt-0.5" style={{ color: "var(--ix-text-soft)" }}>
              A quick guide for each section
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close guide"
            className="text-xl leading-none transition-colors duration-150"
            style={{ color: "var(--ix-text-soft)" }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.color = "var(--ix-text)")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.color = "var(--ix-text-soft)")}
          >
            ×
          </button>
        </div>

        {/* Step progress */}
        <div className="flex gap-1.5 px-6 py-3 shrink-0" style={{ borderBottom: "1px solid var(--ix-border)" }}>
          {TOUR_STEPS.map((s, i) => (
            <button
              key={s.page}
              type="button"
              onClick={() => setStep(i)}
              className="flex-1 h-1.5 rounded-full transition-colors duration-150"
              style={{ background: i <= step ? "var(--ix-primary)" : "var(--ix-border)" }}
              aria-label={`Go to ${s.page}`}
            />
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {/* Page badge */}
          <div className="flex items-center gap-2 mb-4">
            <span style={{ background: "var(--ix-primary)", color: "#fff", fontSize: "10px", fontWeight: 700, padding: "2px 8px", borderRadius: "2px", letterSpacing: "0.5px" }}>
              {current.page.toUpperCase()}
            </span>
            <span className="text-xs" style={{ color: "var(--ix-text-soft)" }}>
              Step {step + 1} of {TOUR_STEPS.length}
            </span>
          </div>

          <h3 className="text-base font-semibold leading-snug mb-3" style={{ color: "var(--ix-text)" }}>
            {current.headline}
          </h3>

          <p className="text-sm leading-relaxed mb-5" style={{ color: "var(--ix-text-soft)" }}>
            {current.body}
          </p>

          {/* Tip card */}
          <div
            className="rounded-sm border px-4 py-3 space-y-1"
            style={{ background: "var(--ix-surface-2)", borderColor: "var(--ix-border)" }}
          >
            <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--ix-primary)" }}>
              Quick tip
            </p>
            <p className="text-xs leading-relaxed" style={{ color: "var(--ix-text-soft)" }}>
              {current.tip}
            </p>
          </div>

          {/* Go to page link */}
          <Link
            href={current.href}
            onClick={onClose}
            className="mt-5 block text-xs underline transition-opacity duration-150 hover:opacity-70"
            style={{ color: "var(--ix-primary)" }}
          >
            Open {current.page} page →
          </Link>
        </div>

        {/* Footer navigation */}
        <div className="px-6 py-4 shrink-0 flex items-center justify-between" style={{ borderTop: "1px solid var(--ix-border)" }}>
          <button
            type="button"
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={isFirst}
            className="text-xs border rounded-sm px-3 py-1.5 transition-colors duration-150 disabled:opacity-30"
            style={{ borderColor: "var(--ix-border)", color: "var(--ix-text-soft)", background: "transparent" }}
          >
            ← Back
          </button>

          <button
            type="button"
            onClick={handleDismiss}
            className="text-xs transition-colors duration-150"
            style={{ color: "var(--ix-text-weak)" }}
          >
            Don&rsquo;t show again
          </button>

          {isLast ? (
            <button
              type="button"
              onClick={handleDismiss}
              className="text-xs border rounded-sm px-3 py-1.5 transition-colors duration-150 font-semibold"
              style={{ borderColor: "var(--ix-primary)", color: "var(--ix-primary)", background: "transparent" }}
            >
              Done
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setStep((s) => Math.min(TOUR_STEPS.length - 1, s + 1))}
              className="text-xs border rounded-sm px-3 py-1.5 transition-colors duration-150"
              style={{ borderColor: "var(--ix-primary)", color: "var(--ix-primary)", background: "transparent" }}
            >
              Next →
            </button>
          )}
        </div>
      </aside>
    </>
  );
}
