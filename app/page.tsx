import { PROJECTS } from "@/data/seed";
import PipelineShell from "@/components/pipeline/pipeline-shell";

export default function PipelinePage() {
  return <PipelineShell projects={PROJECTS} />;
}
