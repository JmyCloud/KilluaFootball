import { prisma } from "@/lib/storage/prisma";
import type { TeamRanking as ApiRanking } from "@/types/sportmonks";

export async function normalizeRankings(rankings: ApiRanking[]) {
  for (const r of rankings) {
    await prisma.teamRanking.upsert({
      where: { rankingIdExt: r.id },
      update: {
        teamId: r.team_id,
        date: new Date(r.date),
        currentRank: r.current_rank,
        scaledScore: r.scaled_score,
        syncedAt: new Date(),
      },
      create: {
        rankingIdExt: r.id,
        teamId: r.team_id,
        date: new Date(r.date),
        currentRank: r.current_rank,
        scaledScore: r.scaled_score,
      },
    });
  }
}
