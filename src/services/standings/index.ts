import { sportmonksGet } from "@/lib/sportmonks/client";
import {
  STANDINGS_INCLUDE,
  STANDINGS_CORRECTIONS_INCLUDE,
  LIVE_STANDINGS_INCLUDE,
} from "@/lib/sportmonks/includes";
import type { StandingRow, StandingCorrection } from "@/types/sportmonks";

export async function getStandingsBySeason(seasonId: number) {
  return sportmonksGet<StandingRow[]>(`/standings/seasons/${seasonId}`, {
    include: STANDINGS_INCLUDE,
  });
}

export async function getStandingsByRound(roundId: number) {
  return sportmonksGet<StandingRow[]>(`/standings/rounds/${roundId}`, {
    include: STANDINGS_INCLUDE,
  });
}

export async function getStandingsCorrections(seasonId: number) {
  return sportmonksGet<StandingCorrection[]>(
    `/standings/corrections/seasons/${seasonId}`,
    {
      include: STANDINGS_CORRECTIONS_INCLUDE,
    }
  );
}

export async function getLiveStandings(leagueId: number) {
  return sportmonksGet<StandingRow[]>(
    `/standings/live/leagues/${leagueId}`,
    {
      include: LIVE_STANDINGS_INCLUDE,
    }
  );
}
