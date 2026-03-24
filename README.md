# KilluaFootball — Football Intelligence & Betting Signal Engine

Professional football analysis engine powered by **SportMonks API 3.0**.  
Transforms structured football data into pre-match analysis packets, live analysis packets, probabilistic betting signals, and AI-powered explanations.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend / API** | Next.js (TypeScript, Tailwind CSS) |
| **Database** | PostgreSQL 16 |
| **Cache / Queue** | Redis OSS 7 |
| **Model Service** | Python 3.12, FastAPI |
| **ML Models** | Poisson, Dixon-Coles, CatBoost, LightGBM, XGBoost |
| **Reverse Proxy** | Nginx |
| **Container** | Docker + Docker Compose |
| **Target OS** | Ubuntu 24.04 LTS (Cloud VPS 20) |

## Supported Competitions (v1)

| ID | Competition | Country |
|----|------------|---------|
| 2 | Champions League | Europe |
| 8 | Premier League | England |
| 82 | Bundesliga | Germany |
| 301 | Ligue 1 | France |
| 384 | Serie A | Italy |
| 564 | La Liga | Spain |

## Markets (v1)

- **1X2** (Full-time result)
- **Over/Under 2.5**
- **BTTS** (Both Teams To Score)

## Project Structure

```
src/
  config/          # Centralized configuration (competitions, bookmaker, markets, etc.)
  lib/
    sportmonks/    # SportMonks HTTP client, includes, filters, errors
    storage/       # Prisma (PostgreSQL) + Redis cache helpers
    analysis/      # Analysis packet assembly (TODO)
  services/        # Endpoint wrappers per domain (fixtures, odds, xg, standings, etc.)
  jobs/            # Sync & compute jobs (reference, pre-match, live, features, signals)
  types/           # TypeScript type definitions (sportmonks, analysis, signals)
  app/             # Next.js App Router pages & API routes
python/
  service/         # FastAPI model service (health, predict endpoints)
  training/        # Model training scripts (TODO)
  inference/       # Model inference logic (TODO)
  calibration/     # Probability calibration (TODO)
  backtesting/     # Backtesting framework (TODO)
prisma/
  schema.prisma    # Full database schema (4 layers + job monitoring)
nginx/
  nginx.conf       # Reverse proxy configuration
```

## Quick Start (Local Development)

```bash
# 1. Copy environment file
cp .env.example .env
# 2. Edit .env with your SportMonks API token and database credentials

# 3. Install dependencies
npm install

# 4. Generate Prisma client
npx prisma generate

# 5. Start dev server
npm run dev
```

## Docker Deployment

```bash
# 1. Copy and configure environment
cp .env.example .env

# 2. Build and start all services
docker compose up -d --build

# 3. Run database migrations
docker compose exec nextjs-app npx prisma migrate deploy
```

## Key Constraints

- **Bookmaker 35 only** — all odds sync uses bookmaker ID `35`
- **Standard Odds only** — no Premium Odds in v1
- **6 competitions only** — controlled from `src/config/competitions.ts`
- **Free/open-source models only** — no paid prediction APIs
- **LLMs for explanation only** — real predictions from statistical + ML models
