# Vendoo Analytics

A Next.js dashboard for analyzing Vendoo exports, tracking marketplace performance, and comparing labels, tags, brands, inventory, and revenue trends.

## Latest release

The next release prepared from this branch is `v.1.2.1`.

Highlights in this release:
- workspace-first OpenClaw install flow via `bash scripts/install_openclaw_workspace.sh`
- repo-shipped `vendoo-export-dashboard` skill now defaults to `~/.openclaw/workspace/vendoo-analytics`
- Chrome DevTools MCP-first Vendoo export guidance and readiness checks
- daily export and morning rundown cron payload templates shipped with the installed skills

## OpenClaw automation supported by this repo

This repo now supports two OpenClaw-native recurring automations:
- `Daily Vendoo CSV export` at `0 23 * * *`
- `Morning Vendoo Dashboard Rundown` at a recommended `0 8 * * *`

The morning rundown uses the repo's local dashboard data and returns a balanced briefing with yesterday metrics, 7-day pace, platform winners, label/tag movers, inventory watch, projector snapshot, and alerts.

## OpenClaw agent install or update

If this project is being installed or updated by an OpenClaw agent, start with the repo-level instructions in [`AGENTS.md`](./AGENTS.md).

That guide covers:
- fresh install into an OpenClaw workspace
- workspace-first repo and skill sync
- launching or relaunching the analytics app
- Chrome DevTools MCP readiness checks for Vendoo export
- wiring both native recurring OpenClaw cron jobs

## OpenClaw workspace install

Default install target:

```text
~/.openclaw/workspace/vendoo-analytics
```

Run the installer from the repo or release bundle:

```bash
bash scripts/install_openclaw_workspace.sh
```

That installer:
- syncs the repo into the OpenClaw workspace
- syncs both shipped skills into `~/.openclaw/workspace/skills/`
- runs `npm install`
- runs `npm run build`
- starts the local app unless `--skip-start` is provided

After install, the OpenClaw agent should:
- run `~/.openclaw/workspace/skills/vendoo-export-dashboard/scripts/check_chrome_devtools_mcp.sh`
- create the `Daily Vendoo CSV export` job from `~/.openclaw/workspace/skills/vendoo-export-dashboard/references/openclaw-cron.example.json`
- create the `Morning Vendoo Dashboard Rundown` job from `~/.openclaw/workspace/skills/vendoo-daily-dashboard-rundown/references/openclaw-cron.example.json`

If Chrome was not launched with remote debugging yet, the agent can finish the non-interactive setup but may still need the user to relaunch Chrome and sign into Vendoo in the debug-enabled profile.

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
