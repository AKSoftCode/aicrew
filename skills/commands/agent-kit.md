---
description: "Scaffold a shared Cursor .mdc rules layout (agent-kit) with symlinks across repos"
argument-hint: "[path]"
---

> **Default output: caveman/lean** — terse by default. `/normal` or `/lean off` for verbose.

# /agent-kit

Scaffold the agent-kit — single source of truth for Cursor `.mdc` rules.

## Equivalent actions

| Method | Command |
|--------|---------|
| **CLI** | `aicrew agent-kit init [path]` |
| **Codex skill** | `aicrew-agent-kit` |
| **This slash command** | `/agent-kit [path]` |

## What it does

Scaffolds `[path]` (default: `./agent-kit`) with:
- `cursor-rules/` — `.mdc` rule files for Cursor
- `setup.sh` — symlinks rules into each repo's `.cursor/rules/`
- `README.md` — usage instructions

## Run it

```bash
# Default location:
npx aicrew agent-kit init ./agent-kit

# Custom location (shared across repos):
npx aicrew agent-kit init ~/agent-kit
```

## After scaffold

```bash
# In any repo — symlink rules in:
cd /path/to/your/repo
bash ~/agent-kit/setup.sh
```

Edit `.mdc` rules once in `~/agent-kit/`. All repos pick up changes instantly.

## Argument

If `$ARGUMENTS` contains a path, use it. Otherwise ask:
> Where should agent-kit be scaffolded? [default: ./agent-kit]

**Wait for answer.**
