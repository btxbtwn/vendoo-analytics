# Vendoo Analytics

A Next.js dashboard for analyzing Vendoo exports, tracking marketplace performance, and comparing labels, tags, brands, inventory, and revenue trends.

Built with the [Linear](https://linear.app) aesthetic — minimal, clean, and focused.

## Design

- **Minimal Linear sidebar** — icon-only (56px) or full (220px), toggles on hover or click
- **Mobile bottom nav** — full-width bar at the bottom of the screen with Overview, Revenue, Platforms, Inventory, Brands, and Settings
- **Squared-off UI** — zero border-radius throughout
- **Full-width content** — no side padding, content stretches edge-to-edge
- **Dark theme** — deep gray background with indigo accent

## Getting Started

```bash
npm install
npm run build
npm run start
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

For local development with hot reload:

```bash
npm run dev
```

## Mobile Access

The app listens on all network interfaces. On the same network, access from mobile at:

```
http://<your-machine-ip>:3000
```

Find your machine's IP with `ipconfig getifaddr en0` (macOS) or `hostname -I` (Linux).

## Data

Drop your Vendoo CSV export into `public/data/vendoo.csv`. The dashboard reads this file on load. For automated daily exports, see the OpenClaw automation section below.

## Morning Rundown Endpoint

When the app is running, the morning briefing can be fetched as plain text:

```
http://127.0.0.1:3000/api/morning-rundown?format=text
```

Returns a balanced briefing covering yesterday's metrics, 7-day pace, platform winners, label/tag movers, inventory watch, and alerts.

## OpenClaw Automation

This repo supports two OpenClaw-native recurring automations:

- `Daily Vendoo CSV export` at `0 23 * * *` — exports fresh data from Vendoo
- `Morning Vendoo Dashboard Rundown` at `0 8 * * *` — sends the morning briefing

### Install / Update for OpenClaw agents

If installing or updating this repo in an OpenClaw workspace, start with [`AGENTS.md`](./AGENTS.md) for the full workflow including skill sync, Chrome DevTools MCP setup, and cron job wiring.

Default install target: `~/.openclaw/workspace/vendoo-analytics`

Run the installer:

```bash
bash scripts/install_openclaw_workspace.sh
```

For an interactive install that also opens the Vendoo sign-in window:

```bash
npm run openclaw:install:interactive
```

## Changelog

See [`CHANGELOG.md`](./CHANGELOG.md) for release history.
