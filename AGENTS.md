# AGENTS.md — Vendoo Analytics for OpenClaw Agents

Use this guide when installing or updating `vendoo-analytics` from a release asset, source bundle, or Git checkout.

## Defaults

| Setting | Value |
|---|---|
| Repo install path | `~/.openclaw/workspace/vendoo-analytics` |
| Skills path | `~/.openclaw/workspace/skills/` |
| App URL | `http://127.0.0.1:3000` |
| CSV target | `~/.openclaw/workspace/vendoo-analytics/public/data/vendoo.csv` |

## Install

```bash
bash scripts/install_openclaw_workspace.sh
```

This script:
1. Syncs the repo into `~/.openclaw/workspace/vendoo-analytics` (preserves `vendoo.csv`)
2. Syncs both shipped skills into `~/.openclaw/workspace/skills/`
3. Runs `npm install && npm run build`
4. Starts the app on `127.0.0.1:3000`

**Options:** `--skip-start`, `--skip-build`, `--skip-npm`, `--skip-skill-sync`, `--launch-debug-chrome`

**Env vars:** `OPENCLAW_WORKSPACE_DIR`, `VENDOO_ANALYTICS_REPO_DIR`, `VENDOO_ANALYTICS_HOST`, `VENDOO_ANALYTICS_PORT`

## Post-Install Chrome Setup

1. `start_vendoo_debug_chrome.sh` — opens a Chrome window for Vendoo sign-in
2. Tell the user to sign into Vendoo in that window
3. `check_chrome_devtools_mcp.sh` — verifies export MCP is connected

## Cron Jobs

After install, create exactly one of each:

| Job | Schedule | Payload template |
|---|---|---|
| `Daily Vendoo CSV export` | `0 23 * * *` | `skills/vendoo-export-dashboard/references/openclaw-cron.example.json` |
| `Morning Vendoo Dashboard Rundown` | `0 8 * * *` | `skills/vendoo-daily-dashboard-rundown/references/openclaw-cron.example.json` |

Both use the local machine timezone. Do not use system `crontab`.

## Update

```bash
bash scripts/install_openclaw_workspace.sh
```

Safe to re-run — the script preserves `public/data/vendoo.csv`. After update:
- Confirm app is reachable at `http://127.0.0.1:3000`
- Confirm `/api/morning-rundown?format=text` responds
- Confirm both cron jobs still exist with correct paths

## Mobile Access

Default app binds to `127.0.0.1`. For LAN access on mobile, restart with:

```bash
HOST=0.0.0.0 PORT=3000 npm run start
```

Access at `http://<machine-ip>:3000`.

## Completion Report

When done, reply with:

1. Repo install path
2. Skill paths
3. App URL and port
4. Whether app is running
5. Export cron job name and schedule
6. Morning cron job name and schedule
7. Whether Chrome DevTools MCP check passed
8. Any blockers

## Stop Conditions

Stop and report the blocker if:
- Release or source cannot be accessed
- GitHub access is missing
- App cannot be launched after dependency install
- Morning rundown endpoint is unreachable
- Vendoo login is required before export can run
