---
name: vendoo-daily-dashboard-rundown
description: Generate and deliver a concise morning briefing from the local Vendoo analytics dashboard data. Use when the user asks for a daily dashboard rundown, morning analytics summary, or a cron-driven report after the nightly Vendoo export.
---

# Vendoo Daily Dashboard Rundown

Use the local dashboard data as the source of truth for a morning summary. Do not scrape the dashboard UI.

## Workflow

1. Verify local app URL and data freshness
- Prefer the local morning rundown endpoint:
  - `http://127.0.0.1:3000/api/morning-rundown?format=text`
- If the app runs on a different local URL or port, use that local URL instead.
- If using the bundled helper script, set `VENDOO_ANALYTICS_URL` when the app is not on `http://127.0.0.1:3000`.
- If the endpoint says the CSV is stale or unavailable, report that clearly instead of presenting the rundown as current.

2. Generate the briefing
- Run `skills/vendoo-daily-dashboard-rundown/scripts/get_morning_dashboard_rundown.sh` from the local workspace, or call the local endpoint directly with `curl`.
- Return the summary to the triggering Telegram chat or session with minimal extra commentary.

3. Expected default content
- yesterday snapshot: sold items, revenue, profit, new listings
- recent pace: last 7-day sales, revenue, profit, and listing activity
- platform winners: recent revenue leader, recent profit leader, and quiet platforms
- label/tag movers: top recent labels and tags
- inventory watch: active listings, drafts, sell-through, and recent listing pace
- forward look: current 30-day projector snapshot
- alerts: stale CSV, no-sales/no-listings, negative-profit or low-activity warnings

4. Cron guidance
- Use native OpenClaw cron only.
- Recommended recurring job name: `Morning Vendoo Dashboard Rundown`
- Recommended cron: `0 8 * * *`
- Run this after the nightly `Daily Vendoo CSV export` job has already refreshed the CSV.
- Avoid duplicate jobs.

## Fast commands

- Default local URL:
  - `skills/vendoo-daily-dashboard-rundown/scripts/get_morning_dashboard_rundown.sh`

- Non-default local app URL:
  - `VENDOO_ANALYTICS_URL=http://127.0.0.1:3001 skills/vendoo-daily-dashboard-rundown/scripts/get_morning_dashboard_rundown.sh`

## Notes

- The morning rundown depends on the locally running analytics app and the local `public/data/vendoo.csv` file.
- This skill is designed for concise recurring briefings, not full dashboard replacement.
- For a cron payload template, see `references/openclaw-cron.example.json`.
