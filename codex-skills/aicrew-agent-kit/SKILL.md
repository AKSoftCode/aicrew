---
name: aicrew-agent-kit
description: Scaffold the agent-kit — a shared Cursor .mdc rules layout with symlinks across repos.
---

# aicrew-agent-kit (Codex)

Use when: you want a single source of truth for Cursor `.mdc` rules shared across multiple repos via symlinks.

## Equivalent actions

| Method | Command |
|--------|---------|
| **CLI** | `aicrew agent-kit init [path]` |
| **Codex skill** | `aicrew-agent-kit` (this skill) |
| **Claude Code slash** | `/agent-kit` |

## Default output

Caveman/lean style. See `~/Agents/agents/caveman.md`.

## What it does

Scaffolds a standalone `agent-kit/` directory (default: `./agent-kit`) containing:
- A central `cursor-rules/` folder with `.mdc` rule files
- A `setup.sh` that symlinks these rules into each repo's `.cursor/rules/`
- A `README.md` with usage instructions

Once set up, run `setup.sh` from any repo to get the latest rules without copying files.

## Steps (when running in Codex)

1. Decide the target path (e.g., `~/agent-kit` for cross-repo sharing or `./agent-kit` for project-local)
2. Run: `npx aicrew agent-kit init ~/agent-kit`
3. Edit `~/agent-kit/cursor-rules/` with your `.mdc` rules
4. In each repo: `bash ~/agent-kit/setup.sh`

## After scaffold

```bash
# Symlink rules into a repo
cd /path/to/your/repo
bash ~/agent-kit/setup.sh
```

Your `.cursor/rules/` will contain symlinks to `~/agent-kit/cursor-rules/*.mdc`.
Edit once in `~/agent-kit/`, all repos pick it up instantly.
