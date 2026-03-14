# AGENTS.md

Follow these instructions when an OpenClaw agent downloads a fresh release or source bundle of this repository.

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

## Required completion report

When the setup is complete, reply with:

1. install path
2. skill path
3. app launch command
4. app URL and port
5. cron job name
6. cron expression
7. exact OpenClaw scheduled payload
8. whether the analytics CSV target exists
9. any blockers

## Stop conditions

Stop and report the exact blocker if any of these are true:

- the release or source bundle cannot be accessed
- GitHub access is missing
- required local paths cannot be determined
- Vendoo login is required before export can run
- the app cannot be launched after dependency install
