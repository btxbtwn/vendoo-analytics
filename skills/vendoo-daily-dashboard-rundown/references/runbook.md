# Vendoo Morning Dashboard Rundown Runbook

1. Confirm the local analytics app is reachable.
2. Call the local endpoint:
   - `http://127.0.0.1:3000/api/morning-rundown?format=text`
3. If the app uses another local URL or port, set `VENDOO_ANALYTICS_URL` for the bundled helper script or call the correct local endpoint directly.
   - From this skill directory: `./scripts/get_morning_dashboard_rundown.sh`
4. Read the returned balanced briefing and send it back to the triggering chat or session.
5. If the response reports stale CSV data, surface that warning clearly.
6. If the endpoint is unavailable, report that the morning rundown could not be generated and include the local URL attempted.

Recommended cron:
- name: `Morning Vendoo Dashboard Rundown`
- cron: `0 8 * * *`
- timezone: local machine timezone
- target: installed `vendoo-daily-dashboard-rundown` skill
