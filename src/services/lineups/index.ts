import { sportmonksGetAllPages } from "@/lib/sportmonks/client";
import {
  EXPECTED_LINEUP_TEAM_INCLUDE,
  EXPECTED_LINEUP_PLAYER_INCLUDE,
} from "@/lib/sportmonks/includes";
import type { ExpectedLineupRow } from "@/types/sportmonks";

export async function getExpectedLineupsByTeam(teamId: number) {
  return sportmonksGetAllPages<ExpectedLineupRow>(
    `/expected-lineups/teams/${teamId}`,
    {
      include: EXPECTED_LINEUP_TEAM_INCLUDE,
      per_page: 50,
    }
  );
}

export async function getExpectedLineupsByPlayer(playerId: number) {
  return sportmonksGetAllPages<ExpectedLineupRow>(
    `/expected-lineups/players/${playerId}`,
    {
      include: EXPECTED_LINEUP_PLAYER_INCLUDE,
      per_page: 50,
    }
  );
}
