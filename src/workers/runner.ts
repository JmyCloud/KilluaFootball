import { CronJob } from "cron";
import { runJob } from "./job-wrapper";
import { syncReferenceData } from "@/jobs/sync-reference";
import { syncPreMatch } from "@/jobs/sync-pre-match";
import { syncLiveTrigger } from "@/jobs/sync-live-trigger";
import { syncLiveRefresh } from "@/jobs/sync-live-refresh";
import { syncFixtureSchedules } from "@/jobs/sync-schedules";

const WORKER_TYPE = process.env.WORKER_TYPE || "sync";

async function startSyncWorker() {
  console.log("[runner] Starting SYNC worker...");

  // Fetch fixture schedules on startup + every 6 hours
  await runJob("sync-schedules", syncFixtureSchedules, 600);
  new CronJob("0 */6 * * *", () => {
    runJob("sync-schedules", syncFixtureSchedules, 600);
  }, null, true);

  // Reference data every hour
  new CronJob("0 * * * *", () => {
    runJob("sync-reference", syncReferenceData, 300);
  }, null, true);

  // Pre-match sync every 5 minutes
  new CronJob("*/5 * * * *", () => {
    runJob("sync-pre-match", syncPreMatch, 240);
  }, null, true);

  // Live trigger every 15 seconds
  setInterval(async () => {
    try {
      const ids = await syncLiveTrigger();
      if (ids.length > 0) {
        await runJob("sync-live-refresh", () => syncLiveRefresh(ids), 60);
      }
    } catch (err) {
      console.error("[sync-live-trigger] Error polling livescores:", err);
    }
  }, 15_000);

  console.log("[runner] SYNC worker scheduled. Waiting for triggers...");
}

async function startFeatureWorker() {
  console.log("[runner] Starting FEATURE worker...");
  // Feature recompute every 10 minutes
  new CronJob("*/10 * * * *", () => {
    runJob("recompute-features", async () => {
      console.log("[recompute-features] Feature pipeline placeholder");
    }, 300);
  }, null, true);

  console.log("[runner] FEATURE worker scheduled.");
}

async function startSignalWorker() {
  console.log("[runner] Starting SIGNAL worker...");
  // Signal recompute every 15 minutes
  new CronJob("*/15 * * * *", () => {
    runJob("recompute-signals", async () => {
      console.log("[recompute-signals] Signal pipeline placeholder");
    }, 300);
  }, null, true);

  console.log("[runner] SIGNAL worker scheduled.");
}

async function main() {
  console.log(`[runner] Worker type: ${WORKER_TYPE}`);

  switch (WORKER_TYPE) {
    case "sync":
      await startSyncWorker();
      break;
    case "feature":
      await startFeatureWorker();
      break;
    case "signal":
      await startSignalWorker();
      break;
    default:
      console.error(`[runner] Unknown WORKER_TYPE: ${WORKER_TYPE}`);
      process.exit(1);
  }
}

main().catch((err) => {
  console.error("[runner] Fatal error:", err);
  process.exit(1);
});
