import { prisma } from "@/lib/storage/prisma";
import type {
  StandingRow as ApiStandingRow,
  StandingCorrection as ApiCorrection,
} from "@/types/sportmonks";

export async function normalizeStandings(rows: ApiStandingRow[]) {
  for (const r of rows) {
    const row = await prisma.standingsRow.upsert({
      where: {
        seasonId_participantId_roundId: {
          seasonId: r.season_id,
          participantId: r.participant_id,
          roundId: r.round_id ?? 0,
        },
      },
      update: {
        leagueId: r.league_id,
        stageId: r.stage_id ?? null,
        groupId: r.group_id ?? null,
        position: r.position,
        points: r.points,
        result: r.result ?? null,
        form: r.form ?? [],
        syncedAt: new Date(),
      },
      create: {
        leagueId: r.league_id,
        seasonId: r.season_id,
        stageId: r.stage_id ?? null,
        roundId: r.round_id ?? 0,
        groupId: r.group_id ?? null,
        participantId: r.participant_id,
        position: r.position,
        points: r.points,
        result: r.result ?? null,
        form: r.form ?? [],
      },
    });

    if (r.details?.length) {
      await prisma.standingsDetail.deleteMany({
        where: { standingsRowId: row.id },
      });
      await prisma.standingsDetail.createMany({
        data: r.details.map((d) => ({
          standingsRowId: row.id,
          typeName: d.type?.name ?? String(d.type_id ?? "unknown"),
          value: d.value,
        })),
      });
    }
  }
}

export async function normalizeStandingsCorrections(corrections: ApiCorrection[]) {
  for (const c of corrections) {
    await prisma.standingsCorrection.upsert({
      where: { correctionIdExt: c.id },
      update: {
        seasonId: c.season_id,
        stageId: c.stage_id ?? null,
        groupId: c.group_id ?? null,
        typeId: c.type_id,
        value: c.value,
        calcType: c.calc_type,
        participantId: c.participant_id,
        active: c.active,
        syncedAt: new Date(),
      },
      create: {
        correctionIdExt: c.id,
        seasonId: c.season_id,
        stageId: c.stage_id ?? null,
        groupId: c.group_id ?? null,
        typeId: c.type_id,
        value: c.value,
        calcType: c.calc_type,
        participantId: c.participant_id,
        active: c.active,
      },
    });
  }
}

export async function normalizeLiveStandings(
  leagueId: number,
  seasonId: number,
  rows: ApiStandingRow[]
) {
  for (const r of rows) {
    await prisma.liveStandingsRow.upsert({
      where: {
        leagueId_participantId: {
          leagueId,
          participantId: r.participant_id,
        },
      },
      update: {
        seasonId,
        position: r.position,
        points: r.points,
        result: r.result ?? null,
        syncedAt: new Date(),
      },
      create: {
        leagueId,
        seasonId,
        participantId: r.participant_id,
        position: r.position,
        points: r.points,
        result: r.result ?? null,
      },
    });
  }
}
