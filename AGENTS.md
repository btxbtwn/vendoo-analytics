# AGENTS.md

Use this guide when an OpenClaw agent installs or updates `vendoo-analytics` from a release asset, source bundle, or Git checkout.

## Fresh install workflow

1. Install the project
- Use the downloaded release or source bundle as the source of truth.
- Extract or clone it into the local OpenClaw workspace as `vendoo-analytics`.
- Treat this as a fresh install. Do not assume the repo, app, or skill already exists.

2. Install the skills
- Copy `skills/vendoo-export-dashboard` into the local OpenClaw workspace skills folder as `vendoo-export-dashboard`.
- Copy `skills/vendoo-daily-dashboard-rundown` into the local OpenClaw workspace skills folder as `vendoo-daily-dashboard-rundown`.
- Example destination root: `~/.openclaw/workspace/skills/`

3. Localize machine-specific paths before running anything
- The export skill still contains example `/Users/cris/...` paths from the original machine.
- Replace those paths with machine-local paths in:
  - `skills/vendoo-export-dashboard/SKILL.md`
  - `skills/vendoo-export-dashboard/references/runbook.md`
  - `skills/vendoo-export-dashboard/scripts/deploy_latest_vendoo_csv.sh`
  - `skills/vendoo-export-dashboard/scripts/restart_sales_dashboard.sh`
- The canonical analytics CSV target must be the local repo copy of `public/data/vendoo.csv`.
- If the analytics app does not run on `http://127.0.0.1:3000`, set the morning-rundown skill's `VENDOO_ANALYTICS_URL` environment override or adjust the cron payload accordingly.

4. Install and launch the analytics app
- Run `npm install`.
- Run `npm run build`.
- Launch the app in the background with the repo's existing scripts, preferably `npm run start`.
- If port `3000` is unavailable, choose another open port and report it.
- Confirm the app is reachable before continuing.

5. Create the nightly export cron job
- Use OpenClaw's native cron or scheduler only.
- Do not use system `crontab`.
- Create exactly one recurring job named `Daily Vendoo CSV export`.
- Use cron expression `0 23 * * *`.
- Use the local machine timezone.
- The job must run the Vendoo CSV export workflow, refresh the canonical analytics CSV target, and report the result back to the triggering Telegram chat or session.
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
- See `skills/vendoo-daily-dashboard-rundown/references/openclaw-cron.example.json` for a payload template.

## Update workflow

1. Update the local repo copy
- Download the latest release asset or pull the latest repository state into the existing local `vendoo-analytics` checkout.
- If the app is currently running, stop the existing process before replacing files or restarting it.

2. Preserve local machine state
- Keep the machine-local analytics CSV at `public/data/vendoo.csv` unless the update explicitly replaces it with a newer exported file.
- Preserve any machine-local path edits that were already made for the Vendoo export skill.
- Preserve any install-specific launch port or process manager choices unless the update requires a change.

3. Re-sync the skills if needed
- Compare the repo copies of `skills/vendoo-export-dashboard` and `skills/vendoo-daily-dashboard-rundown` with the installed workspace skills.
- If either repo copy changed, update the installed skill folder.
- Re-check the machine-local path substitutions after updating the export skill files.
- Re-check `VENDOO_ANALYTICS_URL` if the app URL or port changed.

4. Reinstall, rebuild, and relaunch
- Run `npm install` if dependencies changed.
- Run `npm run build`.
- Relaunch the app and confirm the chosen URL returns a successful response.

5. Validate both recurring jobs
- Ensure there is still exactly one recurring native OpenClaw job named `Daily Vendoo CSV export`.
- Ensure there is still exactly one recurring native OpenClaw job named `Morning Vendoo Dashboard Rundown`.
- Keep the export schedule at `0 23 * * *` unless the operator explicitly changed it.
- Keep the morning rundown schedule at the chosen morning time unless the operator explicitly changed it.
- If the install path, skill path, or app URL changed, update the scheduled payloads so they point at the correct local paths and local URL.
- Do not leave duplicate scheduled jobs behind.

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
