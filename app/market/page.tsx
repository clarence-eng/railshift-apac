import type { Metadata } from "next";
import { Suspense } from "react";
import MarketShell from "@/components/market/market-shell";

export const metadata: Metadata = {
  title: "Market — RailShift APAC",
  description: "APAC rail market intelligence across 6 tabs: country breakdown, technology mix, delivery timeline, competitive matrix, funding sources, and M&A signals.",
};

export default function MarketPage() {
  return (
    <Suspense fallback={<div className="ix-page-enter" />}>
      <MarketShell />
    </Suspense>
  );
}
