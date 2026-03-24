import { prisma } from "@/lib/storage/prisma";
import type { SquadPlayer as ApiSquad } from "@/types/sportmonks";

export async function normalizeSquads(
  teamId: number,
  seasonId: number | null,
  players: ApiSquad[]
) {
  for (const p of players) {
    await prisma.teamSquad.upsert({
      where: {
        teamId_playerId_seasonId: {
          teamId,
          playerId: p.player_id,
          seasonId: seasonId ?? 0,
        },
      },
      update: {
        positionId: p.position_id ?? null,
        positionName: p.position?.name ?? null,
        jerseyNumber: p.jersey_number ?? null,
        playerName: p.player?.display_name ?? null,
        syncedAt: new Date(),
      },
      create: {
        teamId,
        seasonId: seasonId ?? 0,
        playerId: p.player_id,
        positionId: p.position_id ?? null,
        positionName: p.position?.name ?? null,
        jerseyNumber: p.jersey_number ?? null,
        playerName: p.player?.display_name ?? null,
      },
    });
  }
}
