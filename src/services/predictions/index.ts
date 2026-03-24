import { sportmonksGetAllPages } from "@/lib/sportmonks/client";
import { PREDICTIONS_INCLUDE } from "@/lib/sportmonks/includes";
import type { Prediction } from "@/types/sportmonks";

export async function getPredictionsByFixture(fixtureId: number) {
  return sportmonksGetAllPages<Prediction>(
    `/predictions/probabilities/fixtures/${fixtureId}`,
    {
      include: PREDICTIONS_INCLUDE,
    }
  );
}
