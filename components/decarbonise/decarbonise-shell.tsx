"use client";

import { useState } from "react";
import { IxTabs, IxTabItem } from "@siemens/ix-react";
import ModalShiftTab from "./modal-shift-tab";
import ElectrificationTab from "./electrification-tab";
import ReferenceTab from "./reference-tab";

export default function DecarboniseShell() {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div className="space-y-5">
      <div className="pl-3 border-l-2" style={{ borderColor: "var(--ix-primary)" }}>
        <h1 className="text-2xl font-semibold tracking-tight" style={{ color: "var(--theme-color-std-text)" }}>
          Decarbonise
        </h1>
        <p className="mt-0.5 text-sm" style={{ color: "var(--theme-color-soft-text)" }}>
          Emission avoided and carbon value calculator — all figures from verified sources. Zero network calls.
        </p>
        <p className="mt-0.5 text-xs" style={{ color: "var(--theme-color-weak-text)" }}>
          Aligned to Siemens <strong style={{ color: "var(--theme-color-soft-text)" }}>DEGREE</strong> framework — Decarbonization · Ethics · Governance · Resource efficiency · Equity · Employability
        </p>
      </div>

      <IxTabs
        activeTabKey={String(activeTab)}
        onTabChange={(e) => {
          const raw = e.detail;
          const idx = typeof raw === "string" ? parseInt(raw, 10) : Number(raw ?? 0);
          setActiveTab(isNaN(idx) ? 0 : idx);
        }}
      >
        <IxTabItem label="Modal shift" />
        <IxTabItem label="Electrification" />
        <IxTabItem label="Reference" />
      </IxTabs>

      <div>
        {activeTab === 0 ? <ModalShiftTab /> : activeTab === 1 ? <ElectrificationTab /> : <ReferenceTab />}
      </div>

      <p className="text-xs border-t pt-3" style={{ color: "var(--theme-color-weak-text)", borderColor: "var(--theme-color-x-weak-bdr)" }}>
        Emission factors: EEA EU-27 WtW 2018 · Grid factors: Ember 2024 lifecycle · Carbon price: NCCS Singapore 2026–27 · Supports DEGREE decarbonization pillar · Calculations are indicative.
      </p>
    </div>
  );
}
