#!/usr/bin/env bash
# PaperVoice - Startup Script
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$DIR"

PORT=${PORT:-3000}
echo "📜 Starting PaperVoice TTS Studio on http://127.0.0.1:${PORT} ..."
node server.js
