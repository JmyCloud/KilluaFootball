# Cloud VPS 20 + 6-League Football Intelligence Project Handoff

## 1) Purpose

This document defines the final infrastructure choice, league scope, free software stack, free modelling stack, and implementation plan for the SportMonks-based football analysis and betting-intelligence project.

This handoff is intentionally written for an implementation agent and should be treated as a project-level operating document.

The system goal is to:

- ingest SportMonks football data professionally
- support only the selected 6 competitions in the first production scope
- transform raw API data into normalized data, features, predictions, and betting signals
- keep all software components free and open-source
- run the full stack on **one Cloud VPS 20 server**

---

## 2) Selected Server

### Final server choice

**Cloud VPS 20**

### Selected hardware profile

- **CPU:** 6 vCPU Cores
- **RAM:** 12 GB RAM
- **Storage:** **100 GB NVMe** preferred over 200 GB SSD
- **Snapshots:** 2 snapshots
- **Port:** 300 Mbit/s
- **Quantity:** 1 server

### Storage decision

Choose:

- **100 GB NVMe**

Do not choose:

- 200 GB SSD

Reason:

- NVMe provides better latency and better real-world database and cache performance.
- PostgreSQL, Redis, logs, normalized tables, and feature recomputation benefit more from faster storage than from slower extra capacity.
- The project is intentionally limited to 6 competitions, so performance is more important than raw disk size at this stage.

### Why this server is acceptable

This server is acceptable because the project scope is fixed to **6 competitions only**, with a disciplined ingestion strategy and a controlled live-refresh design.

It is strong enough to run:

- Next.js application and API layer
- PostgreSQL as the primary database
- Redis OSS as cache / queue / lock layer
- Python model service for feature generation, model inference, and scheduled training
- background jobs and sync workers
- reverse proxy (Nginx or Caddy)

### Important capacity rule

This server is approved for:

- **6 competitions only**
- controlled live polling
- precomputed features and predictions
- disciplined caching
- selective refresh based on changed fixtures

It is **not** intended to support an unrestricted number of leagues or uncontrolled full-payload syncing.

---

## 3) Fixed Competition Scope

The first production version must support **only these 6 competitions**:

```js
[
  2, // Champions League (Europe)
  8, // Premier League (England)
  82, // Bundesliga (Germany)
  301, // Ligue 1 (France)
  384, // Serie A (Italy)
  564, // La Liga (Spain)
];
```

### Competition scope rule

The system must be designed so that league support is controlled from **one static configuration file**.

This means:

- no hardcoded league IDs scattered across services
- no duplicate competition lists inside workers
- no endpoint-specific ad hoc filtering logic
- all sync jobs, live jobs, pre-match jobs, and model jobs must read from the same centralized competition config

### Required competition configuration file

Create one dedicated file such as:

- `src/config/competitions.ts`

Recommended content:

```ts
export const SUPPORTED_COMPETITIONS = [
  { id: 2, name: "Champions League", country: "Europe", priority: 1 },
  { id: 8, name: "Premier League", country: "England", priority: 1 },
  { id: 82, name: "Bundesliga", country: "Germany", priority: 1 },
  { id: 301, name: "Ligue 1", country: "France", priority: 1 },
  { id: 384, name: "Serie A", country: "Italy", priority: 1 },
  { id: 564, name: "La Liga", country: "Spain", priority: 1 },
] as const;
```

Optional JSON version if a pure config file is preferred:

```json
{
  "competitions": [
    { "id": 2, "name": "Champions League", "country": "Europe", "priority": 1 },
    { "id": 8, "name": "Premier League", "country": "England", "priority": 1 },
    { "id": 82, "name": "Bundesliga", "country": "Germany", "priority": 1 },
    { "id": 301, "name": "Ligue 1", "country": "France", "priority": 1 },
    { "id": 384, "name": "Serie A", "country": "Italy", "priority": 1 },
    { "id": 564, "name": "La Liga", "country": "Spain", "priority": 1 }
  ]
}
```

### Mandatory usage rule

Every one of these modules must consume the same competition config:

- fixture sync jobs
- live sync jobs
- standings jobs
- odds jobs
- xG jobs
- squad jobs
- news jobs
- model feature jobs
- prediction jobs
- dashboards / admin pages

If a competition must be added or removed later, that change should happen primarily inside the single config file.

---

## 4) Software Stack — Free/Open Source Only

Everything below must remain free and open-source.

### Operating system

- **Ubuntu 24.04 LTS**

### Container/runtime layer

