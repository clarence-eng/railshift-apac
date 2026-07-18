"use client";

import { useState } from "react";
import ModalShiftTab from "./modal-shift-tab";
import ElectrificationTab from "./electrification-tab";

const TABS = [
  { id: "modal", label: "Modal shift" },
  { id: "elec", label: "Electrification" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function DecarboniseShell() {
  const [tab, setTab] = useState<TabId>("modal");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Decarbonise</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Emission avoided and carbon value calculator — all figures from{" "}
          <span className="font-mono text-xs">data/seed.ts</span> and{" "}
          <span className="font-mono text-xs">lib/calc.ts</span>. Zero network calls.
        </p>
      </div>

      {/* Tab bar */}
      <div className="flex border-b border-border">
        {TABS.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={[
              "px-3 py-2 text-sm border-b-2 transition-colors -mb-px sm:px-4",
              tab === id
                ? "border-primary text-foreground font-medium"
                : "border-transparent text-muted-foreground hover:text-foreground",
            ].join(" ")}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Tab body */}
      {tab === "modal" ? <ModalShiftTab /> : <ElectrificationTab />}

      {/* Attribution */}
      <p className="text-xs text-muted-foreground border-t border-border pt-3">
        Emission factors: EEA EU-27 WtW 2018. Grid factors: Ember 2024 lifecycle.
        Carbon price: NCCS Singapore 2026–27. Calculations are indicative; see Methodology
        in each source link.
      </p>
    </div>
  );
}
