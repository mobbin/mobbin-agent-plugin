# Mobbin Agent Plugin

The Mobbin Agent Plugin packages Mobbin's hosted MCP server and a design-research skill for Agent
Plugins 1.0.0 clients. It helps agents find real-world UI screens, multi-step flows, and website
sections from Mobbin's design library.

## Install

```bash
npx plugins add mobbin/mobbin-agent-plugin
```

Any client that supports Agent Plugins 1.0.0 can load it — ChatGPT and Codex, Cursor, GitHub
Copilot, Kiro, and VS Code at the specification's launch.

Several clients also offer a native Mobbin setup path that predates this plugin, which stays
supported: [ChatGPT](https://docs.mobbin.com/mcp/clients/chatgpt),
[Cursor](https://docs.mobbin.com/mcp/clients/cursor),
[VS Code](https://docs.mobbin.com/mcp/clients/vscode),
[Codex CLI](https://docs.mobbin.com/mcp/clients/codex-cli), and
[others](https://docs.mobbin.com/mcp/clients/other).

On first use, the client opens a browser for OAuth authorization. You need a Mobbin account on a
Pro, Team, or Enterprise plan. The plugin contains no API key or other credential.

## What it installs

- The `mobbin` MCP server at `https://api.mobbin.com/mcp` using Streamable HTTP.
- The `mobbin-design-research` skill, which teaches agents when and how to use Mobbin's three
  search tools.

The root `mcp.json` is the standard configuration; `.mcp.json` is a compatibility copy for older
installers that still probe the dot-prefixed filename.

Mobbin provides these read-only MCP tools:

- `search_screens` — UI screens.
- `search_flows` — multi-step user journeys such as onboarding and checkout.
- `search_sections` — website sections such as pricing pages, heroes, and footers.

Results include images, metadata, and links back to Mobbin. Agents should inspect the images before
recommending references and cite each mentioned screen with its `mobbin_url`.

## Layout

```text
mobbin-agent-plugin/
├── plugin.json
├── mcp.json
├── skills/
│   └── mobbin-design-research/
│       └── SKILL.md
├── schemas/1.0.0/
│   ├── plugin.schema.json
│   └── mcp.schema.json
├── scripts/
│   └── validate.mjs
└── .github/workflows/validate.yml
```

Read the [Mobbin MCP introduction](https://docs.mobbin.com/mcp/introduction) for client setup and
authorization details.
