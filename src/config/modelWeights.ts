export const MODEL_WEIGHTS = {
  poisson: 0.15,
  dixonColes: 0.15,
  catboost: 0.35,
  lightgbm: 0.20,
  xgboost: 0.15,
} as const;

export const SIGNAL_THRESHOLDS = {
  minEdgeForLean: 0.03,
  minEdgeForStrong: 0.07,
  minConfidenceForLean: 0.55,
  minConfidenceForStrong: 0.70,
  maxKellyFraction: 0.25,
} as const;

export type SignalClass = "NO_BET" | "LEAN" | "STRONG_SIGNAL";
