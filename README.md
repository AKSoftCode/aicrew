# aicrew

**A TDD-first AI development pipeline for Claude Code, Cursor, Codex, Gemini CLI, and Antigravity.**

---

## Install

```bash
npx aicrew install               # all platforms
npx aicrew install claude|cursor|codex|gemini   # one platform
npx aicrew install mcp           # optional MCP servers (graph index, token optimizer)
```

**Requirements:** Node 18+. No extra Python packages.

---

## Daily commands

### `/dev` — full pipeline (features, refactors)

9-phase pipeline: intake → research → brainstorm → design → implement (TDD) → tests → security → audit → conclude. Every phase stops and waits for your go-ahead. Use for anything that needs a design spec or touches multiple systems.

```
/dev Add rate limiting to the auth API
```

Codex: `aicrew-dev`

---

### `/fix` — fast bug fix

3 intake questions, then TDD straight to done. Skips brainstorm and design phases. Use when you know what's broken and want it fixed.

```
/fix OAuth redirect returns 500 after login
```

Codex: `aicrew-fix`

---

### `/quick` — small task, lowest tokens

Scout → Act. A cheap model does a graph-first discovery pass (~500 tokens) and emits a summary; the main model acts from that summary only. No pipeline overhead. Use for scoped, well-defined tasks.

```
/quick Rename UserService to AccountService across the repo
```

Codex: `aicrew-quick`

---

## Which one?

| Situation | Use |
|-----------|-----|
| New feature, refactor, or anything needing a design spec | `/dev` |
| Bug fix — you know what's broken | `/fix` |
| Small scoped task — rename, tweak, quick addition | `/quick` |

> Examples: "Add login page with email + password" → `/dev`. "Fix broken OAuth redirect" → `/fix`. "Rename a variable across three files" → `/quick`.

---

---

## Advanced

### Brainstorm first

Get 3 materially different approaches with trade-offs before writing any code.

```
/brainstorm How should I structure the auth layer?
```

Codex: `brainstorm`

---

### Cross-tool handoff

Switching tools mid-task (Claude → Cursor)? Run `/handoff` to produce a compact state block (~300 tokens). Paste it into the new tool — no chat replay.

1. Name the session early: `/session cursor my-feature`
   → state file: `.ai/state/AI_STATE.cursor.my-feature.md`
2. When ready to switch: `/handoff`
3. In the new tool: `Continue from .ai/state/AI_STATE.cursor.my-feature.md`

Each switch costs ~300 tokens instead of ~15,000.

Codex: `aicrew-handoff` / `aicrew-session`

---

### Utilities

| Command | Codex skill | What it does |
|---------|-------------|--------------|
| `/conclude` | `aicrew-conclude` | End session — saves learnings, proposes commit message |
| `/update-skills` | `aicrew-update-skills` | Refresh or generate project-specific skills |
| `/harness-audit` | `aicrew-harness-audit` | Health-check your aicrew install |
| `/session` | `aicrew-session` | Name this task so state files don't collide |
| `/handoff` | `aicrew-handoff` | Compact summary when switching tools |
| `/benchmark` | `aicrew-benchmark` | Estimate tokens saved (writes `.ai/reports/TOKEN_REPORT`) |
| `/brainstorm` | `brainstorm` | 3 design options with trade-offs |

---

### Platform matrix

> Full invocation details: [`skills/docs/platform-entry-points.md`](./skills/docs/platform-entry-points.md)
> Step-by-step install guide: [`skills/docs/install-by-platform.md`](./skills/docs/install-by-platform.md)

| Action | CLI | Claude Code / Cursor / Gemini / Antigravity | Codex |
|--------|-----|---------------------------------------------|-------|
| Full dev pipeline | — | `/dev` | `aicrew-dev` |
| Fast bug fix | — | `/fix` | `aicrew-fix` |
| Scout → Act | — | `/quick` | `aicrew-quick` |
| Design brainstorm | — | `/brainstorm` | `brainstorm` |
| First-time install | `aicrew install` | `/install` | `aicrew-install` |
| Pull latest skills | `aicrew update` | `/update` | `aicrew-update` |
| Check install state | `aicrew status` | `/status` | `aicrew-status` |

