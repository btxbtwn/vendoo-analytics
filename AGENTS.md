# AGENTS.md

Use this guide when an OpenClaw agent installs or updates `vendoo-analytics` from a release asset, source bundle, or Git checkout.

Default install target:

- repo: `~/.openclaw/workspace/vendoo-analytics`
- skills: `~/.openclaw/workspace/skills/`
- app URL: `http://127.0.0.1:3000`
- canonical CSV target: `~/.openclaw/workspace/vendoo-analytics/public/data/vendoo.csv`

## Fresh install workflow

1. Install the project
- Use the downloaded release or source bundle as the source of truth.
- Extract or clone it locally.
- Treat this as a fresh install. Do not assume the repo, app, or skill already exists.

2. Install into the OpenClaw workspace
- Run `bash scripts/install_openclaw_workspace.sh`.
- This syncs the repo into `~/.openclaw/workspace/vendoo-analytics` by default.
- This also syncs both shipped skills into `~/.openclaw/workspace/skills/`.
- This runs `npm install`, `npm run build`, and starts the app unless `--skip-start` is explicitly passed.
- For an interactive install, prefer `npm run openclaw:install:interactive` so the dedicated Vendoo sign-in window opens immediately.
- If this machine uses a non-standard location, set `OPENCLAW_WORKSPACE_DIR` or `VENDOO_ANALYTICS_REPO_DIR` before running the installer.

3. Verify app health
- Confirm the app is reachable at `http://127.0.0.1:3000` unless the install explicitly chose another host or port.
- If port `3000` is unavailable, choose another open port, restart the app, and report the actual local URL.

4. Verify Chrome DevTools MCP readiness for export
- During interactive setup, run `~/.openclaw/workspace/skills/vendoo-export-dashboard/scripts/start_vendoo_debug_chrome.sh` immediately after install if the installer did not already do it.
- Tell the user to sign into Vendoo in the opened Chrome window right away.
- Run `~/.openclaw/workspace/skills/vendoo-export-dashboard/scripts/check_chrome_devtools_mcp.sh`.
- If Node.js, npm, npx, or Chrome are missing, install them or report the exact blocker.
- If Chrome was not launched with remote debugging, use the shipped launcher script before falling back to manual relaunch instructions.
- If Vendoo is not signed into the debug-enabled Chrome session, pause and have the user sign in there before continuing.

5. Create the nightly export cron job
- Use OpenClaw's native cron or scheduler only.
- Do not use system `crontab`.
- Create exactly one recurring job named `Daily Vendoo CSV export`.
- Use cron expression `0 23 * * *`.
- Use the local machine timezone.
- The job must run the Vendoo CSV export workflow, refresh the canonical analytics CSV target, and report the result back to the triggering Telegram chat or session.
- Use the template at `~/.openclaw/workspace/skills/vendoo-export-dashboard/references/openclaw-cron.example.json`.
- Avoid duplicate jobs.

6. Create the morning dashboard rundown cron job
- Create exactly one recurring job named `Morning Vendoo Dashboard Rundown`.
- Recommended cron expression: `0 8 * * *`.
- Use the local machine timezone.
- This job depends on the nightly export pipeline having already refreshed `public/data/vendoo.csv`.
- The job should run the `vendoo-daily-dashboard-rundown` skill and send the balanced morning briefing back to the same chat or session.
- Prefer the local dashboard endpoint `http://127.0.0.1:3000/api/morning-rundown?format=text` unless the app uses another local URL.
- If the app is unavailable or the CSV is stale, the morning job must say that clearly instead of pretending the report is current.
- Avoid duplicate jobs.
- Use the template at `~/.openclaw/workspace/skills/vendoo-daily-dashboard-rundown/references/openclaw-cron.example.json`.

## Update workflow

1. Update the local repo copy
- Download the latest release asset or pull the latest repository state.
- Re-run `bash scripts/install_openclaw_workspace.sh`.
- This preserves the installed repo path in the OpenClaw workspace and keeps the canonical CSV target at `public/data/vendoo.csv`.

