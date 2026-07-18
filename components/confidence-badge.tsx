import type { Confidence } from "@/data/seed";

const STYLES: Record<Confidence, string> = {
  HIGH: "bg-zinc-800 text-zinc-300 border border-zinc-600",
  MED: "bg-yellow-900/60 text-yellow-300 border border-yellow-700",
  LOW: "bg-red-900/60 text-red-400 border border-red-700",
};

interface Props {
  confidence: Confidence;
  className?: string;
}

export default function ConfidenceBadge({ confidence, className = "" }: Props) {
  return (
    <span
      className={`inline-flex items-center rounded px-1.5 py-0.5 text-xs font-medium ${STYLES[confidence]} ${className}`}
    >
      {confidence}
    </span>
  );
}

export { STYLES as CONFIDENCE_BADGE_STYLES };
