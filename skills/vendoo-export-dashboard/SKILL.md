---
name: vendoo-export-dashboard
description: Export Vendoo CSV and refresh the sales dashboard. Use when the user asks to pull latest Vendoo data, update sales dashboard CSV, refresh/restart the sales dashboard app, or verify sales data freshness.
---

# Vendoo Export Dashboard

Run the locked Vendoo export protocol with managed browser, then deploy CSV to the sales dashboard.

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
- Move newest Vendoo CSV to: `/Users/cris/openclaw/sales_dashboard/`
- Keep filename stable if dashboard expects one; otherwise preserve source name.

3. Restart dashboard service
- Use `scripts/restart_sales_dashboard.sh`.
- Target app: `/Users/cris/openclaw/sales_dashboard/app.py`
- Target port: `8501`

4. Verify freshness
- Confirm newest CSV modified timestamp.
- Confirm Streamlit process is up on port `8501`.
- Report success/failure + what changed.

## Fast commands

- Deploy + restart only:
  - `skills/vendoo-export-dashboard/scripts/deploy_latest_vendoo_csv.sh`
  - `skills/vendoo-export-dashboard/scripts/restart_sales_dashboard.sh`

## Notes

- If browser export fails, retry once with alternative click strategy (e.g., JS click).
- If no new CSV exists, report clearly and do not claim refresh.
