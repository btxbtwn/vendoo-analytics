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

Hot-reload development: `npm run dev`

---

## Data

The dashboard reads from `public/data/vendoo.csv`. Drop a fresh Vendoo export there and reload the page.

### CSV Columns

These are the actual CSV header names from a Vendoo export:

| CSV Header | Type | Description |
|---|---|---|
| `Title` | text | Item title |
| `Status` | text | Active / Sold / Draft |
| `Price` | number | List price |
| `Price Sold` | number | Sale price |
| `Cost of Goods` | number | COGS |
| `Marketplace Fees` | number | Platform fees |
| `Shipping Expenses` | number | Shipping cost |
| `Sold Date` | date | Date sold |
| `Listed Date` | date | Date listed |
| `Shipped Date` | date | Date shipped |
| `Brand` | text | Brand name |
| `Category` | text | Category |
| `Labels` | text | Comma-separated labels |
| `Tags` | text | Comma-separated tags |
| `Condition` | text | Item condition (New, Used, etc.) |
| `Description` | text | Item description |
| `Sku` | text | SKU |
| `Primary Color` | text | Primary color |
| `Secondary Color` | text | Secondary color |
| `Images` | text | Image URLs |
| `Internal Notes` | text | Private notes |
| `Listing Platforms` | text | Where it's listed |
| `Sold Platform` | text | Where it sold |
| `Quantity Left` | number | Units remaining |
| `Quantity Sold` | number | Units sold |

---

## Architecture

```
src/
├── app/
│   ├── page.tsx                  # Server component — loads CSV, renders Dashboard
│   └── api/morning-rundown/     # Morning briefing API endpoint
├── components/
│   ├── Dashboard.tsx             # Client shell — tab routing, layout
│   ├── layout/
│   │   ├── AppShell.tsx         # Sidebar + header wrapper
│   │   ├── Sidebar.tsx          # Desktop sidebar + mobile bottom nav
│   │   ├── Header.tsx           # Top bar with title, date picker, theme toggle
│   │   └── TabNav.tsx           # Pill tab switcher
│   ├── dashboard-tabs/
│   │   ├── OverviewPanel.tsx    # KPIs, charts, recent sales
│   │   ├── RevenuePanel.tsx     # Revenue/profit charts, period comparison
│   │   ├── PlatformsPanel.tsx   # Platform breakdown
│   │   ├── InventoryPanel.tsx  # Inventory table, aging, cost summary
│   │   └── BrandsPanel.tsx      # Brand ROI, category breakdown
│   └── ui/                      # Shared primitives (Badge, Button, Select, etc.)
└── lib/
    ├── analytics.ts              # All data transformations and computations
    ├── types.ts                  # TypeScript interfaces
    ├── server-listings.ts        # CSV loading (server-side)
    ├── csv-loader.ts             # CSV file loading utilities
    ├── morning-rundown.ts        # Morning briefing text generator
    └── *.ts                      # AppContext, hooks, motion, design tokens
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

- **Server:** CSV loaded once at page load via `loadServerListings()`
- **Client:** `AppContext` — theme, active tab, date filter, label/tag filter
- **Panel filters:** Each tab panel has its own date filter passed as a prop

---

## Automation

Two skills ship with this repo:

| Skill | Purpose | Location |
|---|---|---|
| `vendoo-export-dashboard` | Chrome DevTools MCP — exports fresh CSV from Vendoo | `~/.hermes/skills/` or OpenClaw skills |
| `vendoo-daily-dashboard-rundown` | Morning briefing generator + delivery | `~/.hermes/skills/` or OpenClaw skills |

### Cron Jobs

| Job | Schedule | What it does |
|---|---|---|
| `Daily Vendoo CSV export` | `0 23 * * *` | Runs export skill, refreshes `public/data/vendoo.csv` |
| `Morning Vendoo Dashboard Rundown` | `0 8 * * *` | Fetches morning rundown, delivers to Telegram |

### Morning Rundown Endpoint

```
http://127.0.0.1:3000/api/morning-rundown?format=text
```

Returns plain text: yesterday snapshot, 7-day pace, platform winners, label/tag movers, inventory watch, 30-day projector, and alerts.

### Key Scripts

```bash
restart_vendoo_analytics.sh     # Start or restart the app
start_vendoo_debug_chrome.sh     # Open Chrome for Vendoo sign-in
check_chrome_devtools_mcp.sh    # Verify Chrome DevTools MCP is connected
get_morning_dashboard_rundown.sh # Fetch morning rundown manually
```

Paths: `~/.hermes/skills/vendoo-export-dashboard/scripts/` and `~/.hermes/skills/vendoo-daily-dashboard-rundown/scripts/`

### Mobile Access

The app binds to `0.0.0.0` when started with `HOST=0.0.0.0`. Access from mobile at `http://192.168.0.186:3000`.

---

## For Hermes Agents

**Repo:** `~/Developer/vendoo-analytics`
**Skills:** `~/.hermes/skills/`
**CSV:** `~/Developer/vendoo-analytics/public/data/vendoo.csv`

### Install / Update

```bash
cd ~/Developer/vendoo-analytics && git pull origin main
```

### Start the App

```bash
# Local access (127.0.0.1)
~/.hermes/skills/vendoo-export-dashboard/scripts/restart_vendoo_analytics.sh

# LAN / mobile access
HOST=0.0.0.0 PORT=3000 nohup npx next start --hostname 0.0.0.0 --port 3000 \
  > ~/Developer/vendoo-analytics/next-start.log 2>&1 &
```

### Verify

```bash
curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:3000    # → 200
curl -s "http://127.0.0.1:3000/api/morning-rundown?format=text"   # → plain text
```

### Cron Job Payloads

| Job | Payload |
|---|---|
| `Daily Vendoo CSV export` | `~/.hermes/skills/vendoo-export-dashboard/references/hermes-cron.example.json` |
| `Morning Vendoo Dashboard Rundown` | `~/.hermes/skills/vendoo-daily-dashboard-rundown/references/hermes-cron.example.json` |

Deliver morning cron to `telegram:8588506573`.

---

## For OpenClaw Agents

**Repo:** `~/.openclaw/workspace/vendoo-analytics`
**Skills:** `~/.openclaw/workspace/skills/`
**CSV:** `~/.openclaw/workspace/vendoo-analytics/public/data/vendoo.csv`

### Install / Update

```bash
bash scripts/install_openclaw_workspace.sh
```

This syncs the repo, installs dependencies, builds, starts the app, and syncs the skills.

**Options:** `--skip-start` `--skip-build` `--skip-npm` `--skip-skill-sync` `--launch-debug-chrome`

**Env vars:** `OPENCLAW_WORKSPACE_DIR`, `VENDOO_ANALYTICS_REPO_DIR`, `VENDOO_ANALYTICS_HOST`, `VENDOO_ANALYTICS_PORT`

### Post-Install Chrome Setup

1. `start_vendoo_debug_chrome.sh` — opens a Chrome window for Vendoo sign-in
2. Tell the user to sign into Vendoo in that window
3. `check_chrome_devtools_mcp.sh` — verifies Chrome DevTools MCP is connected

### Cron Job Payloads

| Job | Payload |
|---|---|
| `Daily Vendoo CSV export` | `~/.openclaw/workspace/skills/vendoo-export-dashboard/references/openclaw-cron.example.json` |
| `Morning Vendoo Dashboard Rundown` | `~/.openclaw/workspace/skills/vendoo-daily-dashboard-rundown/references/openclaw-cron.example.json` |

---

## Changelog

See [`CHANGELOG.md`](./CHANGELOG.md) for release history.
