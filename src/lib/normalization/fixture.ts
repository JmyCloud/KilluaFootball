import { prisma } from "@/lib/storage/prisma";
import type {
  Fixture as ApiFixture,
  Participant,
  Score,
  FixtureEvent as ApiEvent,
  FixtureStatistic as ApiStat,
  Lineup as ApiLineup,
  ExpectedLineupRow,
} from "@/types/sportmonks";

export async function normalizeFixture(f: ApiFixture) {
  await prisma.fixture.upsert({
    where: { id: f.id },
    update: {
      leagueId: f.league_id,
      seasonId: f.season_id,
      stageId: f.stage_id ?? null,
      roundId: f.round_id ?? null,
      stateId: f.state_id,
      name: f.name,
      startingAt: new Date(f.starting_at),
      length: f.length ?? null,
      hasOdds: f.has_odds ?? false,
      resultInfo: f.result_info ?? null,
      syncedAt: new Date(),
    },
    create: {
      id: f.id,
      leagueId: f.league_id,
      seasonId: f.season_id,
      stageId: f.stage_id ?? null,
      roundId: f.round_id ?? null,
      stateId: f.state_id,
      name: f.name,
      startingAt: new Date(f.starting_at),
      length: f.length ?? null,
      hasOdds: f.has_odds ?? false,
      resultInfo: f.result_info ?? null,
    },
  });

  if (f.participants?.length) {
    await normalizeParticipants(f.id, f.participants);
  }
  if (f.scores?.length) {
    await normalizeScores(f.id, f.scores);
  }
  if (f.events?.length) {
    await normalizeEvents(f.id, f.events);
  }
  if (f.statistics?.length) {
    await normalizeStatistics(f.id, f.statistics);
  }
  if (f.lineups?.length) {
    await normalizeLineups(f.id, f.lineups);
  }
  if (f.expectedLineups?.length) {
    await normalizeExpectedLineups(f.id, f.expectedLineups);
  }
}

async function normalizeParticipants(fixtureId: number, participants: Participant[]) {
  for (const p of participants) {
    await prisma.fixtureParticipant.upsert({
      where: { fixtureId_teamId: { fixtureId, teamId: p.id } },
      update: {
        teamName: p.name,
        location: p.meta?.location ?? "home",
        isWinner: p.meta?.winner ?? null,
      },
      create: {
        fixtureId,
        teamId: p.id,
        teamName: p.name,
        location: p.meta?.location ?? "home",
        isWinner: p.meta?.winner ?? null,
      },
    });
  }
}

async function normalizeScores(fixtureId: number, scores: Score[]) {
  await prisma.fixtureScore.deleteMany({ where: { fixtureId } });
  if (scores.length > 0) {
    await prisma.fixtureScore.createMany({
      data: scores.map((s) => ({
        fixtureId,
        participantId: s.participant_id,
        description: s.description,
        goals: s.score.goals,
      })),
    });
  }
}

async function normalizeEvents(fixtureId: number, events: ApiEvent[]) {
  await prisma.fixtureEvent.deleteMany({ where: { fixtureId } });
  if (events.length > 0) {
    await prisma.fixtureEvent.createMany({
      data: events.map((e) => ({
        fixtureId,
        eventIdExt: e.id ?? null,
        minute: e.minute ?? null,
        extraMinute: e.extra_minute ?? null,
        typeId: e.type_id,
        participantId: e.participant_id ?? null,
        playerId: e.player_id ?? null,
        relatedPlayerId: e.related_player_id ?? null,
        result: e.result ?? null,
        info: e.info ?? null,
      })),
    });
  }
}

async function normalizeStatistics(fixtureId: number, stats: ApiStat[]) {
  await prisma.fixtureStatistic.deleteMany({ where: { fixtureId } });
  if (stats.length > 0) {
    await prisma.fixtureStatistic.createMany({
      data: stats.map((s) => ({
        fixtureId,
        typeId: s.type_id,
        participantId: s.participant_id,
        value: String(s.data?.value ?? ""),
        location: s.location ?? null,
      })),
    });
  }
}

async function normalizeLineups(fixtureId: number, lineups: ApiLineup[]) {
  for (const l of lineups) {
    await prisma.lineup.upsert({
      where: { fixtureId_playerId: { fixtureId, playerId: l.player_id } },
      update: {
        teamId: l.team_id,
        typeId: l.type_id,
        jerseyNumber: l.jersey_number ?? null,
        playerName: l.player_name ?? null,
        formationField: l.formation_field ?? null,
      },
      create: {
        fixtureId,
        playerId: l.player_id,
        teamId: l.team_id,
        typeId: l.type_id,
        jerseyNumber: l.jersey_number ?? null,
        playerName: l.player_name ?? null,
        formationField: l.formation_field ?? null,
      },
    });
  }
}

async function normalizeExpectedLineups(fixtureId: number, rows: ExpectedLineupRow[]) {
  for (const r of rows) {
    await prisma.expectedLineup.upsert({
      where: { fixtureId_playerId: { fixtureId, playerId: r.player_id } },
      update: {
        teamId: r.team_id,
        typeId: r.type_id,
        jerseyNumber: r.jersey_number ?? null,
        playerName: r.player_name ?? null,
        positionId: r.position_id ?? null,
        formationPosition: r.formation_position ?? null,
      },
      create: {
        fixtureId,
        playerId: r.player_id,
        teamId: r.team_id,
        typeId: r.type_id,
        jerseyNumber: r.jersey_number ?? null,
        playerName: r.player_name ?? null,
        positionId: r.position_id ?? null,
        formationPosition: r.formation_position ?? null,
      },
    });
  }
}
