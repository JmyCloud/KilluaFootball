import { prisma } from "@/lib/storage/prisma";
import type { XGRow as ApiXGRow } from "@/types/sportmonks";

export async function normalizeXgTeam(rows: ApiXGRow[]) {
  for (const r of rows) {
    if (!r.participant_id) continue;
    await prisma.xgTeamRow.upsert({
      where: {
        fixtureId_participantId_typeId: {
          fixtureId: r.fixture_id,
          participantId: r.participant_id,
          typeId: r.type_id,
        },
      },
      update: {
        value: r.data?.value ?? 0,
        location: r.location ?? null,
        syncedAt: new Date(),
      },
      create: {
        fixtureId: r.fixture_id,
        participantId: r.participant_id,
        typeId: r.type_id,
        value: r.data?.value ?? 0,
        location: r.location ?? null,
      },
    });
  }
}

export async function normalizeXgPlayer(rows: ApiXGRow[]) {
  for (const r of rows) {
    if (!r.player_id) continue;
    await prisma.xgPlayerRow.upsert({
      where: {
        fixtureId_playerId_typeId: {
          fixtureId: r.fixture_id,
          playerId: r.player_id,
          typeId: r.type_id,
        },
      },
      update: {
        teamId: r.participant_id ?? r.team?.id ?? 0,
        value: r.data?.value ?? 0,
        syncedAt: new Date(),
      },
      create: {
        fixtureId: r.fixture_id,
        playerId: r.player_id,
        teamId: r.participant_id ?? r.team?.id ?? 0,
        typeId: r.type_id,
        value: r.data?.value ?? 0,
      },
    });
  }
}
