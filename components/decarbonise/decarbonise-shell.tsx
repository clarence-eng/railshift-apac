"use client";

import { useState } from "react";
import ModalShiftTab from "./modal-shift-tab";
import ElectrificationTab from "./electrification-tab";
import ReferenceTab from "./reference-tab";

const TABS = ["Modal Shift", "Electrification", "Reference"] as const;
type Tab = typeof TABS[number];

export default function DecarboniseShell() {
  const [activeTab, setActiveTab] = useState<Tab>("Modal Shift");

  return (
    <div className="space-y-5">
      <div className="pl-3 border-l-2" style={{ borderColor: "var(--ix-primary)" }}>
        <h1 className="text-2xl font-semibold tracking-tight" style={{ color: "var(--theme-color-std-text)" }}>
          Decarbonise
        </h1>
        <p className="mt-0.5 text-sm" style={{ color: "var(--theme-color-soft-text)" }}>
          Quantify the carbon value that Siemens Mobility rail projects create — the avoided emissions and their monetary worth at Singapore&rsquo;s carbon price.
        </p>
        <p className="mt-0.5 text-xs" style={{ color: "var(--theme-color-weak-text)" }}>
          Aligned to Siemens <strong style={{ color: "var(--theme-color-soft-text)" }}>DEGREE</strong> — Decarbonization pillar · Emission factors: EEA EU-27 WtW 2018 · Grid: Ember 2024 · Carbon price: NCCS 2026–27
        </p>
      </div>

      {/* Tab bar — custom buttons for consistent spacing and label control */}
      <div className="ix-no-scrollbar flex gap-0 border-b overflow-x-auto" style={{ borderColor: "var(--theme-color-std-bdr)" }}>
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

      {/* Tab descriptions — shown below the tab bar */}
      <p className="text-xs -mt-1" style={{ color: "var(--theme-color-weak-text)" }}>
        {activeTab === "Modal Shift" && "People switching from cars to rail: how many tonnes of CO₂ does a metro line avoid per year, and what is that worth at the carbon price?"}
        {activeTab === "Electrification" && "Diesel rail lines converting to electric traction: how much does electrification reduce emissions — and how grid-dependent is the answer?"}
        {activeTab === "Reference" && "Underlying emission factors and calculator defaults with primary source citations."}
      </p>

      <div>
        {activeTab === "Modal Shift" && <ModalShiftTab />}
        {activeTab === "Electrification" && <ElectrificationTab />}
        {activeTab === "Reference" && <ReferenceTab />}
      </div>

      <p className="text-xs border-t pt-3" style={{ color: "var(--theme-color-std-text)", borderColor: "var(--theme-color-x-weak-bdr)" }}>
        Calculations are indicative. All figures sourced from verified primary data — see Methodology drawer for citations.
      </p>
    </div>
  );
}
