import allMarketsData from "@/data/all-markets.json";

export interface MarketInfo {
  id: number;
  legacy_id: number | null;
  name: string;
  developer_name: string;
  has_winning_calculations: boolean;
}

export const ALL_MARKETS: MarketInfo[] = allMarketsData.data;

export function getAllMarketIds(): number[] {
  return ALL_MARKETS.map((m) => m.id);
}

export function getMarketById(id: number): MarketInfo | undefined {
  return ALL_MARKETS.find((m) => m.id === id);
}

export function getMarketByDevName(devName: string): MarketInfo | undefined {
  return ALL_MARKETS.find((m) => m.developer_name === devName);
}
