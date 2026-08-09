#!/bin/bash
export PATH="/usr/local/bin:/opt/homebrew/bin:/usr/bin:/bin:$PATH"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
LOGDIR="$ROOT/.logs"
mkdir -p "$LOGDIR"
exec >"$LOGDIR/session.log" 2>&1
echo "=== start $(date) ==="
for port in 3000 3001 5173 5174; do
  pids=$(lsof -tiTCP:$port -sTCP:LISTEN 2>/dev/null || true)
  [ -n "$pids" ] && kill -9 $pids 2>/dev/null || true
done
sleep 1
printf 'VITE_API_BASE_URL=http://localhost:3000\nVITE_GOOGLE_MAPS_KEY=\n' > "$ROOT/front_end/.env"
cd "$ROOT/backend"
node --import tsx/esm src/index.ts >"$LOGDIR/backend.log" 2>&1 &
echo backend_pid=$!
for i in $(seq 1 50); do
  curl -sf http://127.0.0.1:3000/health && break
  sleep 0.3
done
cd "$ROOT/front_end"
npm run dev >"$LOGDIR/frontend.log" 2>&1 &
echo frontend_pid=$!
wait
