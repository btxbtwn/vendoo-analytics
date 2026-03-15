#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/dashboard_paths.sh"

SRC_DIR="${VENDOO_EXPORT_DOWNLOAD_DIR:-$HOME/.openclaw/browser/openclaw/Default/Downloads}"
REPO_DIR="$(require_vendoo_analytics_repo_dir)"
DST_FILE="$(vendoo_analytics_csv_target)"

if [[ ! -d "$SRC_DIR" ]]; then
  echo "Missing Vendoo export download directory: $SRC_DIR" >&2
  exit 1
fi

LATEST_CSV="$(ls -t "$SRC_DIR"/*.csv 2>/dev/null | head -n 1 || true)"
if [[ -z "$LATEST_CSV" ]]; then
  echo "No CSV found in $SRC_DIR" >&2
  exit 1
fi

mkdir -p "$(dirname "$DST_FILE")"
cp "$LATEST_CSV" "$DST_FILE"
echo "Deployed: $(basename "$LATEST_CSV") -> $DST_FILE"
echo "Repo: $REPO_DIR"
stat -f "Modified: %Sm" -t "%Y-%m-%d %H:%M:%S" "$LATEST_CSV"
