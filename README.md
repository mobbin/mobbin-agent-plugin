# Mobbin Agent Plugin

The Mobbin Agent Plugin packages Mobbin's hosted MCP server for Agent Plugins 1.0.0 clients. It
helps agents find real-world UI screens, multi-step flows, and website sections from Mobbin's
design library.

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

The root `plugin.json` and `mcp.json` are the standard configurations. The root `.mcp.json`,
`.claude-plugin/plugin.json`, and `.codex-plugin/plugin.json` are compatibility copies for current
installers that still probe client-specific filenames and directories.

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
├── .mcp.json
├── .claude-plugin/plugin.json
├── .codex-plugin/plugin.json
├── schemas/1.0.0/
│   ├── plugin.schema.json
│   └── mcp.schema.json
├── scripts/
│   └── validate.mjs
└── .github/workflows/validate.yml
```

Read the [Mobbin MCP introduction](https://docs.mobbin.com/mcp/introduction) for client setup and
authorization details.
