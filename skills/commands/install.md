---
description: "Run aicrew install — first-time global setup of skills, hooks, and MCP wiring. Supports platform-targeted install."
argument-hint: "[platform: claude | cursor | codex | gemini | all]"
---

> **Default output: caveman/lean** — terse by default. `/normal` or `/lean off` for verbose.

# /install

Run or guide the aicrew global install. Supports targeting a single platform.

## Platform-specific install

```bash
aicrew install             # all platforms (default)
aicrew install all         # same as default
aicrew install claude      # Claude Code only
aicrew install cursor      # Cursor only
aicrew install codex       # Codex only
aicrew install gemini      # Gemini CLI only
```

> `~/Agents/` is always populated as shared source of truth — even for platform-specific installs.

## Equivalent actions (all platforms)

| Method | Command |
|--------|---------|
| **CLI — all platforms** | `npx aicrew install` |
| **CLI — Claude only** | `npx aicrew install claude` |
| **CLI — Cursor only** | `npx aicrew install cursor` |
| **CLI — Codex only** | `npx aicrew install codex` |
| **CLI — Gemini only** | `npx aicrew install gemini` |
| **Codex skill** | `aicrew-install` |
| **This slash command** | `/install` |

## What each platform install does

### `aicrew install claude`
1. Copies package skills → `~/Agents/` (shared source of truth)
2. Merges skills → `~/.claude/skills/` (adds missing, never overwrites)
3. Symlinks `~/.claude/commands/*.md` → `~/Agents/commands/*.md`
4. Registers `session-memory.py` (Stop) + `security-guard.py` (PreToolUse) in `~/.claude/settings.json`
5. Symlinks `~/.claude/.mcp.json` → `config/mcp/claude.json`

### `aicrew install cursor`
1. Populates `~/Agents/` (shared source of truth)
2. Seeds `config/mcp/cursor.local.json` from template (if missing)
3. Symlinks `~/.cursor/mcp.json` → `config/mcp/cursor.local.json`

> Fill in real API keys in `config/mcp/cursor.local.json` (gitignored).
> Then run `aicrew agent-kit init` to share `.mdc` rules across repos.

### `aicrew install codex`
1. Populates `~/Agents/` (shared source of truth)
2. Merges `codex-skills/` → `~/.codex/skills/`
3. Patches `~/.codex/config.toml` with MCP server entries

### `aicrew install gemini`
1. Populates `~/Agents/` (shared source of truth)
2. Prints Gemini CLI config instructions (varies by Gemini CLI version)

> Wire manually: point Gemini CLI commands config to `~/Agents/commands/` or reference files directly.

### `aicrew install` (all)
Runs all of the above in sequence.

## Verify

```bash
aicrew status
```

Shows per-platform install state: `~/Agents/`, Claude commands, Cursor MCP, Codex skills, Gemini instructions.

## Full platform matrix

See [`skills/docs/platform-entry-points.md`](../docs/platform-entry-points.md) for the complete action → per-platform entry point table.
