# AGENTS.md — Vendoo Analytics

Use this guide when installing or updating `vendoo-analytics` from a release asset, source bundle, or Git checkout.

---

## Hermes Agent

### Defaults

| Setting | Value |
|---|---|
| Repo path | `~/Developer/vendoo-analytics` |
| Skills path | `~/.hermes/skills/` |
| App URL | `http://127.0.0.1:3000` (LAN: `http://192.168.0.186:3000`) |
| CSV target | `~/Developer/vendoo-analytics/public/data/vendoo.csv` |

### Install / Update

The repo is already cloned at `~/Developer/vendoo-analytics`. Skills are already at `~/.hermes/skills/`.

```bash
# Pull latest changes
cd ~/Developer/vendoo-analytics && git pull origin main

# Install deps if needed
npm install

# Rebuild if needed
npm run build
```

### Start the App

```bash
# Local access only (127.0.0.1)
~/.hermes/skills/vendoo-export-dashboard/scripts/restart_vendoo_analytics.sh

# LAN access (for mobile/other devices)
HOST=0.0.0.0 PORT=3000 nohup npx next start --hostname 0.0.0.0 --port 3000 > ~/Developer/vendoo-analytics/next-start.log 2>&1 &
sleep 3 && curl -fsS --connect-timeout 5 http://192.168.0.186:3000 > /dev/null && echo "Running at http://192.168.0.186:3000"
```

### Verify

- `curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:3000` → `200`
- `curl -s "http://127.0.0.1:3000/api/morning-rundown?format=text"` → plain text response

### Cron Jobs

| Job | Schedule | Payload |
|---|---|---|
| `Daily Vendoo CSV export` | `0 23 * * *` | `~/.hermes/skills/vendoo-export-dashboard/references/hermes-cron.example.json` |
| `Morning Vendoo Dashboard Rundown` | `0 8 * * *` | `~/.hermes/skills/vendoo-daily-dashboard-rundown/references/hermes-cron.example.json` |

Both use the local machine timezone. Deliver to `telegram:8588506573` (Cristian's Telegram).

### Key Scripts

```bash
# Restart / start the app
~/.hermes/skills/vendoo-export-dashboard/scripts/restart_vendoo_analytics.sh

# Open debug Chrome for Vendoo sign-in
~/.hermes/skills/vendoo-export-dashboard/scripts/start_vendoo_debug_chrome.sh

# Check Chrome DevTools MCP status
~/.hermes/skills/vendoo-export-dashboard/scripts/check_chrome_devtools_mcp.sh

# Morning rundown (manual)
~/.hermes/skills/vendoo-daily-dashboard-rundown/scripts/get_morning_dashboard_rundown.sh
```

### Mobile Access

The app binds to `0.0.0.0` when started with `HOST=0.0.0.0`. Access from mobile at `http://192.168.0.186:3000`.

---

## OpenClaw Agent

### Defaults

| Setting | Value |
|---|---|
| Repo install path | `~/.openclaw/workspace/vendoo-analytics` |
| Skills path | `~/.openclaw/workspace/skills/` |
| App URL | `http://127.0.0.1:3000` |
| CSV target | `~/.openclaw/workspace/vendoo-analytics/public/data/vendoo.csv` |

### Install / Update

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

### Post-Install Chrome Setup

1. `start_vendoo_debug_chrome.sh` — opens a Chrome window for Vendoo sign-in
2. Tell the user to sign into Vendoo in that window
3. `check_chrome_devtools_mcp.sh` — verifies Chrome DevTools MCP is connected

### Cron Jobs

After install, create exactly one of each:

| Job | Schedule | Payload template |
|---|---|---|
| `Daily Vendoo CSV export` | `0 23 * * *` | `skills/vendoo-export-dashboard/references/openclaw-cron.example.json` |
| `Morning Vendoo Dashboard Rundown` | `0 8 * * *` | `skills/vendoo-daily-dashboard-rundown/references/openclaw-cron.example.json` |

Both use the local machine timezone. Do not use system `crontab`.

### Mobile Access

Default app binds to `127.0.0.1`. For LAN access on mobile, restart with:

```bash
HOST=0.0.0.0 PORT=3000 npm run start
```

Access at `http://<machine-ip>:3000`.

---

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
