---
name: vendoo-export-dashboard
description: Use Chrome DevTools MCP to export the latest Vendoo CSV, publish it into the local vendoo-analytics repo, and verify dashboard freshness. Use when the user asks to pull latest Vendoo data, update vendoo-analytics CSV data, set up the export workflow, or verify sales data freshness.
---

# Vendoo Export Dashboard

Use Chrome DevTools MCP first. The target app repo is `vendoo-analytics`.

## Workflow

1. Resolve the local install
- Install or extract the `vendoo-analytics` repo into the OpenClaw workspace at:
  - `~/.openclaw/workspace/vendoo-analytics`
- The scripts treat `$OPENCLAW_WORKSPACE_DIR/vendoo-analytics` as the default install location.
- Use `VENDOO_ANALYTICS_REPO_DIR` only if this machine intentionally uses a non-standard location.
- Canonical CSV target is `public/data/vendoo.csv` inside the detected repo.
- Default canonical file path is `~/.openclaw/workspace/vendoo-analytics/public/data/vendoo.csv`.
- Default local app URL is `http://127.0.0.1:3000` unless `VENDOO_ANALYTICS_HOST` or `VENDOO_ANALYTICS_PORT` overrides it.

2. Ensure Chrome DevTools MCP is ready
- For interactive installs or first-time setup, run `./scripts/start_vendoo_debug_chrome.sh` right away so the user can sign into Vendoo immediately.
- Run `./scripts/check_chrome_devtools_mcp.sh`.
- Prefer a configured MCP server named `chrome-devtools`.
- If Node/npm/npx are present but the MCP package is not cached yet, let the agent bootstrap it with:
  - `npx -y chrome-devtools-mcp@latest --help`
- Prefer attaching to the active local Chrome debug session at `http://127.0.0.1:9222`, or use `VENDOO_CHROME_DEBUG_URL` / `VENDOO_CHROME_DEBUG_PORT`.
- If the current Chrome window is not exposing remote debugging yet, guide the user to relaunch Chrome with remote debugging or do the agent-doable setup first. Do not ask the user for browser credentials.
- See `references/chrome-devtools-mcp-setup.md` for the full install-or-guide flow.

3. Export the CSV with MCP
- Connect to the active Chrome debug session through Chrome DevTools MCP.
- Open `https://web.vendoo.co/app/settings/#export-csv`.
- Ensure `All Inventory` is selected so export can run.
- Click `Generate CSV`, wait for the download control, and download the export.
- If the user is not already signed into Vendoo inside the debug-enabled Chrome session, stop and tell them to sign in there before continuing.

4. Publish the latest CSV
- Run `./scripts/deploy_latest_vendoo_csv.sh`.
- This copies the newest downloaded CSV to the stable target inside the workspace checkout:
  - `~/.openclaw/workspace/vendoo-analytics/public/data/vendoo.csv`

5. Ensure the local analytics app is reachable
- Only restart when the app is not already reachable or when install/update work requires it.
- Use `./scripts/restart_vendoo_analytics.sh`.
- Default launch command is `npm run start -- --hostname 127.0.0.1 --port 3000`.

6. Verify freshness
- Confirm newest CSV modified timestamp.
- Confirm the local analytics URL is reachable.
- Report success/failure + what changed.

## Fast commands

- Check MCP readiness:
  - `./scripts/start_vendoo_debug_chrome.sh`
  - `./scripts/check_chrome_devtools_mcp.sh`

- From this skill directory, deploy + ensure app only:
  - `./scripts/deploy_latest_vendoo_csv.sh`
  - `./scripts/restart_vendoo_analytics.sh`

## Notes

- Use Chrome DevTools MCP instead of unrelated browser tooling when possible.
- If the active Chrome debug endpoint is unavailable, report the exact setup step still needed instead of pretending export can continue.
- If no new CSV exists, report clearly and do not claim refresh.
- OpenClaw workspace is the canonical install home for this setup: repo at `~/.openclaw/workspace/vendoo-analytics`, skills at `~/.openclaw/workspace/skills/`.
- `VENDOO_EXPORT_DOWNLOAD_DIR` overrides the default download source of `~/.openclaw/browser/openclaw/Default/Downloads`.
- Released installs should use the bundled scripts and cron templates above; they resolve install-specific paths automatically and avoid checkout-specific absolute paths.
- For a native OpenClaw cron payload template, see `references/openclaw-cron.example.json`.
