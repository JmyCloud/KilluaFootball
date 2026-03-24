import { prisma } from "@/lib/storage/prisma";
import { BOOKMAKER_ID } from "@/config/bookmaker";
import { getFixtureLive } from "@/services/fixtures";
import { getInplayOdds } from "@/services/odds";
import { getCommentariesByFixture } from "@/services/commentaries";
import { getLiveStandings } from "@/services/standings";
import { storeRawLivescore, storeRawOdds } from "@/lib/ingestion";
import {
  normalizeFixture,
  normalizeOddsInplay,
  normalizeCommentary,
  normalizeLiveStandings,
} from "@/lib/normalization";

export async function syncLiveRefresh(changedFixtureIds: number[]) {
  if (changedFixtureIds.length === 0) return;

  console.log(
    `[sync-live-refresh] Refreshing ${changedFixtureIds.length} fixtures...`
  );

  const processedLeagues = new Set<number>();

  for (const fixtureId of changedFixtureIds) {
    try {
      // 1. Fetch live fixture snapshot
      const fixtureRes = await getFixtureLive(fixtureId);
      if (fixtureRes.data) {
        await storeRawLivescore(fixtureId, "livescores/inplay", fixtureRes.data);
        await normalizeFixture(fixtureRes.data);

        // 2. Live standings (once per league)
        const leagueId = fixtureRes.data.league_id;
        if (!processedLeagues.has(leagueId)) {
          processedLeagues.add(leagueId);
          try {
            const liveStandingsRes = await getLiveStandings(leagueId);
            if (liveStandingsRes.data?.length) {
              await normalizeLiveStandings(
                leagueId,
                fixtureRes.data.season_id,
                liveStandingsRes.data
              );
            }
          } catch {
            console.warn(`[sync-live-refresh] Live standings unavailable for league ${leagueId}`);
          }
        }
      }

      // 3. Inplay odds
      const oddsRes = await getInplayOdds(fixtureId);
      if (oddsRes.data?.length) {
        await storeRawOdds(fixtureId, BOOKMAKER_ID, "inplay", oddsRes.data);
        await normalizeOddsInplay(fixtureId, BOOKMAKER_ID, oddsRes.data);
      }

      // 4. Commentary
      const commentaryRes = await getCommentariesByFixture(fixtureId);
      if (commentaryRes.data?.length) {
        await normalizeCommentary(fixtureId, commentaryRes.data);
      }
    } catch (err) {
      console.error(`[sync-live-refresh] Error refreshing fixture ${fixtureId}:`, err);
    }
  }

  console.log("[sync-live-refresh] Live refresh complete.");
}
