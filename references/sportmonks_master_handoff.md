# SportMonks Football API 3.0 — Master Handoff for the Windsurf / Claude Agent

This document is the **single merged implementation handoff** for the football analysis and betting-intelligence project.

It supersedes the two earlier handoff files and merges them into one master reference for:

- endpoint selection
- include strategy
- sync logic
- live orchestration
- feature engineering input design
- analysis packet assembly
- betting-signal generation support
- safe implementation rules for a production-grade SportMonks integration

This file is intentionally written for an agent that may not browse during implementation. The goal is to make the execution path explicit, conservative, and aligned with the **official SportMonks API 3.0 documentation**. Whenever a field or include differs in real responses, the official SportMonks docs remain the source of truth.

---

## 0) Project mission

Build a professional football intelligence engine that ingests SportMonks data at scale, normalises it, enriches it, and transforms it into:

- pre-match analysis packets
- live match analysis packets
- probabilistic betting signals
- structured explanation objects for the final AI layer

The AI layer must **not** invent data, and it must **not** treat narrative endpoints as primary predictors. The system should use structured football data as the core evidence layer, and use AI only as the reasoning and explanation layer on top.

---

## 1) Locked project constraints

These constraints are non-negotiable and must be preserved exactly:

- Subscription level: **highest SportMonks plan** with all features available.
- Odds policy: **Standard Odds only** in this version.
- Bookmaker policy: **bookmaker `35` only**.
- Do **not** add Premium Odds into this workflow.
- Keep all market caching, odds sync, and value-comparison logic centred on bookmaker `35`.
- The implementation target is a **professional match-analysis engine**, not a generic fixture browser.
- All endpoint requests must prefer **minimal payloads** unless additional includes materially improve analysis.

---

## 2) Product architecture the agent should build

The project should be built as a layered football intelligence system:

1. **Acquisition Layer**
   - SportMonks HTTP client
   - endpoint wrappers
   - retry, timeout, pagination, and include handling

2. **Raw Ingestion Layer**
   - store the source payload for critical requests when useful
   - tag every record with endpoint, request params, sync timestamp, and freshness metadata

3. **Normalization Layer**
   - flatten fixtures, participants, scores, odds, standings, xG, lineups, statistics, and commentary-derived live signals into stable internal shapes

4. **Feature Layer**
   - derive modelling features such as form, rest, congestion, attack/defence strength, squad availability, live pressure, market movement, and table pressure

5. **Prediction / Signal Layer**
   - combine model outputs, SportMonks predictions, market data, contextual football evidence, and risk rules
   - output probabilities, confidence, fair odds, edge, and no-bet / lean / strong-signal classifications

6. **Explanation Layer**
   - convert structured evidence into natural-language reasoning without inventing unsupported claims

---

## 3) Core implementation philosophy

### 3.1 Use SportMonks as the structured truth layer

The project should treat SportMonks as the primary source for:

- fixtures
- scores
- standings
- statistics
- lineups
- xG
- predictions
- odds
- news
- commentaries
- match facts
- rankings
- squad structure

### 3.2 Separate pre-match, live, and background sync flows

Do **not** use one generic sync routine for everything.

The agent should implement three distinct orchestration flows:

- **background sync** for slower reference/context data
- **pre-match sync** for fixtures approaching kick-off
- **live sync** for fixtures currently changing

### 3.3 Use livescores for frequent live refresh, fixtures for complete snapshots

During live play, prefer Livescores endpoints for high-frequency refresh work. Use fixture endpoints when a complete or fallback snapshot is needed.

### 3.4 Use includes deliberately

Large includes are valuable, but only when the data is immediately consumed by the analysis engine. Avoid pulling huge nested payloads that are not used downstream.

### 3.5 Prefer derived signals over raw endpoint dumping

The final analysis packet should rarely expose raw API arrays directly. Instead, compress endpoint outputs into signals such as:

- `home_xg_last_match`
- `away_rest_days`
- `home_live_pressure_last_10m`
- `table_pressure_state`
- `star_attacker_missing`
- `market_drift_direction`
- `commentary_momentum_shift`

---

## 4) Official-documentation rules the agent must obey

1. Treat the **Base URL shown on the official endpoint page** as the canonical path.
2. Respect pagination whenever the endpoint page says **Pagination: Yes**.
3. Use `filters` only when the filter is officially documented for the entity or discovered through `/v3/my/filters/entity`.
4. Use `select` whenever it reduces payload cleanly without hurting analysis.
5. Use `include` only when it adds real modelling or explanation value.
6. Use collection endpoints when the official docs expose them instead of relying on undocumented single-record variants.
7. For bulk initial sync, prefer **lightweight population patterns** instead of heavy include-based backfills.
8. For live changes, prefer **latest-updated** endpoints to decide what needs deeper refresh.

---

## 5) Recommended service / module layout

```txt
src/
  lib/
    sportmonks/
      client.ts
      pagination.ts
      filters.ts
      includes.ts
      errors.ts
    analysis/
      packets/
      features/
      signals/
    storage/
      raw/
      normalized/
      cache/
  services/
    fixtures/
    livescores/
    standings/
    odds/
    xg/
    lineups/
    squads/
    schedules/
    predictions/
    news/
    commentaries/
    matchFacts/
    rankings/
    rumours/
  jobs/
    sync-reference.ts
    sync-pre-match.ts
    sync-live-trigger.ts
    sync-live-refresh.ts
    recompute-features.ts
    recompute-signals.ts
  types/
    sportmonks.ts
    analysis.ts
    signals.ts
```

---

## 6) Analysis packet design

The agent should produce **two main packet types**.

### 6.1 Pre-match analysis packet

This packet should aim to contain:

- fixture identity and state
- competition context
- home / away participants
- standings context
- standings correction context
- round context
- recent H2H
- team season statistics
- referee season statistics
- pre-match xG context
- expected lineup context
- squad depth context
- rest and congestion context
- injuries / sidelined context
- pre-match news context
- transfer-rumour context only if relevant
- bookmaker 35 pre-match odds
- SportMonks prediction probabilities
- match-fact evidence
- optional team ranking trend

### 6.2 Live analysis packet

This packet should aim to contain:

- latest live state
- score state and periods
- live events
- live statistics
- live xG if present
- live inplay odds for bookmaker 35
- live standings impact
- commentary-derived momentum
- match facts as support
- formation and lineup context
- recent change timestamps / freshness

---

## 7) Endpoint execution order by phase

### 7.1 Background reference sync

Use for slower-changing data:

- teams / squads
- standings context
- team rankings
- transfer rumours
- season-level supporting context

### 7.2 Pre-match sync

Use as kick-off approaches:

- fixture snapshot
- H2H
- team season stats
- referee stats
- xG
- predictions
- news
- expected lineups
- squads
- schedules
- standings / corrections / round context
- pre-match odds
- match facts

### 7.3 Live sync

Use during active windows:

1. poll `livescores/latest`
2. if nothing changed, stop
3. if some fixtures changed, refresh only those fixtures
4. use `livescores/inplay` as the working live feed
5. pull live standings, commentaries, inplay odds, and fixture-level fallback only when needed

---

## 8) Core endpoints that must remain in the project

