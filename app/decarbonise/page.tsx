import type { Metadata } from "next";
import DecarboniseShell from "@/components/decarbonise/decarbonise-shell";

export const metadata: Metadata = {
  title: "Decarbonise — RailShift APAC",
  description: "Emission avoided and carbon value calculators for APAC rail. Modal shift and electrification analysis aligned to Siemens DEGREE decarbonization pillar.",
};

export default function DecarbonisePage() {
  return <DecarboniseShell />;
}
