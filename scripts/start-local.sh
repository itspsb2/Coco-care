#!/bin/bash
# Run this in Terminal.app / iTerm (not from a restricted agent sandbox).
# Requires: Docker Postgres on 5433, deps already installed.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"

echo "==> Stopping old listeners on 3000 / 3001 / 5173 / 5174"
for port in 3000 3001 5173 5174; do
  if pids=$(lsof -tiTCP:"$port" -sTCP:LISTEN 2>/dev/null); then
    kill -9 $pids 2>/dev/null || true
  fi
done
sleep 1

printf 'VITE_API_BASE_URL=http://localhost:3000\nVITE_GOOGLE_MAPS_KEY=\n' > "$ROOT/front_end/.env"

echo "==> Backend (port 3000)"
cd "$ROOT/backend"
node --import tsx/esm src/index.ts &
BACKEND_PID=$!

for _ in $(seq 1 40); do
  if curl -sf http://localhost:3000/health >/dev/null; then
    echo "    health OK (pid $BACKEND_PID)"
    break
  fi
  sleep 0.4
done

echo "==> DNS check (OpenWeather)"
if node -e "require('dns').lookup('api.openweathermap.org',(e,a)=>{if(e){console.error(e.message);process.exit(1)};console.log('    OK',a)})"; then
  :
else
  echo "    FAIL — weather will not work until outbound DNS/network works for Node"
fi

echo "==> Frontend (port 5173)"
cd "$ROOT/front_end"
npm run dev &
FRONTEND_PID=$!

echo ""
echo "Open http://127.0.0.1:5173"
echo "Backend pid=$BACKEND_PID  Frontend pid=$FRONTEND_PID"
echo "Keep this terminal open."
wait
