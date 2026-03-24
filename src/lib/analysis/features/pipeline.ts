import { prisma } from "@/lib/storage/prisma";
import { COMPETITION_IDS } from "@/config/competitions";
import { computeTeamForm } from "./form";
import { computeXgTrend } from "./xg-trend";
import { computeScheduleFeatures } from "./schedule";
import { computeStandingsFeatures } from "./standings-rank";
import { computeH2HFeatures } from "./h2h";
import { computeMarketFeatures } from "./market";
import { computeLiveFeatures } from "./live";

export async function runPrematchFeaturePipeline() {
  const now = new Date();
  const cutoff = new Date(now.getTime() + 48 * 60 * 60 * 1000);

  const fixtures = await prisma.fixture.findMany({
    where: {
      leagueId: { in: [...COMPETITION_IDS] },
      startingAt: { gte: now, lte: cutoff },
    },
    include: { participants: true },
  });

  console.log(`[feature-pipeline] Computing features for ${fixtures.length} fixtures`);

  for (const fix of fixtures) {
    try {
      const home = fix.participants.find((p) => p.location === "home");
      const away = fix.participants.find((p) => p.location === "away");
      if (!home || !away) continue;

      // 1. Form + strength
      const [homeForm, awayForm] = await Promise.all([
        computeTeamForm(home.teamId, fix.startingAt),
        computeTeamForm(away.teamId, fix.startingAt),
      ]);

      // 2. xG trends
      const [homeXgTrend, awayXgTrend] = await Promise.all([
        computeXgTrend(home.teamId, fix.startingAt),
        computeXgTrend(away.teamId, fix.startingAt),
      ]);

      // 3. Schedule / rest
      const [homeSched, awaySched] = await Promise.all([
        computeScheduleFeatures(home.teamId, fix.startingAt),
        computeScheduleFeatures(away.teamId, fix.startingAt),
      ]);

      // 4. Standings + rankings
      const [homeStandings, awayStandings] = await Promise.all([
        computeStandingsFeatures(home.teamId, fix.leagueId, fix.seasonId),
        computeStandingsFeatures(away.teamId, fix.leagueId, fix.seasonId),
      ]);

      // 5. H2H
      const h2h = await computeH2HFeatures(home.teamId, away.teamId);

      // 6. Market features
      const marketFeatures = await computeMarketFeatures(fix.id);

      // Store prematch features
      await prisma.featuresPrematch.upsert({
        where: { fixtureId: fix.id },
        update: {
          homeForm: homeForm.form,
          awayForm: awayForm.form,
          homeAttackStrength: homeForm.attackStrength,
          awayAttackStrength: awayForm.attackStrength,
          homeDefenceStrength: homeForm.defenceStrength,
          awayDefenceStrength: awayForm.defenceStrength,
          homeXgTrend,
          awayXgTrend,
          homeRestDays: homeSched.restDays,
          awayRestDays: awaySched.restDays,
          homeCongestionScore: homeSched.congestionScore,
          awayCongestionScore: awaySched.congestionScore,
          homeStandingsPosition: homeStandings.position,
          awayStandingsPosition: awayStandings.position,
          homeStandingsPoints: homeStandings.points,
          awayStandingsPoints: awayStandings.points,
          homeRankScore: homeStandings.rankScore,
          awayRankScore: awayStandings.rankScore,
          h2hHomeWinRate: h2h.homeWinRate,
          h2hDrawRate: h2h.drawRate,
          h2hBttsRate: h2h.bttsRate,
          h2hOverRate: h2h.overRate,
          computedAt: new Date(),
        },
        create: {
          fixtureId: fix.id,
          homeForm: homeForm.form,
          awayForm: awayForm.form,
          homeAttackStrength: homeForm.attackStrength,
          awayAttackStrength: awayForm.attackStrength,
          homeDefenceStrength: homeForm.defenceStrength,
          awayDefenceStrength: awayForm.defenceStrength,
          homeXgTrend,
          awayXgTrend,
          homeRestDays: homeSched.restDays,
          awayRestDays: awaySched.restDays,
          homeCongestionScore: homeSched.congestionScore,
          awayCongestionScore: awaySched.congestionScore,
          homeStandingsPosition: homeStandings.position,
          awayStandingsPosition: awayStandings.position,
          homeStandingsPoints: homeStandings.points,
          awayStandingsPoints: awayStandings.points,
          homeRankScore: homeStandings.rankScore,
          awayRankScore: awayStandings.rankScore,
          h2hHomeWinRate: h2h.homeWinRate,
          h2hDrawRate: h2h.drawRate,
          h2hBttsRate: h2h.bttsRate,
          h2hOverRate: h2h.overRate,
        },
      });

      // Store market features
      for (const mf of marketFeatures) {
        await prisma.featuresMarket.upsert({
          where: { fixtureId_market: { fixtureId: fix.id, market: mf.market } },
          update: {
            openingOdds: mf.openingOdds,
            currentOdds: mf.currentOdds,
            driftDirection: mf.driftDirection,
            driftMagnitude: mf.driftMagnitude,
            impliedProbability: mf.impliedProbability,
            syncedAt: new Date(),
          },
          create: {
            fixtureId: fix.id,
            market: mf.market,
            openingOdds: mf.openingOdds,
            currentOdds: mf.currentOdds,
            driftDirection: mf.driftDirection,
            driftMagnitude: mf.driftMagnitude,
            impliedProbability: mf.impliedProbability,
          },
        });
      }

      console.log(`[feature-pipeline]   ✓ ${fix.name}`);
    } catch (err) {
      console.error(`[feature-pipeline] Error computing features for fixture ${fix.id}:`, err);
    }
  }
}

export async function runLiveFeaturePipeline() {
  const liveFixtures = await prisma.fixture.findMany({
    where: {
      leagueId: { in: [...COMPETITION_IDS] },
      stateId: { in: [2, 3, 4] },
    },
    include: { participants: true },
  });

  console.log(`[feature-pipeline] Computing LIVE features for ${liveFixtures.length} fixtures`);

  for (const fix of liveFixtures) {
    try {
      const home = fix.participants.find((p) => p.location === "home");
      const away = fix.participants.find((p) => p.location === "away");
      if (!home || !away) continue;

      const live = await computeLiveFeatures(fix.id, home.teamId, away.teamId);

      await prisma.featuresLive.upsert({
        where: { fixtureId: fix.id },
        update: {
          ...live,
          computedAt: new Date(),
        },
        create: {
          fixtureId: fix.id,
          ...live,
        },
      });

      console.log(`[feature-pipeline]   ✓ LIVE ${fix.name}`);
    } catch (err) {
      console.error(`[feature-pipeline] Error computing live features for fixture ${fix.id}:`, err);
    }
  }
}
