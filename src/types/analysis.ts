// Types used by analysis packets - SignalClass re-exported for downstream consumers
export type { SignalClass } from "@/config";

export interface PreMatchPacket {
  fixtureId: number;
  leagueId: number;
  seasonId: number;
  generatedAt: string;

  fixture: FixtureIdentity;
  competition: CompetitionContext;
  home: TeamContext;
  away: TeamContext;
  standings: StandingsContext;
  standingsCorrections: StandingsCorrectionContext[];
  roundContext: RoundContext;
  h2h: H2HContext;
  teamSeasonStats: { home: TeamSeasonStats; away: TeamSeasonStats };
  refereeStats: RefereeContext;
  xg: XGContext;
  expectedLineup: { home: ExpectedLineupContext; away: ExpectedLineupContext };
  squadDepth: { home: SquadDepthContext; away: SquadDepthContext };
  restCongestion: { home: RestCongestionContext; away: RestCongestionContext };
  sidelined: { home: SidelinedContext; away: SidelinedContext };
  news: NewsContext[];
  odds: OddsContext;
  predictions: PredictionContext;
  matchFacts: MatchFactContext[];
  teamRankings: { home: TeamRankingContext; away: TeamRankingContext };
}

export interface LivePacket {
  fixtureId: number;
  generatedAt: string;
  freshness: FreshnessInfo;

  liveState: LiveStateContext;
  scoreState: ScoreStateContext;
  liveEvents: LiveEventContext[];
  liveStatistics: LiveStatisticsContext;
  liveXG: LiveXGContext | null;
  inplayOdds: InplayOddsContext;
  liveStandingsImpact: LiveStandingsImpact;
  commentaryMomentum: CommentaryMomentumContext;
  matchFacts: MatchFactContext[];
  formation: FormationContext;
}

// --- Sub-types ---

export interface FixtureIdentity {
  id: number;
  name: string;
  startingAt: string;
  stateId: number;
  stateName: string;
  venueName: string | null;
}

export interface CompetitionContext {
  leagueId: number;
  leagueName: string;
  seasonId: number;
  seasonName: string;
  stageName: string | null;
  roundName: string | null;
}

export interface TeamContext {
  id: number;
  name: string;
  location: "home" | "away";
}

export interface StandingsContext {
  homePosition: number;
  homePoints: number;
  awayPosition: number;
  awayPoints: number;
  homeForm: string[];
  awayForm: string[];
}

export interface StandingsCorrectionContext {
  teamId: number;
  teamName: string;
  value: number;
  calcType: string;
}

export interface RoundContext {
  roundId: number | null;
  roundName: string | null;
}

export interface H2HContext {
  totalMatches: number;
  homeWins: number;
  awayWins: number;
  draws: number;
  recentScorelines: string[];
  bttsTendency: number;
  overTwoFiveTendency: number;
}

export interface TeamSeasonStats {
  goalsFor: number;
  goalsAgainst: number;
  shotsTotal: number;
  shotsOnTarget: number;
  xgTotal: number | null;
  cleanSheets: number;
  yellowCards: number;
  redCards: number;
}

export interface RefereeContext {
  id: number | null;
  name: string | null;
  penalties: number;
  yellowCards: number;
  redCards: number;
}

export interface XGContext {
  homeXG: number | null;
  awayXG: number | null;
}

export interface ExpectedLineupContext {
  startingXI: { playerId: number; playerName: string; position: string | null }[];
}

export interface SquadDepthContext {
  totalPlayers: number;
  averageAge: number | null;
  keyMissing: string[];
}

export interface RestCongestionContext {
  daysSinceLastMatch: number | null;
  daysUntilNextMatch: number | null;
  matchesLast7Days: number;
  matchesNext14Days: number;
}

export interface SidelinedContext {
  players: { playerId: number; playerName: string; reason: string }[];
}

export interface NewsContext {
  title: string;
  lines: string[];
}

export interface OddsContext {
  markets: {
    marketId: number;
    marketName: string;
    outcomes: { label: string; value: string; probability: string }[];
  }[];
}

export interface PredictionContext {
  scores: Record<string, number>;
  typeId: number;
}

export interface MatchFactContext {
  category: string;
  description: string;
  data: Record<string, unknown>;
}

export interface TeamRankingContext {
  currentRank: number | null;
  scaledScore: number | null;
  trend: "up" | "down" | "stable" | null;
}

// --- Live Sub-types ---

export interface FreshnessInfo {
  lastUpdated: string;
  ageSeconds: number;
}

export interface LiveStateContext {
  stateId: number;
  stateName: string;
  minute: number | null;
}

export interface ScoreStateContext {
  homeGoals: number;
  awayGoals: number;
  periods: { name: string; homeGoals: number; awayGoals: number }[];
}

export interface LiveEventContext {
  minute: number;
  type: string;
  teamId: number;
  playerName: string | null;
  detail: string | null;
}

export interface LiveStatisticsContext {
  homePossession: number | null;
  awayPossession: number | null;
  homeShots: number;
  awayShots: number;
  homeShotsOnTarget: number;
  awayShotsOnTarget: number;
  homeCorners: number;
  awayCorners: number;
}

export interface LiveXGContext {
  homeXG: number;
  awayXG: number;
}

export interface InplayOddsContext {
  markets: {
    marketId: number;
    marketName: string;
    outcomes: { label: string; value: string; probability: string }[];
  }[];
}

export interface LiveStandingsImpact {
  homePositionBefore: number;
  homePositionNow: number;
  awayPositionBefore: number;
  awayPositionNow: number;
}

export interface CommentaryMomentumContext {
  dangerousAttacksLast10m: { home: number; away: number };
  momentumDirection: "home" | "away" | "neutral";
  recentBigChances: number;
}

export interface FormationContext {
  homeFormation: string | null;
  awayFormation: string | null;
}