#### Claude Code

Install: `aicrew install claude`

Slash commands (from `~/.claude/commands/`, symlinked from `~/Agents/commands/`):

```
/dev     /fix     /quick     /conclude     /update-skills     /harness-audit
/benchmark     /brainstorm     /lean     /normal
/session     /handoff
/install     /update     /status     /agent-kit     /cursor-plugin
```

Hooks auto-registered: `session-memory.py` (Stop) + `security-guard.py` (PreToolUse).

#### Codex

Install: `aicrew install codex`

Skills land in `~/.codex/skills/` after install:

```
aicrew-dev    aicrew-fix    aicrew-quick    aicrew-conclude    aicrew-update-skills
aicrew-harness-audit    aicrew-benchmark    brainstorm    lean

aicrew-install    aicrew-update    aicrew-status
aicrew-agent-kit    aicrew-cursor-plugin

aicrew-session    aicrew-handoff    aicrew-normal
```

#### Cursor

Install: `aicrew install cursor`

After install, `~/Agents/` and `AGENTS.md`/`CLAUDE.md` provide shared context.

- Slash commands available if Claude integration is active
- **agent-kit:** share `.mdc` rules across repos — `aicrew agent-kit init ./agent-kit`
- **cursor-plugin:** multi-tool terminal panel — `aicrew cursor-plugin init`
- MCP servers wired via `~/.cursor/mcp.json` → `config/mcp/cursor.local.json`

#### Gemini CLI

Install: `aicrew install gemini` — populates `~/Agents/` and prints config instructions.

#### Antigravity

Reference `~/Agents/commands/` in your Antigravity config. Slash commands work natively.

---

### Where skills land

| Location | Contents |
|---|---|
| `~/Agents/` | Single source of truth — commands, agents, hooks, docs |
| `~/.claude/commands/` | Symlinks → `~/Agents/commands/*.md` (slash commands) |
| `~/.codex/skills/` | Codex-native skill folders (`aicrew-dev`, `aicrew-fix`, …) |
| `~/.claude/settings.json` | Merged hook entries (`session-memory.py`, `security-guard.py`) |
| `~/.cursor/mcp.json` | Symlink → `config/mcp/cursor.local.json` |
| `~/.codex/config.toml` | Patched with MCP server entries |

---

### MCP & token economy

**The problem:** A repo-wide grep costs ~80,000 tokens. That burns context fast on large codebases.

**The solution:** aicrew wires three MCP servers and a read policy that routes every query to the cheapest strategy first.

> Full guide: [`skills/docs/how-token-savings-work.md`](./skills/docs/how-token-savings-work.md)

1. **`codebase-memory-mcp`** indexes your project into a knowledge graph. A graph query for "what calls `authMiddleware`?" costs ~500 tokens vs ~80,000 for grep. Index once; every session benefits.

2. **`/lean` mode** (or the `lean` Codex skill) enables the `context-economy` policy: `git diff`, directory trees, and graph queries *before* reading whole files.

3. **`context-mode`** and **`token-optimizer-mcp`** shape long sessions — compressing stale context between phases, keeping the KV-cache warm.

4. **Scout → Act pattern** (`/quick`): a cheap fast model does a graph-first Scout pass (~1–2 K tokens) and emits a fixed summary schema. The main model receives only that summary — not the raw repo.

#### When to use each lever

| You want to… | Use |
|---|---|
| Explore a large codebase without burning context | `codebase-memory-mcp` graph queries (all commands use this) |
| Keep sessions from filling the context window | `/lean on` |
| Compress stale context between phases | `/compact` at phase boundaries |
| Hand off a session to a different tool | `/handoff` (~300 tokens) |
| Scout-first with minimal overhead | `/quick` (Scout → Act) |

Use `/normal` or `/lean off` to restore full verbosity.

---

### Token stack — all commands carry the same 11 capabilities

Every entry-point command (`/dev`, `/fix`, `/quick`) carries an identical token-saving foundation — only pipeline depth differs.

