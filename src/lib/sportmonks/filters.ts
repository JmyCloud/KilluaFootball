import { BOOKMAKER_ID } from "@/config/bookmaker";
import { COMPETITION_IDS } from "@/config/competitions";

export function leagueFilter(): string {
  return `fixtureLeagues:${COMPETITION_IDS.join(",")}`;
}

export function newsLeagueFilter(): string {
  return `newsitemLeagues:${COMPETITION_IDS.join(",")}`;
}

export function bookmakerFilter(): string {
  return `bookmakers:${BOOKMAKER_ID}`;
}

export function seasonFilter(seasonId: number): string {
  return `seasons:${seasonId}`;
}

export function refereeSeasonFilter(seasonId: number): string {
  return `refereeStatisticSeasons:${seasonId}`;
}

export function dateRangeFilter(from: string, to: string): string {
  return `fixtureStartingAtFrom:${from};fixtureStartingAtTo:${to}`;
}
