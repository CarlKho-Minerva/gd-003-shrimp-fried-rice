#!/bin/bash
# ═══════════════════════════════════════════════════════════════
#  START.SH — One-Command Launcher for Shrimp Fried Rice
#  Starts combined server + ngrok tunnel + opens display
#
#  Usage:
#    ./start.sh          # default port 3000
#    PORT=8080 ./start.sh
# ═══════════════════════════════════════════════════════════════

set -e

PORT="${PORT:-3000}"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo ""
echo "  🍤 Shrimp Fried Rice — Launcher"
echo "  ════════════════════════════════"
echo ""

# ── Check dependencies ──
if ! command -v node &>/dev/null; then
  echo "  ❌ Node.js not found. Install from https://nodejs.org"
  exit 1
fi

if ! command -v ngrok &>/dev/null; then
  echo "  ⚠️  ngrok not found."
  echo "     Install: brew install ngrok   (or https://ngrok.com/download)"
  echo "     Without ngrok, phone sensors won't work (HTTPS required)."
  echo "     Starting local-only mode..."
  echo ""
  NO_NGROK=1
fi

# ── Install ws dependency if needed ──
if [ ! -d "$SCRIPT_DIR/relay/node_modules/ws" ]; then
  echo "  📦 Installing ws dependency..."
  cd "$SCRIPT_DIR/relay" && npm install --silent 2>/dev/null
  cd "$SCRIPT_DIR"
fi

# Symlink node_modules so serve.js can find ws
if [ ! -d "$SCRIPT_DIR/node_modules" ]; then
  ln -sf "$SCRIPT_DIR/relay/node_modules" "$SCRIPT_DIR/node_modules"
fi

# ── Kill any stale ngrok from previous runs ──
pkill -x ngrok 2>/dev/null || true

# ── Kill anything already on the port ──
lsof -ti:$PORT | xargs kill -9 2>/dev/null || true

# ── Start combined server ──
echo "  🚀 Starting server on port $PORT..."
PORT=$PORT node "$SCRIPT_DIR/serve.js" &
SERVER_PID=$!

# Give server a moment to start
sleep 1

# ── Start ngrok if available ──
if [ -z "$NO_NGROK" ]; then
  echo "  🌐 Starting ngrok tunnel..."
  ngrok http $PORT --log=stdout > /tmp/shrimp-ngrok.log 2>&1 &
  NGROK_PID=$!

  # Wait for ngrok to establish tunnel
  NGROK_URL=""
  for i in $(seq 1 15); do
    NGROK_URL=$(curl -s http://localhost:4040/api/tunnels 2>/dev/null | grep -o '"public_url":"https://[^"]*' | head -1 | cut -d'"' -f4)
    if [ -n "$NGROK_URL" ]; then break; fi
    sleep 1
  done

  if [ -n "$NGROK_URL" ]; then
    echo ""
    echo "  ✅ NGROK TUNNEL ACTIVE"
    echo "  ══════════════════════"
    echo ""
    echo "  🖥️  Game URL:  $NGROK_URL"
    echo ""

    # Open display in browser
    open "$NGROK_URL" 2>/dev/null || xdg-open "$NGROK_URL" 2>/dev/null || echo "  Open $NGROK_URL in your browser"
  else
    echo "  ⚠️  ngrok tunnel failed to start. Using local mode."
    echo "     Check: ngrok config check"
    open "http://localhost:$PORT" 2>/dev/null || true
  fi
else
  echo ""
  echo "  🖥️  Game: http://localhost:$PORT"
  echo "  (Desktop mode only — no phone sensors without HTTPS)"
  echo ""
  open "http://localhost:$PORT" 2>/dev/null || true
fi

# ── Cleanup on exit ──
cleanup() {
  echo ""
  echo "  🛑 Shutting down..."
  kill $SERVER_PID 2>/dev/null
  [ -n "$NGROK_PID" ] && kill $NGROK_PID 2>/dev/null
  exit 0
}
trap cleanup SIGINT SIGTERM

echo "  Press Ctrl+C to stop."
echo ""

# Keep alive
wait $SERVER_PID
