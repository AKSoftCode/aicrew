# Third-Party Notices

This file lists licenses and attribution for MCP servers referenced in **`config/mcp/`**, optional Cursor template servers, and external projects that inspired aicrew design. aicrew itself is [MIT licensed](./LICENSE).

---

## MCP servers (configured via `aicrew install`)

These packages are **not vendored** in this repository. Install them separately (typically via `npx -y <package>` or the server’s own installer). License information below was verified against the npm registry where applicable.

### @modelcontextprotocol/server-* (MIT)

Official [Model Context Protocol](https://modelcontextprotocol.io/) reference servers, referenced in **`config/mcp/cursor.json`** (template):

| Package | Typical use in template |
|---------|-------------------------|
| `@modelcontextprotocol/server-github` | GitHub API |
| `@modelcontextprotocol/server-filesystem` | Scoped filesystem access |
| `@modelcontextprotocol/server-memory` | Persistent memory |
| `@modelcontextprotocol/server-brave-search` | Web search (Brave API key) |
| `@modelcontextprotocol/server-playwright` | Browser automation |
| `@modelcontextprotocol/server-postgres` | PostgreSQL |
| `@modelcontextprotocol/server-sqlite` | SQLite |

**License:** MIT  
**Source:** https://github.com/modelcontextprotocol/servers

### @perplexity-ai/mcp-server (MIT)

Perplexity search MCP server (optional in Cursor template; requires **`PERPLEXITY_API_KEY`** in **`cursor.local.json`**).

**License:** MIT  
**npm:** `@perplexity-ai/mcp-server`

### context-mode (Elastic License 2.0)

Context shaping MCP server; pinned in **`config/mcp/`** for Claude, Cursor, and Codex.

**License:** Elastic-2.0  
**Repository:** https://github.com/mksglu/context-mode  
**npm:** `context-mode`

### token-optimizer-mcp (MIT)

Token budgeting and cache-friendly MCP responses; user-installed path in Cursor template.

**License:** MIT  
**Repository:** https://github.com/ooples/token-optimizer-mcp  
**npm:** `token-optimizer-mcp`

### codebase-memory-mcp (MIT) — separate install

High-performance code intelligence MCP server (knowledge graph over the repo). **Not an npm dependency of aicrew** — install the binary separately and point **`config/mcp/*.json`** / **`codex.toml`** at your local path (e.g. **`~/.local/bin/codebase-memory-mcp`**).

**License:** MIT  
**Repository:** https://github.com/DeusData/codebase-memory-mcp  
**npm:** `codebase-memory-mcp` (installer wrapper)

---

## Other optional integrations (Cursor template only)

| Integration | Notes |
|-------------|--------|
| **GitKraken / GitLens MCP** | Editor extension MCP host; not redistributed by aicrew. |

---

## Inspiration credits (not bundled)

These projects are **not** included in the aicrew package. They informed guidelines and architecture only.

### forrestchang/andrej-karpathy-skills (MIT)

Karpathy-inspired engineering guidelines referenced in skill/command tone and TDD discipline.

**License:** MIT  
**Repository:** https://github.com/forrestchang/andrej-karpathy-skills

### NVIDIA-NeMo/Guardrails

Architectural inspiration for guardrails, checkpoints, and structured phase gates — **no Guardrails code is bundled**.

**Repository:** https://github.com/NVIDIA-NeMo/Guardrails

---

## Updating this file

When adding MCP servers to **`config/mcp/`**, append a row here with package name, license, and source URL. Do not commit API keys or **`cursor.local.json`**.
