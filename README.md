# Vendoo Analytics

A Next.js dashboard for analyzing Vendoo exports, tracking marketplace performance, and comparing labels, tags, brands, inventory, and revenue trends.

## Latest release

The next release prepared from this branch is `v.1.2.0`.

Highlights in this release:
- repo-shipped morning dashboard rundown skill for OpenClaw agents
- local morning rundown endpoint at `/api/morning-rundown?format=text`
- balanced morning briefing with yesterday metrics, 7-day pace, platform winners, label/tag movers, inventory watch, projector snapshot, and alerts
- cache-aware server CSV loading so refreshed Vendoo exports are picked up without relying on a full app restart
- repo docs and example payloads for wiring both nightly export and morning rundown native cron jobs

## OpenClaw automation supported by this repo

This repo now supports two OpenClaw-native recurring automations:
- `Daily Vendoo CSV export` at `0 23 * * *`
- `Morning Vendoo Dashboard Rundown` at a recommended `0 8 * * *`

The morning rundown uses the repo's local dashboard data and returns a balanced briefing with yesterday metrics, 7-day pace, platform winners, label/tag movers, inventory watch, projector snapshot, and alerts.

## OpenClaw agent install or update

If this project is being installed or updated by an OpenClaw agent, start with the repo-level instructions in [`AGENTS.md`](./AGENTS.md).

That guide covers:
- fresh install into an OpenClaw workspace
- updating an existing install safely
- copying or re-syncing both shipped skills
- localizing machine-specific paths
- launching or relaunching the analytics app
- wiring both native recurring OpenClaw cron jobs

## Morning rundown endpoint

When the app is running locally, the morning briefing can be generated from:

```text
http://127.0.0.1:3000/api/morning-rundown?format=text
```

If the app runs on another local URL or port, use that local endpoint instead.

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
