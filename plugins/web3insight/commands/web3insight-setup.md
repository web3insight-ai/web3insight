---
description: Walk the user through setting up the Web3Insight Copilot MCP server, including minting a personal token and exporting the env var.
allowed-tools: Bash(echo:*), Bash(printf:*), Bash(uname:*), Bash(test:*)
---

# /web3insight-setup

Walk the user through enabling the Web3Insight Copilot MCP server in this Claude Code workspace.

Follow this script — do NOT skip steps; the only one that requires the user to leave the terminal is step 1.

## Step 1 — Mint a personal MCP token

Open this URL in their browser:

    https://dash.web3insight.ai/copilot?copilotMcpTokens=open

It opens the Copilot settings → MCP access tokens dialog. The user clicks **Create token**, gives it a name, and copies the resulting `w3i_mcp_...` value. The token is shown only once.

If they cannot reach the dashboard, ask whether they have an account on web3insight.ai. They must be signed in via Privy before the dialog renders.

## Step 2 — Export the token

Tell the user to export the token in their shell profile so it persists across sessions. Detect the shell from `$SHELL` (or `uname` if needed) and recommend the right file:

- `bash` → `~/.bashrc`
- `zsh`  → `~/.zshrc`
- `fish` → `~/.config/fish/config.fish` (use `set -Ux WEB3INSIGHT_MCP_TOKEN ...`)

Recommended line (bash/zsh):

    export WEB3INSIGHT_MCP_TOKEN="w3i_mcp_<their-token>"

Remind them to **start a new shell** (or `source` the file) so the env var is visible to Claude Code.

## Step 3 — Confirm the plugin is active

The plugin's `.mcp.json` references `${WEB3INSIGHT_MCP_TOKEN}`. After restart, Claude Code should auto-register the `web3insight` MCP server. Confirm by asking the user to run:

    /mcp

They should see `web3insight` listed with status **connected** and the 24 tools listed below it. If status is **failed**, the most common cause is the env var not being set in the current shell — re-check by running `echo $WEB3INSIGHT_MCP_TOKEN` in the same terminal Claude Code was launched from.

## Step 4 — Smoke test

Try a trivial question like "What's the platform overview?" — that should fire `mcp__web3insight__getPlatformOverview` and return something like:

    { totalEcosystems: 7157, totalRepositories: 544343, totalDevelopers: 1373370, totalCoreDevelopers: 38592 }

If you get a 401 here, the token is wrong or revoked — repeat step 1.

## Step 5 — Done

The bundled `web3insight` skill auto-activates whenever the user mentions a Web3 ecosystem, GitHub handle in a Web3 context, hackathon, donation, or trending repository. The user does not need to invoke anything explicitly.

To revoke the token later: Dashboard → Copilot settings → MCP access tokens → Revoke. The plugin will fail with 401 on the next call; mint a fresh one and update the env var.
