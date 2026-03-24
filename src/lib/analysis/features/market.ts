import { prisma } from "@/lib/storage/prisma";

interface MarketFeature {
  market: string;
  openingOdds: number | null;
  currentOdds: number | null;
  driftDirection: string;
  driftMagnitude: number;
  impliedProbability: number | null;
}

export async function computeMarketFeatures(
  fixtureId: number
): Promise<MarketFeature[]> {
  const oddsRows = await prisma.oddsPrematchRow.findMany({
    where: { fixtureId },
    orderBy: { syncedAt: "asc" },
  });

  if (oddsRows.length === 0) return [];

  const marketGroups = new Map<string, typeof oddsRows>();
  for (const row of oddsRows) {
    const key = `${row.marketId}:${row.label}`;
    const group = marketGroups.get(key) ?? [];
    group.push(row);
    marketGroups.set(key, group);
  }

  const features: MarketFeature[] = [];

  for (const [key, rows] of marketGroups) {
    const marketName = rows[0].marketName ?? key;
    const label = rows[0].label;
    const opening = parseFloat(rows[0].value);
    const current = parseFloat(rows[rows.length - 1].value);

    if (isNaN(opening) || isNaN(current)) continue;

    const drift = current - opening;
    const driftDirection =
      drift > 0.05 ? "lengthening" : drift < -0.05 ? "shortening" : "stable";
    const impliedProb = current > 0 ? 1 / current : null;

    features.push({
      market: `${marketName}:${label}`,
      openingOdds: opening,
      currentOdds: current,
      driftDirection,
      driftMagnitude: Math.abs(drift),
      impliedProbability: impliedProb,
    });
  }

  return features;
}
