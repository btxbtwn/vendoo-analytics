# Vendoo Analytics

A Next.js dashboard for analyzing Vendoo exports, tracking marketplace performance, and comparing labels, tags, brands, inventory, and revenue trends.

## Latest release

The next release prepared from this branch is `v.1.1.0`.

Highlights in this release:
- per-tab date filters using the most relevant date for each tab
- platform-aware label and tag comparison with searchable multi-select versus views
- revenue and profit projector windows for `7`, `14`, `30`, `60`, and `90` days
- slimmer mobile header, aligned snapshot metrics, and a more compact sidebar
- `Inventory Status` only in the Inventory tab and `Sales by Category` only in the Revenue tab
- improved desktop category chart layout so the chart no longer clips

## OpenClaw agent install or update

If this project is being installed or updated by an OpenClaw agent, start with the repo-level instructions in [`AGENTS.md`](./AGENTS.md).

That guide covers:
- fresh install into an OpenClaw workspace
- updating an existing install safely
- copying or re-syncing `skills/vendoo-export-dashboard`
- localizing machine-specific paths
- launching or relaunching the analytics app
- validating the native recurring OpenClaw cron job that runs every day at `11:00 PM` with `0 23 * * *`

## Changelog

See [`CHANGELOG.md`](./CHANGELOG.md) for release history and a detailed summary of what changed in each version.

## Getting Started

Install dependencies and start the app locally:

```bash
npm install
npm run build
npm run start
```

For local development instead of production start:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