The two source handoffs focused mainly on the missing or corrected areas. For a true master handoff, the agent should also preserve and formalise the project’s **already-required core endpoints** below.

### 8.1 GET Fixture by ID

#### Official path

`GET /v3/football/fixtures/{ID}`

#### Why this endpoint matters

This is the primary fixture snapshot endpoint and should remain the backbone of the pre-match packet. It is the best place to assemble rich fixture context using carefully selected includes.

#### Recommended include for analysis

`state;league;season;stage;round;participants;scores;events;statistics;periods;lineups;formations;sidelined;referees;venue;metadata;odds;inplayOdds;predictions;xGFixture;expectedLineups;matchfacts`

#### Recommended usage

Use this endpoint for:

- one-shot fixture snapshots
- fallback refresh when live feeds are insufficient
- pre-match packet assembly
- reconciliation after a live match is finished

#### Example request

```txt
/v3/football/fixtures/{FIXTURE_ID}?include=state;league;season;stage;round;participants;scores;events;statistics;periods;lineups;formations;sidelined;referees;venue;metadata;odds;inplayOdds;predictions;xGFixture;expectedLineups;matchfacts
```

#### #example-response

```json
{
  "data": {
    "id": 18535605,
    "league_id": 501,
    "season_id": 19735,
    "stage_id": 77457866,
    "round_id": 274733,
    "state_id": 5,
    "name": "Team A vs Team B",
    "starting_at": "2026-03-28 18:00:00",
    "has_odds": true,
    "participants": [
      { "id": 53, "name": "Team A", "meta": { "location": "home" } },
      { "id": 62, "name": "Team B", "meta": { "location": "away" } }
    ],
    "scores": [
      { "description": "CURRENT", "participant_id": 53, "score": { "goals": 2 } },
      { "description": "CURRENT", "participant_id": 62, "score": { "goals": 1 } }
    ],
    "state": { "id": 5, "name": "FT" }
  }
}
```

### 8.2 GET Fixtures by Head To Head

#### Official path

`GET /v3/football/fixtures/head-to-head/{team_id_1}/{team_id2}`

#### Why this endpoint matters

It provides recent H2H structure for pattern context, style clashes, and lightweight narrative support. It should **not** dominate modelling, but it is useful as one feature family.

#### Recommended include for analysis

`state;league;season;participants;scores;events;statistics`

#### Recommended usage

Use it to derive:

- recent H2H scorelines
- BTTS tendency
- over/under tendency
- venue-neutral vs venue-sensitive patterns
- whether one team historically suppresses the other’s attacking output

#### Example request

```txt
/v3/football/fixtures/head-to-head/{HOME_TEAM_ID}/{AWAY_TEAM_ID}?include=state;league;season;participants;scores;events;statistics
```

#### #example-response

```json
{
  "data": [
    {
      "id": 18200111,
      "league_id": 501,
      "season_id": 19610,
      "state_id": 5,
      "name": "Team A vs Team B",
      "starting_at": "2025-11-04 17:00:00",
      "participants": [
        { "id": 53, "name": "Team A", "meta": { "location": "home" } },
        { "id": 62, "name": "Team B", "meta": { "location": "away" } }
      ],
      "scores": [
        { "description": "CURRENT", "participant_id": 53, "score": { "goals": 1 } },
        { "description": "CURRENT", "participant_id": 62, "score": { "goals": 1 } }
      ]
    }
  ]
}
```

### 8.3 GET Season Statistics by Participant (team season statistics)

#### Official path

`GET /v3/football/statistics/seasons/{participant}/{id}`

#### Why this endpoint matters

This is one of the strongest statistical foundations for the model. For team analysis, it can serve as the season-level team statistics layer when the implementation prefers the statistics endpoint directly.

#### Recommended usage in this project

Use the participant value that corresponds to the team path in your implementation, or use the equivalent team endpoint with `statistics` include if that fits your wrapper better. The important part is to retrieve season-scoped team statistics cleanly and consistently.

#### Best use inside the bot

Use this endpoint to derive:

- attack / defence baselines
- goals for / against rates
- shot quality and volume indicators
- discipline tendencies
- home / away differentials if available in your selected statistic family

#### Example request

```txt
/v3/football/statistics/seasons/team/{TEAM_ID}
```

#### #example-response

```json
{
  "data": [
    {
      "id": 27262200,
      "team_id": 53,
      "season_id": 19735,
      "has_values": true,
      "details": [
        { "type_id": 42, "value": { "total": 58 } },
        { "type_id": 34, "value": { "total": 122 } },
        { "type_id": 83, "value": { "total": 49 } }
      ]
    }
  ]
}
```

### 8.4 Referee season statistics

#### Recommended official pattern

SportMonks documents referee statistics via referee endpoints using the `statistics.details` nested include and season/type filters such as `refereeStatisticSeasons` and `refereeStatisticDetailTypes`.

#### Recommended request pattern

```txt
/v3/football/referees/{REFEREE_ID}?include=statistics.details.type&filters=refereeStatisticSeasons:{SEASON_ID}
```

#### Why this endpoint matters

Referee data is valuable for:

- foul profile
- card profile
- penalty frequency
- game control / strictness context
- volatility adjustment for cards and penalty-related markets

#### #example-response

```json
{
  "data": {
    "id": 914,
    "name": "Referee A",
    "statistics": [
      {
        "season_id": 19735,
        "details": [
          { "type": { "id": 47, "name": "Penalties" }, "value": 9 },
          { "type": { "id": 56, "name": "Yellow Cards" }, "value": 112 },
          { "type": { "id": 57, "name": "Red Cards" }, "value": 6 }
        ]
      }
    ]
  }
}
```

### 8.5 GET Probabilities by Fixture ID

#### Official path

`GET /v3/football/predictions/probabilities/fixtures/{ID}`

#### Why this endpoint matters

This endpoint should be part of the evidence stack, not the sole prediction engine. It can be used as a comparison layer, consensus layer, and sanity-check layer against internal model output.

#### Recommended usage

Use it to capture:

- scoreline probabilities
- score distribution shape
- disagreement vs market
- disagreement vs internal model
- ensemble support features

#### Example request

```txt
/v3/football/predictions/probabilities/fixtures/{FIXTURE_ID}
```

#### #example-response

```json
{
  "data": [
    {
      "id": 3317639,
      "fixture_id": 18535605,
      "predictions": {
        "scores": {
          "0-0": 2.84,
          "0-1": 4.97,
          "1-0": 4.75,
          "1-1": 8.72,
          "2-1": 7.81,
          "Other_1": 9.33,
          "Other_X": 0.59
        }
      },
      "type_id": 240
    }
  ]
}
```

### 8.6 GET Transfer Rumours by Team ID

#### Official path

`GET /v3/football/transfer-rumours/teams/{TEAM_ID}`

#### Why this endpoint matters

This is **supporting context only**, not a primary predictive input. It can still matter when rumours indicate instability around key players, potential absences, or unsettled squad conditions.

#### Recommended usage

Use very lightly, mainly for:

- uncertainty around key players
- late-window distraction context
- narrative support when a major outgoing / incoming rumour is clearly material

#### Example request

```txt
/v3/football/transfer-rumours/teams/{TEAM_ID}
```

