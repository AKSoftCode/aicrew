---
description: "Run aicrew install — first-time global setup of skills, hooks, and MCP wiring. Supports platform-targeted install."
argument-hint: "[platform: claude | cursor | codex | gemini | all]"
---

> **Default output: caveman/lean** — terse by default. `/normal` or `/lean off` for verbose.

# /install

Run the aicrew global install. Targets a single platform or all at once.

## Quick reference

```bash
aicrew install             # all platforms (default)
aicrew install claude      # Claude Code only
aicrew install cursor      # Cursor only
aicrew install codex       # Codex only
aicrew install gemini      # Gemini CLI only
```

> `~/Agents/` is always populated as shared source of truth — even for platform-specific installs.

## What each platform install does

| Platform | What gets wired |
|----------|----------------|
| `claude` | `~/Agents/`, command symlinks in `~/.claude/commands/`, hooks in `settings.json`, MCP in `~/.claude/.mcp.json` |
| `cursor` | `~/Agents/`, `~/.cursor/mcp.json` → `config/mcp/cursor.local.json` (fill real API keys there) |
| `codex` | `~/Agents/`, skills in `~/.codex/skills/`, MCP in `~/.codex/config.toml` |
| `gemini` | `~/Agents/` + printed config instructions for manual wiring |

## Verify

```bash
aicrew status
```

Shows per-platform install state: `~/Agents/`, Claude commands, Cursor MCP, Codex skills, Gemini instructions.

## Full platform matrix

See [`skills/docs/platform-entry-points.md`](../docs/platform-entry-points.md) for the complete action → per-platform entry point table.
