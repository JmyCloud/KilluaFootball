import { sportmonksGetAllPages } from "@/lib/sportmonks/client";
import { MATCH_FACTS_INCLUDE } from "@/lib/sportmonks/includes";
import type { MatchFact } from "@/types/sportmonks";

export async function getMatchFacts(fixtureId: number) {
  return sportmonksGetAllPages<MatchFact>(`/match-facts/${fixtureId}`, {
    include: MATCH_FACTS_INCLUDE,
  });
}
