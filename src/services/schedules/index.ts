import { sportmonksGet } from "@/lib/sportmonks/client";
import type { ScheduleStage } from "@/types/sportmonks";

export async function getScheduleBySeasonAndTeam(
  seasonId: number,
  teamId: number
) {
  return sportmonksGet<ScheduleStage[]>(
    `/schedules/seasons/${seasonId}/teams/${teamId}`
  );
}
