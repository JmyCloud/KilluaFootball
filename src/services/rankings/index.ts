import { sportmonksGetAllPages } from "@/lib/sportmonks/client";
import { TEAM_RANKINGS_INCLUDE } from "@/lib/sportmonks/includes";
import type { TeamRanking } from "@/types/sportmonks";

export async function getTeamRankings(teamId: number) {
  return sportmonksGetAllPages<TeamRanking>(
    `/team-rankings/teams/${teamId}`,
    {
      include: TEAM_RANKINGS_INCLUDE,
    }
  );
}
