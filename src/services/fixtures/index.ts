import { sportmonksGet, sportmonksGetAllPages } from "@/lib/sportmonks/client";
import { FIXTURE_PREMATCH_INCLUDE, FIXTURE_LIVE_INCLUDE, H2H_INCLUDE } from "@/lib/sportmonks/includes";
import type { Fixture } from "@/types/sportmonks";

export async function getFixturePrematch(fixtureId: number) {
  return sportmonksGet<Fixture>(`/fixtures/${fixtureId}`, {
    include: FIXTURE_PREMATCH_INCLUDE,
  });
}

export async function getFixtureLive(fixtureId: number) {
  return sportmonksGet<Fixture>(`/fixtures/${fixtureId}`, {
    include: FIXTURE_LIVE_INCLUDE,
  });
}

export async function getH2H(teamId1: number, teamId2: number) {
  return sportmonksGetAllPages<Fixture>(
    `/fixtures/head-to-head/${teamId1}/${teamId2}`,
    {
      include: H2H_INCLUDE,
    }
  );
}
