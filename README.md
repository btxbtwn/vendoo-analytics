# Vendoo Analytics

A Next.js 16 dashboard for analyzing Vendoo marketplace exports. Displays revenue, profit, inventory, platform performance, and projections from a CSV file.

**Design:** Linear aesthetic — minimal sidebar, squared-off UI, dark theme, mobile bottom nav with Settings.

---

## Quick Start

```bash
npm install
npm run build
npm run start
# → http://localhost:3000
```

For hot-reload development:

```bash
npm run dev
```

---

## Data

The dashboard reads a Vendoo CSV export from:

```
public/data/vendoo.csv
```

Drop a fresh export there and reload. For automated daily exports, see [OpenClaw Automation](#openclaw-automation) below.

### CSV Fields Used

| Field | Description |
|---|---|
| `title` | Item title |
| `status` | Active / Sold / Draft |
| `price` | List price |
| `priceSold` | Sale price |
| `costOfGoods` | COGS |
| `marketplaceFees` | Platform fees |
| `shippingExpenses` | Shipping cost |
| `soldDate` | Date sold |
| `listedDate` | Date listed |
| `brand` | Brand name |
| `category` | Category |
| `labels` | Comma-separated labels |
| `tags` | Comma-separated tags |
| `soldPlatform` | Where it sold |
| `listingPlatforms` | Where it's listed |
| `quantitySold` | Units sold |
| `quantityLeft` | Units remaining |

---

## Architecture

```
src/
├── app/
│   ├── page.tsx               # Server component — loads CSV, renders Dashboard
│   └── api/morning-rundown/  # Morning briefing API endpoint
├── components/
│   ├── Dashboard.tsx           # Client shell — tab routing, layout
│   ├── layout/
│   │   ├── AppShell.tsx      # Sidebar + header wrapper
│   │   ├── Sidebar.tsx       # Desktop sidebar + mobile bottom nav
│   │   ├── Header.tsx        # Top bar with title, date picker, theme toggle
│   │   └── TabNav.tsx        # Pill tab switcher
│   ├── dashboard-tabs/
│   │   ├── OverviewPanel.tsx  # KPIs, charts, recent sales
│   │   ├── RevenuePanel.tsx   # Revenue/profit charts, period comparison
│   │   ├── PlatformsPanel.tsx  # Platform breakdown
│   │   ├── InventoryPanel.tsx # Inventory table, aging, cost summary
│   │   └── BrandsPanel.tsx    # Brand ROI, category breakdown
│   ├── ui/                    # Shared primitives (Badge, Button, Select, etc.)
│   └── *.tsx                  # Charts: Revenue, Platform, Brand, Projection, etc.
└── lib/
    ├── analytics.ts           # All data transformations and computations
    ├── types.ts               # TypeScript interfaces
    ├── AppContext.tsx         # Client-side state (theme, active tab, filters)
    ├── csv-loader.ts          # CSV file loading utilities
    ├── morning-rundown.ts     # Morning briefing text generator
    └── use-*.ts              # Custom hooks (theme, chart-ready)
```

### Data Flow

```
public/data/vendoo.csv
  → loadServerListings() [server-listings.ts]
  → page.tsx (server component)
  → <Dashboard initialListings={listings} />
  → AppContext (client state)
  → Tab panels (Overview, Revenue, Platforms, Inventory, Brands)
  → Charts (Recharts)
  → <KPICards /> (summary metrics)
```

### State Management

- **Server state:** CSV loaded once at page load via `loadServerListings()`
- **Client state:** `AppContext` — theme, active tab, date filter, label/tag filter
- **Panel filters:** Each tab panel has its own date filter passed as a prop

---

## OpenClaw Automation

Two skills ship with this repo and are synced into the OpenClaw workspace during install:

| Skill | Purpose |
|---|---|
| `vendoo-export-dashboard` | Chrome DevTools MCP — exports fresh CSV from Vendoo |
| `vendoo-daily-dashboard-rundown` | Morning briefing generator + delivery |

### Cron Jobs

| Job | Schedule | What it does |
|---|---|---|
| `Daily Vendoo CSV export` | `0 23 * * *` | Runs export skill, refreshes `public/data/vendoo.csv` |
| `Morning Vendoo Dashboard Rundown` | `0 8 * * *` | Fetches `/api/morning-rundown?format=text`, delivers to Telegram |

### Morning Rundown Endpoint

```
http://127.0.0.1:3000/api/morning-rundown?format=text
```

Returns plain text with: yesterday snapshot, 7-day pace, platform winners, label/tag movers, inventory watch, 30-day projector, and alerts.

---

## For Hermes Agents

The repo is cloned at `~/Developer/vendoo-analytics`. Skills live at `~/.hermes/skills/`.

### Install / Update

```bash
cd ~/Developer/vendoo-analytics && git pull origin main
```

### Start the App

```bash
# Local access only (127.0.0.1)
~/.hermes/skills/vendoo-export-dashboard/scripts/restart_vendoo_analytics.sh

# LAN access (mobile/other devices on the network)
HOST=0.0.0.0 PORT=3000 nohup npx next start --hostname 0.0.0.0 --port 3000 > ~/Developer/vendoo-analytics/next-start.log 2>&1 &
```

### Verify

```bash
curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:3000    # → 200
curl -s "http://127.0.0.1:3000/api/morning-rundown?format=text"  # → plain text
```

### Key Paths

```
~/Developer/vendoo-analytics/                        ← repo
~/.hermes/skills/vendoo-export-dashboard/           ← export skill
~/.hermes/skills/vendoo-daily-dashboard-rundown/    ← morning skill
~/Developer/vendoo-analytics/public/data/vendoo.csv ← CSV data
```

### Cron Jobs

| Job | Schedule | Payload |
|---|---|---|
| `Daily Vendoo CSV export` | `0 23 * * *` | `~/.hermes/skills/vendoo-export-dashboard/references/hermes-cron.example.json` |
| `Morning Vendoo Dashboard Rundown` | `0 8 * * *` | `~/.hermes/skills/vendoo-daily-dashboard-rundown/references/hermes-cron.example.json` |

Deliver morning cron to `telegram:8588506573`.

### Key Scripts

```bash
~/.hermes/skills/vendoo-export-dashboard/scripts/restart_vendoo_analytics.sh     # restart/start app
~/.hermes/skills/vendoo-export-dashboard/scripts/start_vendoo_debug_chrome.sh    # open Vendoo sign-in Chrome
~/.hermes/skills/vendoo-export-dashboard/scripts/check_chrome_devtools_mcp.sh   # check MCP
~/.hermes/skills/vendoo-daily-dashboard-rundown/scripts/get_morning_dashboard_rundown.sh  # manual rundown
```

### Mobile Access

App binds to `0.0.0.0` when started with `HOST=0.0.0.0`. Access from mobile at `http://192.168.0.186:3000`.

---

## For OpenClaw Agents

### Install or Update

This repo is designed to be installed by an OpenClaw agent using the shipped installer script. The script syncs the repo into the OpenClaw workspace, installs dependencies, starts the app, and wires the cron jobs.

```bash
# From the repo directory or a release asset
bash scripts/install_openclaw_workspace.sh
```

**Options:**

| Flag | Effect |
|---|---|
| `--skip-start` | Don't start the app after install |
| `--skip-build` | Skip `npm run build` |
| `--skip-npm` | Skip `npm install` |
| `--skip-skill-sync` | Don't sync skills into the OpenClaw workspace |
| `--launch-debug-chrome` | Open the Vendoo sign-in Chrome window after install |

**Environment variables:**

| Variable | Default | Description |
|---|---|---|
| `OPENCLAW_WORKSPACE_DIR` | `~/.openclaw/workspace` | Parent directory for repo + skills |
| `VENDOO_ANALYTICS_REPO_DIR` | `~/.openclaw/workspace/vendoo-analytics` | Repo install path |
| `VENDOO_ANALYTICS_HOST` | `127.0.0.1` | Interface the app binds to |
| `VENDOO_ANALYTICS_PORT` | `3000` | Port the app listens on |

### Key Paths After Install

```
~/.openclaw/workspace/vendoo-analytics/     ← repo root
~/.openclaw/workspace/skills/vendoo-export-dashboard/    ← export skill
~/.openclaw/workspace/skills/vendoo-daily-dashboard-rundown/  ← morning skill
~/.openclaw/workspace/vendoo-analytics/public/data/vendoo.csv  ← canonical CSV
```

### Post-Install Checklist

1. Run `start_vendoo_debug_chrome.sh` — opens a Chrome window for Vendoo sign-in
2. Tell the user to sign into Vendoo in that window
3. Run `check_chrome_devtools_mcp.sh` — verifies Chrome DevTools MCP is connected
4. Create `Daily Vendoo CSV export` cron job from the export skill's `openclaw-cron.example.json`
5. Create `Morning Vendoo Dashboard Rundown` cron job from the morning skill's `openclaw-cron.example.json`

### Update Workflow

When a new version is available:

```bash
bash scripts/install_openclaw_workspace.sh
```

The script preserves `public/data/vendoo.csv` across syncs. After updating, verify:
- App is reachable at `http://127.0.0.1:3000`
- Morning rundown endpoint responds at `/api/morning-rundown?format=text`
- Cron jobs are still present and have correct paths

### App URL

The app binds to `127.0.0.1` by default. For mobile access on the LAN, set `VENDOO_ANALYTICS_HOST=0.0.0.0` before starting, or restart with:

```bash
HOST=0.0.0.0 PORT=3000 npm run start
```

Then access from mobile at `http://<machine-ip>:3000`.

---

## Changelog

See [`CHANGELOG.md`](./CHANGELOG.md) for release history.
