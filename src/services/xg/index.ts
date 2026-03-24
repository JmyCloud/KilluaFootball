import { sportmonksGetAllPages } from "@/lib/sportmonks/client";
import { XG_TEAM_INCLUDE, XG_PLAYER_INCLUDE } from "@/lib/sportmonks/includes";
import { isSupported } from "@/config/competitions";
import type { XGRow } from "@/types/sportmonks";

export async function getXGByTeam() {
  const rows = await sportmonksGetAllPages<XGRow>("/expected/fixtures", {
    include: XG_TEAM_INCLUDE,
  });
  return rows.filter(
    (row) => row.fixture?.league_id && isSupported(row.fixture.league_id)
  );
}

export async function getXGByPlayer() {
  const rows = await sportmonksGetAllPages<XGRow>("/expected/lineups", {
    include: XG_PLAYER_INCLUDE,
  });
  return rows.filter(
    (row) => row.fixture?.league_id && isSupported(row.fixture.league_id)
  );
}
