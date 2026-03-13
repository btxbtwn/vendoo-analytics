#!/usr/bin/env bash
set -euo pipefail

APP_DIR="/Users/cris/openclaw/sales_dashboard"
PORT="8501"
LOG_FILE="$APP_DIR/streamlit.log"

if [[ ! -d "$APP_DIR" ]]; then
  echo "Missing app directory: $APP_DIR"
  exit 1
fi

pkill -f "streamlit run app.py --server.port $PORT" || true
sleep 1

cd "$APP_DIR"
nohup streamlit run app.py --server.port "$PORT" --server.headless true > "$LOG_FILE" 2>&1 &
sleep 2

if pgrep -f "streamlit run app.py --server.port $PORT" >/dev/null; then
  echo "Sales dashboard restarted on :$PORT"
else
  echo "Failed to restart sales dashboard"
  exit 1
fi
