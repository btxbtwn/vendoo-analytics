# Vendoo Export + Sales Dashboard Runbook

1. Export from Vendoo settings page using managed browser profile `openclaw`.
2. Verify new CSV appears in:
   - `~/.openclaw/browser/openclaw/Default/Downloads/`
3. Deploy latest CSV:
   - `skills/vendoo-export-dashboard/scripts/deploy_latest_vendoo_csv.sh`
4. Restart dashboard:
   - `skills/vendoo-export-dashboard/scripts/restart_sales_dashboard.sh`
5. Validate process and file freshness.
