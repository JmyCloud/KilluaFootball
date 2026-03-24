export interface SportMonksResponse<T = unknown> {
  data: T;
  subscription?: SubscriptionMeta[];
  rate_limit?: RateLimitMeta;
  timezone?: string;
}

export interface PaginatedResponse<T = unknown> extends SportMonksResponse<T[]> {
  pagination?: PaginationMeta;
}

export interface PaginationMeta {
  count: number;
  per_page: number;
  current_page: number;
  next_page: string | null;
  has_more: boolean;
}

export interface RateLimitMeta {
  resets_in_seconds: number;
  remaining: number;
  requested_entity: string;
}

export interface SubscriptionMeta {
  meta: { trial: boolean; ends_at: string | null };
  plans: { plan: string; sport: string; category: string }[];
}

// --- Core Entities ---

export interface Fixture {
  id: number;
  league_id: number;
  season_id: number;
  stage_id: number;
  round_id: number | null;
  state_id: number;
  name: string;
  starting_at: string;
  starting_at_timestamp: number;
  result_info: string | null;
  length: number;
  has_odds: boolean;
  has_premium_odds?: boolean;
  participants?: Participant[];
  scores?: Score[];
  events?: FixtureEvent[];
  statistics?: FixtureStatistic[];
  periods?: Period[];
  lineups?: Lineup[];
  formations?: Formation[];
  sidelined?: Sidelined[];
  referees?: Referee[];
  venue?: Venue;
  state?: FixtureState;
  league?: League;
  season?: Season;
  stage?: Stage;
  round?: Round;
  odds?: OddsRow[];
  inplayOdds?: OddsRow[];
  predictions?: Prediction[];
  xGFixture?: XGRow[];
  expectedLineups?: ExpectedLineupRow[];
  matchfacts?: MatchFact[];
  metadata?: unknown;
}

export interface Participant {
  id: number;
  name: string;
  short_code?: string;
  image_path?: string;
  meta?: {
    location: "home" | "away";
    winner?: boolean;
  };
}

export interface Score {
  description: string;
  participant_id: number;
  score: {
    goals: number;
    participant?: string;
  };
}

export interface FixtureEvent {
  id: number;
  fixture_id?: number;
  minute: number | null;
  extra_minute?: number | null;
  type_id: number;
  participant_id: number;
  player_id?: number;
  related_player_id?: number;
  result?: string;
  info?: string;
  addition?: string;
}

export interface FixtureStatistic {
  id?: number;
  fixture_id?: number;
  type_id: number;
  participant_id: number;
  data: { value: number | string };
  location?: string;
}

export interface Period {
  id: number;
  fixture_id: number;
  type_id: number;
  started?: number;
  ended?: number;
  counts_from?: number;
  ticking?: boolean;
}

export interface Lineup {
  id: number;
  fixture_id: number;
  player_id: number;
  team_id: number;
  formation_field?: string | null;
  type_id: number;
  jersey_number: number;
  player_name?: string;
}

export interface Formation {
  id: number;
  fixture_id: number;
  participant_id: number;
  formation: string;
  location: "home" | "away";
}

export interface Sidelined {
  id: number;
  player_id: number;
  team_id: number;
  type_id: number;
  category?: string;
  start_date?: string;
  end_date?: string | null;
}

export interface Referee {
  id: number;
  name: string;
  type_id?: number;
  statistics?: RefereeStatistic[];
}

export interface RefereeStatistic {
  season_id: number;
  details: RefereeStatDetail[];
}

export interface RefereeStatDetail {
  type: { id: number; name: string };
  value: number;
}

export interface Venue {
  id: number;
  name: string;
  city_name?: string;
  capacity?: number;
}

export interface FixtureState {
  id: number;
  name: string;
  short_name?: string;
  developer_name?: string;
}

export interface League {
  id: number;
  name: string;
  short_code?: string;
  image_path?: string;
}

export interface Season {
  id: number;
  name: string;
  league_id?: number;
  is_current?: boolean;
}

export interface Stage {
  id: number;
  name: string;
  type_id?: number;
}

export interface Round {
  id: number;
  name: string;
  stage_id?: number;
  finished?: boolean;
}

// --- Odds ---

export interface OddsRow {
  id: number;
  fixture_id: number;
  market_id: number;
  bookmaker_id: number;
  label: string;
  value: string;
  name?: string;
  probability?: string;
  market?: { id: number; name: string };
  bookmaker?: { id: number; name: string };
}

// --- Predictions ---

export interface Prediction {
  id: number;
  fixture_id: number;
  type_id: number;
  predictions?: {
    scores?: Record<string, number>;
    [key: string]: unknown;
  };
}

// --- xG ---

