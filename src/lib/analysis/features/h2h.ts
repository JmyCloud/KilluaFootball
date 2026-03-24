import { prisma } from "@/lib/storage/prisma";

interface H2HResult {
  homeWinRate: number;
  drawRate: number;
  bttsRate: number;
  overRate: number;
}

export async function computeH2HFeatures(
  homeTeamId: number,
  awayTeamId: number
): Promise<H2HResult> {
  const h2hFixtures = await prisma.fixture.findMany({
    where: {
      stateId: { in: [5, 6] },
      AND: [
        { participants: { some: { teamId: homeTeamId } } },
        { participants: { some: { teamId: awayTeamId } } },
      ],
    },
    orderBy: { startingAt: "desc" },
    take: 10,
    include: {
      scores: { where: { description: "CURRENT" } },
    },
  });

  if (h2hFixtures.length === 0) {
    return { homeWinRate: 0.33, drawRate: 0.33, bttsRate: 0.5, overRate: 0.5 };
  }

  let homeWins = 0;
  let draws = 0;
  let btts = 0;
  let over25 = 0;

  for (const fix of h2hFixtures) {
    const homeGoals =
      fix.scores.find((s) => s.participantId === homeTeamId)?.goals ?? 0;
    const awayGoals =
      fix.scores.find((s) => s.participantId === awayTeamId)?.goals ?? 0;

    if (homeGoals > awayGoals) homeWins++;
    else if (homeGoals === awayGoals) draws++;

    if (homeGoals > 0 && awayGoals > 0) btts++;
    if (homeGoals + awayGoals > 2) over25++;
  }

  const total = h2hFixtures.length;
  return {
    homeWinRate: homeWins / total,
    drawRate: draws / total,
    bttsRate: btts / total,
    overRate: over25 / total,
  };
}
