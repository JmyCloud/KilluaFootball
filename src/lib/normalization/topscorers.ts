import { prisma } from "@/lib/storage/prisma";
import type { Topscorer as ApiTopscorer } from "@/types/sportmonks";

export async function normalizeTopscorers(scorers: ApiTopscorer[]) {
  for (const s of scorers) {
    await prisma.topscorer.upsert({
      where: { topscorerIdExt: s.id },
      update: {
        seasonId: s.season_id,
        playerId: s.player_id,
        typeId: s.type_id,
        position: s.position,
        total: s.total,
        participantId: s.participant_id,
        playerName: s.player?.display_name ?? null,
        syncedAt: new Date(),
      },
      create: {
        topscorerIdExt: s.id,
        seasonId: s.season_id,
        playerId: s.player_id,
        typeId: s.type_id,
        position: s.position,
        total: s.total,
        participantId: s.participant_id,
        playerName: s.player?.display_name ?? null,
      },
    });
  }
}
