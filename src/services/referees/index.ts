import { sportmonksGetAllPages } from "@/lib/sportmonks/client";
import { REFEREE_STATS_INCLUDE } from "@/lib/sportmonks/includes";
import type { RefereeStatistic } from "@/types/sportmonks";

export async function getRefereeSeasonStats(refereeId: number) {
  return sportmonksGetAllPages<RefereeStatistic>(
    `/statistics/seasons/referees/${refereeId}`,
    {
      include: REFEREE_STATS_INCLUDE,
    }
  );
}
