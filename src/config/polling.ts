export const POLLING_INTERVALS = {
  livescoresLatest: 8_000,
  livescoresInplay: 15_000,
  liveStandings: 60_000,
  liveOdds: 30_000,
  commentaries: 30_000,
  preMatchSync: 5 * 60_000,
  backgroundSync: 60 * 60_000,
  featureRecompute: 10 * 60_000,
  signalRecompute: 5 * 60_000,
} as const;
