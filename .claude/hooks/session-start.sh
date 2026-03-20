#!/bin/bash
set -euo pipefail

# Only run in Claude Code remote (web) environment
if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

cd "$CLAUDE_PROJECT_DIR"

# Install dependencies if node_modules is missing or stale
if [ ! -d "node_modules" ]; then
  echo "Installing npm dependencies..."
  npm install
fi

# Copy .env if it doesn't exist
if [ ! -f ".env" ]; then
  echo "Creating .env from .env.example..."
  cp .env.example .env
fi

# Seed the database if it doesn't exist
DB_PATH="./server/db/ev_primitive.sqlite"
if [ ! -f "$DB_PATH" ]; then
  echo "Seeding database..."
  npm run seed
fi

# Start the server in the background
echo "Starting server on port 3000..."
nohup npm start > /tmp/server.log 2>&1 &
SERVER_PID=$!

# Wait for the server to be ready (up to 15s)
for i in $(seq 1 15); do
  if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 | grep -qE "^[23]"; then
    echo "Server is up (PID $SERVER_PID)"
    exit 0
  fi
  sleep 1
done

echo "Warning: server did not respond within 15s. Check /tmp/server.log"
exit 0
