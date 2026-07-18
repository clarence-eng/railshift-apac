import type { Confidence } from "@/data/seed";

// iX semantic tokens via Tailwind utility classes — theme-aware, no hardcodes
const STYLES: Record<Confidence, string> = {
  HIGH: "bg-neutral/15 text-neutral border border-neutral/30",
  MED:  "bg-warning/15 text-warning border border-warning/30",
  LOW:  "bg-error/15   text-error   border border-error/30",
};

interface Props {
  confidence: Confidence;
  className?: string;
}

export default function ConfidenceBadge({ confidence, className = "" }: Props) {
  return (
    <span
      className={`inline-flex items-center rounded-sm px-1.5 py-0.5 text-xs font-medium ${STYLES[confidence]} ${className}`}
    >
      {confidence}
    </span>
  );
}

export { STYLES as CONFIDENCE_BADGE_STYLES };
