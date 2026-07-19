import type { Metadata } from "next";
import { PROJECTS } from "@/data/seed";
import PipelineShell from "@/components/pipeline/pipeline-shell";

export const metadata: Metadata = {
  title: "Pipeline — RailShift APAC",
  description: `${PROJECTS.length} active APAC rail projects on an interactive map with KPI strip, filterable table, and project detail panel.`,
};

export default function PipelinePage() {
  return <PipelineShell projects={PROJECTS} />;
}
