import { prisma } from "@/lib/storage/prisma";
import type { CommentaryLine as ApiComment } from "@/types/sportmonks";

export async function normalizeCommentary(fixtureId: number, lines: ApiComment[]) {
  for (const l of lines) {
    await prisma.commentaryLine.upsert({
      where: { commentIdExt: l.id },
      update: {
        fixtureId,
        comment: l.comment,
        minute: l.minute ?? null,
        extraMinute: l.extra_minute ?? null,
        isGoal: l.is_goal ?? false,
        isImportant: l.is_important ?? false,
        order: l.order,
        syncedAt: new Date(),
      },
      create: {
        commentIdExt: l.id,
        fixtureId,
        comment: l.comment,
        minute: l.minute ?? null,
        extraMinute: l.extra_minute ?? null,
        isGoal: l.is_goal ?? false,
        isImportant: l.is_important ?? false,
        order: l.order,
      },
    });
  }
}
