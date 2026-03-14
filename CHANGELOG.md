# Changelog

All notable changes to this project will be documented in this file.

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
