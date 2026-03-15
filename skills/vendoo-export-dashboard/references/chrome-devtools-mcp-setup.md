# Chrome DevTools MCP setup for Vendoo export

Use this checklist when `vendoo-export-dashboard` needs browser automation.

## Minimum prerequisites

- Node.js 20.19 or newer, with `npm` and `npx`
- Google Chrome stable
- Local access to the `vendoo-analytics` repo at `~/.openclaw/workspace/vendoo-analytics`

If Node.js is missing and the machine uses Homebrew, the agent can usually install it with:

```bash
brew install node
```

If Chrome is missing, the user may need to install it manually before the agent can continue.

## What the agent should do first

1. Run `./scripts/check_chrome_devtools_mcp.sh`.
2. Prefer a configured MCP server named `chrome-devtools`.
3. Use `npx -y chrome-devtools-mcp@latest --browser-url=http://127.0.0.1:9222` when the MCP client needs a direct command.
4. Reuse the existing local Chrome debug session if `http://127.0.0.1:9222/json/version` responds.

## What the agent can usually do without user help

- Verify `node`, `npm`, `npx`, `curl`, and Chrome availability.
- Warm or download the MCP package via `npx -y chrome-devtools-mcp@latest --help`.
- Detect the local `vendoo-analytics` repo and canonical CSV target inside the OpenClaw workspace.
- Configure or suggest the MCP command for the current client.
- Attach to an already running Chrome debug session.

## What may still require the user

- Relaunching Chrome with remote debugging when the current session was not started that way.
- Signing into Vendoo inside the debug-enabled Chrome profile.
- Installing Chrome or Node.js if they are missing and the agent cannot use a package manager on that machine.

## Remote-debug Chrome launch

Default debug URL: `http://127.0.0.1:9222`

macOS:

```bash
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  --remote-debugging-port=9222 \
  --remote-debugging-address=127.0.0.1 \
  --user-data-dir="$HOME/.openclaw/browser/vendoo-mcp-profile"
```

Linux:

```bash
google-chrome \
  --remote-debugging-port=9222 \
  --remote-debugging-address=127.0.0.1 \
  --user-data-dir="$HOME/.openclaw/browser/vendoo-mcp-profile"
```

Recent Chrome versions may require a dedicated `--user-data-dir` for automation. Do not promise attachment to the default Chrome profile unless the debug endpoint is already live.

## MCP client command

```bash
npx -y chrome-devtools-mcp@latest --browser-url=http://127.0.0.1:9222
```

If the active Chrome debug session uses another port, set `VENDOO_CHROME_DEBUG_URL` or `VENDOO_CHROME_DEBUG_PORT` before running the check script.

## Vendoo export flow after MCP is ready

1. Connect to the active Chrome debug session.
2. Open `https://web.vendoo.co/app/settings/#export-csv`.
3. Ensure `All Inventory` is selected.
4. Generate the export.
5. Download the CSV.
6. Run `./scripts/deploy_latest_vendoo_csv.sh` to publish it to `~/.openclaw/workspace/vendoo-analytics/public/data/vendoo.csv`.
7. If the local app is not reachable, run `./scripts/restart_vendoo_analytics.sh`.
8. Confirm the local analytics URL is reachable and report the result.
