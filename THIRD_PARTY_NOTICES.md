# Third-Party Notices

This file lists the MCP servers, npm packages, and external projects that aicrew references, installs, or draws architectural inspiration from.

---

## Bundled / installed via `aicrew install`

The following packages are **not bundled inside the aicrew npm package**. They are pulled at runtime by the MCP host (Claude Code, Codex, Cursor) using the server definitions in `config/mcp/`.

---

### `@modelcontextprotocol/server-github`

- **Version:** 2025.4.8 (latest at time of writing)
- **License:** MIT
- **Source:** https://www.npmjs.com/package/@modelcontextprotocol/server-github
- **Copyright:** Anthropic, PBC and contributors

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions: The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software. THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.

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

### `codebase-memory-mcp`

- **Version:** 0.8.1 (latest at time of writing)
- **License:** MIT
- **Source:** https://www.npmjs.com/package/codebase-memory-mcp
- **Install location:** `~/.local/bin/codebase-memory-mcp` (standalone binary; **not** bundled in the aicrew npm package)

See MIT license text above; same terms apply.

---

## Architecture inspiration (not bundled, not distributed)

The following projects are **not included in aicrew** in any form. They influenced design decisions and are credited here for transparency.

---

### forrestchang/andrej-karpathy-skills

- **Repository:** https://github.com/forrestchang/andrej-karpathy-skills
- **License:** MIT
- **Inspiration:** Karpathy-style agent safety heuristics (slow down before irreversible actions, prefer reversible steps, checkpoint state) informed the design of aicrew's guardrail layer and phase-gate checkpoints.
- **No code copied.**

---

### NVIDIA NeMo Guardrails

- **Repository:** https://github.com/NVIDIA/NeMo-Guardrails
- **License:** [NVIDIA NeMo Guardrails License](https://github.com/NVIDIA/NeMo-Guardrails/blob/main/LICENSE) — not MIT; review before any redistribution.
- **Inspiration:** The input-rail / output-rail / dialogue-rail layered architecture (input guard → phase logic → output reviewer) influenced aicrew's `security-guard.py` (PreToolUse), phase-gate checkpoints, and `security-reviewer` agent pattern.
- **No code copied. Architecture reference only.**

---

### chopratejas/headroom

- **Repository:** https://github.com/chopratejas/headroom
- **License:** Apache 2.0
- **Inspiration:** Headroom's context compression architecture — CCR (Compress-Cache-Retrieve), ContentRouter, CacheAligner, RollingWindow, and the `headroom learn` → AGENTS.md pattern — informed aicrew's "context budget rail" concept and the Headroom-inspired section in `skills/docs/guardrails-taxonomy.md`.
- **No code copied. Architecture reference only.**

---

*This file is maintained manually. If you add a new MCP server to `config/mcp/`, please add a corresponding entry here.*
