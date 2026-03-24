import { prisma } from "@/lib/storage/prisma";
import { COMPETITION_IDS } from "@/config/competitions";
import { BOOKMAKER_ID } from "@/config/bookmaker";
import { getFixturePrematch } from "@/services/fixtures";
import { getPreMatchOdds } from "@/services/odds";
import { getPreMatchNewsUpcoming } from "@/services/news";
import { getMatchFacts } from "@/services/matchFacts";
import { storeRawFixture, storeRawOdds, storeRawMatchFact } from "@/lib/ingestion";
import { normalizeFixture, normalizeOddsPrematch, normalizeMatchFacts, normalizeNews } from "@/lib/normalization";

export async function syncPreMatch() {
  console.log("[sync-pre-match] Starting pre-match sync...");

  // 1. Find upcoming fixtures (next 48h) for supported competitions
  const now = new Date();
  const cutoff = new Date(now.getTime() + 48 * 60 * 60 * 1000);

  const upcomingFixtures = await prisma.fixture.findMany({
    where: {
      leagueId: { in: [...COMPETITION_IDS] },
      startingAt: { gte: now, lte: cutoff },
    },
    select: { id: true, name: true },
  });

  console.log(`[sync-pre-match] Found ${upcomingFixtures.length} upcoming fixtures`);

  // 2. Sync each fixture
  for (const fix of upcomingFixtures) {
    try {
      console.log(`[sync-pre-match] Syncing fixture ${fix.id}: ${fix.name}`);

      // 2a. Fixture prematch snapshot
      const fixtureRes = await getFixturePrematch(fix.id);
      if (fixtureRes.data) {
        await storeRawFixture(fix.id, "fixtures/prematch", fixtureRes.data);
        await normalizeFixture(fixtureRes.data);
      }

      // 2b. Pre-match odds (bookmaker 35)
      const oddsRes = await getPreMatchOdds(fix.id);
      if (oddsRes.data?.length) {
        await storeRawOdds(fix.id, BOOKMAKER_ID, "pre-match", oddsRes.data);
        await normalizeOddsPrematch(fix.id, BOOKMAKER_ID, oddsRes.data);
        console.log(`[sync-pre-match]   → ${oddsRes.data.length} odds rows`);
      }

      // 2c. Match facts
      const facts = await getMatchFacts(fix.id);
      if (facts.length) {
        await storeRawMatchFact(fix.id, facts);
        await normalizeMatchFacts(facts);
        console.log(`[sync-pre-match]   → ${facts.length} match facts`);
      }
    } catch (err) {
      console.error(`[sync-pre-match] Error syncing fixture ${fix.id}:`, err);
    }
  }

  // 3. Sync upcoming news (one call covers all competitions)
  try {
    const newsArticles = await getPreMatchNewsUpcoming();
    if (newsArticles.length) {
      await normalizeNews(newsArticles);
      console.log(`[sync-pre-match] → ${newsArticles.length} news articles`);
    }
  } catch (err) {
    console.error("[sync-pre-match] Error syncing news:", err);
  }

  console.log("[sync-pre-match] Pre-match sync complete.");
}