- **Docker Engine**
- **Docker Compose**

### Reverse proxy

Choose one:

- **Nginx**
- or **Caddy**

### Application layer

- **Next.js** for dashboard, API routes, admin controls, and final presentation layer

### Database layer

- **PostgreSQL** as the primary database

### Cache / queue layer

- **Redis OSS** only

### Model / analysis service

- **Python** service
- recommended: **FastAPI** for internal model endpoints

### Python libraries

- **pandas**
- **numpy**
- **scikit-learn**
- **statsmodels** when useful
- **CatBoost**
- **LightGBM**
- **XGBoost**
- **SHAP** for explainability if required
- **Optuna** for hyperparameter tuning if used

### Job scheduling

Use one of these free approaches:

- internal cron inside the server
- APScheduler in Python
- lightweight custom job runner

### Monitoring/logging

Keep it lightweight at first:

- file logs
- structured JSON logs
- PostgreSQL job tables
- optional later: Prometheus + Grafana, both open-source

---

## 5) What Is Free and What Is Paid

### Paid

- SportMonks subscription
- VPS hosting subscription

### Free/Open Source

- Ubuntu
- Docker
- Nginx / Caddy
- Next.js
- PostgreSQL
- Redis OSS
- Python
- FastAPI
- pandas / numpy / scikit-learn
- CatBoost
- LightGBM
- XGBoost
- SHAP
- Optuna

### Important policy

The project must avoid paid managed services unless absolutely necessary.

That means:

- no paid hosted Redis requirement
- no paid hosted database requirement
- no paid model API requirement for prediction logic
- no paid feature platform requirement

The full prediction and signal stack must remain self-hosted and free in software terms.

---

## 6) Final Architecture

```txt
Internet / Admin User
        |
        v
   Reverse Proxy
        |
        v
      Next.js
   (dashboard + API)
        |
   -------------------------
   |           |           |
   v           v           v
PostgreSQL   Redis     Python Model Service
   |           |           |
   ------------|-----------
               |
               v
         Background Jobs
   (sync, normalize, features,
    predictions, signals)
```

### Core role of each service

#### Next.js

Responsible for:

- admin dashboard
- analysis output API
- signal presentation
- internal orchestration endpoints
- reading prediction tables and feature summaries

#### PostgreSQL

Responsible for:

- raw endpoint references when needed
- normalized football entities
- standings
- lineups
- xG tables
- odds snapshots
- features
- model predictions
- signal outputs
- job history and monitoring tables

#### Redis OSS

Responsible for:

- caching expensive reads
- queue buffering
- distributed locking
- live refresh coordination
- short-lived state

Redis is **not** the primary database.

#### Python model service

Responsible for:

- feature generation
- training
- backtesting
- calibration
- ensemble prediction
- betting signal generation support

---

## 7) Data Storage Design

The database must be split into logical layers.

### A. Raw / source-reference layer

Tables such as:

- `raw_fixture_snapshots`
- `raw_livescore_snapshots`
- `raw_odds_snapshots`
- `raw_news_articles`
- `raw_match_facts`

Use this layer only when source preservation is useful.

### B. Normalized football layer

Tables such as:

- `fixtures`
- `fixture_participants`
- `fixture_scores`
- `fixture_events`
- `fixture_statistics`
- `lineups`
- `expected_lineups`
- `xg_team_rows`
- `xg_player_rows`
- `standings_rows`
- `standings_corrections`
- `live_standings_rows`
- `team_squads`
- `team_rankings`
- `topscorers`
- `news_articles`
- `commentary_lines`
- `match_fact_rows`
- `odds_prematch_rows`
- `odds_inplay_rows`

### C. Feature layer

Tables such as:

- `features_prematch`
- `features_live`
- `features_schedule`
- `features_squad`
- `features_market`
- `features_rankings`

### D. Prediction / signal layer

Tables such as:

- `model_predictions_1x2`
- `model_predictions_ou25`
- `model_predictions_btts`
- `calibrated_probabilities`
- `betting_signals`
- `analysis_packets`

---

## 8) Free Modelling Stack

This section defines the exact style of models the project should use.

All of them must remain free/open-source.

### Model Group A — Statistical Baselines

#### 1. Poisson Goal Model

Use for:

- expected goals-to-score conversion baseline
- 1X2 probability scaffolding
- correct score distributions
- over/under baseline

Why it matters:

- simple
- interpretable
- useful as a sanity baseline
- strong enough to serve as a reference engine

#### 2. Dixon-Coles Model

Use for:

