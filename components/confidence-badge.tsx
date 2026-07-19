"use client";

import { IxChip } from "@siemens/ix-react";
import type { Confidence } from "@/data/seed";

const BG: Record<Confidence, string> = {
  HIGH: "var(--theme-color-success)",
  MED:  "var(--theme-color-warning)",
  LOW:  "var(--theme-color-alarm)",
};

interface Props {
  confidence: Confidence;
}

export default function ConfidenceBadge({ confidence }: Props) {
  return (
    <IxChip
      variant="custom"
      background={BG[confidence]}
      style={{ fontSize: "11px" }}
    >
      {confidence}
    </IxChip>
  );
}
