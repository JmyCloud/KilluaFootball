import { SUPPORTED_COMPETITIONS } from "@/config/competitions";
import { getSquadBySeason, getSquadByTeam } from "@/services/squads";
import { getTeamRankings } from "@/services/rankings";
import { getStandingsBySeason, getStandingsCorrections } from "@/services/standings";

export async function syncReferenceData() {
  console.log("[sync-reference] Starting background reference sync...");

  for (const competition of SUPPORTED_COMPETITIONS) {
    console.log(`[sync-reference] Processing: ${competition.name}`);
    // TODO: Resolve current season_id for each competition
    // TODO: Sync standings, squads, rankings
    // TODO: Store normalized data in PostgreSQL
  }

  console.log("[sync-reference] Background reference sync complete.");
}
