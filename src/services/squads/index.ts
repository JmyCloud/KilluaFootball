import { sportmonksGet } from "@/lib/sportmonks/client";
import {
  SQUADS_SEASON_INCLUDE,
  SQUADS_TEAM_INCLUDE,
} from "@/lib/sportmonks/includes";
import type { SquadPlayer } from "@/types/sportmonks";

export async function getSquadBySeason(seasonId: number, teamId: number) {
  return sportmonksGet<SquadPlayer[]>(
    `/squads/seasons/${seasonId}/teams/${teamId}`,
    {
      include: SQUADS_SEASON_INCLUDE,
    }
  );
}

export async function getSquadByTeam(teamId: number) {
  return sportmonksGet<SquadPlayer[]>(`/squads/teams/${teamId}`, {
    include: SQUADS_TEAM_INCLUDE,
  });
}
