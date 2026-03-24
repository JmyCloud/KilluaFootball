import { prisma } from "@/lib/storage/prisma";

interface StandingsResult {
  position: number | null;
  points: number | null;
  rankScore: number | null;
}

export async function computeStandingsFeatures(
  teamId: number,
  leagueId: number,
  seasonId: number
): Promise<StandingsResult> {
  const standing = await prisma.standingsRow.findFirst({
    where: { seasonId, participantId: teamId },
    orderBy: { roundId: "desc" },
    select: { position: true, points: true },
  });

  const ranking = await prisma.teamRanking.findFirst({
    where: { teamId },
    orderBy: { date: "desc" },
    select: { scaledScore: true },
  });

  return {
    position: standing?.position ?? null,
    points: standing?.points ?? null,
    rankScore: ranking?.scaledScore ?? null,
  };
}
