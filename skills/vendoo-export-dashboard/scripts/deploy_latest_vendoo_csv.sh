#!/usr/bin/env bash
set -euo pipefail

SRC_DIR="$HOME/.openclaw/browser/openclaw/Default/Downloads"
DST_DIR="/Users/cris/openclaw/sales_dashboard"

mkdir -p "$DST_DIR"

LATEST_CSV="$(ls -t "$SRC_DIR"/*.csv 2>/dev/null | head -n 1 || true)"
if [[ -z "$LATEST_CSV" ]]; then
  echo "No CSV found in $SRC_DIR"
  exit 1
fi

cp "$LATEST_CSV" "$DST_DIR/"
echo "Deployed: $(basename "$LATEST_CSV") -> $DST_DIR"
stat -f "Modified: %Sm" -t "%Y-%m-%d %H:%M:%S" "$LATEST_CSV"