#### #example-response

```json
{
  "data": {
    "id": 5,
    "sport_id": 1,
    "player_id": 34053,
    "position_id": 27,
    "from_team_id": 20,
    "to_team_id": 8,
    "transfer_fee_id": 78367,
    "probability": "LOW",
    "source_name": "The Telegraph",
    "source_url": "https://example.com/rumour",
    "amount": 77000000,
    "currency": "EUR",
    "date": "2025-06-23",
    "type_id": 219
  }
}
```

### 8.7 Standard pre-match odds by fixture and bookmaker 35

#### Official path

`GET /v3/football/odds/pre-match/fixtures/{ID}/bookmakers/{ID}`

#### Locked project rule

The bookmaker id must remain `35`.

#### Required include

`market;bookmaker`

#### Recommended request

```txt
/v3/football/odds/pre-match/fixtures/{FIXTURE_ID}/bookmakers/35?include=market;bookmaker
```

#### Why this endpoint matters

This is the project’s primary market source for:

- market baseline
- fair-odds comparison
- edge detection
- stale-vs-current checks
- market-movement snapshots if versioned internally

#### #example-response

```json
{
  "data": [
    {
      "id": 9912231,
      "fixture_id": 18535605,
      "market_id": 1,
      "bookmaker_id": 35,
      "label": "Home",
      "value": "2.15",
      "name": "1",
      "probability": "46.5",
      "market": { "id": 1, "name": "Fulltime Result" },
      "bookmaker": { "id": 35, "name": "Bookmaker 35" }
    }
  ]
}
```

### 8.8 Standard inplay odds by fixture and bookmaker 35

#### Official path

`GET /v3/football/odds/inplay/fixtures/{ID}/bookmakers/{ID}`

#### Locked project rule

The bookmaker id must remain `35`.

#### Required include

`market;bookmaker`

#### Recommended request

```txt
/v3/football/odds/inplay/fixtures/{FIXTURE_ID}/bookmakers/35?include=market;bookmaker
```

#### Why this endpoint matters

This endpoint should feed the live signal engine for:

- live market reaction
- odds drift after goals/cards/substitutions
- momentum confirmation vs raw stats
- threshold-based trading logic

#### #example-response

```json
{
  "data": [
    {
      "id": 9920011,
      "fixture_id": 18535605,
      "market_id": 1,
      "bookmaker_id": 35,
      "label": "Home",
      "value": "1.48",
      "name": "1",
      "probability": "67.6",
      "market": { "id": 1, "name": "Fulltime Result" },
      "bookmaker": { "id": 35, "name": "Bookmaker 35" }
    }
  ]
}
```

---

## 9) Corrected and expanded endpoint reference from the two source handoffs

> The sections below merge and preserve the core endpoint guidance from the two uploaded handoffs. Example responses remain **schema-oriented** and are meant to accelerate implementation, not replace the official live schema.

# 1) Expected (xG)

## 1.1 GET Expected by Team

### Official path

`GET /v3/football/expected/fixtures`

### Purpose

Returns xG values at the **team level**.

### Available query params

- `api_token` (required)
- `include`
- `select`
- `filters`

### Include options

- `type`
- `fixture`
- `participant`

### Pagination

- Yes

### Include depth

- 3 nested includes

### Required include for best analysis

`type;fixture;participant`

### Recommended request

`/v3/football/expected/fixtures?include=type;fixture;participant`

### Implementation rule

Use this endpoint as the source of team xG. Then narrow the result to the target match by `fixture_id`.

### #example-response

```json
{
  "data": [
    {
      "id": 26898369,
      "fixture_id": 18898173,
      "type_id": 5304,
      "participant_id": 10010,
      "data": { "value": 1.0674 },
      "location": "home",
      "type": { "id": 5304, "name": "Expected Goals" },
      "fixture": { "id": 18898173, "name": "Team A vs Team B" },
      "participant": { "id": 10010, "name": "Team A" }
    },
    {
      "id": 26898370,
      "fixture_id": 18898173,
      "type_id": 5304,
      "participant_id": 7011,
      "data": { "value": 1.8234 },
      "location": "away",
      "type": { "id": 5304, "name": "Expected Goals" },
      "fixture": { "id": 18898173, "name": "Team A vs Team B" },
      "participant": { "id": 7011, "name": "Team B" }
    }
  ]
}
```

---

## 1.2 GET Expected by Player

### Official path

`GET /v3/football/expected/lineups`

### Purpose

Returns xG values at the **player / lineup level**.

### Available query params

- `api_token` (required)
- `include`
- `select`
- `filters`

### Include options

- `type`
- `fixture`
- `player`
- `team`

### Pagination

- Yes

### Include depth

- 3 nested includes

### Required include for best analysis

`type;fixture;player;team`

### Recommended request

`/v3/football/expected/lineups?include=type;fixture;player;team`

### Implementation rule

Use this endpoint for per-player xG contribution. Then keep only rows matching the target `fixture_id`.

### #example-response

```json
{
  "data": [
    {
      "id": 1064853093,
      "fixture_id": 19076535,
      "player_id": 77908,
      "team_id": 238626,
      "lineup_id": 8076889919,
      "type_id": 5304,
      "data": { "value": 0.0295 },
      "type": { "id": 5304, "name": "Expected Goals" },
      "fixture": { "id": 19076535, "name": "Team A vs Team B" },
      "player": { "id": 77908, "display_name": "Player A" },
      "team": { "id": 238626, "name": "Team A" }
    }
  ]
}
```

---

# 2) Premium Expected Lineups

## 2.1 GET Expected Lineup by Team

### Official path

`GET /v3/football/expected-lineups/teams/{TEAM_ID}`

### Purpose

Returns expected lineup rows for a specific team.

### Available query params

- `api_token` (required)
- `include`
- `select`
- `filters`

### Include options

- `type`
- `fixture`
- `participant`

### Pagination

- Yes

### Include depth

- 3 nested includes

### Required include for best analysis

`type;fixture;participant`

### Recommended request

`/v3/football/expected-lineups/teams/{TEAM_ID}?include=type;fixture;participant&per_page=50`

### Implementation rule

Call this once for the home team and once for the away team, then keep only entries where `fixture_id === targetFixtureId`.

### #example-response

```json
{
  "data": [
    {
      "id": 1,
      "sport_id": 1,
      "fixture_id": 19347797,
      "player_id": 37526530,
      "team_id": 3285,
      "formation_field": null,
      "position_id": null,
      "detailed_position_id": null,
      "type_id": 77615,
      "formation_position": null,
      "player_name": "Player A",
      "jersey_number": 2,
      "type": { "id": 77615, "name": "Starting XI" },
      "fixture": { "id": 19347797, "name": "Team A vs Team B" },
      "participant": { "id": 3285, "name": "Team A" }
    }
  ]
}
```

---

## 2.2 GET Expected Lineups by Player

### Official path

`GET /v3/football/expected-lineups/players/{PLAYER_ID}`

### Purpose

Returns expected lineup rows for one player across fixtures.

### Available query params

- `api_token` (required)
- `include`
- `select`
- `filters`

### Include options

- `type`
- `fixture`
- `player`
- `team`

### Pagination

- Yes

### Include depth

- 3 nested includes

