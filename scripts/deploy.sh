#!/bin/bash
set -e

PROJECT_DIR="/opt/killuafootball"

echo "============================================"
echo "  KilluaFootball Deploy Script"
echo "============================================"

cd "$PROJECT_DIR"

# --- 1. Check .env ---
if [ ! -f .env ]; then
  echo "ERROR: .env file not found!"
  echo "Run: cp .env.example .env && nano .env"
  exit 1
fi

echo "[1/5] .env file found ✓"

# --- 2. Build & Start Containers ---
echo ""
echo "[2/5] Building and starting containers..."
docker compose up -d --build

# --- 3. Wait for services ---
echo ""
echo "[3/5] Waiting for services to be healthy..."
sleep 10

# Check postgres
echo -n "  PostgreSQL: "
docker compose exec -T postgres pg_isready -U killua > /dev/null 2>&1 && echo "✓ Ready" || echo "✗ Not ready"

# Check redis
echo -n "  Redis: "
docker compose exec -T redis redis-cli ping > /dev/null 2>&1 && echo "✓ Ready" || echo "✗ Not ready"

# --- 4. Database Migration ---
echo ""
echo "[4/5] Running database migrations..."
docker compose exec -T nextjs-app npx prisma migrate deploy 2>/dev/null || {
  echo "  No migrations found. Pushing schema directly..."
  docker compose exec -T nextjs-app npx prisma db push
}

# --- 5. Verify ---
echo ""
echo "[5/5] Verifying services..."

echo -n "  Next.js:       "
curl -sf http://localhost:3000 > /dev/null && echo "✓ Running" || echo "✗ Not responding"

echo -n "  Python Model:  "
curl -sf http://localhost:8000/health > /dev/null && echo "✓ Running" || echo "✗ Not responding"

echo -n "  Nginx Proxy:   "
curl -sf http://localhost:80 > /dev/null && echo "✓ Running" || echo "✗ Not responding"

echo ""
echo "============================================"
echo "  Deploy Complete!"
echo "============================================"
echo ""
echo "  Containers status:"
docker compose ps --format "table {{.Name}}\t{{.Status}}\t{{.Ports}}"
echo ""
echo "  Access:"
echo "    Local:    http://localhost:3000"
echo "    Public:   http://$(curl -sf ifconfig.me)"
echo ""
