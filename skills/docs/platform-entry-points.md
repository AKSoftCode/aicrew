# Platform Entry Points — Complete Matrix

Every aicrew action is reachable from every supported platform. No CLI required on any of them.

**Source of truth:** `~/Agents/` (platform-agnostic).
All platforms consume from there — via symlinks, merged copies, or config references.

---

## Platform install paths

| Platform | Install method | Skills land at |
|----------|---------------|----------------|
| **Claude Code** | `aicrew install claude` | `~/.claude/commands/`, `~/.claude/skills/`, hooks in `~/.claude/settings.json` |
| **Cursor** | `aicrew install cursor` | `~/.cursor/mcp.json` → `config/mcp/cursor.local.json`; rules via `~/Agents/agents/` |
| **Codex** | `aicrew install codex` | `~/.codex/skills/aicrew-*/`, MCP in `~/.codex/config.toml` |
| **Gemini CLI** | `aicrew install gemini` | `~/Agents/` populated; see Gemini config note below |
| **Antigravity** | (reads `~/Agents/` directly) | Reference `~/Agents/commands/` in Antigravity config |
| **All platforms** | `aicrew install` or `aicrew install all` | All of the above |

> `~/Agents/` is always populated regardless of which platform target is used.

---

## Action → Per-platform entry point

| Action | CLI | Claude Code | Cursor | Codex | Gemini CLI | Antigravity |
|--------|-----|-------------|--------|-------|------------|-------------|
| **First-time setup** | `aicrew install` | `/install` | `aicrew install cursor` | `aicrew-install` | `aicrew install gemini` | — |
| **Platform-only setup** | `aicrew install <platform>` | — | — | — | — | — |
| **Pull new skills** | `aicrew update` | `/update` | re-run `aicrew install cursor` | `aicrew-update` | re-run `aicrew install gemini` | — |
| **Check install state** | `aicrew status` | `/status` | `aicrew status` | `aicrew-status` | `aicrew status` | — |
| **Scaffold agent-kit** | `aicrew agent-kit init` | `/agent-kit` | `aicrew agent-kit init` | `aicrew-agent-kit` | — | — |
| **Scaffold cursor plugin** | `aicrew cursor-plugin init` | `/cursor-plugin` | `aicrew cursor-plugin init` | `aicrew-cursor-plugin` | — | — |
| **Full dev pipeline** | — | `/dev` | `/dev` (via symlink) | `aicrew-dev` | `/dev` | `/dev` |
| **Fast bug fix** | — | `/fix` | `/fix` (via symlink) | `aicrew-fix` | `/fix` | `/fix` |
| **Scout → Act** | — | `/quick` | `/quick` (via symlink) | `aicrew-quick` | `/quick` | `/quick` |
| **Wrap up session** | — | `/conclude` | `/conclude` (via symlink) | `aicrew-conclude` | `/conclude` | `/conclude` |
| **Evolve project skills** | — | `/update-skills` | `/update-skills` (via symlink) | `aicrew-update-skills` | `/update-skills` | `/update-skills` |
| **Audit harness** | — | `/harness-audit` | `/harness-audit` (via symlink) | `aicrew-harness-audit` | `/harness-audit` | `/harness-audit` |
| **Session checkpoint label** | — | `/session` | `/session` (via symlink) | `aicrew-session` | `/session` | `/session` |
| **Cross-tool handoff** | — | `/handoff` | `/handoff` (via symlink) | `aicrew-handoff` | `/handoff` | `/handoff` |
| **Benchmark token savings** | `aicrew benchmark` | `/benchmark` | `aicrew benchmark` | `aicrew-benchmark` | `aicrew benchmark` | — |
| **Design brainstorm** | — | `/brainstorm` | `/brainstorm` (via symlink) | `brainstorm` | `/brainstorm` | `/brainstorm` |
| **Lean/terse on** | — | `/lean on` | `/lean on` (via symlink) | `lean` | `/lean on` | `/lean on` |
| **Lean/terse off** | — | `/lean off` or `/normal` | `/lean off` or `/normal` | `aicrew-normal` | `/lean off` | `/lean off` |
| **Re-enable terse** | — | `/terse` | `/terse` (via symlink) | `aicrew-terse` | `/terse` | `/terse` |

---

## Platform notes

### Claude Code
- Slash commands via `~/.claude/commands/*.md` (symlinked from `~/Agents/commands/`)
- Skills readable from `~/.claude/skills/` (merged copy of `~/Agents/`)
- Hooks auto-registered in `~/.claude/settings.json`
- MCP servers wired via `~/.claude/.mcp.json`
- Interactive checkpoints: uses `AskUserQuestion` tool

### Cursor
- Commands available if `~/.claude/commands/` is symlinked or referenced (via Cursor's Claude integration)
- Rules loaded from `~/.cursor/rules/` (symlinked from `~/Agents/agents/`)
- MCP wired via `~/.cursor/mcp.json` → `config/mcp/cursor.local.json` (API keys gitignored)
- Agent-kit: `aicrew agent-kit init` creates a single-source-of-truth rules folder
- Cursor plugin: `aicrew cursor-plugin init` scaffolds a multi-tool terminal extension
- Interactive checkpoints: uses `askFollowupQuestion` tool

### Codex
- Skills installed to `~/.codex/skills/aicrew-*/` as native Codex skill folders
- Each skill is a `SKILL.md` that the Codex skill runner picks up automatically
- MCP wired via `~/.codex/config.toml` (patched by installer)
- No slash commands — use skill names directly (e.g., `aicrew-dev`)
- Interactive checkpoints: uses `ask_human` tool

### Gemini CLI
- References `~/Agents/` commands if Gemini supports slash commands from a config path
- `aicrew install gemini` ensures `~/Agents/` is populated; outputs Gemini config instructions
- Gemini-native wiring (config file path) varies by Gemini CLI version — see printed instructions after install
- Interactive checkpoints: uses `ask_human` tool

### Antigravity
- Reads `~/Agents/commands/` directly when configured
- Interactive checkpoints: uses platform `ask` tool (or ends response and waits)

---

## Interactive checkpoint platform matrix

All commands use mandatory stop-and-wait checkpoints. Platform behavior:

| Platform | Tool call | Fallback |
|----------|-----------|---------|
| Claude Code | `AskUserQuestion` | End response, wait for reply |
| Cursor | `askFollowupQuestion` | End response, wait for reply |
| Gemini CLI | `ask_human` | End response, wait for reply |
| Codex CLI | `ask_human` | End response, wait for reply |
| Antigravity | `ask` (if available) | End response, wait for reply |
| Autonomous script | Stops execution | Never invents answer |

---

## `aicrew status` — per-platform state

`aicrew status` shows install state for each platform:

```
=== aicrew status ===

Shared assets (~/Agents/):     ✓ populated
Claude Code:                   ✓ ~/.claude/commands/ (17 symlinks), hooks registered
Cursor:                        ✓ ~/.cursor/mcp.json linked
Codex:                         ✓ ~/.codex/skills/ (18 skill folders)
Gemini CLI:                    ⚠ ~/Agents/ populated; manual Gemini config needed
```

Run: `aicrew status`
