# AICrew Multi-Tool Launcher (Cursor extension template)

This template creates a local Cursor/VS Code extension that opens terminal sessions for:

- Claude Code CLI
- Gemini CLI
- Codex CLI

with one shared task/session name.

## Commands

- `AICrew: Start Multi-Tool Task`
- `AICrew: Open Claude Code Terminal`
- `AICrew: Open Gemini CLI Terminal`
- `AICrew: Open Codex Terminal`

## Settings

- `aicrewMultiTool.claudeCommand` (default: `claude`)
- `aicrewMultiTool.geminiCommand` (default: `gemini`)
- `aicrewMultiTool.codexCommand` (default: `codex`)
- `aicrewMultiTool.exportSessionVar` (default: `true`)

When enabled, the extension exports `AICREW_SESSION=<session-name>` before launching each CLI.

## Install in Cursor (local dev)

1. Open this template folder as a project in Cursor or VS Code.
2. Press `F5` to launch an Extension Development Host.
3. In that host window, run command palette and execute: `AICrew: Start Multi-Tool Task`.

## Package (optional)

```bash
npm i -g @vscode/vsce
vsce package
```

Then install the generated `.vsix` in Cursor.
