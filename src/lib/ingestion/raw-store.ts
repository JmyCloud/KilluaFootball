import { prisma } from "@/lib/storage/prisma";

export async function storeRawFixture(
  fixtureId: number,
  endpoint: string,
  payload: unknown
) {
  await prisma.rawFixtureSnapshot.create({
    data: {
      fixtureId,
      endpoint,
      payload: payload as object,
    },
  });
}

export async function storeRawLivescore(
  fixtureId: number,
  endpoint: string,
  payload: unknown
) {
  await prisma.rawLivescoreSnapshot.create({
    data: {
      fixtureId,
      endpoint,
      payload: payload as object,
    },
  });
}

export async function storeRawOdds(
  fixtureId: number,
  bookmakerIdExt: number,
  oddsType: "pre-match" | "inplay",
  payload: unknown
) {
  await prisma.rawOddsSnapshot.create({
    data: {
      fixtureId,
      bookmakerIdExt,
      oddsType,
      payload: payload as object,
    },
  });
}

export async function storeRawNews(articleIdExt: number, payload: unknown) {
  await prisma.rawNewsArticle.upsert({
    where: { articleIdExt },
    update: { payload: payload as object, syncedAt: new Date() },
    create: { articleIdExt, payload: payload as object },
  });
}

export async function storeRawMatchFact(fixtureId: number, payload: unknown) {
  await prisma.rawMatchFact.create({
    data: {
      fixtureId,
      payload: payload as object,
    },
  });
}
