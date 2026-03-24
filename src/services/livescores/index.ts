import { sportmonksGet } from "@/lib/sportmonks/client";
import { LIVESCORES_INCLUDE } from "@/lib/sportmonks/includes";
import { leagueFilter } from "@/lib/sportmonks/filters";
import type { Fixture } from "@/types/sportmonks";

export async function getLivescoresLatest() {
  return sportmonksGet<Fixture[]>("/livescores/latest", {
    include: LIVESCORES_INCLUDE,
    filters: leagueFilter(),
  });
}

export async function getLivescoresInplay() {
  return sportmonksGet<Fixture[]>("/livescores/inplay", {
    include: LIVESCORES_INCLUDE,
    filters: leagueFilter(),
  });
}
