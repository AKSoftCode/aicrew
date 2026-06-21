---
name: aicrew-install
description: Run or guide `aicrew install` — first-time global setup of skills, hooks, and MCP wiring.
---

# aicrew-install (Codex)

Use when: first time setting up aicrew on a machine, or running from within Codex without a terminal.

## Equivalent actions

| Method | Command |
|--------|---------|
| **CLI** | `npx aicrew install` or `aicrew install` |
| **Codex skill** | `aicrew-install` (this skill) |
| **Claude Code slash** | `/install` |

## Default output

Caveman/lean style. See `~/Agents/agents/caveman.md`.

## What install does

1. Copies package skills → `~/Agents/` (shared source of truth)
2. Merges skills → `~/.claude/skills/` (adds missing, never overwrites)
3. Symlinks `~/.claude/commands/*.md` → `~/Agents/commands/*.md`
4. Merges `codex-skills/` → `~/.codex/skills/`
5. Registers `session-memory.py` (Stop) + `security-guard.py` (PreToolUse) in `~/.claude/settings.json`
6. Symlinks MCP configs (`~/.claude/.mcp.json`, `~/.cursor/mcp.json`), patches Codex `config.toml`

## Steps (when running in Codex)

1. Confirm Node 18+ is available: `node --version`
2. Run: `npx aicrew install` (or `aicrew install` if globally installed)
3. Verify: `aicrew status`

## Expected output

```
=== aicrew — Global Install ===
...
=== Install complete ===
Commands available: N
Available commands in Claude Code:
  /dev   /quick   /conclude   /update-skills ...
Available skills in Codex:
  aicrew-dev, aicrew-fix, aicrew-quick, aicrew-conclude, ...
```

## After install

Open Claude Code in any project and type `/dev`. In Codex, invoke `aicrew-dev`.
