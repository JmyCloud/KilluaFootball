import { sportmonksGet } from "@/lib/sportmonks/client";
import { ODDS_INCLUDE } from "@/lib/sportmonks/includes";
import { BOOKMAKER_ID } from "@/config/bookmaker";
import type { OddsRow } from "@/types/sportmonks";

function buildMarketFilter(marketIds?: number[]): string | undefined {
  if (!marketIds || marketIds.length === 0) return undefined;
  return `markets:${marketIds.join(",")}`;
}

export async function getPreMatchOdds(
  fixtureId: number,
  marketIds?: number[]
) {
  return sportmonksGet<OddsRow[]>(
    `/odds/pre-match/fixtures/${fixtureId}/bookmakers/${BOOKMAKER_ID}`,
    {
      include: ODDS_INCLUDE,
      filters: buildMarketFilter(marketIds),
    }
  );
}

export async function getInplayOdds(
  fixtureId: number,
  marketIds?: number[]
) {
  return sportmonksGet<OddsRow[]>(
    `/odds/inplay/fixtures/${fixtureId}/bookmakers/${BOOKMAKER_ID}`,
    {
      include: ODDS_INCLUDE,
      filters: buildMarketFilter(marketIds),
    }
  );
}
