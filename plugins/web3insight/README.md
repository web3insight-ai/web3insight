# Web3Insight Copilot — Claude Code Plugin

Query Web3 ecosystems, repositories, developers, donation-enabled OSS projects, and hackathon profiles directly from Claude Code (or any MCP-capable client) via the **Web3Insight Copilot MCP server**.

24 tools, end-to-end typed, backed by GitHub + GHArchive + OSS Insight + the crypto-ecosystems taxonomy. 7,000+ ecosystems, 540,000+ repositories, 1.3M+ developers indexed.

---

## What you get

- **MCP server** (`web3insight`) — HTTP transport, bearer auth, all 24 platform tools auto-loaded.
- **Skill** (`web3insight`) — describes every tool, when to use it, common combos, error handling. Auto-triggers on Web3 questions.
- **Slash command** (`/web3insight-setup`) — walks any user through the token + env-var setup.

---

## Install

### Option A — Plugin (recommended)

One-line marketplace add, one-line install, one env var:

```bash
# In Claude Code:
/plugin marketplace add web3insight-ai/web3insight
/plugin install web3insight@web3insight

# In your shell (~/.zshrc or ~/.bashrc):
export WEB3INSIGHT_MCP_TOKEN="w3i_mcp_<your-token>"
```

Restart Claude Code. Run `/mcp` — you should see `web3insight` connected with 24 tools.

Need a token? Open: <https://dash.web3insight.ai/copilot?copilotMcpTokens=open>

Want the plugin to walk a teammate through it? Run `/web3insight-setup`.

### Option B — Skill only (no MCP)

For clients without MCP support, install just the SKILL.md so the assistant knows how to talk *about* Web3Insight (it will tell the user to hit the dashboard or REST API directly):

```bash
npx skills add web3insight-ai/web3insight
```

### Option C — Manual MCP config

For Claude Desktop, Cursor, VS Code, or any other MCP client — drop this into the client's `mcp.json` (`~/Library/Application Support/Claude/claude_desktop_config.json` / `~/.cursor/mcp.json` / `.vscode/mcp.json`):

```json
{
  "mcpServers": {
    "web3insight": {
      "type": "http",
      "url": "https://dash.web3insight.ai/api/ai/mcp",
      "headers": {
        "Authorization": "Bearer w3i_mcp_<your-token>"
      }
    }
  }
}
```

Restart the client.

---

## The 24 tools at a glance

| Category | Tools |
|---|---|
| Platform | `getPlatformOverview`, `countEcosystems` |
| Ecosystem counts | `countRepositories`, `countContributors` |
| Ecosystem rankings | `rankEcosystems`, `rankRepositories`, `rankContributors` |
| Ecosystem trends | `getRecentContributorTrends`, `getContributorGrowth`, `getCountryDistribution`, `compareEcosystems` |
| Repo discovery | `getTrendingRepositories`, `getHotRepositories`, `getRepositoryActiveDevelopers` |
| Developer profiles | `getDeveloperProfile`, `getDeveloperTopRepositories`, `getDeveloperRecentActivity`, `getDeveloperEcosystems`, `getEventDeveloperProfile` |
| Donations (x402) | `getDonationRepositories`, `getDonationRepositoryByName` |
| Events / reports | `getPublicEventInsights`, `getYearlyReport` |
| Escape hatch | `queryWeb3Data` (read-only SQL) |

See `skills/web3insight/SKILL.md` for the full picker rubric, output conventions, and common combos.

---

## Token lifecycle

- Mint at: <https://dash.web3insight.ai/copilot?copilotMcpTokens=open>
- Tokens are shown **once** — save it immediately.
- Revoke from the same dialog. Revocation takes effect on the next request.
- Each token is HMAC-SHA256 hashed server-side; the raw value never leaves your machine after creation.

---

## Endpoint

| | |
|---|---|
| URL | `https://dash.web3insight.ai/api/ai/mcp` |
| Transport | Streamable HTTP (no SSE) |
| Auth | `Authorization: Bearer w3i_mcp_...` |
| Protocol | MCP 2024-11-05 |

---

## License

MIT. See repository root.
