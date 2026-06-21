---
name: aicrew-cursor-plugin
description: Scaffold a local Cursor extension for a multi-tool terminal panel (Claude Code + Codex + Gemini).
---

# aicrew-cursor-plugin (Codex)

Use when: you want a Cursor sidebar panel that runs Claude Code, Codex, and Gemini CLI terminals side-by-side.

## Equivalent actions

| Method | Command |
|--------|---------|
| **CLI** | `aicrew cursor-plugin init [path]` |
| **Codex skill** | `aicrew-cursor-plugin` (this skill) |
| **Claude Code slash** | `/cursor-plugin` |

## Default output

Caveman/lean style. See `~/Agents/agents/caveman.md`.

## What it does

Scaffolds a local Cursor extension at the specified path (default: `./cursor-multi-tool-plugin`) with:
- A Cursor extension manifest (`package.json` with `contributes.viewsContainers`)
- A `src/` with webview that hosts multiple AI terminal panels in one window
- A `README.md` with build + install instructions

## Steps (when running in Codex)

1. Decide the target path (usually sibling to your repos, e.g., `~/cursor-multi-tool-plugin`)
2. Run: `npx aicrew cursor-plugin init ~/cursor-multi-tool-plugin`
3. Install the extension in Cursor:
   - Open Cursor → Extensions → `...` → Install from VSIX (or use `code --install-extension`)
4. Open the multi-tool panel from the Cursor activity bar

## Checkpoint

Ask: Where should the plugin be scaffolded? (default: `./cursor-multi-tool-plugin`)

**Wait for answer.**
