import { prisma } from "@/lib/storage/prisma";

interface ScheduleResult {
  restDays: number;
  congestionScore: number;
}

export async function computeScheduleFeatures(
  teamId: number,
  fixtureDate: Date
): Promise<ScheduleResult> {
  const sevenDaysAgo = new Date(fixtureDate.getTime() - 7 * 24 * 60 * 60 * 1000);
  const fourteenDaysAhead = new Date(fixtureDate.getTime() + 14 * 24 * 60 * 60 * 1000);

  // Last match before this fixture
  const lastMatch = await prisma.fixture.findFirst({
    where: {
      startingAt: { lt: fixtureDate },
      participants: { some: { teamId } },
      stateId: { in: [5, 6] },
    },
    orderBy: { startingAt: "desc" },
    select: { startingAt: true },
  });

  const restDays = lastMatch
    ? Math.floor(
        (fixtureDate.getTime() - lastMatch.startingAt.getTime()) /
          (24 * 60 * 60 * 1000)
      )
    : 7;

  // Matches in last 7 days + next 14 days
  const matchesAround = await prisma.fixture.count({
    where: {
      participants: { some: { teamId } },
      startingAt: { gte: sevenDaysAgo, lte: fourteenDaysAhead },
    },
  });

  // congestionScore: 0 = relaxed, 1 = very congested
  const congestionScore = Math.min(matchesAround / 7, 1);

  return { restDays, congestionScore };
}