### Required include for best analysis

`type;fixture;player;team`

### Recommended request

`/v3/football/expected-lineups/players/{PLAYER_ID}?include=type;fixture;player;team&per_page=50`

### Best use case

Use this when the agent wants to verify whether a key player is expected to start.

### #example-response

```json
{
  "data": [
    {
      "id": 1,
      "sport_id": 1,
      "fixture_id": 19347797,
      "player_id": 37526530,
      "team_id": 3285,
      "formation_field": null,
      "position_id": null,
      "detailed_position_id": null,
      "type_id": 77615,
      "formation_position": null,
      "player_name": "Player A",
      "jersey_number": 2,
      "type": { "id": 77615, "name": "Starting XI" },
      "fixture": { "id": 19347797, "name": "Team A vs Team B" },
      "player": { "id": 37526530, "display_name": "Player A" },
      "team": { "id": 3285, "name": "Team A" }
    }
  ]
}
```

---

# 3) News

## 3.1 GET Pre-Match News by Season ID

### Official path

`GET /v3/football/news/pre-match/seasons/{ID}`

### Purpose

Returns pre-match news articles for one season.

### Available query params

- `api_token` (required)
- `include`
- `filters`
- `order`
- `per_page`
- `page`

### Include options

- `fixture`
- `league`
- `lines`

### Pagination

- Yes

### Include depth

- 1 nested include

### Required include for best analysis

`fixture;league;lines`

### Recommended request

`/v3/football/news/pre-match/seasons/{ID}?include=fixture;league;lines&order=desc&per_page=50`

### Implementation rule

This should be the primary news endpoint when `season_id` is known.

### #example-response

```json
{
  "data": [
    {
      "id": 1376,
      "fixture_id": 18535041,
      "league_id": 8,
      "title": "Team A vs Team B",
      "type": "prematch",
      "fixture": { "id": 18535041, "name": "Team A vs Team B" },
      "league": { "id": 8, "name": "Premier League" },
      "lines": [
        { "id": 1, "content": "Key injury update..." },
        { "id": 2, "content": "Manager comments..." }
      ]
    }
  ]
}
```

---

## 3.2 GET Pre-Match News for Upcoming Fixtures

### Official path

`GET /v3/football/news/pre-match/upcoming`

### Purpose

Returns pre-match news articles for upcoming fixtures inside the subscription scope.

### Available query params

- `api_token` (required)
- `include`
- `filters`
- `order`
- `per_page`
- `page`

### Include options

- `fixture`
- `league`
- `lines`

### Pagination

- Yes

### Include depth

- 1 nested include

### Required include for best analysis

`fixture;league;lines`

### Recommended request

`/v3/football/news/pre-match/upcoming?include=fixture;league;lines&order=desc&per_page=50`

### Implementation rule

Use this only as a fallback when the season-specific route is unavailable or when you intentionally want a wider upcoming-news sweep.

### #example-response

```json
{
  "data": [
    {
      "id": 2274,
      "fixture_id": 18535339,
      "league_id": 8,
      "title": "Manager update before Team A vs Team B",
      "type": "prematch",
      "fixture": { "id": 18535339, "name": "Team A vs Team B" },
      "league": { "id": 8, "name": "Premier League" },
      "lines": [
        { "id": 10, "content": "Expected tactical setup..." }
      ]
    }
  ]
}
```

---

# 4) Standings

## 4.1 GET Standings by Season ID

### Official path

`GET /v3/football/standings/seasons/{ID}`

### Purpose

Returns the full standing table for one season.

### Available query params

- `api_token` (required)
- `include`
- `select`
- `filters`
- `locale`

### Include options

- `participant`
- `season`
- `league`
- `stage`
- `group`
- `round`
- `rule`
- `details`
- `form`
- `sport`

### Pagination

- No

### Include depth

- 2 nested includes

### Required include for best analysis

`participant;season;league;stage;round;group;rule;details.type;form`

### Recommended request

`/v3/football/standings/seasons/{ID}?include=participant;season;league;stage;round;group;rule;details.type;form`

### #example-response

```json
{
  "data": [
    {
      "id": 2588673,
      "sport_id": 1,
      "league_id": 501,
      "season_id": 19735,
      "stage_id": 77457866,
      "group_id": null,
      "round_id": 275092,
      "participant_id": 53,
      "standing_rule_id": 13224,
      "position": 1,
      "result": "up",
      "points": 78,
      "participant": { "id": 53, "name": "Team A" },
      "season": { "id": 19735, "name": "2025/2026" },
      "league": { "id": 501, "name": "League" },
      "stage": { "id": 77457866, "name": "Regular Season" },
      "round": { "id": 275092, "name": "Round 30" },
      "group": null,
      "rule": { "id": 13224, "name": "League Table" },
      "details": [
        { "type": { "id": 1, "name": "wins" }, "value": 24 },
        { "type": { "id": 2, "name": "goals_for" }, "value": 70 }
      ],
      "form": ["W", "W", "D", "W", "L"]
    }
  ]
}
```

---

## 4.2 GET Standings by Round ID

### Official path

`GET /v3/football/standings/rounds/{ID}`

### Purpose

Returns the standing table for a specific round.

### Available query params

- `api_token` (required)
- `include`
- `select`
- `filters`
- `locale`

### Include options

- `participant`
- `season`
- `league`
- `stage`
- `group`
- `round`
- `rule`
- `details`
- `form`
- `sport`

### Pagination

- No

### Include depth

- 2 nested includes

### Required include for best analysis

`participant;season;league;stage;round;group;rule;details.type;form`

### Recommended request

`/v3/football/standings/rounds/{ID}?include=participant;season;league;stage;round;group;rule;details.type;form`

### #example-response

```json
{
  "data": [
    {
      "id": 2588673,
      "league_id": 501,
      "season_id": 19735,
      "round_id": 275092,
      "participant_id": 53,
      "position": 1,
      "points": 78,
      "participant": { "id": 53, "name": "Team A" },
      "round": { "id": 275092, "name": "Round 30" },
      "details": [
        { "type": { "id": 1, "name": "wins" }, "value": 24 }
      ],
      "form": ["W", "W", "D", "W", "L"]
    }
  ]
}
```

---

## 4.3 GET Standing Correction by Season ID

### Official path

`GET /v3/football/standings/corrections/seasons/{ID}`

### Purpose

Returns point corrections, deductions, or additions applied officially in the season.

### Available query params

- `api_token` (required)
- `include`
- `select`
- `filters`
- `locale`

### Include options

- `participant`
- `season`
- `league`
- `stage`
- `group`

### Pagination

- No

### Include depth

- 2 nested includes

### Required include for best analysis

`participant;season;league;stage;group`

### Recommended request

`/v3/football/standings/corrections/seasons/{ID}?include=participant;season;league;stage;group`

### #example-response

```json
{
  "data": [
    {
      "id": 6398,
      "season_id": 19790,
      "stage_id": 77457999,
      "group_id": null,
      "type_id": 173,
      "value": 3,
      "calc_type": "-",
      "participant_type": "team",
      "participant_id": 3630,
      "active": true,
      "participant": { "id": 3630, "name": "Team A" },
      "season": { "id": 19790, "name": "2025/2026" },
      "league": { "id": 8, "name": "League" },
      "stage": { "id": 77457999, "name": "Regular Season" },
      "group": null
    }
  ]
}
```

