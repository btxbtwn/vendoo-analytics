# Vendoo Export + Vendoo Analytics Runbook

1. Install or extract `vendoo-analytics` into the OpenClaw workspace:
   - default repo path: `~/.openclaw/workspace/vendoo-analytics`
   - default skills path: `~/.openclaw/workspace/skills/`
   - use `VENDOO_ANALYTICS_REPO_DIR` only for non-standard installs
2. Verify Chrome DevTools MCP prerequisites and the active Chrome debug session:
   - From this skill directory: `./scripts/check_chrome_devtools_mcp.sh`
   - See `references/chrome-devtools-mcp-setup.md` for the full install and relaunch flow.
3. Use Chrome DevTools MCP for the Vendoo browser workflow.
   - Prefer the active local debug session at `http://127.0.0.1:9222` unless `VENDOO_CHROME_DEBUG_URL` overrides it.
   - If the user is not signed into Vendoo in that debug-enabled session, pause and have them sign in there.
4. Verify the new CSV appears in:
   - `~/.openclaw/browser/openclaw/Default/Downloads/`
   - Override with `VENDOO_EXPORT_DOWNLOAD_DIR` when needed.
5. Deploy the latest CSV to the workspace repo target:
   - `~/.openclaw/workspace/vendoo-analytics/public/data/vendoo.csv`
   - From this skill directory: `./scripts/deploy_latest_vendoo_csv.sh`
6. Start or restart the local analytics app only when needed:
   - From this skill directory: `./scripts/restart_vendoo_analytics.sh`
   - Default URL: `http://127.0.0.1:3000`
   - Override with `VENDOO_ANALYTICS_HOST`, `VENDOO_ANALYTICS_PORT`, or `VENDOO_ANALYTICS_LOG_FILE`.
7. Create or verify the native OpenClaw recurring job:
   - name: `Daily Vendoo CSV export`
   - cron: `0 23 * * *`
   - payload template: `references/openclaw-cron.example.json`
8. Validate the app URL, CSV timestamp, and export result.
