import type { Metadata } from "next";
import StrategyShell from "@/components/strategy/strategy-shell";

export const metadata: Metadata = {
  title: "Strategy — RailShift APAC",
  description: "How RailShift APAC maps to Siemens DEGREE framework, BTA planning, JD requirements, and candidate fit.",
};

export default function StrategyPage() {
  return <StrategyShell />;
}
