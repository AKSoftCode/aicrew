---
description: "Show what aicrew has installed — ~/Agents, hooks, commands, Codex skills, and .ai/skills/"
argument-hint: ""
---

> **Default output: caveman/lean** — terse by default. `/normal` or `/lean off` for verbose.

# /status

Show installed aicrew components and diagnose anything missing.

## Equivalent actions

| Method | Command |
|--------|---------|
| **CLI** | `aicrew status` or `npx aicrew status` |
| **Codex skill** | `aicrew-status` |
| **This slash command** | `/status` |

## What to check

Run `aicrew status` and inspect each section:

1. **Shared assets** — `~/Agents/` with `commands/`, `agents/`, `hooks/`
2. **Global commands** — `~/.claude/commands/` symlinks
3. **Registered hooks** — `session-memory.py` + `security-guard.py`
4. **Codex skills** — `~/.codex/skills/aicrew-*`
5. **Project skills** — `.ai/skills/` in current repo

## Quick inline check

```bash
aicrew status
ls ~/Agents/commands/
ls ~/.codex/skills/
```

## Remediation

| Issue | Fix |
|-------|-----|
| `~/Agents/` missing | `aicrew install` |
| Hooks not registered | `aicrew install` |
| Project skills missing | `/update-skills` |
