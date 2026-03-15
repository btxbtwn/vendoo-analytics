#!/usr/bin/env bash

openclaw_workspace_dir() {
  if [[ -n "${OPENCLAW_WORKSPACE_DIR:-}" ]]; then
    printf '%s\n' "$OPENCLAW_WORKSPACE_DIR"
  else
    printf '%s\n' "$HOME/.openclaw/workspace"
  fi
}

default_vendoo_analytics_repo_dir() {
  printf '%s/vendoo-analytics\n' "$(openclaw_workspace_dir)"
}

resolve_vendoo_analytics_repo_dir() {
  local explicit_dir="${VENDOO_ANALYTICS_REPO_DIR:-}"
  if [[ -n "$explicit_dir" ]]; then
    printf '%s\n' "$explicit_dir"
    return 0
  fi

  local repo_dir
  repo_dir="$(default_vendoo_analytics_repo_dir)"
  if [[ -f "$repo_dir/package.json" && -d "$repo_dir/public" ]]; then
    printf '%s\n' "$repo_dir"
    return 0
  fi

  return 1
}

require_vendoo_analytics_repo_dir() {
  local repo_dir
  repo_dir="$(resolve_vendoo_analytics_repo_dir)" || {
    echo "Unable to locate vendoo-analytics in the OpenClaw workspace." >&2
    echo "Expected: $(default_vendoo_analytics_repo_dir)" >&2
    echo "Install or extract vendoo-analytics there, or set VENDOO_ANALYTICS_REPO_DIR." >&2
    return 1
  }

  if [[ ! -f "$repo_dir/package.json" ]]; then
    echo "Vendoo analytics directory is missing package.json: $repo_dir" >&2
    return 1
  fi

  printf '%s\n' "$repo_dir"
}

vendoo_analytics_csv_target() {
  local repo_dir
  repo_dir="$(require_vendoo_analytics_repo_dir)" || return 1
  printf '%s\n' "${VENDOO_ANALYTICS_CSV_TARGET:-$repo_dir/public/data/vendoo.csv}"
}

vendoo_analytics_port() {
  printf '%s\n' "${VENDOO_ANALYTICS_PORT:-3000}"
}

vendoo_analytics_host() {
  printf '%s\n' "${VENDOO_ANALYTICS_HOST:-127.0.0.1}"
}

vendoo_analytics_url() {
  printf 'http://%s:%s\n' "$(vendoo_analytics_host)" "$(vendoo_analytics_port)"
}

chrome_debug_url() {
  printf '%s\n' "${VENDOO_CHROME_DEBUG_URL:-http://127.0.0.1:${VENDOO_CHROME_DEBUG_PORT:-9222}}"
}

require_chrome_binary() {
  local candidates=()

  case "$(uname -s)" in
    Darwin)
      candidates=(
        "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
        "$HOME/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
      )
      ;;
    Linux)
      candidates=("google-chrome" "google-chrome-stable" "chromium" "chromium-browser")
      ;;
  esac

  local candidate
  for candidate in "${candidates[@]}"; do
    if [[ -x "$candidate" ]]; then
      printf '%s\n' "$candidate"
      return 0
    fi
    if command -v "$candidate" >/dev/null 2>&1; then
      command -v "$candidate"
      return 0
    fi
  done

  echo "Google Chrome was not found. Install Chrome before using vendoo-export-dashboard." >&2
  return 1
}
