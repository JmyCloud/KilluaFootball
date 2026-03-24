import { sportmonksGet } from "@/lib/sportmonks/client";
import { leagueFilter } from "@/lib/sportmonks/filters";
import type { Fixture } from "@/types/sportmonks";

export async function getFixturesLatest() {
  return sportmonksGet<Fixture[]>("/fixtures/latest", {
    filters: leagueFilter(),
  });
}