> Authoritative list: [`skills/docs/token-foundation.md`](./skills/docs/token-foundation.md)
> Full guide with worked examples: [`skills/docs/how-token-savings-work.md`](./skills/docs/how-token-savings-work.md)

| # | Capability | Typical saving |
|---|---|---|
| 1 | Graph-first (`codebase-memory-mcp`) | ~79.5K per 3 queries |
| 2 | Speculative Scout → verify (SCOUT schema) | ~79K per session |
| 3 | Karpathy guardrails (scope, simplicity, surgical edits) | Reduces re-work |
| 4 | Layered guardrails (input → scope → phase → output → budget) | Prevents runaway sessions |
| 5 | Context-economy read policy (diff/tree/search before reads) | ~70% fewer read tokens |
| 6 | `security-guard.py` hooks (blocks secrets before they land on disk) | Prevents credential leaks |
| 7 | `.ai/state` checkpoints (survives context resets) | Survives context resets |
| 8 | `/compact` between phases (~60% context at each boundary) | ~60% context at each boundary |
| 9 | `/handoff` on tool switch (~300 tokens per switch) | ~14.7K per tool switch |
| 10 | Optional: `context-mode` + `token-optimizer-mcp` | Varies; biggest on sessions >30 min |
| 11 | Caveman default output (~35% fewer output tokens) | ~35% fewer output tokens |

#### Pipeline depth (the only thing that differs)

| Command | Phases | Use when |
|---|---|---|
| `/dev` | 9 (intake → research → brainstorm → design → implement → tests → security → audit → conclude) | Feature, refactor, or anything needing a design spec |
| `/fix` | 5 (intake → bug analysis → implement → tests → security → conclude) | Bug fix with mandatory TDD |
| `/quick` | 2 (Scout → Act) | Scoped task; graph-first without pipeline overhead |

#### Measure it for your project

```bash
aicrew benchmark --report
```

Writes `.ai/reports/TOKEN_REPORT.<timestamp>.md` — baseline vs aicrew estimates for your codebase. All numbers are clearly labeled **estimated**.

---

### Guardrails

aicrew uses a layered safety model inspired by Andrej Karpathy's agent-safety writing and NVIDIA NeMo Guardrails.

- **Input rail:** `security-guard.py` fires before every file write — blocks PEM private keys and AWS secrets outright; warns on high-entropy strings.
- **Output rail:** `security-reviewer` agent scans changed files in Phase 6 of `/dev`.
- **Phase gates:** every `/dev` and `/fix` phase stops and waits for your explicit go-ahead — the agent never invents your response.
- **Session memory:** `session-memory.py` strips `<private>…</private>` blocks before writing session journals.

Set `ECC_HOOK_PROFILE=strict` for maximum hook verbosity, or `minimal` to quiet them.

Full taxonomy: [`skills/docs/guardrails-taxonomy.md`](./skills/docs/guardrails-taxonomy.md)

---

### Install (full reference)

#### Option A — one-off (no global binary)

```bash
npx aicrew install
npx aicrew update
npx aicrew status
npx aicrew agent-kit init ./agent-kit
npx aicrew cursor-plugin init ./cursor-multi-tool-plugin
```

#### Option B — global CLI (from a git clone)

```bash
cd /path/to/aicrew
npm install -g .
```

If you see **`EACCES`** on Linux:

```bash
npm install -g --prefix ~/.local/npm-global .
export PATH="$HOME/.local/npm-global/bin:$PATH"
# add the export to ~/.bashrc
```

#### What `install` does

- Copies packaged skills into `~/Agents/` (shared source of truth).
- Merges skills into `~/.claude/skills/` (adds missing files; does not overwrite existing).
- Symlinks `~/.claude/commands/*.md` → `~/Agents/commands/*.md`.
- Merges `codex-skills/` into `~/.codex/skills/`.
- Registers `session-memory.py` and `security-guard.py` in `~/.claude/settings.json`.
- Wires MCP config files (symlinks/patches) — does **not** install MCP server binaries.

