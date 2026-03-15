#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/dashboard_paths.sh"

DEBUG_URL="$(chrome_debug_url)"
REPO_DIR="$(resolve_vendoo_analytics_repo_dir || true)"
DEFAULT_REPO_DIR="$(default_vendoo_analytics_repo_dir)"
REPO_MISSING="false"

require_command() {
  local cmd="$1"
  local hint="$2"
  if ! command -v "$cmd" >/dev/null 2>&1; then
    echo "Missing required command: $cmd" >&2
    echo "$hint" >&2
    exit 1
  fi
}

require_command "curl" "Install curl before using this skill."
require_command "node" "Install Node.js 20.19+ before using Chrome DevTools MCP."
require_command "npm" "Install npm together with Node.js before using Chrome DevTools MCP."
require_command "npx" "Install npm/npx together with Node.js before using Chrome DevTools MCP."

CHROME_BIN="$(require_chrome_binary)"

echo "NODE_VERSION=$(node --version)"
echo "NPM_VERSION=$(npm --version)"
echo "NPX_VERSION=$(npx --version)"
echo "CHROME_BINARY=$CHROME_BIN"
echo "CHROME_DEBUG_URL=$DEBUG_URL"
echo "DEFAULT_VENDOO_ANALYTICS_REPO_DIR=$DEFAULT_REPO_DIR"

if [[ -n "$REPO_DIR" ]]; then
  echo "VENDOO_ANALYTICS_REPO_DIR=$REPO_DIR"
  echo "VENDOO_ANALYTICS_CSV_TARGET=$(vendoo_analytics_csv_target)"
  echo "VENDOO_ANALYTICS_APP_URL=$(vendoo_analytics_url)"
else
  echo "VENDOO_ANALYTICS_REPO_DIR_MISSING=true"
  echo "Install or extract vendoo-analytics into $DEFAULT_REPO_DIR before continuing." >&2
  REPO_MISSING="true"
fi

if ! npx -y chrome-devtools-mcp@latest --help >/dev/null 2>&1; then
  echo "Unable to download or start chrome-devtools-mcp via npx." >&2
  echo "Check your Node.js installation and npm registry access, then try again." >&2
  exit 1
fi

echo "MCP_PACKAGE_READY=true"
echo "MCP_SERVER_NAME=chrome-devtools"
echo "MCP_SERVER_COMMAND=npx -y chrome-devtools-mcp@latest --browser-url=$DEBUG_URL"

VERSION_JSON="$(curl -fsS --connect-timeout 3 --max-time 5 "$DEBUG_URL/json/version" || true)"
if [[ -z "$VERSION_JSON" ]]; then
  echo "CHROME_DEBUG_SESSION=false" >&2
  cat >&2 <<EOF
No active Chrome remote-debugging session was found at $DEBUG_URL.

To finish setup:
1. Close the Chrome window you want the agent to control, or launch a separate Chrome window just for Vendoo automation.
2. Start Chrome with remote debugging enabled:
   "$CHROME_BIN" --remote-debugging-port=${VENDOO_CHROME_DEBUG_PORT:-9222} --remote-debugging-address=127.0.0.1 --user-data-dir="$HOME/.openclaw/browser/vendoo-mcp-profile"
3. Open Vendoo in that Chrome window and sign in if needed.
4. Re-run ./scripts/check_chrome_devtools_mcp.sh.
5. Connect the MCP server with:
   npx -y chrome-devtools-mcp@latest --browser-url=$DEBUG_URL

Note: Recent Chrome versions may refuse attaching DevTools automation to your default profile unless remote debugging was enabled at launch time. Use the dedicated profile above when needed.
EOF
  exit 1
fi

echo "CHROME_DEBUG_SESSION=true"
echo "CHROME_BROWSER_VERSION=$(node -e 'const data = JSON.parse(process.argv[1]); process.stdout.write(data.Browser || "unknown");' "$VERSION_JSON")"
echo "CHROME_WEBSOCKET_DEBUGGER_URL=$(node -e 'const data = JSON.parse(process.argv[1]); process.stdout.write(data.webSocketDebuggerUrl || "");' "$VERSION_JSON")"

if [[ "$REPO_MISSING" == "true" ]]; then
  echo "READY_FOR_VENDOO_EXPORT=false" >&2
  echo "Vendoo export is blocked until vendoo-analytics is installed at $DEFAULT_REPO_DIR or VENDOO_ANALYTICS_REPO_DIR is set." >&2
  exit 1
fi

echo "READY_FOR_VENDOO_EXPORT=true"
