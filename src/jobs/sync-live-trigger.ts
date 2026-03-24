import { getLivescoresLatest } from "@/services/livescores";
import { isSupported } from "@/config/competitions";

export async function syncLiveTrigger(): Promise<number[]> {
  console.log("[sync-live-trigger] Polling livescores/latest...");

  const response = await getLivescoresLatest();
  const fixtures = response.data;

  if (!Array.isArray(fixtures) || fixtures.length === 0) {
    console.log("[sync-live-trigger] No changed fixtures.");
    return [];
  }

  const changedFixtureIds = fixtures
    .filter((f) => isSupported(f.league_id))
    .map((f) => f.id);

  console.log(
    `[sync-live-trigger] ${changedFixtureIds.length} supported fixtures changed.`
  );

  return changedFixtureIds;
}
