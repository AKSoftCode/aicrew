---
description: "Re-run aicrew install to pick up new skills (merge only — preserves user edits)"
argument-hint: ""
---

> **Default output: caveman/lean** — terse by default. `/normal` or `/lean off` for verbose.

# /update

Re-merge new aicrew skills without overwriting local edits.

## Equivalent actions

| Method | Command |
|--------|---------|
| **CLI** | `npx aicrew update` or `aicrew update` |
| **Codex skill** | `aicrew-update` |
| **This slash command** | `/update` |

## What update does

Same as `install` — re-merges package skills into `~/Agents/`, `~/.claude/skills/`, `~/.codex/skills/`.
- Adds new files that don't exist yet
- Skips (keeps) files you've already customized
- Re-registers hooks if missing

## Run it

```bash
npx aicrew update
# or:
aicrew update
```

## Note

To evolve project-specific skills, use `/update-skills` (generates `.ai/skills/` overrides from your repo context).
