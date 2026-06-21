---
name: aicrew-update
description: Re-run `aicrew install` to pick up new skills from the package (merge only — preserves user edits).
---

# aicrew-update (Codex)

Use when: aicrew has released new skills or commands and you want to pull them in without overwriting local edits.

## Equivalent actions

| Method | Command |
|--------|---------|
| **CLI** | `npx aicrew update` or `aicrew update` |
| **Codex skill** | `aicrew-update` (this skill) |
| **Claude Code slash** | `/update` |

## Default output

Caveman/lean style. See `~/Agents/agents/caveman.md`.

## What update does

Same as `install` — re-merges package skills into `~/Agents/`, `~/.claude/skills/`, and `~/.codex/skills/`.
- Adds new files that don't exist yet.
- Skips (keeps) files you've already customized.
- Re-registers hooks if missing.

## Steps (when running in Codex)

1. Run: `npx aicrew update` (or `aicrew update`)
2. Verify: `aicrew status`

## Note

To evolve project-specific skills, use `aicrew-update-skills` (or `/update-skills` in Claude Code) — that generates `.ai/skills/` overrides from your repo context.
