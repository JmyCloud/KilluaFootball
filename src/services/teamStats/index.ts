import { sportmonksGet } from "@/lib/sportmonks/client";
import { TEAM_STATS_INCLUDE } from "@/lib/sportmonks/includes";
import type { TeamSeasonStatistics } from "@/types/sportmonks";

export async function getTeamSeasonStats(teamId: number) {
  return sportmonksGet<TeamSeasonStatistics[]>(
    `/statistics/seasons/teams/${teamId}`,
    {
      include: TEAM_STATS_INCLUDE,
    }
  );
}
