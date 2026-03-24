import { sportmonksGetAllPages } from "@/lib/sportmonks/client";
import { NEWS_INCLUDE } from "@/lib/sportmonks/includes";
import { newsLeagueFilter } from "@/lib/sportmonks/filters";
import type { NewsArticle } from "@/types/sportmonks";

export async function getPreMatchNewsBySeason(seasonId: number) {
  return sportmonksGetAllPages<NewsArticle>(
    `/news/pre-match/seasons/${seasonId}`,
    {
      include: NEWS_INCLUDE,
      filters: newsLeagueFilter(),
      order: "desc",
      per_page: 50,
    }
  );
}

export async function getPreMatchNewsUpcoming() {
  return sportmonksGetAllPages<NewsArticle>("/news/pre-match/upcoming", {
    include: NEWS_INCLUDE,
    filters: newsLeagueFilter(),
    order: "desc",
    per_page: 50,
  });
}
