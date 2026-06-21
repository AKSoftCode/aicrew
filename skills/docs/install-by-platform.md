# Install by Platform

Step-by-step install guide for each supported platform. One command per platform — then run any aicrew action immediately.

**Source of truth:** `~/Agents/` (populated for every platform)
**Full action matrix:** [`platform-entry-points.md`](./platform-entry-points.md)

---

## Claude Code

### Install

```bash
npx aicrew install claude
# or, after cloning and installing globally:
aicrew install claude
```

### What gets installed

| Location | Contents |
|----------|----------|
| `~/Agents/` | Shared source of truth — commands, agents, hooks, docs |
| `~/.claude/commands/` | Symlinks → `~/Agents/commands/*.md` (slash commands) |
| `~/.claude/skills/` | Merged copy of `~/Agents/` (Claude skill reader) |
| `~/.claude/settings.json` | Merged hook entries (`session-memory.py`, `security-guard.py`) |
| `~/.claude/.mcp.json` | Symlink → `config/mcp/claude.json` |

### First command to run

```
/dev I want to add a login page with email + password
```

### Available slash commands

**Core:**

| Command | What it does |
|---------|-------------|
| `/dev` | Full 9-phase TDD pipeline |
| `/fix` | Fast bug-fix flow |
| `/quick` | Scout → Act (token-efficient) |
| `/brainstorm` | 3 design options with trade-offs |

**Utilities:**

| Command | What it does |
|---------|-------------|
| `/conclude` | Wrap up session, capture learnings |
| `/update-skills` | Evolve project-level skill overrides |
| `/harness-audit` | Audit skill health and hook wiring |
| `/session` | Name this task (avoids state file collisions) |
| `/handoff` | Cross-tool state checkpoint |
| `/benchmark` | Token savings estimate |

**Setup / maintenance:**

| Command | What it does |
|---------|-------------|
| `/install` | Re-run install / update |
| `/update` | Pull latest skills from package |
| `/status` | Show install state per platform |
| `/agent-kit` | Scaffold `.mdc` rules shared across repos |
| `/cursor-plugin` | Scaffold Cursor multi-tool extension |

> **Output style:** Terse by default (caveman). Use `/normal` to go verbose; `/lean on` or `/terse` to return to terse.

### Hooks

| Hook | Event | Role |
|------|-------|------|
| `session-memory.py` | Stop | Journals changed files; strips `<private>` blocks |
| `security-guard.py` | PreToolUse | Blocks secrets; warns on risky patterns |

Tune with `ECC_HOOK_PROFILE=minimal|standard|strict`.

### MCP

`~/.claude/.mcp.json` → `config/mcp/claude.json` (symlinked).
Core servers: `codebase-memory-mcp`, `context-mode`, `token-optimizer-mcp`.

### Interactive checkpoints

Uses `AskUserQuestion` tool — never invents your answer.

---

## Cursor

### Install

```bash
npx aicrew install cursor
# or after global install:
aicrew install cursor
```

### What gets installed

| Location | Contents |
|----------|----------|
| `~/Agents/` | Shared source of truth |
| `~/.cursor/mcp.json` | Symlink → `config/mcp/cursor.local.json` |
| `config/mcp/cursor.local.json` | Seeded from template (gitignored — fill real API keys here) |

### First command to run

Ask the Cursor agent with the shared `~/Agents/` rules:

```
/dev I want to add a login page with email + password
```

Or use the CLI scaffold commands:

```bash
aicrew agent-kit init        # share .mdc rules across repos
aicrew cursor-plugin init    # scaffold a multi-tool terminal extension
```

### Available actions

| Action | How |
|--------|-----|
| `/dev`, `/fix`, `/quick`, `/conclude`, etc. | Via Claude integration (rules in `~/Agents/`) |
| MCP tools | Wired via `~/.cursor/mcp.json` |
| Agent-kit rules | Run `aicrew agent-kit init` → shares `.mdc` across repos |
| Cursor plugin | Run `aicrew cursor-plugin init` → scaffolds local extension |

### MCP

`~/.cursor/mcp.json` symlinks to `config/mcp/cursor.local.json`.
`config/mcp/cursor.json` is the committed template (no secrets).
Fill API keys in `cursor.local.json` (gitignored).

Optional servers: GitHub, filesystem, memory, Brave, Playwright, SQLite, Postgres, GitKraken, Perplexity.

### Interactive checkpoints

Uses `askFollowupQuestion` tool.

---

## Codex

### Install

```bash
npx aicrew install codex
# or after global install:
aicrew install codex
```

### What gets installed

