# Platform Entry Points — Complete Matrix

Every aicrew action is reachable from every supported platform. No CLI required on any of them.

**Source of truth:** `~/Agents/` (platform-agnostic).
All platforms consume from there — via symlinks, merged copies, or config references.

---

## Platform install paths

| Platform | Install method | Skills land at |
|----------|---------------|----------------|
| **Claude Code** | `aicrew install claude` | `~/.claude/commands/`, `~/.claude/skills/`, hooks in `~/.claude/settings.json` |
| **Cursor** | `aicrew install cursor` | `~/.cursor/mcp.json` → `config/mcp/cursor.local.json`; rules via `~/Agents/agents/` |
| **Codex** | `aicrew install codex` | `~/.codex/skills/aicrew-*/`, MCP in `~/.codex/config.toml` |
| **Gemini CLI** | `aicrew install gemini` | `~/Agents/` populated; see Gemini config note below |
| **Antigravity** | (reads `~/Agents/` directly) | Reference `~/Agents/commands/` in Antigravity config |
| **All platforms** | `aicrew install` or `aicrew install all` | All of the above |

> `~/Agents/` is always populated regardless of which platform target is used.

---

## Core commands — per-platform entry point

| Action | CLI | Claude Code | Cursor | Codex | Gemini / Antigravity |
|--------|-----|-------------|--------|-------|----------------------|
| **Full dev pipeline** | — | `/dev` | `/dev` | `aicrew-dev` | `/dev` |
| **Fast bug fix** | — | `/fix` | `/fix` | `aicrew-fix` | `/fix` |
| **Scout → Act** | — | `/quick` | `/quick` | `aicrew-quick` | `/quick` |
| **Design brainstorm** | — | `/brainstorm` | `/brainstorm` | `brainstorm` | `/brainstorm` |

## Setup (install once)

| Action | CLI | Claude Code | Codex |
|--------|-----|-------------|-------|
| **First-time setup** | `aicrew install` | `/install` | `aicrew-install` |
| **Platform-only setup** | `aicrew install <platform>` | — | — |
| **Pull new skills** | `aicrew update` | `/update` | `aicrew-update` |
| **Check install state** | `aicrew status` | `/status` | `aicrew-status` |
| **Scaffold agent-kit** | `aicrew agent-kit init` | `/agent-kit` | `aicrew-agent-kit` |
| **Scaffold cursor plugin** | `aicrew cursor-plugin init` | `/cursor-plugin` | `aicrew-cursor-plugin` |

## Utilities (optional)

| Action | Claude Code / Cursor / Gemini / Antigravity | Codex |
|--------|---------------------------------------------|-------|
| **Wrap up session** | `/conclude` | `aicrew-conclude` |
| **Evolve project skills** | `/update-skills` | `aicrew-update-skills` |
| **Health check** | `/harness-audit` | `aicrew-harness-audit` |
| **Name session** | `/session` | `aicrew-session` |
| **Cross-tool handoff** | `/handoff` | `aicrew-handoff` |
| **Benchmark token savings** | `/benchmark` | `aicrew-benchmark` |

> **Output style:** Terse by default (caveman). Use `/normal` to restore verbose. Use `/lean on` to re-enable terse if you toggled it off.

---

## Platform notes

### Claude Code
- Slash commands via `~/.claude/commands/*.md` (symlinked from `~/Agents/commands/`)
- Skills readable from `~/.claude/skills/` (merged copy of `~/Agents/`)
- Hooks auto-registered in `~/.claude/settings.json`
- MCP servers wired via `~/.claude/.mcp.json`
- Interactive checkpoints: uses `AskUserQuestion` tool

### Cursor
- Commands available if `~/.claude/commands/` is symlinked or referenced (via Cursor's Claude integration)
- Rules loaded from `~/.cursor/rules/` (symlinked from `~/Agents/agents/`)
- MCP wired via `~/.cursor/mcp.json` → `config/mcp/cursor.local.json` (API keys gitignored)
- Agent-kit: `aicrew agent-kit init` creates a single-source-of-truth rules folder
- Cursor plugin: `aicrew cursor-plugin init` scaffolds a multi-tool terminal extension
- Interactive checkpoints: uses `askFollowupQuestion` tool

### Codex
- Skills installed to `~/.codex/skills/aicrew-*/` as native Codex skill folders
- Each skill is a `SKILL.md` that the Codex skill runner picks up automatically
- MCP wired via `~/.codex/config.toml` (patched by installer)
- No slash commands — use skill names directly (e.g., `aicrew-dev`)
- Interactive checkpoints: uses `ask_human` tool

### Gemini CLI
- References `~/Agents/` commands if Gemini supports slash commands from a config path
- `aicrew install gemini` ensures `~/Agents/` is populated; outputs Gemini config instructions
- Gemini-native wiring (config file path) varies by Gemini CLI version — see printed instructions after install
- Interactive checkpoints: uses `ask_human` tool

### Antigravity
- Reads `~/Agents/commands/` directly when configured
- Interactive checkpoints: uses platform `ask` tool (or ends response and waits)

---

## Interactive checkpoint platform matrix

All commands use mandatory stop-and-wait checkpoints. Platform behavior:

| Platform | Tool call | Fallback |
|----------|-----------|---------|
| Claude Code | `AskUserQuestion` | End response, wait for reply |
| Cursor | `askFollowupQuestion` | End response, wait for reply |
| Gemini CLI | `ask_human` | End response, wait for reply |
| Codex CLI | `ask_human` | End response, wait for reply |
| Antigravity | `ask` (if available) | End response, wait for reply |
| Autonomous script | Stops execution | Never invents answer |

---

## `aicrew status` — per-platform state

`aicrew status` shows install state for each platform:

```
=== aicrew status ===

Shared assets (~/Agents/):     ✓ populated
Claude Code:                   ✓ ~/.claude/commands/ (17 symlinks), hooks registered
Cursor:                        ✓ ~/.cursor/mcp.json linked
Codex:                         ✓ ~/.codex/skills/ (18 skill folders)
Gemini CLI:                    ⚠ ~/Agents/ populated; manual Gemini config needed
```

Run: `aicrew status`
