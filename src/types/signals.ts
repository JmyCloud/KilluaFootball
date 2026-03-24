import type { SignalClass } from "@/config";

export interface BettingSignal {
  fixtureId: number;
  market: string;
  generatedAt: string;

  modelProbability: number;
  fairOdds: number;
  bookmakerOdds: number;
  edgePercent: number;
  confidence: number;
  signalClass: SignalClass;

  modelBreakdown: ModelBreakdown;
  explanation: string;
}

export interface ModelBreakdown {
  poisson: number;
  dixonColes: number;
  catboost: number;
  lightgbm: number;
  xgboost: number;
  sportmonksPrediction: number | null;
  ensembleFinal: number;
  calibratedFinal: number;
}

export interface DerivedFeatures {
  fixtureId: number;
  computedAt: string;

  tablePressureScore: number;
  roundContextDelta: number;
  scheduleCongestionScore: number;
  squadDepthPenalty: number;
  keyScorerDependency: number;
  liveMomentumScore: number | null;
  liveTableSwing: number | null;
  marketEdgePreMatch: number | null;
  marketEdgeLive: number | null;
  narrativeEvidenceFlags: string[];
}
