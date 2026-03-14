#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${VENDOO_ANALYTICS_URL:-http://127.0.0.1:3000}"
ENDPOINT="${BASE_URL%/}/api/morning-rundown?format=text"

if ! curl -fsS --connect-timeout 10 --max-time 30 "$ENDPOINT"; then
  echo "Unable to reach morning dashboard rundown endpoint at $ENDPOINT" >&2
  exit 1
fi