#### MCP server binaries (one-time, per machine)

```bash
npm install -g codebase-memory-mcp   # required for graph queries (~500 tok vs ~80K grep)
npm install -g token-optimizer-mcp   # optional; needed for Cursor token-optimizer entry
# context-mode: no install needed — auto-downloads via npx on first use
```

Or run `aicrew install mcp` for the full checklist with paths.

---

### CLI reference

| Command | Codex skill | Claude Code | Purpose |
|---------|-------------|-------------|---------|
| `aicrew install` | `aicrew-install` | `/install` | First-time or fresh machine |
| `aicrew update` | `aicrew-update` | `/update` | Pull new files from the package |
| `aicrew status` | `aicrew-status` | `/status` | Show install state across all platforms |
| `aicrew agent-kit init [path]` | `aicrew-agent-kit` | `/agent-kit` | Scaffold shared Cursor `.mdc` rules |
| `aicrew cursor-plugin init [path]` | `aicrew-cursor-plugin` | `/cursor-plugin` | Scaffold Cursor multi-tool terminal extension |
| `aicrew benchmark` | `aicrew-benchmark` | `/benchmark` | Token savings estimate + report |
| `aicrew --version` | — | — | Print package version |
| `aicrew --help` | — | — | Help |

---

### MCP integration

`aicrew install` wires MCP servers from `config/mcp/` into each tool:

| Tool | Target | Source in repo |
|------|--------|----------------|
| **Claude Code** | `~/.claude/.mcp.json` (symlink) | `config/mcp/claude.json` |
| **Cursor** | `~/.cursor/mcp.json` (symlink) | `config/mcp/cursor.local.json` |
| **Codex** | `~/.codex/config.toml` (merged) | `config/mcp/codex.toml` |

**Cursor secrets:** `config/mcp/cursor.json` is the committed template (placeholders only). `config/mcp/cursor.local.json` is gitignored; install seeds it from the template and symlinks Cursor to it.

| Server | Role | Install |
|--------|------|---------|
| **`codebase-memory-mcp`** | Graph index of functions, classes, call chains, routes | `npm install -g codebase-memory-mcp` |
| **`context-mode`** | Context shaping for long sessions | Auto via `npx` — no install needed |
| **`token-optimizer-mcp`** | Token budgeting and cache-friendly responses _(optional)_ | `npm install -g token-optimizer-mcp` |

The Cursor template also lists optional servers (GitHub, filesystem, memory, Brave, Playwright, SQLite, Postgres, GitKraken, Perplexity) — enable and fill env vars in `cursor.local.json` as needed.

---

### Pipeline reference (`/dev` phases)

| Phase | Name | Notes |
|------:|------|--------|
| 0 | Intake | Work type, clarifying questions, which stages run |
| 1 | Research | Bug analyst vs exploration |
| 2 | Brainstorm | On by default for features/refactors |
| 3 | Design | Contracts, interfaces, over/under-build flags |
| 4 | Implement | TDD default; specialist routing from changed file paths |
| 5 | Tests | Pyramid, coverage, smoke path |
| 6 | Security | Changed files only, low noise |
| 7 | Project audit | Only if project has an audit command |
| 8 | Cloud / infra | Auto when infra-related files change |
| 9 | Conclude | Memory + commit message prep |

TDD is the default in Phase 4; opt out explicitly at intake.

**State files:** `/dev` writes to `.ai/state/AI_STATE.<tool>.<session>.md`. Use `/session` early, `/handoff` when switching tools, and clean up old states with `~/Agents/bin/cleanup-ai-state.sh 3 .`.

#### Specialist routing (Phase 4)

| Signals in changed paths | Agent |
|--------------------------|--------|
| `*.tsx`, `*.vue`, `*/components/*` | `frontend-specialist` |
| `*/api/*`, `*/routes/*`, `*/services/*` | `backend-specialist` |
| `*/migrations/*`, `*models*`, `*schema*` | `db-migration` |
| Performance as acceptance criterion | `performance` |

---

### Agent files

