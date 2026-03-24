import { prisma } from "@/lib/storage/prisma";
import type { OddsRow as ApiOddsRow } from "@/types/sportmonks";

export async function normalizeOddsPrematch(
  fixtureId: number,
  bookmakerIdExt: number,
  odds: ApiOddsRow[]
) {
  await prisma.oddsPrematchRow.deleteMany({
    where: { fixtureId, bookmakerIdExt },
  });
  if (odds.length > 0) {
    await prisma.oddsPrematchRow.createMany({
      data: odds.map((o) => ({
        oddsIdExt: o.id,
        fixtureId,
        marketId: o.market_id,
        bookmakerIdExt: o.bookmaker_id,
        label: o.label,
        value: o.value,
        name: o.name ?? null,
        probability: o.probability ?? null,
        marketName: o.market?.name ?? null,
      })),
    });
  }
}

export async function normalizeOddsInplay(
  fixtureId: number,
  bookmakerIdExt: number,
  odds: ApiOddsRow[]
) {
  await prisma.oddsInplayRow.deleteMany({
    where: { fixtureId, bookmakerIdExt },
  });
  if (odds.length > 0) {
    await prisma.oddsInplayRow.createMany({
      data: odds.map((o) => ({
        oddsIdExt: o.id,
        fixtureId,
        marketId: o.market_id,
        bookmakerIdExt: o.bookmaker_id,
        label: o.label,
        value: o.value,
        name: o.name ?? null,
        probability: o.probability ?? null,
        marketName: o.market?.name ?? null,
      })),
    });
  }
}
