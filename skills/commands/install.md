---
description: "Run aicrew install — first-time global setup of skills, hooks, and MCP wiring"
argument-hint: ""
---

> **Default output: caveman/lean** — terse by default. `/normal` or `/lean off` for verbose.

# /install

Run or guide the aicrew global install.

## Equivalent actions

| Method | Command |
|--------|---------|
| **CLI** | `npx aicrew install` or `aicrew install` |
| **Codex skill** | `aicrew-install` |
| **This slash command** | `/install` |

## What install does

1. Copies package skills → `~/Agents/` (shared source of truth)
2. Merges skills → `~/.claude/skills/` (adds missing, never overwrites)
3. Symlinks `~/.claude/commands/*.md` → `~/Agents/commands/*.md`
4. Merges `codex-skills/` → `~/.codex/skills/`
5. Registers `session-memory.py` (Stop) + `security-guard.py` (PreToolUse) in `~/.claude/settings.json`
6. Symlinks MCP configs, patches Codex `config.toml`

## Run it

```bash
npx aicrew install
# or if globally installed:
aicrew install
```

Then verify: `aicrew status`
