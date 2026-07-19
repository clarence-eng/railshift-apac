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
    headline: "Six-tab market intelligence dashboard",
    body: "Work through the tabs left to right: Country → size the market by geography. Technology → see the CBTC/HSR/Metro mix. Timeline → visualise the delivery horizon to 2036. Competitive → see where Siemens, Alstom, Hitachi and CRRC each stand. Funding → understand tied vs open procurement. M&A Signals → get PROTECT/PURSUE/MONITOR/WATCH classifications.",
    tip: "Tab state is saved in the URL — you can share a direct link to any tab.",
  },
  {
    page: "Decarbonise",
    href: "/decarbonise",
    headline: "Quantify the carbon value case",
    body: "Modal Shift: set a line's daily ridership and see how many tonnes of CO₂ are avoided per year vs car travel, priced at Singapore's carbon tax. Electrification: compare diesel-to-electric savings across APAC grids. Reference: raw emission factors and calculator defaults with full source citations.",
    tip: "Try the Cross Island Line: 500k riders/day, Singapore grid. The lifetime carbon value (~S$193m undiscounted) is a powerful commercial anchor.",
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
    headline: "Framework alignment and candidate fit",
    body: "Strategy maps this prototype to three frameworks the JD requires: DEGREE sustainability (6 clickable pillars linking to evidence), BTA planning dimensions (6 cards showing what feeds a Business Target Agreement), and a direct JD requirements → app capabilities mapping table. The Candidate Fit section at the bottom shows HIGH/MED fit against each role requirement.",
    tip: "Each DEGREE card is a clickable link — click Decarbonization to go straight to the calculator.",
  },
];

const STORAGE_KEY = "railshift-tour-dismissed";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function TourDrawer({ open, onClose }: Props) {
  const [step, setStep] = useState(0);
  const panelRef = useRef<HTMLElement>(null);

  // Reset to first step when reopened
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
    localStorage.setItem(STORAGE_KEY, "1");
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
            onClick={onClose}
            aria-label="Close guide"
            className="text-xl leading-none transition-colors"
            style={{ color: "var(--ix-text-soft)" }}
            onMouseEnter={(e) => ((e.currentTarget).style.color = "var(--ix-text)")}
            onMouseLeave={(e) => ((e.currentTarget).style.color = "var(--ix-text-soft)")}
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
            className="mt-5 block text-xs underline transition-opacity hover:opacity-70"
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
            className="text-xs transition-colors"
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
