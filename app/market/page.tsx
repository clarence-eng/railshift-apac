import { Suspense } from "react";
import MarketShell from "@/components/market/market-shell";

export default function MarketPage() {
  return (
    <Suspense>
      <MarketShell />
    </Suspense>
  );
}
