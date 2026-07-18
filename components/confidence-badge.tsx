"use client";

import { IxChip } from "@siemens/ix-react";
import type { Confidence } from "@/data/seed";

// Map confidence to iX chip background colors (iX custom variant)
const BG: Record<Confidence, string> = {
  HIGH: "var(--theme-color-neutral)",
  MED:  "var(--theme-color-warning)",
  LOW:  "var(--theme-color-alarm)",
};

interface Props {
  confidence: Confidence;
  className?: string;
}

export default function ConfidenceBadge({ confidence, className = "" }: Props) {
  return (
    <IxChip
      variant="custom"
      background={BG[confidence]}
      className={className}
      style={{ fontSize: "11px" }}
    >
      {confidence}
    </IxChip>
  );
}

// Keep export for any remaining code that imports CONFIDENCE_BADGE_STYLES
export const CONFIDENCE_BADGE_STYLES: Record<Confidence, string> = {
  HIGH: "",
  MED: "",
  LOW: "",
};
