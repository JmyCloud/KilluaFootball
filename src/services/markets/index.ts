import { sportmonksGetAllPages } from "@/lib/sportmonks/client";
import { BOOKMAKER_ID } from "@/config/bookmaker";

export interface MarketDefinition {
  id: number;
  legacy_id: number | null;
  name: string;
  developer_name: string;
  has_winning_calculations: boolean;
}

export async function getMarketsForBookmaker() {
  return sportmonksGetAllPages<MarketDefinition>("/odds/markets", {
    filters: `bookmakers:${BOOKMAKER_ID}`,
  });
}
