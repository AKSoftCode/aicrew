# Third-Party Notices

This file lists the MCP servers and npm packages that aicrew references, installs, or wires into a host tool. It covers software whose code executes at runtime.

aicrew itself bundles **no npm runtime dependencies** (`package.json` `dependencies` is empty). The packages below are **not** bundled inside the aicrew npm package; they are pulled at runtime by the MCP host (Claude Code, Cursor, Codex, Gemini CLI, or Antigravity) using the server definitions in `config/mcp/`.

> For design inspirations (no code used), see README → Acknowledgements / Inspiration.

> User-facing explanation of how aicrew uses these techniques: [`skills/docs/how-token-savings-work.md`](./skills/docs/how-token-savings-work.md)

---

## Core MCP servers

These three power aicrew's token economy and are recommended for every install.

### `codebase-memory-mcp`

- **Version:** 0.8.1 (latest at time of writing)
- **License:** MIT
- **Source:** https://www.npmjs.com/package/codebase-memory-mcp
- **Install location:** `~/.local/bin/codebase-memory-mcp` (standalone binary; **not** bundled in the aicrew npm package)

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions: The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software. THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.

---

### `context-mode`

- **Version:** 1.0.162 (latest at time of writing)
- **License:** Elastic License 2.0 (ELv2)
- **Source:** https://www.npmjs.com/package/context-mode
- **Notes:** Free to use for internal and non-commercial purposes. Production SaaS use requires a separate commercial agreement. See [elastic.co/licensing/elastic-license](https://www.elastic.co/licensing/elastic-license) for full terms.

---

### `token-optimizer-mcp`

- **Version:** 2.17.0 (latest at time of writing)
- **License:** MIT
- **Source:** https://www.npmjs.com/package/token-optimizer-mcp

See MIT license text above; same terms apply.

---

## Optional MCP servers (wired via the Cursor template)

`config/mcp/cursor.json` lists these optional servers as commented/placeholder entries. They run only if a user enables them and supplies credentials. License notices are retained because their code executes when enabled.

### `@modelcontextprotocol/server-github`

- **Version:** 2025.4.8 (latest at time of writing)
- **License:** MIT
- **Source:** https://www.npmjs.com/package/@modelcontextprotocol/server-github
- **Copyright:** Anthropic, PBC and contributors

See MIT license text above; same terms apply.

---

### `@modelcontextprotocol/server-memory`

- **Version:** 2026.1.26 (latest at time of writing)
- **License:** MIT
- **Source:** https://www.npmjs.com/package/@modelcontextprotocol/server-memory
- **Copyright:** Anthropic, PBC and contributors

See MIT license text above; same terms apply.

---

### `@modelcontextprotocol/server-brave-search`

- **Version:** 0.6.2 (latest at time of writing)
- **License:** MIT
- **Source:** https://www.npmjs.com/package/@modelcontextprotocol/server-brave-search
- **Copyright:** Anthropic, PBC and contributors

See MIT license text above; same terms apply.

---

### `@modelcontextprotocol/server-playwright`

- **Version:** 0.6.2 (latest at time of writing)
- **License:** MIT
- **Source:** https://www.npmjs.com/package/@modelcontextprotocol/server-playwright
- **Copyright:** Anthropic, PBC and contributors

See MIT license text above; same terms apply.

---

### `@modelcontextprotocol/server-postgres`

- **License:** MIT (see package for exact terms)
- **Source:** https://www.npmjs.com/package/@modelcontextprotocol/server-postgres
- **Copyright:** Anthropic, PBC and contributors

See MIT license text above; same terms apply.

---

### `@perplexity-ai/mcp-server`

- **Version:** 0.9.0 (latest at time of writing)
- **License:** MIT
- **Source:** https://www.npmjs.com/package/@perplexity-ai/mcp-server
- **Copyright:** Perplexity AI, Inc. and contributors

See MIT license text above; same terms apply.

---

*This file is maintained manually and covers only software whose code runs at runtime. If you add a new MCP server to `config/mcp/`, add a corresponding entry here. Design inspirations that contributed ideas or patterns (no code) live in README → Acknowledgements / Inspiration.*
