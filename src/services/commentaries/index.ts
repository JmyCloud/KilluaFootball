import { sportmonksGet } from "@/lib/sportmonks/client";
import { COMMENTARIES_INCLUDE } from "@/lib/sportmonks/includes";
import type { CommentaryLine } from "@/types/sportmonks";

export async function getCommentariesByFixture(fixtureId: number) {
  return sportmonksGet<CommentaryLine[]>(
    `/commentaries/fixtures/${fixtureId}`,
    {
      include: COMMENTARIES_INCLUDE,
    }
  );
}
