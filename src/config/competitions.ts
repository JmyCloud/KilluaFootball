export const SUPPORTED_COMPETITIONS = [
  { id: 2, name: "Champions League", country: "Europe", priority: 1 },
  { id: 8, name: "Premier League", country: "England", priority: 1 },
  { id: 82, name: "Bundesliga", country: "Germany", priority: 1 },
  { id: 301, name: "Ligue 1", country: "France", priority: 1 },
  { id: 384, name: "Serie A", country: "Italy", priority: 1 },
  { id: 564, name: "La Liga", country: "Spain", priority: 1 },
] as const;

export type CompetitionId = (typeof SUPPORTED_COMPETITIONS)[number]["id"];

export const COMPETITION_IDS: readonly CompetitionId[] = SUPPORTED_COMPETITIONS.map(
  (c) => c.id
);

export function isSupported(leagueId: number): boolean {
  return COMPETITION_IDS.includes(leagueId as CompetitionId);
}