| Location | Contents |
|----------|----------|
| `~/Agents/` | Shared source of truth |
| `~/.codex/skills/` | Codex-native skill folders (`aicrew-dev`, `aicrew-fix`, …) |
| `~/.codex/config.toml` | Patched with MCP server entries |

### First command to run

Invoke a skill by name in Codex:

```
aicrew-dev
```

### Available Codex skills

**Core:**

| Skill name | Equivalent |
|------------|-----------|
| `aicrew-dev` | `/dev` |
| `aicrew-fix` | `/fix` |
| `aicrew-quick` | `/quick` |
| `brainstorm` | `/brainstorm` |

**Utilities:**

| Skill name | Equivalent |
|------------|-----------|
| `aicrew-conclude` | `/conclude` |
| `aicrew-update-skills` | `/update-skills` |
| `aicrew-harness-audit` | `/harness-audit` |
| `aicrew-session` | `/session` |
| `aicrew-handoff` | `/handoff` |
| `aicrew-benchmark` | `/benchmark` |

**Setup / maintenance:**

| Skill name | Equivalent |
|------------|-----------|
| `aicrew-install` | `/install` |
| `aicrew-update` | `/update` |
| `aicrew-status` | `/status` |
| `aicrew-agent-kit` | `/agent-kit` |
| `aicrew-cursor-plugin` | `/cursor-plugin` |

> **Output style:** Terse by default (caveman). Use `aicrew-normal` to go verbose; `lean` or `aicrew-terse` to return to terse.

### MCP (config.toml)

`aicrew install codex` patches `~/.codex/config.toml` with MCP server entries.
Core: `codebase-memory-mcp`, `context-mode`, `token-optimizer-mcp`.

### Interactive checkpoints

Uses `ask_human` tool.

---

## Gemini CLI

### Install

```bash
npx aicrew install gemini
# or after global install:
aicrew install gemini
```

### What gets installed

| Location | Contents |
|----------|----------|
| `~/Agents/` | Shared source of truth (always populated) |

Gemini CLI prints post-install instructions for wiring commands manually (varies by Gemini CLI version).

### Wire manually

Point your Gemini CLI commands config to `~/Agents/commands/` or reference files directly:

```bash
# Example: reference a command inline
cat ~/Agents/commands/dev.md
```

### First command to run

After wiring, use the command text from `~/Agents/commands/dev.md` as your Gemini prompt, or use it as a slash command if your Gemini CLI version supports that.

### Available actions

All commands in `~/Agents/commands/` are available:
`/dev`, `/fix`, `/quick`, `/conclude`, `/update-skills`, `/harness-audit`, `/session`, `/handoff`, `/benchmark`, `/brainstorm`, `/lean on`, `/lean off`, `/terse`, `/normal`.

### Interactive checkpoints

Uses `ask_human` tool (or ends response and waits).

---

## Antigravity

### Install

Antigravity reads `~/Agents/commands/` directly.

```bash
npx aicrew install           # populates ~/Agents/ (all platforms)
# or:
aicrew install               # same
```

`aicrew install gemini` also works — both just populate `~/Agents/`.

### What to configure

In your Antigravity config, point the commands reference to `~/Agents/commands/`.

### First command to run

```
/dev I want to add a login page with email + password
```

### Available actions

All slash commands from `~/Agents/commands/`:
`/dev`, `/fix`, `/quick`, `/conclude`, `/update-skills`, `/harness-audit`, `/session`, `/handoff`, `/brainstorm`, `/lean on`, `/lean off`, `/terse`, `/normal`.

### Interactive checkpoints

Uses `ask` tool (if available), or ends response and waits.

---

## All platforms at once

```bash
npx aicrew install         # installs for all supported platforms
npx aicrew install all     # same
```

---

## Verify any platform

```bash
aicrew status
```

Expected output:

```
=== aicrew status ===

Shared assets (~/Agents/):     ✓ populated
Claude Code:                   ✓ ~/.claude/commands/ (17 symlinks), hooks registered
Cursor:                        ✓ ~/.cursor/mcp.json linked
Codex:                         ✓ ~/.codex/skills/ (18 skill folders)
Gemini CLI:                    ⚠ ~/Agents/ populated; manual Gemini config needed
```

---

## Re-install / update skills

```bash
aicrew update               # pull latest skills from package → ~/Agents/
# or per platform:
aicrew install claude       # re-runs claude install (merge, not clobber)
aicrew install codex        # re-runs codex install
```

---

## See also

- **Complete action matrix:** [`platform-entry-points.md`](./platform-entry-points.md)
- **Install command reference:** [`../commands/install.md`](../commands/install.md)
- **Skills system overview:** [`../SKILLS_SYSTEM.md`](../SKILLS_SYSTEM.md)
