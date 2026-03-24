import { SUPPORTED_COMPETITIONS } from "@/config/competitions";
import { getStandingsBySeason, getStandingsCorrections } from "@/services/standings";
import { getTopscorersBySeason } from "@/services/topscorers";
import { prisma } from "@/lib/storage/prisma";
import {
  normalizeStandings,
  normalizeStandingsCorrections,
  normalizeTopscorers,
} from "@/lib/normalization";

export async function syncReferenceData() {
  console.log("[sync-reference] Starting background reference sync...");

  for (const comp of SUPPORTED_COMPETITIONS) {
    console.log(`[sync-reference] Processing: ${comp.name} (league ${comp.id})`);

    try {
      const seasonId = await resolveCurrentSeason(comp.id);
      if (!seasonId) {
        console.warn(`[sync-reference] No current season for ${comp.name}, skipping`);
        continue;
      }

      // 1. Standings
      console.log(`[sync-reference] Syncing standings for season ${seasonId}`);
      const standingsRes = await getStandingsBySeason(seasonId);
      if (standingsRes.data?.length) {
        await normalizeStandings(standingsRes.data);
        console.log(`[sync-reference]   → ${standingsRes.data.length} standings rows`);
      }

      // 2. Standings corrections
      const correctionsRes = await getStandingsCorrections(seasonId);
      if (correctionsRes.data?.length) {
        await normalizeStandingsCorrections(correctionsRes.data);
        console.log(`[sync-reference]   → ${correctionsRes.data.length} corrections`);
      }

      // 3. Topscorers
      console.log(`[sync-reference] Syncing topscorers for season ${seasonId}`);
      const topscorers = await getTopscorersBySeason(seasonId);
      if (topscorers.length) {
        await normalizeTopscorers(topscorers);
        console.log(`[sync-reference]   → ${topscorers.length} topscorers`);
      }
    } catch (err) {
      console.error(`[sync-reference] Error processing ${comp.name}:`, err);
    }
  }

  console.log("[sync-reference] Background reference sync complete.");
}

async function resolveCurrentSeason(leagueId: number): Promise<number | null> {
  const fixture = await prisma.fixture.findFirst({
    where: { leagueId },
    orderBy: { startingAt: "desc" },
    select: { seasonId: true },
  });
  return fixture?.seasonId ?? null;
}
