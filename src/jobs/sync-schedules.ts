import { sportmonksGetAllPages } from "@/lib/sportmonks/client";
import { leagueFilter, dateRangeFilter } from "@/lib/sportmonks/filters";
import { normalizeFixture } from "@/lib/normalization";
import type { Fixture } from "@/types/sportmonks";

export async function syncFixtureSchedules() {
  console.log("[sync-schedules] Fetching fixture schedules...");

  const now = new Date();
  const from = formatDate(now);
  const future = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
  const to = formatDate(future);
  const past = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const fromPast = formatDate(past);

  let totalSynced = 0;

  // 1. Fetch upcoming fixtures (next 14 days)
  try {
    console.log(`[sync-schedules] Fetching fixtures from ${from} to ${to}`);
    const upcoming = await sportmonksGetAllPages<Fixture>("/fixtures", {
      filters: `${leagueFilter()};${dateRangeFilter(from, to)}`,
      include: "participants;league;season;stage;round;state;venue",
      per_page: 50,
    });

    for (const f of upcoming) {
      await normalizeFixture(f);
      totalSynced++;
    }
    console.log(`[sync-schedules]   → ${upcoming.length} upcoming fixtures`);
  } catch (err) {
    console.error("[sync-schedules] Error fetching upcoming fixtures:", err);
  }

  // 2. Fetch recent past fixtures (last 7 days) for historical data
  try {
    console.log(`[sync-schedules] Fetching recent fixtures from ${fromPast} to ${from}`);
    const recent = await sportmonksGetAllPages<Fixture>("/fixtures", {
      filters: `${leagueFilter()};${dateRangeFilter(fromPast, from)}`,
      include: "participants;league;season;stage;round;state;venue;scores;events;statistics",
      per_page: 50,
    });

    for (const f of recent) {
      await normalizeFixture(f);
      totalSynced++;
    }
    console.log(`[sync-schedules]   → ${recent.length} recent fixtures`);
  } catch (err) {
    console.error("[sync-schedules] Error fetching recent fixtures:", err);
  }

  console.log(`[sync-schedules] Complete. Total synced: ${totalSynced}`);
}

function formatDate(d: Date): string {
  return d.toISOString().split("T")[0];
}
