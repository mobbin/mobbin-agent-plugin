# Mobbin Agent Plugin

The Mobbin Agent Plugin packages Mobbin's hosted MCP server for Agent Plugins 1.0.0 clients. It
helps agents find real-world UI screens, multi-step flows, and website sections from Mobbin's
design library.

## Install

The package is a portable Agent Plugins 1.0.0 directory. Use the installation flow documented by
your client:

- [VS Code](https://code.visualstudio.com/docs/agent-customization/agent-plugins): install from
  the marketplace, use **Chat: Install Plugin From Source**, or register a local checkout with
  `chat.pluginLocations`.
- [Cursor](https://cursor.com/docs/plugins): install from Customize, or load a local checkout
  from `~/.cursor/plugins/local/`.
- [GitHub Copilot](https://docs.github.com/en/copilot/reference/copilot-cli-reference/cli-plugin-reference):
  use `copilot plugin install OWNER/REPO` or the documented local/repository flow.
- [Kiro](https://kiro.dev/docs/powers/installation/): use **Powers → Add Custom Power**.
- [ChatGPT and Codex](https://developers.openai.com/plugins): install through OpenAI's plugin
  directory.

Claude Code is not an Agent Plugins-compatible client; use Mobbin's
[`claude mcp add` setup](https://docs.mobbin.com/mcp/clients/claude-code) instead.

On first use, the client opens a browser for OAuth authorization. You need a Mobbin account on a
Pro, Team, or Enterprise plan. The plugin contains no API key or other credential.

## What it installs

- The `mobbin` MCP server at `https://api.mobbin.com/mcp` using Streamable HTTP.

The root `plugin.json` and `mcp.json` are the only package configuration files required by the
Agent Plugins standard.

Mobbin provides these read-only MCP tools:

- `search_screens` — UI screens.
- `search_flows` — multi-step user journeys such as onboarding and checkout.
- `search_sections` — website sections such as pricing pages, heroes, and footers.

Results include images, metadata, and links back to Mobbin.

## Layout

```text
mobbin-agent-plugin/
├── plugin.json
├── mcp.json
├── schemas/1.0.0/
│   ├── plugin.schema.json
│   └── mcp.schema.json
├── scripts/
│   └── validate.mjs
└── .github/workflows/validate.yml
```

Read the [Mobbin MCP introduction](https://docs.mobbin.com/mcp/introduction) for client setup and
authorization details.