2. Validate both recurring jobs
- Ensure there is still exactly one recurring native OpenClaw job named `Daily Vendoo CSV export`.
- Ensure there is still exactly one recurring native OpenClaw job named `Morning Vendoo Dashboard Rundown`.
- Keep the export schedule at `0 23 * * *` unless the operator explicitly changed it.
- Keep the morning rundown schedule at the chosen morning time unless the operator explicitly changed it.
- If the install path, skill path, or app URL changed, update the scheduled payloads so they point at the correct local paths and local URL.
- Do not leave duplicate scheduled jobs behind.

3. Re-check export readiness
- If the operator wants to finish setup immediately, run `~/.openclaw/workspace/skills/vendoo-export-dashboard/scripts/start_vendoo_debug_chrome.sh` and have them sign in right away.
- Re-run `~/.openclaw/workspace/skills/vendoo-export-dashboard/scripts/check_chrome_devtools_mcp.sh`.
- If Chrome debug setup changed or expired, guide the user through the exact relaunch/sign-in step still needed.

## Morning rundown contents

The default morning briefing should be a balanced rundown with:
- yesterday snapshot: sold items, revenue, profit, new listings
- recent pace: last 7-day sales, revenue, profit, and listing activity
- platform winners: recent revenue leader, recent profit leader, and quiet platforms
- label/tag movers: top recent labels and tags
- inventory watch: active listings, drafts, sell-through, and recent listing pace
- forward look: current 30-day revenue/profit projector snapshot
- alerts: stale CSV, no-sales/no-listings, negative-profit warnings, and similar issues

## Release-specific expectations for v.1.1.0

After updating to `v.1.1.0`, verify these features are present:
- slimmer mobile top header
- desktop sidebar collapsed by default and slimmer when opened
- aligned snapshot metrics at the top of the dashboard
- per-tab date filters
- platform-aware label/tag comparison with multi-select versus views
- `Inventory Status` only in Inventory
- `Sales by Category` only in Revenue
- revenue and profit projector controls

## Release-specific expectations for v.1.2.0

After updating to `v.1.2.0`, verify these features are present:
- repo-shipped `vendoo-daily-dashboard-rundown` skill exists in the repo and local workspace skill folder
- local morning briefing endpoint responds at `/api/morning-rundown?format=text` on the configured local app URL
- the morning briefing includes yesterday snapshot, 7-day pace, platform winners, label/tag movers, inventory watch, 30-day projector, and alerts
- exactly one native OpenClaw job exists for `Morning Vendoo Dashboard Rundown`
- the morning job runs after the nightly CSV export job and reports stale-data problems clearly

## Release-specific expectations for v.1.2.1

After updating to `v.1.2.1`, verify these features are present:
- repo installer script exists at `scripts/install_openclaw_workspace.sh`
- running that installer places the repo at `~/.openclaw/workspace/vendoo-analytics` by default
- both shipped skills are synced into `~/.openclaw/workspace/skills/`
- `vendoo-export-dashboard` is Chrome DevTools MCP-first and includes a readiness check script
- the repo also ships a debug Chrome launcher for immediate Vendoo sign-in
- the export cron payload template exists at `~/.openclaw/workspace/skills/vendoo-export-dashboard/references/openclaw-cron.example.json`
- the canonical analytics CSV target is `~/.openclaw/workspace/vendoo-analytics/public/data/vendoo.csv`

## Required completion report

When the setup or update is complete, reply with:

1. install path
2. skill paths
3. app launch command
4. app URL and port
5. export cron job name
6. export cron expression
7. morning rundown cron job name
8. morning rundown cron expression
9. exact OpenClaw scheduled payloads for both jobs
10. whether the analytics CSV target exists
11. whether this was a fresh install or an update
12. any blockers

## Stop conditions

Stop and report the exact blocker if any of these are true:
- the release or source bundle cannot be accessed
- GitHub access is missing
- required local paths cannot be determined
- Vendoo login is required before export can run
- the app cannot be launched after dependency install
- the morning rundown endpoint cannot be reached and the local app URL cannot be determined
