---
name: aicrew-status
description: Show what aicrew has installed — ~/Agents, hooks, commands, Codex skills, and project .ai/skills/.
---

# aicrew-status (Codex)

Use when: verifying aicrew is correctly installed, or diagnosing a missing skill or hook.

## Equivalent actions

| Method | Command |
|--------|---------|
| **CLI** | `aicrew status` or `npx aicrew status` |
| **Codex skill** | `aicrew-status` (this skill) |
| **Claude Code slash** | `/status` |

## Default output

Caveman/lean style. See `~/Agents/agents/caveman.md`.

## What to check

Run `aicrew status` and inspect each section:

1. **Shared assets** — `~/Agents/` should exist with `commands/`, `agents/`, `hooks/`
2. **Global commands** — `~/.claude/commands/` symlinks (`/dev`, `/fix`, `/quick`, ...)
3. **Registered hooks** — `session-memory.py` (Stop) + `security-guard.py` (PreToolUse)
4. **Codex skills** — `~/.codex/skills/aicrew-*` present
5. **Project skills** — `.ai/skills/` in current repo (if any)

## Remediation

| Issue | Fix |
|-------|-----|
| `~/Agents/` missing | Run `aicrew install` |
| Commands missing | Run `aicrew install` |
| Hooks not registered | Run `aicrew install` |
| Codex skills missing | Run `aicrew install` |
| Project skills missing | Run `aicrew-update-skills` or `/update-skills` |
| MCP wiring missing | Run `aicrew install` |

## Quick inline check (Codex)

```bash
ls ~/Agents/commands/
ls ~/.codex/skills/
aicrew status
```