---

## 4.4 GET Live Standings by League ID

### Official path

`GET /v3/football/standings/live/leagues/{ID}`

### Purpose

Returns the live standings table for the active stage of a league.

### Available query params

- `api_token` (required)
- `include`
- `select`
- `filters`
- `locale`

### Include options

- `participant`
- `season`
- `league`
- `stage`
- `group`
- `round`
- `rule`
- `details`
- `form`
- `sport`

### Pagination

- No

### Include depth

- 2 nested includes

### Required include for best analysis

`participant;season;league;stage;round;group;rule;details.type;form`

### Recommended request

`/v3/football/standings/live/leagues/{ID}?include=participant;season;league;stage;round;group;rule;details.type;form`

### Important note

This endpoint may return no data when there is no active stage in the league.

### #example-response

```json
{
  "data": [
    {
      "id": 2588673,
      "league_id": 501,
      "season_id": 19735,
      "participant_id": 53,
      "position": 1,
      "points": 78,
      "result": "up",
      "participant": { "id": 53, "name": "Team A" },
      "season": { "id": 19735, "name": "2025/2026" },
      "league": { "id": 501, "name": "League" },
      "stage": { "id": 77457866, "name": "Regular Season" },
      "details": [
        { "type": { "id": 1, "name": "wins" }, "value": 24 }
      ],
      "form": ["W", "W", "D", "W", "L"]
    }
  ]
}
```

---

# 5) Bookmaker / Odds policy for this project

## Keep this exactly as-is

Use only:

- `odds/pre-match/fixtures/{fixtureId}/bookmakers/35`
- `odds/inplay/fixtures/{fixtureId}/bookmakers/35`

with:

- `include=market;bookmaker`

## Do not add Premium Odds in this handoff

Reason:

- the user wants bookmaker `35` only
- this workflow is already built around bookmaker `35`
- Premium Odds is intentionally out of scope for this version

---

# 6) Missing endpoints that should still be added for stronger analysis

These are the highest-value missing additions from the current project, but they are **supporting endpoints**, not replacements for the core stack above.

## 6.1 `GET /v3/football/livescores/latest`

Use as the live change trigger.

Why it matters:

- detects fixtures updated in the last 10 seconds
- ideal for polling every 5–8 seconds
- prevents unnecessary heavy refreshes

Recommended include for a rich live refresh layer:

`state;participants;scores;events;statistics;periods;inplayOdds;xGFixture;expectedLineups;matchfacts`

## 6.2 `GET /v3/football/livescores/inplay`

Use as the lightweight live fixture feed.

Why it matters:

- fast live discovery
- same fixture-style structure
- better than re-pulling full fixture pages too often

## 6.3 `GET /v3/football/schedules/seasons/{seasonId}/teams/{teamId}`

Use to calculate:

- rest days
- fixture congestion
- travel / sequence stress
- short-turnaround risk

## 6.4 `GET /v3/football/squads/seasons/{seasonId}/teams/{teamId}`

Use to model:

- squad depth
- backup quality
- positional coverage
- expected lineup fallback strength

Recommended include:

`player;team;season;details;position`

## 6.5 `GET /v3/football/commentaries/fixtures/{fixtureId}`

Use for live pressure, momentum, and dangerous-phase interpretation.

Recommended include:

`fixture;player;relatedPlayer`

## 6.6 `GET /v3/football/match-facts/{fixtureId}`

Use as a structured narrative support layer.

It is valuable for:

- contextual facts
- pattern reinforcement
- human-readable support for the final AI explanation

---

# 7) Final implementation priorities

## Priority 1

Fix `syncXG` to use the official xG collection endpoints.

## Priority 2

Add the three missing standings endpoints:

- by round
- corrections
- live standings

## Priority 3

Keep bookmaker `35` Standard Odds exactly as-is.

## Priority 4

Tighten news sync with:

- `order=desc`
- `per_page=50`
- dedupe by article `id`

## Priority 5

Add live trigger and context endpoints:

- `livescores/latest`
- `livescores/inplay`
- schedules by season + team
- squads by season + team
- commentaries by fixture
- match facts by fixture

---

# 8) Short conclusion for the agent

If the goal is a stronger football analysis engine without changing the bookmaker policy, the correct path is:

1. fix xG integration
2. complete standings coverage
3. enrich pre-match context with news + squads + schedules
4. enrich live context with latest/inplay/commentaries/match facts
5. keep odds strictly on Standard Odds + bookmaker `35`

That combination produces a much more professional analysis stack without breaking the current betting workflow.



# 4) GET Schedules by Season ID and Team ID

### Why this endpoint is missing-but-important

This is one of the most practical missing **pre-match context** endpoints.

It helps the AI understand:

- rest days
- congestion
- fixture sequence stress
- short turnaround risk
- whether a team is inside a dense schedule window

### Official path

`GET /v3/football/schedules/seasons/{id}/teams/{id}`

### Available query params

- `api_token` — required
- `include`
- `select`
- `filters`
- `locale`

### Include depth

- `0`

### Pagination

- `NO`

### Include options

- `NONE`

### Recommended request

```txt
/v3/football/schedules/seasons/{SEASON_ID}/teams/{TEAM_ID}
```

### Best use inside the bot

Compute derived schedule signals:

- days since last match
- days until next match
- matches in the last 7 days
- matches in the next 7–14 days
- whether the fixture sits inside a high-load cluster

### #example-response

```json
{
  "data": [
    {
      "id": 77457866,
      "league_id": 501,
      "season_id": 19735,
      "name": "Regular Season",
      "is_current": true,
      "rounds": [
        {
          "id": 274733,
          "name": "Round 20",
          "fixtures": [
            {
              "id": 18535605,
              "league_id": 501,
              "season_id": 19735,
              "round_id": 274733,
              "state_id": 5,
              "name": "Team A vs Team B",
              "starting_at": "2026-03-01 18:00:00",
              "starting_at_timestamp": 1772388000,
              "result_info": "Game ended in draw.",
              "length": 90,
              "has_odds": true,
              "participants": [
                {
                  "id": 53,
                  "name": "Team A",
                  "meta": { "location": "home", "winner": false }
                },
                {
                  "id": 62,
                  "name": "Team B",
                  "meta": { "location": "away", "winner": false }
                }
              ],
              "scores": [
                {
                  "description": "CURRENT",
                  "participant_id": 53,
                  "score": { "goals": 2, "participant": "home" }
                },
                {
                  "description": "CURRENT",
                  "participant_id": 62,
                  "score": { "goals": 2, "participant": "away" }
                }
              ]
            }
          ]
        }
      ]
    }
  ]
}
```

---

# 5) GET Team Squad by Team and Season ID

### Why this endpoint is missing-but-important

Expected lineups alone are not enough.

The bot also needs the **season squad pool** to model:

- depth quality
- positional coverage
- bench strength
- injury impact severity
- replacement plausibility

### Official path

`GET /v3/football/squads/seasons/{seasonID}/teams/{teamID}`

### Available query params

- `api_token` — required
- `include`
- `select`
- `filters`
- `locale`

