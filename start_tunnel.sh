#!/usr/bin/env bash
# PaperVoice - Tunnel Manager Script
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$DIR"

PORT=${PORT:-3000}
URL_FILE="$DIR/tunnel_url.txt"
LOG_FILE="$DIR/cloudflared.log"

echo "=== PaperVoice Tunnel Manager ==="

# Check if server is running
if ! curl -s -o /dev/null http://127.0.0.1:${PORT}; then
  echo "Starting local PaperVoice server on port ${PORT}..."
  PORT=${PORT} node server.js > server.log 2>&1 &
  sleep 2
fi

echo "Starting Cloudflare HTTPS tunnel for port ${PORT}..."
pkill -f "cloudflared tunnel --url http://127.0.0.1:${PORT}" 2>/dev/null || true
cloudflared tunnel --url "http://127.0.0.1:${PORT}" > "$LOG_FILE" 2>&1 &

# Wait for tunnel URL
echo "Waiting for live URL..."
for i in {1..20}; do
  URL=$(grep -o 'https://[a-zA-Z0-9-]*\.trycloudflare\.com' "$LOG_FILE" | head -n 1)
  if [ -n "$URL" ]; then
    echo "$URL" > "$URL_FILE"
    echo "========================================="
    echo " 🚀 LIVE PUBLIC TUNNEL URL:"
    echo " $URL"
    echo "========================================="
    exit 0
  fi
  sleep 1
done

echo "Tunnel started. Check $LOG_FILE for details."
