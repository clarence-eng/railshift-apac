"use client";

import { useState } from "react";
import { PROJECTS } from "@/data/seed";
import CountryBreakdown from "./country-breakdown";
import TechClassification from "./tech-classification";
import PipelineTimeline from "./pipeline-timeline";

const TABS = ["Country", "Technology", "Timeline"] as const;
type Tab = typeof TABS[number];

export default function MarketShell() {
  const [activeTab, setActiveTab] = useState<Tab>("Country");

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="pl-3 border-l-2" style={{ borderColor: "var(--ix-primary)" }}>
        <h1 className="text-2xl font-semibold tracking-tight" style={{ color: "var(--theme-color-std-text)" }}>
          Market
        </h1>
        <p className="mt-0.5 text-sm" style={{ color: "var(--theme-color-soft-text)" }}>
          APAC rail market intelligence — {PROJECTS.length} projects across {[...new Set(PROJECTS.map((p) => p.country.split(/\s*\/\s*/)[0]))].length} markets. All figures from verified sources, zero network calls.
        </p>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 border-b" style={{ borderColor: "var(--theme-color-std-bdr)" }}>
        {TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className="px-4 py-2.5 text-sm border-b-2 -mb-px transition-colors duration-150"
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
        {activeTab === "Country" && <CountryBreakdown projects={PROJECTS} />}
        {activeTab === "Technology" && <TechClassification projects={PROJECTS} />}
        {activeTab === "Timeline" && <PipelineTimeline projects={PROJECTS} />}
      </div>

      {/* Footer note */}
      <p className="text-xs border-t pt-3" style={{ color: "var(--theme-color-std-text)", borderColor: "var(--theme-color-x-weak-bdr)" }}>
        Market intelligence derived from project dataset. Project values in original reported currencies — not normalised to a single currency. Confidence levels per dataset conventions.
      </p>
    </div>
  );
}