### Include depth

- `2`

### Pagination

- `NO`

### Include options

- `player`
- `team`
- `season`
- `details`
- `position`

### Best include for analysis

`player;team;season;details;position`

### Recommended request

```txt
/v3/football/squads/seasons/{SEASON_ID}/teams/{TEAM_ID}?include=player;team;season;details;position
```

### Best use inside the bot

Join this endpoint with:

- sidelined data from fixture snapshots
- expected lineups
- player xG

Then derive:

- who is available
- who is missing
- whether replacements are natural or weak
- whether absences damage finishing / creation / defensive structure

### #example-response

```json
{
  "data": [
    {
      "id": 81291,
      "player_id": 991122,
      "team_id": 53,
      "season_id": 19735,
      "position_id": 27,
      "jersey_number": 9,
      "player": {
        "id": 991122,
        "display_name": "Forward A"
      },
      "team": {
        "id": 53,
        "name": "Team A"
      },
      "season": {
        "id": 19735,
        "name": "2025/2026"
      },
      "position": {
        "id": 27,
        "name": "Attacker"
      },
      "details": [
        {
          "type_id": 100,
          "value": "first_team"
        }
      ]
    }
  ]
}
```

---

# 6) GET Team Squad by Team ID

### Why this endpoint is missing-but-important

This is a very useful companion endpoint.

Use it when:

- season id is not yet resolved
- you want the current domestic squad quickly
- you need a faster fallback than season-specific squad logic

### Official path

`GET /v3/football/squads/teams/{ID}`

### Available query params

- `api_token` — required
- `include`
- `select`
- `filters`
- `locale`

### Include depth

- `4`

### Pagination

- `NO`

### Include options

- `team`
- `player`
- `position`
- `detailedPosition`
- `transfer`

### Best include for analysis

`player;team;position;detailedPosition;transfer`

### Recommended request

```txt
/v3/football/squads/teams/{TEAM_ID}?include=player;team;position;detailedPosition;transfer
```

### Best use inside the bot

Use it as a fallback and current-squad layer:

- latest squad members
- role granularity via `detailedPosition`
- transfer timing context
- contract window hints via `start` / `end`

### #example-response

```json
{
  "data": [
    {
      "id": 6540,
      "transfer_id": 26785,
      "player_id": 78121,
      "team_id": 62,
      "position_id": 27,
      "detailed_position_id": 151,
      "jersey_number": 9,
      "start": "2024-07-01",
      "end": "2027-06-30",
      "player": {
        "id": 78121,
        "display_name": "Forward B"
      },
      "position": {
        "id": 27,
        "name": "Attacker"
      },
      "detailedPosition": {
        "id": 151,
        "name": "Centre Forward"
      },
      "transfer": {
        "id": 26785,
        "date": "2024-07-10"
      }
    }
  ]
}
```

---

# 7) GET Topscorers by Season ID

### Why this endpoint is missing-but-important

This endpoint adds a strong player-impact layer.

It helps the AI measure:

- attacking reliance on one player
- scoring distribution inside the team
- assist concentration
- card-risk context if filtered by type

### Official path

`GET /v3/football/topscorers/seasons/{ID}`

### Available query params

- `api_token` — required
- `include`
- `select`
- `filters`
- `locale`
- `order`
- `per_page`
- `page`

### Include depth

- `4`

### Pagination

- `YES`

### Include options

- `season`
- `stage`
- `player`
- `participant`
- `type`

### Best include for analysis

`season;stage;player;participant;type`

### Recommended request

```txt
/v3/football/topscorers/seasons/{SEASON_ID}?include=season;stage;player;participant;type&order=asc&per_page=50
```

### Best use inside the bot

Use this endpoint to build:

- team scoring dependency scores
- assist dependency scores
- card-risk profiles
- “missing star attacker” penalty if the key scorer is unavailable

### #example-response

```json
{
  "data": [
    {
      "id": 1540848,
      "season_id": 19735,
      "player_id": 20708316,
      "type_id": 83,
      "position": 1,
      "total": 19,
      "participant_id": 314,
      "season": {
        "id": 19735,
        "name": "2025/2026"
      },
      "stage": {
        "id": 77457866,
        "name": "Regular Season"
      },
      "player": {
        "id": 20708316,
        "display_name": "Striker A"
      },
      "participant": {
        "id": 314,
        "name": "Team A"
      },
      "type": {
        "id": 83,
        "name": "Goals"
      }
    }
  ],
  "pagination": {
    "has_more": false,
    "current_page": 1
  }
}
```

---

# 8) GET Commentaries by Fixture ID

### Why this endpoint is missing-but-important

This is one of the best missing **live narrative** endpoints.

Raw numbers do not fully explain a live match. Commentary helps interpret:

- pressure waves
- repeated dangerous attacks
- missed big chances
- tactical momentum swings
- game flow between major events

### Official path

`GET /v3/football/commentaries/fixtures/{ID}`

### Available query params

- `api_token` — required
- `include`
- `select`
- `filters`
- `locale`

### Include depth

- `1`

### Pagination

- `NO`

### Include options

- `fixture`
- `player`
- `relatedPlayer`

### Best include for analysis

`fixture;player;relatedPlayer`

### Recommended request

```txt
/v3/football/commentaries/fixtures/{FIXTURE_ID}?include=fixture;player;relatedPlayer
```

### Best use inside the bot

Do **not** send all raw commentary lines directly to the final AI response.

Instead, compress them into derived signals such as:

- dangerous attacks in the last 10 minutes
- repeated shots / saves
- recent big chance count
- which team is territorially stronger
- whether momentum changed after a card, goal, or substitution

### #example-response

```json
{
  "data": [
    {
      "id": 4991022,
      "fixture_id": 18535605,
      "comment": "First half starts.",
      "minute": null,
      "extra_minute": null,
      "is_goal": false,
      "is_important": false,
      "order": 1,
      "fixture": {
        "id": 18535605,
        "name": "Team A vs Team B"
      }
    },
    {
      "id": 4991023,
      "fixture_id": 18535605,
      "comment": "Shot saved from the right side of the box.",
      "minute": 1,
      "extra_minute": null,
      "is_goal": false,
      "is_important": false,
      "order": 2,
      "player": {
        "id": 77221,
        "display_name": "Player A"
      },
      "relatedPlayer": {
        "id": 88331,
        "display_name": "Player B"
      }
    }
  ]
}
```

---

# 9) GET Match Facts by Fixture ID

### Why this endpoint is missing-but-important

This endpoint is a strong **evidence layer**.

It helps the bot generate structured supporting facts such as:

- streaks
- H2H tendencies
- player / team outcome patterns
- probability-flavoured narrative context

### Official path

`GET /v3/football/match-facts/{FIXTURE_ID}`

### Available query params

- `api_token` — required
- `include`
- `select`
- `sortBy`
- `filters`
- `locale`

### Include depth

- `3`

### Pagination

- `YES`

### Include options

- `type`
- `sport`
- `fixture`

### Useful special filter

- `matchFactTypes`

### Best include for analysis

`type;sport;fixture`

### Recommended request

```txt
/v3/football/match-facts/{FIXTURE_ID}?include=type;sport;fixture
```

