#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/dashboard_paths.sh"

DEBUG_URL="$(chrome_debug_url)"
DEBUG_PORT="${VENDOO_CHROME_DEBUG_PORT:-9222}"
PROFILE_DIR="${VENDOO_CHROME_USER_DATA_DIR:-$HOME/.openclaw/browser/vendoo-mcp-profile}"
TARGET_URL="${VENDOO_EXPORT_ENTRY_URL:-https://web.vendoo.co/app/settings/#export-csv}"
CHROME_BIN="$(require_chrome_binary)"

mkdir -p "$PROFILE_DIR"

echo "CHROME_BINARY=$CHROME_BIN"
echo "CHROME_DEBUG_URL=$DEBUG_URL"
echo "CHROME_PROFILE_DIR=$PROFILE_DIR"
echo "VENDOO_EXPORT_ENTRY_URL=$TARGET_URL"

if curl -fsS --connect-timeout 2 --max-time 4 "$DEBUG_URL/json/version" >/dev/null 2>&1; then
  echo "CHROME_DEBUG_SESSION=true"
  echo "NEXT_USER_STEP=Open the existing debug-enabled Chrome window, sign into Vendoo if needed, and keep the window open."
  exit 0
fi

nohup "$CHROME_BIN" \
  --remote-debugging-port="$DEBUG_PORT" \
  --remote-debugging-address=127.0.0.1 \
  --user-data-dir="$PROFILE_DIR" \
  --no-first-run \
  --disable-default-apps \
  --new-window \
  "$TARGET_URL" >/dev/null 2>&1 &

for _ in $(seq 1 20); do
  if curl -fsS --connect-timeout 2 --max-time 4 "$DEBUG_URL/json/version" >/dev/null 2>&1; then
    echo "CHROME_DEBUG_SESSION=true"
    echo "NEXT_USER_STEP=Sign into Vendoo in the opened Chrome window, keep it open, and then tell the agent you are ready."
    exit 0
  fi
  sleep 1
done

echo "CHROME_DEBUG_SESSION=false" >&2
echo "Failed to start a Chrome remote-debug session at $DEBUG_URL." >&2
echo "Try launching Chrome manually with remote debugging, then rerun this script." >&2
exit 1
