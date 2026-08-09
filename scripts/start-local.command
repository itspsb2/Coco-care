#!/bin/bash
# Start Coco Care outside the editor sandbox (full network for weather/AI APIs)
set -e
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "Stopping processes on 3000, 3001, 5173, 5174..."
for port in 3000 3001 5173 5174; do
  pids=$(lsof -tiTCP:$port -sTCP:LISTEN 2>/dev/null || true)
  if [ -n "$pids" ]; then
    kill -9 $pids 2>/dev/null || true
  fi
done
sleep 1

# Ensure frontend points at default backend port
printf 'VITE_API_BASE_URL=http://localhost:3000\nVITE_GOOGLE_MAPS_KEY=\n' > front_end/.env

echo "Starting backend..."
cd "$ROOT/backend"
node --import tsx/esm src/index.ts &
BACKEND_PID=$!
cd "$ROOT"

for i in $(seq 1 40); do
  if curl -sf http://localhost:3000/health >/dev/null 2>&1; then
    echo "Backend OK: http://localhost:3000 (pid $BACKEND_PID)"
    break
  fi
  sleep 0.5
done

# Smoke-test OpenWeather DNS from Node
node -e "require('dns').lookup('api.openweathermap.org',(e,a)=>{if(e){console.error('DNS fail:',e.message);process.exit(1)};console.log('OpenWeather DNS OK:',a)})" || {
  echo "WARNING: OpenWeather hostname not resolvable. Weather will fail."
}

echo "Starting frontend..."
cd "$ROOT/front_end"
npm run dev &
FRONTEND_PID=$!

echo ""
echo "Coco Care is starting:"
echo "  App:     http://127.0.0.1:5173"
echo "  API:     http://localhost:3000"
echo "  Backend: $BACKEND_PID"
echo "  Frontend:$FRONTEND_PID"
echo ""
echo "Leave this window open. Press Ctrl+C to stop (or close the window)."
wait