- improved football scoreline modelling
- low-score corrections
- stronger realistic match probability structure

Why it matters:

- more football-specific than plain Poisson
- better handling of common scoreline dependence
- excellent baseline for serious football modelling

### Model Group B — Main Tabular ML Models

#### 3. CatBoost

Use as the **primary tabular model**.

Use for:

- 1X2 probability estimation
- over/under probability estimation
- BTTS probability estimation
- team-strength interaction modelling
- lineup / xG / market / standings feature interactions

Why CatBoost is recommended:

- excellent on tabular data
- strong with mixed feature types
- stable and practical in real projects
- free and open-source

#### 4. LightGBM

Use as a secondary gradient boosting model.

Use for:

- ensemble diversity
- faster training alternatives
- comparative validation against CatBoost

#### 5. XGBoost

Use as another secondary model for comparison or ensemble support.

Use for:

- alternative tabular benchmark
- additional model diversity

### Model Group C — Calibration Layer

#### 6. Probability Calibration

Use one of:

- Platt scaling
- isotonic regression

Purpose:

- improve probability reliability
- reduce overconfidence
- make fair-odds conversion more trustworthy

This calibration layer is mandatory.

### Model Group D — Ensemble Layer

#### 7. Weighted Ensemble

The final prediction layer should combine:

- Poisson / Dixon-Coles outputs
- CatBoost outputs
- LightGBM outputs
- XGBoost outputs
- SportMonks prediction probabilities as a supporting input, not the sole driver

Purpose:

- improve robustness
- reduce dependency on one model family
- improve stability across leagues and market types

### Model Group E — Signal Engine

#### 8. Betting Signal Engine

This is not a learning model by itself. It is a rules-plus-probabilities decision layer.

It should convert probabilities into:

- fair odds
- market comparison vs bookmaker 35
- edge percentage
- confidence bucket
- final action class:
  - `NO_BET`
  - `LEAN`
  - `STRONG_SIGNAL`

---

## 9) Model Usage Policy

### What generates the real football prediction?

The real prediction engine is:

- Poisson / Dixon-Coles
- CatBoost
- LightGBM
- XGBoost
- calibration layer
- ensemble layer

### What does NOT generate the real prediction?

Do **not** use a general LLM or custom GPT as the primary betting prediction engine.

LLMs may be used only for:

- summarizing evidence
- generating readable explanations
- packaging output for the user

The actual predictive probabilities must come from the free self-hosted modelling stack above.

---

## 10) Markets for the First Production Version

The first production version should focus on:

- **1X2**
- **Over/Under 2.5**
- **BTTS**

These three markets should be the main deliverables.

Do not over-expand market scope in version one.

---

## 11) Endpoint Coverage Philosophy

The project must use the complete SportMonks handoff strategy already defined in the master SportMonks document.

That means the final system should support the required endpoint families for:

- fixture snapshots
- head-to-head
- season standings
- round standings
- standings corrections
- live standings
- xG by team
- xG by player
- expected lineups
- pre-match news
- squads
- schedules
- topscorers
- commentaries
- match facts
- team rankings
- probabilities
- standard pre-match odds for bookmaker 35
- standard inplay odds for bookmaker 35
- livescores latest
- livescores inplay
- latest updated fixtures

The details of these endpoints remain governed by the master SportMonks handoff.

---

## 12) Working Plan

## Phase 1 — Infrastructure Setup

Set up on the selected server:

- Ubuntu 24.04
- Docker Engine
- Docker Compose
- PostgreSQL container
- Redis OSS container
- Next.js container
- Python model-service container
- reverse proxy container or native proxy setup

### Deliverables

- working server
- HTTPS if domain is ready
- all containers booting correctly
- backup/snapshot policy documented

## Phase 2 — Project Skeleton

Create the repository structure:

```txt
app/
  dashboard/
  api/
src/
  config/
  lib/
  services/
  jobs/
  models/
  features/
  signals/
  db/
python/
  service/
  training/
  inference/
  calibration/
  backtesting/
```

### Deliverables

- centralized config
- shared environment config
- competition config file
- SportMonks client scaffold

## Phase 3 — Data Ingestion

Implement:

- reference sync
- pre-match sync
- live trigger sync
- live refresh sync

### Deliverables

- normalized fixture ingestion
- odds ingestion
- xG ingestion
- standings ingestion
- squad ingestion
- news/commentary/match-fact ingestion

## Phase 4 — Feature Engineering

Build derived features such as:

- team form
- home/away splits
- xG trend
- rest days
- schedule congestion
- squad depth
- expected lineup strength
- topscorer dependency
- live pressure
- market movement
- standings pressure
- ranking trend