| Group | Agents |
|-------|--------|
| Core pipeline | `bug-analyst`, `brainstorm`, `architect`, `tdd-developer`, `test-engineer`, `security-reviewer`, `cloud-expert` |
| Phase 4 specialists | `frontend-specialist`, `backend-specialist`, `db-migration`, `performance` |
| Modes / utilities | `caveman`, `context-economy`, `context-scout`, `state-checkpoint`, `terse` |

---

### Hooks

| Script | Claude hook | Role |
|--------|-------------|------|
| `session-memory.py` | Stop | Session journal, optional batch typecheck, `<private>` stripping |
| `security-guard.py` | PreToolUse (Edit / Write) | Blocks obvious secrets; warns on risky patterns |

Set `ECC_HOOK_PROFILE` to `minimal`, `standard` (default), or `strict`.

---

### Project layer (`.ai/skills/`)

Use `/update-skills` (or `aicrew-update-skills`) to generate repo-local overrides:

- `.ai/skills/commands/dev.md` — planner templates, phase goals, validation, git safety
- `.ai/skills/agents/brainstorm.md` — design decisions before coding
- `.ai/skills/commands/audit.md` — domain audit gate
- `.ai/skills/hooks/audit-guard.py` — project PreToolUse checks

Commit `.ai/skills/` so the whole team shares the same guardrails.

---

### Layout after install

```
~/Agents/                 # merged from package skills/ — commands, agents, hooks, docs, bin/
~/.claude/commands/       # symlinks → ~/Agents/commands/*.md
~/.claude/skills/         # merged copy of Claude-facing skills
~/.claude/settings.json   # merged hook entries
~/.codex/skills/          # merged Codex skill packages

[your-repo]/
  .ai/skills/             # optional project overrides (version-controlled)
  .ai/state/              # optional session checkpoints
  .cursor/rules/          # optional; or symlinks from agent-kit
```

---

### Interactive checkpoints

Every command (`/dev`, `/fix`, `/quick`) uses mandatory stop-and-wait gates. The agent never invents your response. On platforms without an explicit ask tool, it ends its response and waits. Phase progression always requires your explicit go-ahead.

---

### Design principles

- **Single shared tree** — `~/Agents/` is the source of truth all tools resolve commands from
- **Merge, do not clobber** — existing `~/.claude/skills` files are kept on update
- **TDD-first** — enforced in `/dev` unless explicitly opted out at intake
- **Lean by default** — caveman/terse output and graph-first reads; `/normal` for verbose
- **Specialist routing** — Phase 4 routes by changed file paths, not upfront configuration
- **No npm runtime deps** — CLI is plain Node.js; hooks use Python stdlib only

---

### Inspired by

aicrew draws **architectural inspiration** (no code copied) from:

- **[forrestchang/andrej-karpathy-skills](https://github.com/forrestchang/andrej-karpathy-skills)** (MIT) — Karpathy-style agent safety heuristics informed the guardrail layer and phase-gate checkpoints.
- **[NVIDIA/NeMo-Guardrails](https://github.com/NVIDIA/NeMo-Guardrails)** (NVIDIA license) — input/output/dialog rail taxonomy inspired `security-guard.py`, phase gates, and the `security-reviewer` pattern.
- **[chopratejas/headroom](https://github.com/chopratejas/headroom)** (Apache 2.0) — CCR, ContentRouter, RollingWindow, and `headroom learn` patterns informed the context budget rail.
- **Academic:** Leviathan et al. speculative decoding (2023), Anthropic context engineering guidance, ReSum, CoMem.

Full attribution: [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)

---

### License

aicrew is MIT — see [LICENSE](LICENSE).

Third-party components: [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)

---

### Discoverability

**GitHub topics:** `ai-agents` · `claude-code` · `codex` · `cursor` · `mcp` · `developer-tools` · `agent-skills` · `hooks` · `workflow` · `tdd` · `sdlc` · `context-engineering` · `token-optimization` · `token-saving` · `guardrails` · `speculative-decoding` · `ai-workflow` · `prompt-engineering` · `context-compression` · `devtools`
