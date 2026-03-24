import { prisma } from "@/lib/storage/prisma";
import type { NewsArticle as ApiNews } from "@/types/sportmonks";

export async function normalizeNews(articles: ApiNews[]) {
  for (const a of articles) {
    const article = await prisma.newsArticle.upsert({
      where: { articleIdExt: a.id },
      update: {
        fixtureId: a.fixture_id ?? null,
        leagueId: a.league_id ?? null,
        title: a.title,
        type: a.type,
        syncedAt: new Date(),
      },
      create: {
        articleIdExt: a.id,
        fixtureId: a.fixture_id ?? null,
        leagueId: a.league_id ?? null,
        title: a.title,
        type: a.type,
      },
    });

    if (a.lines?.length) {
      await prisma.newsLine.deleteMany({ where: { articleId: article.id } });
      await prisma.newsLine.createMany({
        data: a.lines.map((l) => ({
          articleId: article.id,
          content: l.content,
        })),
      });
    }
  }
}