### Deliverables

- `features_prematch`
- `features_live`
- feature generation jobs

## Phase 5 — Modelling

Train:

- Poisson baseline
- Dixon-Coles baseline
- CatBoost main model
- LightGBM secondary model
- XGBoost secondary model
- calibration layer
- weighted ensemble

### Deliverables

- reproducible training scripts
- saved model artifacts
- backtesting reports
- calibration reports

## Phase 6 — Betting Signal Engine

Implement signal logic:

- fair odds generation
- bookmaker 35 comparison
- edge calculation
- confidence classification
- no-bet filters

### Deliverables

- signal table
- signal API
- admin debug view

## Phase 7 — Dashboard and Final Presentation

In Next.js build:

- fixture list page
- match detail page
- prediction/signal page
- admin sync monitor
- competition filter view driven from config

### Deliverables

- full UI
- internal admin pages
- readable football analysis output

---

## 13) Live Refresh Discipline

To keep the server comfortable, live processing must remain disciplined.

### Mandatory rules

- only poll live trigger endpoints at high frequency
- refresh only changed fixtures
- compute live packets only for active fixtures
- keep commentary parsing incremental
- do not recalculate every model from scratch on every poll
- cache hot live data in Redis

This is one of the key reasons the server can remain comfortable with 6 competitions.

---

## 14) Why 6 Competitions Is the Final Limit

The 6 selected competitions are the approved first-production scope because they balance:

- project ambition
- server limits
- SportMonks payload depth
- live refresh cost
- database growth
- prediction quality management

The project should not expand league scope until:

- sync timings are measured
- Redis usage is measured
- PostgreSQL growth is measured
- live refresh behaviour is stable
- model jobs are proven stable

---

## 15) Recommended Container Layout

```yaml
services:
  reverse-proxy:
  nextjs-app:
  postgres:
  redis:
  python-model-service:
  sync-worker:
  feature-worker:
  signal-worker:
```

### Service notes

- `nextjs-app`: web UI and API
- `postgres`: source of truth
- `redis`: cache, queues, locks
- `python-model-service`: model inference + training endpoints
- `sync-worker`: SportMonks ingestion
- `feature-worker`: feature generation
- `signal-worker`: prediction and signal jobs

---

## 16) Configuration Policy

### Centralized env variables

Use environment variables for:

- SportMonks token
- database connection
- Redis connection
- app secrets
- admin secrets
- model paths

### Centralized static config

Use dedicated config files for:

- supported competitions
- bookmaker policy
- market policy
- polling intervals
- cache TTLs
- model weights

### Recommended fixed config files

- `src/config/competitions.ts`
- `src/config/bookmaker.ts`
- `src/config/markets.ts`
- `src/config/polling.ts`
- `src/config/cache.ts`
- `src/config/modelWeights.ts`

Example bookmaker config:

```ts
export const BOOKMAKER_ID = 35;
export const BOOKMAKER_NAME = "Bookmaker 35";
```

Example markets config:

```ts
export const ENABLED_MARKETS = ["1X2", "OU25", "BTTS"] as const;
```

---

## 17) Final Non-Negotiable Rules

1. Support **only 6 competitions** in version one.
2. Keep all competition IDs in one static config file.
3. Use **100 GB NVMe**.
4. Use PostgreSQL as the primary database.
5. Use Redis OSS only as cache / queue / lock layer.
6. Use only free/open-source modelling software.
7. Use Poisson, Dixon-Coles, CatBoost, LightGBM, XGBoost, calibration, and ensemble.
8. Use LLMs only as explanation layers, not as the true prediction engine.
9. Keep the market scope limited to 1X2, Over/Under 2.5, and BTTS.
10. Keep bookmaker policy fixed to bookmaker `35` in this project version.

---

## 18) Final Summary

This project will run on **one Cloud VPS 20 server** with:

- 6 vCPU
- 12 GB RAM
- 100 GB NVMe
- PostgreSQL
- Redis OSS
- Next.js
- Python model service

The project will support **exactly 6 competitions**:

- Champions League
- Premier League
- Bundesliga
- Ligue 1
- Serie A
- La Liga

All core software and modelling components will remain **free and open-source**.

The predictive stack will be built from:

- Poisson
- Dixon-Coles
- CatBoost
- LightGBM
- XGBoost
- calibration
- weighted ensemble
- betting signal engine

The league scope will be controlled by a **single static competition config file**, so future competition changes can be made safely and centrally.
