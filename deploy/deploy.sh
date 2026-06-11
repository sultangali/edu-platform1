#!/usr/bin/env bash
# EduKZ redeploy script. Run on the server AFTER `git pull`.
#
#   cd /var/www/edu-platform && ./deploy/deploy.sh
#
# Prereqs (one-time, see DEPLOY.md): Node 20 LTS, MongoDB running locally, PM2,
# nginx, and backend/.env created from backend/.env.production.example.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"
echo "▶ Deploying from $ROOT"

# 1. Backend deps (production only) + log dir for PM2
echo "▶ Installing backend dependencies..."
( cd backend && npm ci --omit=dev )
mkdir -p backend/logs

# 2. Frontend build (needs dev deps like vite, so a full install)
echo "▶ Building frontend..."
( cd frontend && npm ci && npm run build )

# 3. (Re)start the API under PM2
if pm2 describe edu-api >/dev/null 2>&1; then
  echo "▶ Reloading PM2 process edu-api..."
  pm2 reload ecosystem.config.cjs
else
  echo "▶ Starting PM2 process edu-api..."
  pm2 start ecosystem.config.cjs
fi
pm2 save

echo "✅ Done. API: pm2 logs edu-api   |   Site: https://edu-platform.online"
echo "ℹ  Seed the database (first deploy only):  cd backend && npm run seed"
