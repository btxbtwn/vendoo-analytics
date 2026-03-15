#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/dashboard_paths.sh"

APP_DIR="$(require_vendoo_analytics_repo_dir)"
HOST="$(vendoo_analytics_host)"
PORT="$(vendoo_analytics_port)"
APP_URL="$(vendoo_analytics_url)"
LOG_FILE="${VENDOO_ANALYTICS_LOG_FILE:-$APP_DIR/next-start.log}"

declare -a EXISTING_PIDS=()
while IFS= read -r pid; do
  if [[ -n "$pid" ]]; then
    EXISTING_PIDS+=("$pid")
  fi
done < <(lsof -ti "tcp:$PORT" 2>/dev/null || true)

if (( ${#EXISTING_PIDS[@]} > 0 )); then
  for pid in "${EXISTING_PIDS[@]}"; do
    if ! kill -0 "$pid" 2>/dev/null; then
      continue
    fi

    command_line="$(ps -p "$pid" -o command= 2>/dev/null || true)"
    if [[ -z "$command_line" ]]; then
      continue
    fi

    if [[ "$command_line" != *"$APP_DIR"* && "$command_line" != *"next start"* && "$command_line" != *"next-server"* ]]; then
      echo "Port $PORT is already in use by an unrelated process: $command_line" >&2
      exit 1
    fi

    kill "$pid"
  done
  sleep 1

  for pid in "${EXISTING_PIDS[@]}"; do
    if kill -0 "$pid" 2>/dev/null; then
      kill -9 "$pid"
    fi
  done
fi

if [[ ! -d "$APP_DIR/node_modules" ]]; then
  echo "Missing dependencies in $APP_DIR. Run npm install first." >&2
  exit 1
fi

if [[ ! -d "$APP_DIR/.next" ]]; then
  echo "Missing Next.js build output in $APP_DIR. Run npm run build first." >&2
  exit 1
fi

cd "$APP_DIR"
nohup npm run start -- --hostname "$HOST" --port "$PORT" > "$LOG_FILE" 2>&1 &
sleep 5

if curl -fsS --connect-timeout 5 --max-time 10 "$APP_URL" >/dev/null; then
  echo "Vendoo analytics restarted at $APP_URL"
  echo "Log file: $LOG_FILE"
else
  echo "Failed to start vendoo-analytics at $APP_URL. Check $LOG_FILE" >&2
  exit 1
fi
