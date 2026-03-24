import {
  runPrematchFeaturePipeline,
  runLiveFeaturePipeline,
} from "@/lib/analysis/features";

export async function recomputeFeatures() {
  console.log("[recompute-features] Starting feature recomputation...");

  await runPrematchFeaturePipeline();
  await runLiveFeaturePipeline();

  console.log("[recompute-features] Feature recomputation complete.");
}
