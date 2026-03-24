import { prisma } from "@/lib/storage/prisma";

const FORM_WINDOW = 5;

interface FormResult {
  form: number;
  attackStrength: number;
  defenceStrength: number;
}

export async function computeTeamForm(
  teamId: number,
  beforeDate: Date
): Promise<FormResult> {
  const recentFixtures = await prisma.fixture.findMany({
    where: {
      startingAt: { lt: beforeDate },
      participants: { some: { teamId } },
      stateId: { in: [5, 6] },
    },
    orderBy: { startingAt: "desc" },
    take: FORM_WINDOW,
    include: {
      participants: true,
      scores: true,
    },
  });

  if (recentFixtures.length === 0) {
    return { form: 0.5, attackStrength: 0, defenceStrength: 0 };
  }

  let totalPoints = 0;
  let totalGoalsFor = 0;
  let totalGoalsAgainst = 0;

  for (const fix of recentFixtures) {
    const teamParticipant = fix.participants.find((p) => p.teamId === teamId);
    const opponentParticipant = fix.participants.find((p) => p.teamId !== teamId);
    if (!teamParticipant || !opponentParticipant) continue;

    const currentScores = fix.scores.filter(
      (s) => s.description === "CURRENT"
    );
    const teamGoals =
      currentScores.find((s) => s.participantId === teamId)?.goals ?? 0;
    const opponentGoals =
      currentScores.find((s) => s.participantId !== teamId)?.goals ?? 0;

    totalGoalsFor += teamGoals;
    totalGoalsAgainst += opponentGoals;

    if (teamGoals > opponentGoals) totalPoints += 3;
    else if (teamGoals === opponentGoals) totalPoints += 1;
  }

  const maxPoints = recentFixtures.length * 3;
  const form = maxPoints > 0 ? totalPoints / maxPoints : 0.5;
  const attackStrength = totalGoalsFor / recentFixtures.length;
  const defenceStrength = totalGoalsAgainst / recentFixtures.length;

  return { form, attackStrength, defenceStrength };
}
