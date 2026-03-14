# AGENTS.md

Use this guide when an OpenClaw agent installs or updates `vendoo-analytics` from a release asset, source bundle, or Git checkout.

## Fresh install workflow

1. Install the project
- Use the downloaded release or source bundle as the source of truth.
- Extract or clone it into the local OpenClaw workspace as `vendoo-analytics`.
- Treat this as a fresh install. Do not assume the repo, app, or skill already exists.

2. Install the skill
- Copy `skills/vendoo-export-dashboard` into the local OpenClaw workspace skills folder as `vendoo-export-dashboard`.
- Example destination: `~/.openclaw/workspace/skills/vendoo-export-dashboard`

3. Localize machine-specific paths before running anything
- The shipped skill still contains example `/Users/cris/...` paths from the original machine.
- Replace those paths with machine-local paths in:
  - `skills/vendoo-export-dashboard/SKILL.md`
  - `skills/vendoo-export-dashboard/references/runbook.md`
  - `skills/vendoo-export-dashboard/scripts/deploy_latest_vendoo_csv.sh`
  - `skills/vendoo-export-dashboard/scripts/restart_sales_dashboard.sh`
- The canonical analytics CSV target must be the local repo copy of `public/data/vendoo.csv`.

4. Install and launch the analytics app
- Run `npm install`.
- Run `npm run build`.
- Launch the app in the background with the repo's existing scripts, preferably `npm run start`.
- If port `3000` is unavailable, choose another open port and report it.
- Confirm the app is reachable before continuing.

5. Create the recurring OpenClaw cron job
- Use OpenClaw's native cron or scheduler only.
- Do not use system `crontab`.
- Create exactly one recurring job named `Daily Vendoo CSV export`.
- Use cron expression `0 23 * * *`.
- Use the local machine timezone.
- The job must run the Vendoo CSV export workflow, refresh the canonical analytics CSV target, and report the result back to the triggering Telegram chat or session.
- Avoid duplicate jobs.

## Update workflow

1. Update the local repo copy
- Download the latest release asset or pull the latest repository state into the existing local `vendoo-analytics` checkout.
- If the app is currently running, stop the existing process before replacing files or restarting it.

2. Preserve local machine state
- Keep the machine-local analytics CSV at `public/data/vendoo.csv` unless the update explicitly replaces it with a newer exported file.
- Preserve any machine-local path edits that were already made for the Vendoo export skill.
- Preserve any install-specific launch port or process manager choices unless the update requires a change.

3. Re-sync the skill if needed
- Compare the repo copy of `skills/vendoo-export-dashboard` with the installed workspace skill.
- If the repo copy changed, update the installed skill folder.
- Re-check the machine-local path substitutions after updating skill files.

4. Reinstall, rebuild, and relaunch
- Run `npm install` if dependencies changed.
- Run `npm run build`.
- Relaunch the app and confirm the chosen URL returns a successful response.

5. Validate the recurring export job
- Ensure there is still exactly one recurring native OpenClaw job named `Daily Vendoo CSV export`.
- Keep the schedule at `0 23 * * *` unless the operator explicitly changed it.
- If the install path or skill path changed, update the scheduled payload so it points at the correct local paths.
- Do not leave duplicate scheduled jobs behind.

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

## Required completion report

When the setup or update is complete, reply with:

1. install path
2. skill path
3. app launch command
4. app URL and port
5. cron job name
6. cron expression
7. exact OpenClaw scheduled payload
8. whether the analytics CSV target exists
9. whether this was a fresh install or an update
10. any blockers

## Stop conditions

Stop and report the exact blocker if any of these are true:
- the release or source bundle cannot be accessed
- GitHub access is missing
- required local paths cannot be determined
- Vendoo login is required before export can run
- the app cannot be launched after dependency install
