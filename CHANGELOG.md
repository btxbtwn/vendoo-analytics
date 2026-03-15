# Changelog

All notable changes to this project will be documented in this file.

## [v.1.2.1] - 2026-03-15

### Added
- a workspace-first OpenClaw installer at `scripts/install_openclaw_workspace.sh`
- npm shortcuts for the OpenClaw installer flow
- a repo-shipped nightly export cron payload template via the installed `vendoo-export-dashboard` skill
- Chrome DevTools MCP readiness checks and setup guidance in the shipped export skill

### Changed
- OpenClaw install/update docs now default to `~/.openclaw/workspace/vendoo-analytics`
- shipped Vendoo skills now assume workspace-first install paths instead of machine-specific edits
- the export skill now targets the Next.js `vendoo-analytics` app instead of the older sales-dashboard assumptions

## [v.1.2.0] - 2026-03-14

### Added
- a repo-shipped `vendoo-daily-dashboard-rundown` skill for OpenClaw morning analytics briefings
- a local morning rundown endpoint at `/api/morning-rundown?format=text`
- example native OpenClaw cron payload docs for the morning dashboard rundown job

### Changed
- `AGENTS.md` now documents both the nightly export job and the morning dashboard rundown job
- the server-side Vendoo CSV loader now refreshes when `public/data/vendoo.csv` changes instead of staying cached forever

## [v.1.1.0] - 2026-03-14

### Added
- per-tab date filter controls with preset and custom ranges
- platform-aware label and tag comparison workbench with searchable multi-select versus views
- revenue and profit projector views with `7`, `14`, `30`, `60`, and `90` day windows
- dedicated `CHANGELOG.md` for release history
- explicit OpenClaw agent instructions for both fresh installs and updates

### Changed
- `Inventory Status` now lives only in the Inventory tab
- `Sales by Category` now lives only in the Revenue tab
- mobile top header is slimmer and uses less vertical space
- desktop sidebar opens slimmer and is collapsed by default
- snapshot metrics at the top of the dashboard are aligned consistently
- chart labels and layouts now adapt better to the selected date range

### Fixed
- hardened app loading against stale chunk and service-worker state
- fixed the desktop category chart layout so it no longer clips
- improved dashboard navigation and presentation for mobile and desktop handoff

## [v.1.0.0] - 2026-03-14

### Added
- initial Vendoo analytics dashboard release
- bundled `vendoo-export-dashboard` skill
- baseline OpenClaw setup instructions for fresh installs
