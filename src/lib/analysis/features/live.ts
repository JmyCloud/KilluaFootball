import { prisma } from "@/lib/storage/prisma";

interface LiveFeatureResult {
  minute: number | null;
  homeGoals: number | null;
  awayGoals: number | null;
  homePossession: number | null;
  awayPossession: number | null;
  homeShots: number | null;
  awayShots: number | null;
  homeShotsOnTarget: number | null;
  awayShotsOnTarget: number | null;
  homeXgLive: number | null;
  awayXgLive: number | null;
  momentumScore: number | null;
}

const STAT_TYPE_IDS = {
  possession: 45,
  shots: 42,
  shotsOnTarget: 86,
};

export async function computeLiveFeatures(
  fixtureId: number,
  homeTeamId: number,
  awayTeamId: number
): Promise<LiveFeatureResult> {
  const [scores, stats, xgRows] = await Promise.all([
    prisma.fixtureScore.findMany({
      where: { fixtureId, description: "CURRENT" },
    }),
    prisma.fixtureStatistic.findMany({ where: { fixtureId } }),
    prisma.xgTeamRow.findMany({ where: { fixtureId } }),
  ]);

  const homeGoals = scores.find((s) => s.participantId === homeTeamId)?.goals ?? null;
  const awayGoals = scores.find((s) => s.participantId === awayTeamId)?.goals ?? null;

  const getStat = (typeId: number, teamId: number): number | null => {
    const stat = stats.find(
      (s) => s.typeId === typeId && s.participantId === teamId
    );
    return stat ? parseFloat(stat.value) || null : null;
  };

  const homePossession = getStat(STAT_TYPE_IDS.possession, homeTeamId);
  const awayPossession = getStat(STAT_TYPE_IDS.possession, awayTeamId);
  const homeShots = getStat(STAT_TYPE_IDS.shots, homeTeamId);
  const awayShots = getStat(STAT_TYPE_IDS.shots, awayTeamId);
  const homeShotsOnTarget = getStat(STAT_TYPE_IDS.shotsOnTarget, homeTeamId);
  const awayShotsOnTarget = getStat(STAT_TYPE_IDS.shotsOnTarget, awayTeamId);

  const homeXgLive = xgRows.find((r) => r.participantId === homeTeamId)?.value ?? null;
  const awayXgLive = xgRows.find((r) => r.participantId === awayTeamId)?.value ?? null;

  // Momentum: positive = home dominant, negative = away dominant
  let momentumScore: number | null = null;
  if (homePossession !== null && awayPossession !== null) {
    const possessionEdge = (homePossession - awayPossession) / 100;
    const shotsEdge =
      homeShots !== null && awayShots !== null && (homeShots + awayShots) > 0
        ? (homeShots - awayShots) / (homeShots + awayShots)
        : 0;
    momentumScore = (possessionEdge + shotsEdge) / 2;
  }

  return {
    minute: null,
    homeGoals,
    awayGoals,
    homePossession,
    awayPossession,
    homeShots,
    awayShots,
    homeShotsOnTarget,
    awayShotsOnTarget,
    homeXgLive,
    awayXgLive,
    momentumScore,
  };
}
