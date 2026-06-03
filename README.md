# Vendoo Analytics

A Next.js 16 dashboard for analyzing Vendoo marketplace exports. Displays revenue, profit, inventory, platform performance, and projections from a CSV file.

**Design:** Linear aesthetic — minimal sidebar, squared-off UI, dark theme, mobile bottom nav with Settings.

---

## Quick Start

```bash
git clone https://github.com/btxnbtwn/vendoo-analytics.git
cd vendoo-analytics
npm install
npm run build
npm run start
# → http://localhost:3000
```

Hot-reload development: `npm run dev`

The app ships with a sample CSV (`public/data/vendoo.sample.csv`) so it works out of the box. Drop your real Vendoo export at `public/data/vendoo.csv` to see your own data.

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

## Dashboard Tabs

| Tab | What it shows |
|---|---|
| **Overview** | KPI cards, revenue chart, platform breakdown, recent sales |
| **Revenue** | Revenue/profit over time, period comparison, fees & shipping KPIs |
| **Platforms** | Platform performance comparison, cross-posting stats, fee breakdown |
| **Inventory** | Inventory table, aging analysis, condition & color donut charts, cost summary |
| **Brands** | Brand ROI, category breakdown |
| **Labels/Tags** | Label and tag performance comparison |

### Charts

All charts use Recharts with bold, dark color palettes (no pastels). Gradient fills on area/bar charts. Platform colors: eBay #0064D3, Depop #FF2300, Poshmark #7F0353, Mercari #5E6DF2, Etsy #F56400.

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
│   │   └── Sidebar.tsx          # Desktop sidebar + mobile bottom nav
│   ├── dashboard-tabs/
│   │   ├── OverviewPanel.tsx    # KPIs, charts, recent sales
│   │   ├── RevenuePanel.tsx     # Revenue/profit charts, period comparison
│   │   ├── PlatformsPanel.tsx   # Platform breakdown, cross-posting, fees
│   │   ├── InventoryPanel.tsx   # Inventory table, aging, condition/color charts
│   │   ├── BrandsPanel.tsx      # Brand ROI, category breakdown
│   │   └── LabelsPanel.tsx      # Label/tag performance
│   ├── Charts/                  # Reusable chart components
│   │   ├── RevenueChart.tsx     # Area chart with gradient fills
│   │   ├── PlatformChart.tsx    # Platform comparison bars
│   │   ├── ListingsChart.tsx    # Listings over time
│   │   ├── ConditionChart.tsx   # Condition donut chart
│   │   ├── ColorDonutChart.tsx  # Color distribution donut
│   │   ├── CrossPostingChart.tsx # Cross-posting analytics
│   │   └── FeeBreakdownChart.tsx # Fee breakdown by platform
│   └── ui/                      # Shared primitives (Badge, Button, Select, etc.)
└── lib/
    ├── analytics.ts              # All data transformations and computations
    ├── types.ts                  # TypeScript interfaces
    ├── platform-colors.ts        # Centralized brand colors
    ├── server-listings.ts        # CSV loading (server-side)
    ├── design-tokens.css         # CSS variables for chart colors, spacing
    └── *.ts                      # AppContext, hooks, motion
```

### Data Flow

```
public/data/vendoo.csv (or vendoo.sample.csv)
  → loadServerListings() [server-listings.ts]
  → page.tsx (server component)
  → <Dashboard initialListings={listings} />
  → AppContext (client state)
  → Tab panels (Overview, Revenue, Platforms, Inventory, Brands, Labels)
  → Charts (Recharts)
  → <KPICards /> (summary metrics)
```

### State Management

- **Server:** CSV loaded once at page load via `loadServerListings()`
- **Client:** `AppContext` — theme, active tab, date filter, label/tag filter
- **Panel filters:** Each tab panel has its own date filter passed as a prop

---

## Mobile

The app is fully responsive with:
- Bottom navigation bar (single row, no wrapping)
- Theme toggle in top-right corner
- Touch-friendly button sizes (min 36px)
- Stacked layouts for date filters and pagination on small screens

Access from mobile on the same network: `http://<your-ip>:3000`

```bash
# Start with LAN access
HOST=0.0.0.0 PORT=3000 npm run start
```

---

## Automation

Two skills ship with this repo:

| Skill | Purpose | Location |
|---|---|---|
| `vendoo-export-dashboard` | Chrome DevTools MCP — exports fresh CSV from Vendoo | `skills/vendoo-export-dashboard/` |
| `vendoo-daily-dashboard-rundown` | Morning briefing generator + delivery | `skills/vendoo-daily-dashboard-rundown/` |

### Morning Rundown Endpoint

```
http://127.0.0.1:3000/api/morning-rundown?format=text
```

Returns plain text: yesterday snapshot, 7-day pace, platform winners, label/tag movers, inventory watch, 30-day projector, and alerts.

---

## For Hermes Agents

**Install from GitHub:**

```bash
git clone https://github.com/btxnbtwn/vendoo-analytics.git ~/Developer/vendoo-analytics
cd ~/Developer/vendoo-analytics
npm install
npm run build
```

**Start the app:**

```bash
# Local access
npm run start

# LAN / mobile access
HOST=0.0.0.0 PORT=3000 npm run start
```

**Install Hermes skills:**

```bash
rsync -a skills/vendoo-export-dashboard/ ~/.hermes/skills/vendoo-export-dashboard/
rsync -a skills/vendoo-daily-dashboard-rundown/ ~/.hermes/skills/vendoo-daily-dashboard-rundown/
```

**Verify:**

```bash
curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:3000    # → 200
curl -s "http://127.0.0.1:3000/api/morning-rundown?format=text"   # → plain text
```

**CSV:** Drop your Vendoo export at `~/Developer/vendoo-analytics/public/data/vendoo.csv`. The app falls back to the sample CSV if the real one isn't present.

---

## For OpenClaw Agents

**One-command install:**

```bash
git clone https://github.com/btxnbtwn/vendoo-analytics.git /tmp/vendoo-analytics
cd /tmp/vendoo-analytics
bash scripts/install_openclaw_workspace.sh
```

This clones the repo, installs deps, builds, starts the app, and syncs skills to `~/.openclaw/workspace/skills/`.

**Options:** `--skip-start` `--skip-build` `--skip-npm` `--skip-skill-sync` `--launch-debug-chrome`

**Env vars:**
- `OPENCLAW_WORKSPACE_DIR` — workspace root (default: `~/.openclaw/workspace`)
- `VENDOO_ANALYTICS_REPO_DIR` — repo target (default: `$WORKSPACE_DIR/vendoo-analytics`)
- `VENDOO_ANALYTICS_HOST` — bind host (default: `127.0.0.1`)
- `VENDOO_ANALYTICS_PORT` — bind port (default: `3000`)

**Post-install Chrome setup:**

1. `start_vendoo_debug_chrome.sh` — opens a Chrome window for Vendoo sign-in
2. Tell the user to sign into Vendoo in that window
3. `check_chrome_devtools_mcp.sh` — verifies Chrome DevTools MCP is connected

### Cron Job Payloads

| Job | Payload |
|---|---|
| `Daily Vendoo CSV export` | `skills/vendoo-export-dashboard/references/openclaw-cron.example.json` |
| `Morning Vendoo Dashboard Rundown` | `skills/vendoo-daily-dashboard-rundown/references/openclaw-cron.example.json` |

---

## Changelog

See [`CHANGELOG.md`](./CHANGELOG.md) for release history.
