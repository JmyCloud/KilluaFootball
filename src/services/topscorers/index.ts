import { sportmonksGetAllPages } from "@/lib/sportmonks/client";
import { TOPSCORERS_INCLUDE } from "@/lib/sportmonks/includes";
import type { Topscorer } from "@/types/sportmonks";

export async function getTopscorersBySeason(seasonId: number) {
  return sportmonksGetAllPages<Topscorer>(
    `/topscorers/seasons/${seasonId}`,
    {
      include: TOPSCORERS_INCLUDE,
      order: "asc",
      per_page: 50,
    }
  );
}
