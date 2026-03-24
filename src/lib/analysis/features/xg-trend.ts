import { prisma } from "@/lib/storage/prisma";

const XG_WINDOW = 5;

export async function computeXgTrend(
  teamId: number,
  beforeDate: Date
): Promise<number> {
  const recentXg = await prisma.xgTeamRow.findMany({
    where: {
      participantId: teamId,
      fixture: { startingAt: { lt: beforeDate }, stateId: { in: [5, 6] } },
    },
    orderBy: { fixture: { startingAt: "desc" } },
    take: XG_WINDOW,
    select: { value: true },
  });

  if (recentXg.length < 2) return 0;

  const values = recentXg.map((r) => r.value);
  const avg = values.reduce((a, b) => a + b, 0) / values.length;
  const recentAvg =
    values.slice(0, Math.ceil(values.length / 2)).reduce((a, b) => a + b, 0) /
    Math.ceil(values.length / 2);

  return recentAvg - avg;
}
