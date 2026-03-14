# Vendoo Export + Sales Dashboard Runbook

1. Export from Vendoo settings page using managed browser profile `openclaw`.
2. Verify new CSV appears in:
   - `~/.openclaw/browser/openclaw/Default/Downloads/`
3. Copy `skills/vendoo-export-dashboard` into the local OpenClaw workspace skills folder if it is not already installed.
4. Update machine-specific `/Users/cris/...` paths in:
   - `skills/vendoo-export-dashboard/SKILL.md`
   - `skills/vendoo-export-dashboard/references/runbook.md`
   - `skills/vendoo-export-dashboard/scripts/deploy_latest_vendoo_csv.sh`
   - `skills/vendoo-export-dashboard/scripts/restart_sales_dashboard.sh`
5. Deploy latest CSV to the local analytics repo target:
   - `vendoo-analytics/public/data/vendoo.csv`
6. Launch or restart the local analytics app.
7. Create or verify the native recurring OpenClaw cron job:
   - name: `Daily Vendoo CSV export`
   - cron: `0 23 * * *`
8. Validate process and file freshness.
