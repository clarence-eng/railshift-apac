"use client";

import { useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PROJECTS } from "@/data/seed";
import CountryBreakdown from "./country-breakdown";
import TechClassification from "./tech-classification";
import PipelineTimeline from "./pipeline-timeline";
import CompetitiveAnalysis from "./competitive-analysis";
import MASignals from "./ma-signals";
import FundingAnalysis from "./funding-analysis";

const TABS = ["Country", "Technology", "Timeline", "Competitive", "Funding", "M&A Signals"] as const;
type Tab = typeof TABS[number];

// Computed once at module level — PROJECTS is a static constant
const MARKET_COUNT = new Set(PROJECTS.map((p) => p.country.split(/\s*\/\s*/)[0])).size;

const TAB_PARAM: Record<Tab, string> = {
  "Country":     "country",
  "Technology":  "technology",
  "Timeline":    "timeline",
  "Competitive": "competitive",
  "Funding":     "funding",
  "M&A Signals": "ma-signals",
};
const PARAM_TO_TAB: Record<string, Tab> = Object.fromEntries(
  (Object.entries(TAB_PARAM) as [Tab, string][]).map(([tab, param]) => [param, tab])
);

export default function MarketShell() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const rawTab = searchParams.get("tab") ?? "";
  const activeTab: Tab = PARAM_TO_TAB[rawTab] ?? "Country";

  const setActiveTab = useCallback((tab: Tab) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", TAB_PARAM[tab]);
    router.replace(`/market?${params.toString()}`, { scroll: false });
  }, [router, searchParams]);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="pl-3 border-l-2" style={{ borderColor: "var(--ix-primary)" }}>
        <h1 className="text-2xl font-semibold tracking-tight" style={{ color: "var(--theme-color-std-text)" }}>
          Market
        </h1>
        <p className="mt-0.5 text-sm" style={{ color: "var(--theme-color-soft-text)" }}>
          APAC rail market intelligence — {PROJECTS.length} projects across {MARKET_COUNT} markets.
          All figures from verified sources, zero network calls.
        </p>
      </div>

      {/* Tab bar — scrollable on mobile */}
      <div role="tablist" aria-label="Market intelligence tabs" className="ix-no-scrollbar flex gap-0 border-b overflow-x-auto" style={{ borderColor: "var(--theme-color-std-bdr)" }}>
        {TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            role="tab"
            aria-selected={activeTab === tab}
            onClick={() => setActiveTab(tab)}
            className="px-4 py-2.5 text-sm border-b-2 -mb-px transition-colors duration-150 whitespace-nowrap shrink-0"
            style={{
              borderColor: activeTab === tab ? "var(--ix-primary)" : "transparent",
              color: activeTab === tab ? "var(--theme-color-std-text)" : "var(--theme-color-soft-text)",
              fontWeight: activeTab === tab ? 600 : 400,
              background: "transparent",
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Content */}
      <div>
        {activeTab === "Country"     && <CountryBreakdown      projects={PROJECTS} />}
        {activeTab === "Technology"  && <TechClassification    projects={PROJECTS} />}
        {activeTab === "Timeline"    && <PipelineTimeline       projects={PROJECTS} />}
        {activeTab === "Competitive" && <CompetitiveAnalysis    projects={PROJECTS} />}
        {activeTab === "Funding"     && <FundingAnalysis        projects={PROJECTS} />}
        {activeTab === "M&A Signals" && <MASignals              projects={PROJECTS} />}
      </div>

      {/* Footer note */}
      <p className="text-xs border-t pt-3" style={{ color: "var(--theme-color-weak-text)", borderColor: "var(--theme-color-x-weak-bdr)" }}>
        Market intelligence derived from project dataset · Values in original reported currencies · Confidence levels per dataset conventions
      </p>
    </div>
  );
}