export interface XGRow {
  id: number;
  fixture_id: number;
  type_id: number;
  participant_id?: number;
  player_id?: number;
  data: { value: number };
  location?: string;
  type?: { id: number; name: string };
  fixture?: { id: number; name: string; league_id: number; season_id: number };
  participant?: { id: number; name: string };
  player?: { id: number; display_name: string };
  team?: { id: number; name: string };
}

// --- Expected Lineups ---

export interface ExpectedLineupRow {
  id: number;
  sport_id?: number;
  fixture_id: number;
  player_id: number;
  team_id: number;
  formation_field?: string | null;
  position_id?: number | null;
  detailed_position_id?: number | null;
  type_id: number;
  formation_position?: string | null;
  player_name?: string;
  jersey_number?: number;
  type?: { id: number; name: string };
  fixture?: { id: number; name: string };
  participant?: { id: number; name: string };
  player?: { id: number; display_name: string };
  team?: { id: number; name: string };
}

// --- Standings ---

export interface StandingRow {
  id: number;
  sport_id?: number;
  league_id: number;
  season_id: number;
  stage_id?: number;
  group_id?: number | null;
  round_id?: number;
  participant_id: number;
  standing_rule_id?: number;
  position: number;
  result?: string;
  points: number;
  participant?: Participant;
  season?: Season;
  league?: League;
  stage?: Stage;
  round?: Round;
  group?: { id: number; name: string } | null;
  rule?: { id: number; name: string };
  details?: StandingDetail[];
  form?: string[];
}

export interface StandingDetail {
  type?: { id: number; name: string };
  type_id?: number;
  value: number;
}

export interface StandingCorrection {
  id: number;
  season_id: number;
  stage_id: number;
  group_id: number | null;
  type_id: number;
  value: number;
  calc_type: string;
  participant_type: string;
  participant_id: number;
  active: boolean;
  participant?: { id: number; name: string };
  season?: Season;
  league?: League;
  stage?: Stage;
  group?: { id: number; name: string } | null;
}

// --- News ---

export interface NewsArticle {
  id: number;
  fixture_id: number;
  league_id: number;
  title: string;
  type: string;
  fixture?: { id: number; name: string };
  league?: { id: number; name: string };
  lines?: { id: number; content: string }[];
}

// --- Squads ---

export interface SquadPlayer {
  id: number;
  player_id: number;
  team_id: number;
  season_id?: number;
  position_id?: number;
  detailed_position_id?: number;
  jersey_number?: number;
  start?: string;
  end?: string;
  transfer_id?: number;
  player?: { id: number; display_name: string };
  team?: { id: number; name: string };
  season?: Season;
  position?: { id: number; name: string };
  detailedPosition?: { id: number; name: string };
  transfer?: { id: number; date: string };
  details?: { type_id: number; value: string }[];
}

// --- Topscorers ---

export interface Topscorer {
  id: number;
  season_id: number;
  player_id: number;
  type_id: number;
  position: number;
  total: number;
  participant_id: number;
  season?: Season;
  stage?: Stage;
  player?: { id: number; display_name: string };
  participant?: { id: number; name: string };
  type?: { id: number; name: string };
}

// --- Commentary ---

export interface CommentaryLine {
  id: number;
  fixture_id: number;
  comment: string;
  minute: number | null;
  extra_minute: number | null;
  is_goal: boolean;
  is_important: boolean;
  order: number;
  fixture?: { id: number; name: string };
  player?: { id: number; display_name: string };
  relatedPlayer?: { id: number; display_name: string };
}

// --- Match Facts ---

export interface MatchFact {
  id: number;
  sport_id?: number;
  fixture_id: number;
  type_id: number;
  participant?: string;
  basis?: string;
  data?: Record<string, unknown>;
  natural_language?: string | null;
  category?: string;
  scope?: string;
  type?: { id: number; name: string };
  fixture?: { id: number; name: string };
}

// --- Team Rankings ---

export interface TeamRanking {
  id: number;
  team_id: number;
  date: string;
  current_rank: number;
  scaled_score: number;
  team?: { id: number; name: string };
}

// --- Transfer Rumours ---

export interface TransferRumour {
  id: number;
  sport_id?: number;
  player_id: number;
  position_id?: number;
  from_team_id: number;
  to_team_id: number;
  transfer_fee_id?: number;
  probability?: string;
  source_name?: string;
  source_url?: string;
  amount?: number;
  currency?: string;
  date?: string;
  type_id?: number;
}

// --- Team Season Statistics ---

export interface TeamSeasonStatistics {
  id: number;
  team_id: number;
  season_id: number;
  has_values: boolean;
  details?: { type_id: number; value: { total: number; [key: string]: unknown } }[];
}

// --- Schedule ---

export interface ScheduleStage {
  id: number;
  league_id: number;
  season_id: number;
  name: string;
  is_current?: boolean;
  rounds?: ScheduleRound[];
}

export interface ScheduleRound {
  id: number;
  name: string;
  fixtures?: Fixture[];
}
