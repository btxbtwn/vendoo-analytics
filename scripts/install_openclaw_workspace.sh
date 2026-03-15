#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SOURCE_REPO_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
WORKSPACE_DIR="${OPENCLAW_WORKSPACE_DIR:-$HOME/.openclaw/workspace}"
TARGET_REPO_DIR="${VENDOO_ANALYTICS_REPO_DIR:-$WORKSPACE_DIR/vendoo-analytics}"
SKILLS_DIR="${OPENCLAW_SKILLS_DIR:-$WORKSPACE_DIR/skills}"
HOST="${VENDOO_ANALYTICS_HOST:-127.0.0.1}"
PORT="${VENDOO_ANALYTICS_PORT:-3000}"

RUN_NPM_INSTALL="true"
RUN_BUILD="true"
RUN_START="true"
SYNC_SKILLS="true"
LAUNCH_DEBUG_CHROME="false"

usage() {
  cat <<'EOF'
Usage: bash scripts/install_openclaw_workspace.sh [options]

Options:
  --skip-npm         Skip npm install
  --skip-build       Skip npm run build
  --skip-start       Skip starting vendoo-analytics after install
  --skip-skill-sync  Skip syncing shipped skills into the OpenClaw skills folder
  --launch-debug-chrome  Launch the dedicated Vendoo debug Chrome window after install
EOF
}

require_command() {
  local cmd="$1"
  local hint="$2"
  if ! command -v "$cmd" >/dev/null 2>&1; then
    echo "Missing required command: $cmd" >&2
    echo "$hint" >&2
    exit 1
  fi
}

while (( "$#" > 0 )); do
  case "$1" in
    --skip-npm)
      RUN_NPM_INSTALL="false"
      ;;
    --skip-build)
      RUN_BUILD="false"
      ;;
    --skip-start)
      RUN_START="false"
      ;;
    --skip-skill-sync)
      SYNC_SKILLS="false"
      ;;
    --launch-debug-chrome)
      LAUNCH_DEBUG_CHROME="true"
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "Unknown argument: $1" >&2
      usage >&2
      exit 1
      ;;
  esac
  shift
done

require_command "rsync" "Install rsync before running the OpenClaw workspace installer."
require_command "npm" "Install Node.js and npm before running the OpenClaw workspace installer."

mkdir -p "$WORKSPACE_DIR" "$SKILLS_DIR"

CSV_BACKUP=""
if [[ "$SOURCE_REPO_DIR" != "$TARGET_REPO_DIR" ]]; then
  mkdir -p "$TARGET_REPO_DIR"

  if [[ -f "$TARGET_REPO_DIR/public/data/vendoo.csv" ]]; then
    CSV_BACKUP="$(mktemp)"
    cp "$TARGET_REPO_DIR/public/data/vendoo.csv" "$CSV_BACKUP"
  fi

  rsync -a --delete \
    --exclude '.git' \
    --exclude '.DS_Store' \
    --exclude 'node_modules' \
    --exclude '.next' \
    --exclude 'public/data/vendoo.csv' \
    "$SOURCE_REPO_DIR/" "$TARGET_REPO_DIR/"

  if [[ -n "$CSV_BACKUP" ]]; then
    mkdir -p "$TARGET_REPO_DIR/public/data"
    cp "$CSV_BACKUP" "$TARGET_REPO_DIR/public/data/vendoo.csv"
    rm -f "$CSV_BACKUP"
  fi
fi

mkdir -p "$TARGET_REPO_DIR/public/data"

if [[ "$SYNC_SKILLS" == "true" ]]; then
  rsync -a --delete --exclude '.DS_Store' \
    "$TARGET_REPO_DIR/skills/vendoo-export-dashboard/" \
    "$SKILLS_DIR/vendoo-export-dashboard/"
  rsync -a --delete --exclude '.DS_Store' \
    "$TARGET_REPO_DIR/skills/vendoo-daily-dashboard-rundown/" \
    "$SKILLS_DIR/vendoo-daily-dashboard-rundown/"
  find "$SKILLS_DIR/vendoo-export-dashboard/scripts" -type f -name '*.sh' -exec chmod +x {} +
  find "$SKILLS_DIR/vendoo-daily-dashboard-rundown/scripts" -type f -name '*.sh' -exec chmod +x {} +
fi

cd "$TARGET_REPO_DIR"

if [[ "$RUN_NPM_INSTALL" == "true" ]]; then
  npm install
fi

if [[ "$RUN_BUILD" == "true" ]]; then
  npm run build
fi

if [[ "$RUN_START" == "true" ]]; then
  OPENCLAW_WORKSPACE_DIR="$WORKSPACE_DIR" \
  VENDOO_ANALYTICS_REPO_DIR="$TARGET_REPO_DIR" \
  VENDOO_ANALYTICS_HOST="$HOST" \
  VENDOO_ANALYTICS_PORT="$PORT" \
  "$TARGET_REPO_DIR/skills/vendoo-export-dashboard/scripts/restart_vendoo_analytics.sh"
fi

if [[ "$LAUNCH_DEBUG_CHROME" == "true" ]]; then
  OPENCLAW_WORKSPACE_DIR="$WORKSPACE_DIR" \
  VENDOO_ANALYTICS_REPO_DIR="$TARGET_REPO_DIR" \
  "$TARGET_REPO_DIR/skills/vendoo-export-dashboard/scripts/start_vendoo_debug_chrome.sh"
fi

cat <<EOF
OPENCLAW_WORKSPACE_DIR=$WORKSPACE_DIR
VENDOO_ANALYTICS_INSTALL_PATH=$TARGET_REPO_DIR
VENDOO_ANALYTICS_SKILLS_PATH=$SKILLS_DIR
VENDOO_ANALYTICS_APP_URL=http://$HOST:$PORT
VENDOO_ANALYTICS_CSV_TARGET=$TARGET_REPO_DIR/public/data/vendoo.csv
EXPORT_SKILL_PATH=$SKILLS_DIR/vendoo-export-dashboard
MORNING_SKILL_PATH=$SKILLS_DIR/vendoo-daily-dashboard-rundown
EXPORT_CRON_TEMPLATE=$SKILLS_DIR/vendoo-export-dashboard/references/openclaw-cron.example.json
MORNING_CRON_TEMPLATE=$SKILLS_DIR/vendoo-daily-dashboard-rundown/references/openclaw-cron.example.json
MCP_CHECK_COMMAND=$SKILLS_DIR/vendoo-export-dashboard/scripts/check_chrome_devtools_mcp.sh
DEBUG_CHROME_LAUNCHER=$SKILLS_DIR/vendoo-export-dashboard/scripts/start_vendoo_debug_chrome.sh
NEXT_USER_STEP=Run $SKILLS_DIR/vendoo-export-dashboard/scripts/start_vendoo_debug_chrome.sh, sign into Vendoo in the opened Chrome window, then rerun $SKILLS_DIR/vendoo-export-dashboard/scripts/check_chrome_devtools_mcp.sh.
EOF
