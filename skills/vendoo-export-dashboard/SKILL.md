---
name: vendoo-export-dashboard
description: Export Vendoo CSV and refresh the sales dashboard. Use when the user asks to pull latest Vendoo data, update sales dashboard CSV, refresh/restart the sales dashboard app, or verify sales data freshness.
---

# Vendoo Export Dashboard

Run the locked Vendoo export protocol with managed browser, then deploy CSV to the sales dashboard.

## Fresh install note

- This skill ships with example `/Users/cris/...` paths from the original machine.
- Before first use on another machine, replace those paths in this file, `references/runbook.md`, and the scripts in `scripts/`.
- The canonical analytics CSV target should be the local `vendoo-analytics/public/data/vendoo.csv` file.
- Recurring automation should use the local OpenClaw native cron or scheduler with job name `Daily Vendoo CSV export` and cron expression `0 23 * * *`.

## Workflow

1. Export CSV from Vendoo (browser step)
- Use `browser` with `profile="openclaw"`.
- Open: `https://web.vendoo.co/app/settings/#export-csv`
- Click "All Inventory" checkbox to enable the Generate button
- Click "Generate CSV" and wait for the modal to appear
- Wait for the CSV filename to appear in the modal with a download arrow button
- Click the download arrow button in the modal (or click the filename row)
- After clicking download, navigate to `chrome://downloads` to find the GCS URL in download history
- Copy the full GCS URL from the download entry (click "Copy download link" button)
- Use `curl` to download directly: `curl -L -o /path/to/save.csv "https://storage.googleapis.com/..."`

2. Deploy latest CSV
- Copy the newest Vendoo CSV to the local analytics repo target at `public/data/vendoo.csv`.
- Update `scripts/deploy_latest_vendoo_csv.sh` before first use so it matches the local machine paths.

3. Restart dashboard service
- Launch or restart the locally installed analytics app after refreshing the CSV.
- Update `scripts/restart_sales_dashboard.sh` before first use so it points at the correct local app path and port.

4. Verify freshness
- Confirm newest CSV modified timestamp.
- Confirm the analytics app is up on the configured local port.
- Report success/failure + what changed.

## Fast commands

- Deploy + restart only:
  - `skills/vendoo-export-dashboard/scripts/deploy_latest_vendoo_csv.sh`
  - `skills/vendoo-export-dashboard/scripts/restart_sales_dashboard.sh`

## Notes

- If browser export fails, retry once with alternative click strategy (e.g., JS click).
- If no new CSV exists, report clearly and do not claim refresh.
