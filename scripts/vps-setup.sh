#!/bin/bash
set -e

echo "============================================"
echo "  KilluaFootball VPS Setup Script"
echo "  Cloud VPS 20 — Ubuntu 24.04"
echo "============================================"

# --- 1. System Update ---
echo ""
echo "[1/7] Updating system packages..."
apt update && apt upgrade -y

# --- 2. Essential Tools ---
echo ""
echo "[2/7] Installing essential tools..."
apt install -y \
  curl \
  git \
  htop \
  ufw \
  fail2ban \
  unzip \
  ca-certificates \
  gnupg \
  lsb-release

# --- 3. Docker + Docker Compose ---
echo ""
echo "[3/7] Installing Docker..."
if ! command -v docker &> /dev/null; then
  curl -fsSL https://get.docker.com | sh
  systemctl enable docker
  systemctl start docker
  echo "Docker installed successfully."
else
  echo "Docker already installed, skipping."
fi

# Verify docker compose plugin
docker compose version || {
  echo "ERROR: docker compose plugin not found"
  exit 1
}

# --- 4. Firewall ---
echo ""
echo "[4/7] Configuring firewall (UFW)..."
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp     # SSH
ufw allow 80/tcp     # HTTP
ufw allow 443/tcp    # HTTPS
ufw --force enable
echo "Firewall configured: SSH(22), HTTP(80), HTTPS(443) open."

# --- 5. Swap ---
echo ""
echo "[5/7] Setting up 4GB swap..."
if [ ! -f /swapfile ]; then
  fallocate -l 4G /swapfile
  chmod 600 /swapfile
  mkswap /swapfile
  swapon /swapfile
  echo '/swapfile none swap sw 0 0' >> /etc/fstab
  # Optimize swap usage
  sysctl vm.swappiness=10
  echo 'vm.swappiness=10' >> /etc/sysctl.conf
  echo "4GB swap created."
else
  echo "Swap already exists, skipping."
fi

# --- 6. Fail2Ban ---
echo ""
echo "[6/7] Configuring Fail2Ban..."
systemctl enable fail2ban
systemctl start fail2ban
echo "Fail2Ban enabled for SSH protection."

# --- 7. Project Directory ---
echo ""
echo "[7/7] Creating project directory..."
mkdir -p /opt/killuafootball
echo "Project directory: /opt/killuafootball"

echo ""
echo "============================================"
echo "  VPS Setup Complete!"
echo "============================================"
echo ""
echo "Next steps:"
echo "  1. Upload your project to /opt/killuafootball"
echo "  2. cd /opt/killuafootball"
echo "  3. cp .env.example .env && nano .env"
echo "  4. docker compose up -d --build"
echo "  5. docker compose exec nextjs-app npx prisma migrate deploy"
echo ""
echo "System info:"
echo "  RAM:  $(free -h | awk '/^Mem:/{print $2}')"
echo "  Swap: $(free -h | awk '/^Swap:/{print $2}')"
echo "  Disk: $(df -h / | awk 'NR==2{print $4}') free"
echo "  Docker: $(docker --version)"
echo ""
