---
description: "Scaffold a local Cursor extension for a multi-tool AI terminal panel"
argument-hint: "[path]"
---

> **Default output: caveman/lean** — terse by default. `/normal` or `/lean off` for verbose.

# /cursor-plugin

Scaffold a local Cursor extension for Claude Code + Codex + Gemini terminals side-by-side.

## Equivalent actions

| Method | Command |
|--------|---------|
| **CLI** | `aicrew cursor-plugin init [path]` |
| **Codex skill** | `aicrew-cursor-plugin` |
| **This slash command** | `/cursor-plugin [path]` |

## What it does

Scaffolds a Cursor extension at `[path]` (default: `./cursor-multi-tool-plugin`) with:
- Extension manifest (`package.json` with `contributes.viewsContainers`)
- Webview with multiple AI terminal panels in one Cursor sidebar
- `README.md` with build + install instructions

## Run it

```bash
# Default location:
npx aicrew cursor-plugin init ./cursor-multi-tool-plugin

# Custom location:
npx aicrew cursor-plugin init ~/cursor-multi-tool-plugin
```

## After scaffold

1. Build: `cd ./cursor-multi-tool-plugin && npm install && npm run compile`
2. Install in Cursor: Extensions → `...` → Install from VSIX (or `code --install-extension`)
3. Open the multi-tool panel from the Cursor activity bar

## Argument

If `$ARGUMENTS` contains a path, use it. Otherwise ask:
> Where should the Cursor plugin be scaffolded? [default: ./cursor-multi-tool-plugin]

**Wait for answer.**
