import type { Metadata } from "next";
import BriefShell from "@/components/brief/brief-shell";

export const metadata: Metadata = {
  title: "Brief — RailShift APAC",
  description: "AI-generated executive strategy memos for APAC rail projects. Four-section format: Market Opportunity, Competitive Context, DEGREE Alignment, Recommendation.",
};

export default function BriefPage() {
  return <BriefShell />;
}