### Best use inside the bot

Use match facts as a structured explanation layer, not as a primary predictive engine.

It is especially useful for:

- reinforcing the final narrative
- summarising pattern-based evidence
- highlighting unusual statistical tendencies

### #example-response

```json
{
  "data": [
    {
      "id": 28083540,
      "sport_id": 1,
      "fixture_id": 19427187,
      "type_id": 76115,
      "participant": "both",
      "basis": "h2h",
      "data": {
        "count": 22
      },
      "natural_language": null,
      "category": "statistics",
      "scope": "allFixtures",
      "type": {
        "id": 76115,
        "name": "Both teams scored in H2H"
      },
      "fixture": {
        "id": 19427187,
        "name": "Team A vs Team B"
      }
    },
    {
      "id": 28083542,
      "sport_id": 1,
      "fixture_id": 19427187,
      "type_id": 76116,
      "participant": "home",
      "basis": "recent",
      "data": {
        "streak": 5,
        "matches": 5
      },
      "category": "streaks",
      "scope": "allFixtures"
    }
  ],
  "pagination": {
    "has_more": false,
    "current_page": 1
  }
}
```

---

# 10) GET Latest Updated Livescores

### Why this endpoint is missing-but-important

This is one of the most important missing **live orchestration** endpoints.

It is ideal for deciding **which live fixtures actually changed** before triggering deeper refreshes.

### Official path

`GET /v3/football/livescores/latest`

### Available query params

- `api_token` — required
- `include`
- `select`
- `sortBy`
- `filters`
- `locale`

### Include depth

- `3`

### Pagination

- `NO`

### Include options

- `sport`
- `round`
- `stage`
- `group`
- `aggregate`
- `league`
- `season`
- `coaches`
- `tvStations`
- `venue`
- `state`
- `weatherReport`
- `lineups`
- `events`
- `timeline`
- `comments`
- `trends`
- `statistics`
- `periods`
- `participants`
- `odds`
- `premiumOdds`
- `inplayOdds`
- `prematchNews`
- `metadata`
- `sidelined`
- `predictions`
- `referees`
- `formations`
- `ballCoordinates`
- `scores`
- `xGFixture`
- `expectedLineups`
- `matchfacts`
- `AIOverviews`

### Best include for analysis

For a lightweight change detector:

`state;participants;scores;events;statistics;inplayOdds;xGFixture;expectedLineups;matchfacts`

### Recommended request

```txt
/v3/football/livescores/latest?include=state;participants;scores;events;statistics;inplayOdds;xGFixture;expectedLineups;matchfacts
```

### Best use inside the bot

This endpoint should sit at the top of the live refresh pipeline:

1. poll every `5–8` seconds if limits allow
2. if `data=[]`, skip heavy refresh work
3. if fixtures changed, refresh only those fixture ids

### #example-response

```json
{
  "data": [
    {
      "id": 19321001,
      "league_id": 501,
      "season_id": 19735,
      "state_id": 3,
      "name": "Team A vs Team B",
      "starting_at": "2026-03-23 20:00:00",
      "starting_at_timestamp": 1774296000,
      "result_info": "1-0",
      "length": 90,
      "participants": [
        {
          "id": 53,
          "name": "Team A",
          "meta": { "location": "home" }
        },
        {
          "id": 62,
          "name": "Team B",
          "meta": { "location": "away" }
        }
      ],
      "scores": [
        {
          "description": "CURRENT",
          "participant_id": 53,
          "score": { "goals": 1, "participant": "home" }
        },
        {
          "description": "CURRENT",
          "participant_id": 62,
          "score": { "goals": 0, "participant": "away" }
        }
      ],
      "state": {
        "id": 3,
        "name": "LIVE"
      }
    }
  ]
}
```

---

# 11) GET Inplay Livescores

### Why this endpoint is missing-but-important

This endpoint is a high-value **live feed** that gives fixture-like data during active matches.

It is more efficient than repeatedly pulling full fixture pages during live play.

### Official path

`GET /v3/football/livescores/inplay`

### Available query params

- `api_token` — required
- `include`
- `select`
- `sortBy`
- `filters`
- `locale`

### Include depth

- `3`

### Pagination

- `NO`

### Include options

- `sport`
- `round`
- `stage`
- `group`
- `aggregate`
- `league`
- `season`
- `coaches`
- `tvStations`
- `venue`
- `state`
- `weatherReport`
- `lineups`
- `events`
- `timeline`
- `comments`
- `trends`
- `statistics`
- `periods`
- `participants`
- `odds`
- `premiumOdds`
- `inplayOdds`
- `prematchNews`
- `postmatchNews`
- `metadata`
- `sidelined`
- `predictions`
- `referees`
- `formations`
- `ballCoordinates`
- `scores`
- `xGFixture`
- `expectedLineups`
- `matchfacts`
- `AIOverviews`

### Best include for analysis

For a rich live packet:

`state;participants;scores;events;statistics;periods;inplayOdds;predictions;referees;formations;xGFixture;expectedLineups;matchfacts`

### Recommended request

```txt
/v3/football/livescores/inplay?include=state;participants;scores;events;statistics;periods;inplayOdds;predictions;referees;formations;xGFixture;expectedLineups;matchfacts
```

### Best use inside the bot

Use this endpoint as the live working feed for:

- score state
- event stream
- live statistics
- live xG snapshot if available
- live inplay odds

### #example-response

```json
{
  "data": [
    {
      "id": 19321001,
      "league_id": 501,
      "season_id": 19735,
      "state_id": 3,
      "name": "Team A vs Team B",
      "participants": [
        {
          "id": 53,
          "name": "Team A",
          "meta": { "location": "home", "winner": true }
        },
        {
          "id": 62,
          "name": "Team B",
          "meta": { "location": "away", "winner": false }
        }
      ],
      "scores": [
        {
          "description": "CURRENT",
          "participant_id": 53,
          "score": { "goals": 2, "participant": "home" }
        },
        {
          "description": "CURRENT",
          "participant_id": 62,
          "score": { "goals": 1, "participant": "away" }
        }
      ],
      "events": [
        {
          "id": 991,
          "minute": 74,
          "type_id": 14,
          "participant_id": 53
        }
      ],
      "statistics": [
        {
          "participant_id": 53,
          "type_id": 42,
          "data": { "value": 11 }
        }
      ],
      "inplayOdds": [
        {
          "market_id": 1,
          "bookmaker_id": 35
        }
      ]
    }
  ]
}
```

---

# 12) GET Team Rankings by Team ID

### Why this endpoint is missing-but-important

This is a high-value **strength-trend** endpoint.

It adds a broader strength model that is not limited to:

- one competition table
- one recent fixture
- raw points only

It is especially useful as a background strength signal for the AI.

### Official path

`GET /v3/football/team-rankings/teams/TEAM_ID`

### Available query params

- `api_token` — required
- `include`
- `select`
- `sortBy`
- `filters`
- `locale`

### Include depth

- `1`

### Pagination

- `YES`

### Include options

- `team`

### Best include for analysis

`team`

### Recommended request

```txt
/v3/football/team-rankings/teams/{TEAM_ID}?include=team
```

### Best use inside the bot

Use this endpoint to build:

