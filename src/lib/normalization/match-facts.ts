import { prisma } from "@/lib/storage/prisma";
import type { MatchFact as ApiMatchFact } from "@/types/sportmonks";

export async function normalizeMatchFacts(facts: ApiMatchFact[]) {
  for (const f of facts) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const jsonData = f.data ? (JSON.parse(JSON.stringify(f.data)) as any) : undefined;

    await prisma.matchFactRow.upsert({
      where: { factIdExt: f.id },
      update: {
        fixtureId: f.fixture_id,
        typeId: f.type_id,
        participant: f.participant ?? null,
        basis: f.basis ?? null,
        category: f.category ?? null,
        scope: f.scope ?? null,
        data: jsonData,
        naturalLanguage: f.natural_language ?? null,
        syncedAt: new Date(),
      },
      create: {
        factIdExt: f.id,
        fixtureId: f.fixture_id,
        typeId: f.type_id,
        participant: f.participant ?? null,
        basis: f.basis ?? null,
        category: f.category ?? null,
        scope: f.scope ?? null,
        data: jsonData,
        naturalLanguage: f.natural_language ?? null,
      },
    });
  }
}