- long-range team strength baseline
- ranking trajectory trends
- stability / volatility signals
- a background power rating to complement season standings

### #example-response

```json
{
  "data": [
    {
      "id": 25430410,
      "team_id": 9,
      "date": "2026-03-20",
      "current_rank": 4,
      "scaled_score": 98.17,
      "team": {
        "id": 9,
        "name": "Team A"
      }
    },
    {
      "id": 25429144,
      "team_id": 9,
      "date": "2026-03-19",
      "current_rank": 4,
      "scaled_score": 98.15,
      "team": {
        "id": 9,
        "name": "Team A"
      }
    }
  ],
  "pagination": {
    "has_more": true,
    "current_page": 1
  }
}
```

---

# 13) GET Latest Updated Fixtures

### Why this endpoint is missing-but-important

This endpoint is very useful for **global sync efficiency**, even outside strictly live workflows.

It lets the orchestrator detect fixture records that changed recently and selectively refresh their deeper caches.

### Official path

`GET /v3/football/fixtures/latest`

### Available query params

- `api_token` — required
- `include`
- `select`
- `sortBy`
- `filters`
- `locale`

### Include depth

- `3`

### Pagination

- `NO`

### Include options

- `sport`
- `round`
- `stage`
- `group`
- `aggregate`
- `league`
- `season`
- `coaches`
- `tvStations`
- `venue`
- `state`
- `weatherReport`
- `lineups`
- `events`
- `timeline`
- `comments`
- `trends`
- `statistics`
- `periods`
- `participants`
- `odds`
- `premiumOdds`
- `inplayOdds`
- `prematchNews`
- `postmatchNews`
- `metadata`
- `sidelined`
- `predictions`
- `referees`
- `formations`
- `ballCoordinates`
- `scores`
- `xGFixture`
- `pressure`
- `expectedLineups`
- `matchfacts`
- `AIOverviews`

### Best include for analysis

For selective refresh orchestration:

`state;participants;scores;events;statistics;odds;inplayOdds;xGFixture;expectedLineups;matchfacts`

### Recommended request

```txt
/v3/football/fixtures/latest?include=state;participants;scores;events;statistics;odds;inplayOdds;xGFixture;expectedLineups;matchfacts
```

### Best use inside the bot

Use this for background sync logic:

- detect changed fixtures
- refresh only affected cache entries
- reduce unnecessary full fixture calls
- support efficient stale-while-revalidate behaviour

### #example-response

```json
{
  "data": [
    {
      "id": 19238160,
      "league_id": 1412,
      "season_id": 22988,
      "stage_id": 77469045,
      "state_id": 1,
      "name": "Team A vs Team B",
      "starting_at": "2026-03-24 15:00:00",
      "starting_at_timestamp": 1774364400,
      "length": 90,
      "has_odds": true,
      "has_premium_odds": true,
      "participants": [
        {
          "id": 901,
          "name": "Team A",
          "meta": { "location": "home" }
        },
        {
          "id": 902,
          "name": "Team B",
          "meta": { "location": "away" }
        }
      ]
    }
  ]
}
```

---



---

# 10) Consolidated implementation order

## Phase A — foundation and correctness

1. Build the SportMonks client with retries, timeouts, pagination helpers, include/select helpers, and filter helpers.
2. Implement fixture snapshots, H2H, team season stats, referee stats, probabilities, news, expected lineups, standard odds, and transfer-rumour context.
3. Correct xG integration to use the official collection endpoints.
4. Complete standings support with:
   - standings by season
   - standings by round
   - standing corrections by season
   - live standings by league

## Phase B — richer pre-match modelling context

1. Add schedule congestion context.
2. Add team squads by season and by current team.
3. Add topscorers.
4. Add match facts.
5. Add team rankings.

## Phase C — live orchestration

1. Add `livescores/latest` as the top-level change detector.
2. Add `livescores/inplay` as the live working feed.
3. Add commentaries.
4. Add `fixtures/latest` as a selective background refresh helper.
5. Add live standings refresh.
6. Add bookmaker-35 inplay market joins.

## Phase D — analysis packet compression

For each fixture, compress raw endpoint outputs into stable internal signals such as:

- `table_pressure_score`
- `round_context_delta`
- `schedule_congestion_score`
- `squad_depth_penalty`
- `key_scorer_dependency`
- `live_momentum_score`
- `live_table_swing`
- `market_edge_pre_match`
- `market_edge_live`
- `narrative_evidence_flags`

---

# 11) Data-modelling guidance for the agent

## 11.1 Do not let the final AI prompt read every raw payload

The AI layer should not receive the full raw responses for all endpoints. Instead, the implementation should:

1. parse each endpoint
2. extract the fields used by models or reasoning
3. generate compact evidence objects
4. feed the compact evidence objects into the final analysis prompt

## 11.2 Use endpoint outputs for these modelling families

### Team-strength modelling

Use:

- season standings
- round standings
- team season stats
- xG by team
- H2H lightly
- team rankings

### Player-availability modelling

Use:

- expected lineups
- team squads
- fixture sidelined data
- player xG
- topscorers

### Schedule / fatigue modelling

Use:

- schedules by season and team
- fixture dates from recent H2H / recent fixtures if you already store them
- competition-stage context

### Live state modelling

Use:

- livescores latest
- livescores inplay
- commentaries
- live standings
- inplay odds
- live xG and statistics

### Market comparison modelling

Use:

- bookmaker 35 pre-match odds
- bookmaker 35 inplay odds
- SportMonks probabilities
- internal model outputs

---

# 12) Live orchestration logic the agent should implement

## 12.1 Trigger layer

Poll:

`/v3/football/livescores/latest`

every 5–8 seconds if limits allow.

If the response is empty, skip deeper work.

## 12.2 Working live packet

For changed fixture ids, refresh:

- `livescores/inplay`
- bookmaker 35 inplay odds
- live standings by league
- commentaries by fixture
- fixture fallback only if necessary

## 12.3 Commentary compression

Never dump commentary into the final AI prompt raw. Convert it into features such as:

- dangerous moments last 10m
- chance creation bursts
- territorial dominance signal
- momentum reversal after cards/goals
- repeated set-piece pressure

---

# 13) Caching and sync guidance

## 13.1 Cache aggressively where the payload is expensive and freshness tolerance exists

Good cache candidates:

- standings by season
- standings by round
- standings corrections
- schedules
- squads
- topscorers
- team rankings
- match facts

## 13.2 Use shorter TTL for fast-changing resources

Short TTL / near-live:

- livescores latest
- livescores inplay
- inplay odds
- live standings
- commentaries
- fixtures latest

## 13.3 Use stale-while-revalidate patterns when possible

For non-critical background context, return cached data immediately and refresh it asynchronously.

---

# 14) Final delivery standard for the agent

The finished project should not merely “call many endpoints.” It should build a disciplined analysis engine that:

- requests the right endpoints at the right time
- uses includes with intent
- compresses raw payloads into analytical features
- compares structured football evidence against bookmaker 35 markets
- uses SportMonks predictions as one evidence layer, not the entire brain
- produces explainable, professional football analysis for betting-oriented decision support

If implemented well, this stack turns the project from a simple Sports API consumer into a genuinely strong football intelligence platform.
