# aicrew

Adaptive **TDD-first** development pipeline for **Claude Code**, **Codex**, and **Cursor** (and other tools that can run markdown commands or skills). One **`/dev`** flow walks intake → research → design → implementation → tests → security → conclude, with optional audit and infra stages. In **Codex**, use the **`aicrew-*`** skills plus **`brainstorm`** and **`lean`** (slash commands are a Claude Code convention).

---

## What's new

Recent additions (see git history for details):

| Area | What changed |
|------|----------------|
| **MCP config** | **`config/mcp/`** is the single source of truth. **`aicrew install`** symlinks Claude and Cursor MCP configs and patches Codex **`config.toml`**. |
| **Lean mode** | **`/lean`** (Claude Code), **`context-economy`** agent, and Codex **`lean`** skill — terse output plus diff/tree/search-before-read policy. |
| **State checkpoints** | Per-session files under **`.ai/state/AI_STATE.<tool>.<session>.md`**, set with **`/session`**, hand off with **`/handoff`**, prune with **`~/Agents/bin/cleanup-ai-state.sh`**. |
| **Cursor multi-tool** | **`aicrew cursor-plugin init`** scaffolds a local extension; **`aicrew agent-kit init`** shares **`.mdc`** rules across repos. |
| **Graph memory MCP** | **`codebase-memory-mcp`** indexes the repo into a knowledge graph — structural queries cost ~**500 tokens** vs ~**80K** for broad grep/file reads. |
| **Context compression** | **`context-mode`** and **`token-optimizer-mcp`** MCP servers for session-level context shaping and cache-aware summarisation. |
| **`/quick` + Karpathy guardrails** | Scout → Act shortcut with graph-first exploration and layered safety rails (`karpathy-guardrails` agent). |

---

## Install

### Option A — one-off (no global `aicrew` binary)

```bash
npx aicrew install
npx aicrew update
npx aicrew status
npx aicrew agent-kit init ./agent-kit
npx aicrew cursor-plugin init ./cursor-multi-tool-plugin
```

### Option B — global `aicrew` CLI (from a git clone)

From this repository:

```bash
cd /path/to/aicrew
npm install -g .
```

If you see **`EACCES`** on Linux (default prefix `/usr/local`), install to your home directory and put the binary on **`PATH`**:

```bash
npm install -g --prefix ~/.local/npm-global .
export PATH="$HOME/.local/npm-global/bin:$PATH"
# add the export line to ~/.bashrc or ~/.profile so new shells see `aicrew`
```

Then run **`aicrew`** from any directory:

```bash
aicrew install
aicrew --help
```

**What `install` does**

- Copies packaged skills into **`~/Agents/`** (shared source of truth for commands, agents, hooks).
- Merges skills into **`~/.claude/skills/`** (adds missing files; does not overwrite existing files).
- Symlinks **`~/.claude/commands/*.md`** → **`~/Agents/commands/*.md`**.
- Merges **`codex-skills/`** into **`~/.codex/skills/`** (Codex skill folders: `aicrew-dev`, `aicrew-fix`, …).
- Registers **`session-memory.py`** (Stop) and **`security-guard.py`** (PreToolUse) in **`~/.claude/settings.json`** (merges with existing hooks).

**Requirements:** Node **18+**. Hooks are Python **stdlib** only.

---

## CLI

| Command | Purpose |
|--------|---------|
| `aicrew install` | First-time or fresh machine; merge skills and hooks |
| `aicrew update` | Same as `install` — picks up new files from the package |
| `aicrew status` | Shows `~/Agents`, global skills, command symlinks, hooks, Codex skills, and **cwd** `.ai/skills/` if present |
| `aicrew agent-kit init [path]` | Scaffolds a shared **Cursor** `.mdc` rules layout (default `./agent-kit`) |
| `aicrew cursor-plugin init [path]` | Scaffolds a local Cursor extension for multi-tool terminals (default `./cursor-multi-tool-plugin`) |
| `aicrew --version` / `-v` | Print package version |
| `aicrew --help` / `-h` | Help |
| `aicrew` (no args) | Interactive menu |

---

## MCP integration

**`aicrew install`** wires MCP servers from **`config/mcp/`** into each tool:

| Tool | Target | Source in repo |
|------|--------|----------------|
| **Claude Code** | **`~/.claude/.mcp.json`** (symlink) | **`config/mcp/claude.json`** |
| **Cursor** | **`~/.cursor/mcp.json`** (symlink) | **`config/mcp/cursor.local.json`** (created from template on first install) |
| **Codex** | **`~/.codex/config.toml`** (merged) | **`config/mcp/codex.toml`** |

**Cursor secrets:** **`config/mcp/cursor.json`** is the committed **template** — placeholders only (e.g. **`${PERPLEXITY_API_KEY}`**, **`your_brave_api_key_here`**). **`config/mcp/cursor.local.json`** is **gitignored**; install seeds it from the template if missing, then symlinks Cursor to the local file so real API keys never land in git.

### Core servers (all three tools)

| Server | Role |
|--------|------|
| **`codebase-memory-mcp`** | Graph index of functions, classes, call chains, routes — graph-first exploration (~500 tok/query vs ~80K grep). [Install separately](https://github.com/DeusData/codebase-memory-mcp). |
| **`context-mode`** | Context shaping / mode helpers for long sessions. |
| **`token-optimizer-mcp`** | Token budgeting and cache-friendly MCP responses. |

The Cursor template also lists optional servers (GitHub, filesystem, memory, Brave, Playwright, SQLite, Postgres, GitKraken, Perplexity) — enable and fill env vars in **`cursor.local.json`** as needed.

### Graph-first exploration workflow

1. **Index once** — ask the agent to index the project via **`codebase-memory-mcp`** (or run its installer).
2. **Query the graph** — use **`search_graph`**, **`trace_call_path`**, **`get_architecture`**, **`detect_changes`** before wide grep or full-file reads.
3. **Read slices** — open only the symbols or regions the graph points to; lean mode and **`context-economy`** reinforce this.
4. **Hand off** — **`/handoff`** + **`.ai/state/`** when switching Cursor ↔ Claude ↔ Codex.

Licenses for bundled MCP packages and inspiration credits: **[THIRD_PARTY_NOTICES.md](./THIRD_PARTY_NOTICES.md)**.

---

## Token economy

aicrew is designed for long **`/dev`** runs without blowing the context window:

| Mechanism | Where | What it does |
|-----------|-------|----------------|
| **`/lean`** | Claude Code (`~/Agents/commands/lean.md`) | Enables terse output + **`context-economy`** read policy for the session. |
| **`context-economy`** | **`~/Agents/agents/context-economy.md`** | Diff/tree/search before reads; slice reads; compact between phases. |
| **`lean`** skill | Codex (`~/.codex/skills/lean/`) | Same intent for Codex sessions. |
| **`codebase-memory-mcp`** | MCP | Structural graph queries instead of repo-wide grep. |
| **`context-mode`** | MCP | Session context management. |
| **`token-optimizer-mcp`** | MCP | Response shaping and caching to cut repeat token cost. |
| **`/handoff`** | Claude Code | Compact cross-tool block from **`.ai/state/`** when switching tools or models. |

Use **`/normal`** or **`/lean off`** to restore default verbosity. **`/terse`** toggles output style without the full lean read policy.

---

## Claude Code slash commands

Commands are markdown files under **`~/Agents/commands/`** (after install). Use the slash name without `.md`.

| Command | Role |
|--------|------|
| `/dev` | Full pipeline — bug, feature, refactor, review, or audit intake |
| `/fix` | Fast bug fix — **three** intake questions, then TDD to done |
| `/quick` | Scout → Act — graph-first exploration, Karpathy guardrails, no full pipeline |
| `/conclude` | End session — learnings, commit message prep |
| `/update-skills` | Evolve skills; project generation where applicable |
| `/harness-audit` | Audit the harness / skill set health |
| `/lean` | Low-token / terse mode helpers |
| `/normal` | Restore normal verbosity |
| `/terse` | Terse output mode |
| `/session` | Set tool/session label for **`.ai/state/AI_STATE.<tool>.<session>.md`** |
| `/handoff` | Compact handoff block when switching tools or models |

**`/compact`** is referenced inside **`/dev`** as the **Claude Code** context compaction step between phases; it is **not** shipped as a file in this repo.

**Guardrails taxonomy:** `skills/docs/guardrails-taxonomy.md` (installed to `~/Agents/docs/`) maps NeMo Guardrails rail types to aicrew hooks, phases, and agents — documentation only, no NeMo runtime.

---

## Codex skills

After install, skill folders live under **`~/.codex/skills/`**. Invoke them the way your Codex UI expects (often by name, e.g. **`aicrew-dev`**, **`$brainstorm`** depending on product).

| Skill folder | Purpose |
|--------------|---------|
| `aicrew-dev` | Full pipeline (same story as `/dev`) |
| `aicrew-fix` | Fast fix path (same story as `/fix`) |
| `aicrew-quick` | Scout → Act path (same story as `/quick`) |
| `aicrew-conclude` | Session wrap-up |
| `aicrew-harness-audit` | Harness audit |
| `aicrew-update-skills` | Skill maintenance / project generation |
| `brainstorm` | Options and trade-offs before coding |
| `lean` | Default lean / low-token Codex policy (boost with `/lean on`; disable with `/normal`) |

---

## Optional: Cursor multi-tool extension (`cursor-plugin`)

Scaffold a local Cursor extension that opens terminal sessions for **Claude Code**, **Gemini CLI**, and **Codex CLI** with a shared session/task name:

```bash
npx aicrew cursor-plugin init ./cursor-multi-tool-plugin
# or
aicrew cursor-plugin init ./cursor-multi-tool-plugin
```

Then:

1. Open `./cursor-multi-tool-plugin` in Cursor (or VS Code).
2. Press `F5` (Extension Development Host).
3. In the host window command palette, run: `AICrew: Start Multi-Tool Task`.

The generated extension includes commands:

- `AICrew: Start Multi-Tool Task`
- `AICrew: Open Claude Code Terminal`
- `AICrew: Open Gemini CLI Terminal`
- `AICrew: Open Codex Terminal`

---

## Optional: shared Cursor rules (`agent-kit`)

For **one canonical copy** of `.mdc` rules symlinked into each repo’s **`.cursor/rules/`**:

```bash
npx aicrew agent-kit init ./agent-kit
# or, after global install:
aicrew agent-kit init ./agent-kit
```

1. Put rules in **`agent-kit/repos/<product>/cursor-rules/*.mdc`**.
2. Edit **`agent-kit/install.sh`**: add each repo’s **`.ai/skills/setup.sh`** path to the **`SETUPS`** array (paths are relative to the **parent directory of `agent-kit`**, e.g. your workspace root).
3. Each repo’s **`setup.sh`** should set **`AGENT_KIT_ROOT`** and link **`.cursor/rules/`** from **`$AGENT_KIT_ROOT/repos/<product>/cursor-rules/`**.
4. On any machine: **`bash ./agent-kit/install.sh`**.

---

## Project layer (`.ai/skills/`)

Use **`/update-skills`** in Claude Code (or the **`aicrew-update-skills`** skill) to generate or extend **repo-local** overrides, for example:

- **`.ai/skills/commands/dev.md`** — planner templates, phase goals, validation, git safety  
- **`.ai/skills/agents/brainstorm.md`** — design decisions before coding  
- **`.ai/skills/commands/audit.md`** — domain audit gate when **`/audit`** exists  
- **`.ai/skills/hooks/audit-guard.py`** — project PreToolUse checks (not installed globally by default)

Commit **`.ai/skills/`** so the team shares the same guardrails.

---

## Pipeline (`/dev` / `aicrew-dev`)

Phases are **0–9** in **`skills/commands/dev.md`** (intake is Phase **0**; conclude is Phase **9**). Later phases can be skipped by agreement at intake.

| Phase | Name | Notes |
|------:|------|--------|
| 0 | Intake | Work type, clarifying questions, which stages run |
| 1 | Research | Bug analyst vs exploration |
| 2 | Brainstorm | Default on for features/refactors; often off for bugs |
| 3 | Design | Contracts, interfaces, over/under-build flags |
| 4 | Implement | TDD default; specialist routing from changed files |
| 5 | Tests | Pyramid, coverage, smoke path |
| 6 | Security | Changed files, low noise |
| 7 | Project audit | Only if audit stage included **and** project has audit command |
| 8 | Cloud / infra | Auto when infra-related files change |
| 9 | Conclude | Memory + commit message prep |

**State files:** **`/dev`** expects updates under **`.ai/state/AI_STATE.<tool>.<session>.md`**. Use **`/session`** early and **`/handoff`** when switching tools. Optional cleanup script (installed under **`~/Agents/`** when present in the package):

```bash
~/Agents/bin/cleanup-ai-state.sh 3 .
```

**TDD** is the default in **`/dev`**; relaxed mode requires explicit opt-out at intake.

---

## Specialist routing (Phase 4)

Rough mapping from **`skills/commands/dev.md`** (auto-routing is guidance for the orchestrator):

| Signals in changed paths | Agent |
|--------------------------|--------|
| `*.tsx`, `*.vue`, `*/components/*` | `frontend-specialist` |
| `*/api/*`, `*/routes/*`, `*/services/*` | `backend-specialist` |
| `*/migrations/*`, `*models*`, `*schema*` | `db-migration` |
| Performance as acceptance criterion | `performance` |

---

## Agent files (`~/Agents/agents/`)

Shipped markdown agents (lookup order: **project** `.ai/skills/agents/` or `.ai/team/roles/`, then **`~/Agents/agents/`**):

| Group | Agents |
|-------|--------|
| Core pipeline | `bug-analyst`, `brainstorm`, `architect`, `tdd-developer`, `test-engineer`, `security-reviewer`, `cloud-expert` |
| Phase 4 specialists | `frontend-specialist`, `backend-specialist`, `db-migration`, `performance` |
| Modes / utilities | `caveman`, `context-economy`, `state-checkpoint`, `terse` |

---

## Hooks

| Script | Claude hook | Role |
|--------|-------------|------|
| `session-memory.py` | Stop | Session journal, optional batch typecheck, `<private>` stripping, optional instinct capture |
| `security-guard.py` | PreToolUse (Edit / Write patterns) | Blocks obvious secrets; warns on risky patterns |

**Profile:** set **`ECC_HOOK_PROFILE`** to **`minimal`**, **`standard`** (default), or **`strict`** (see `session-memory.py` header).

Wrap secrets or noise in **`<private>...</private>`** so session memory does not persist that content.

---

## Layout after install

```
~/Agents/                 # merged from package `skills/` — commands, agents, hooks, docs, bin/
~/.claude/commands/       # symlinks → ~/Agents/commands/*.md
~/.claude/skills/         # merged copy of Claude-facing skills
~/.claude/settings.json   # merged hook entries
~/.codex/skills/          # merged Codex skill packages

[your-repo]/
  .ai/skills/             # optional project overrides (version control)
  .ai/state/              # optional session checkpoints
  .cursor/rules/          # optional; or symlinks from agent-kit
```

The npm package source lives under **`skills/`**, **`codex-skills/`**, and **`templates/`** in this repository; **`install`** copies from the **installed** package path on your machine.

---

## Guardrails

aicrew uses a layered approach inspired by Andrej Karpathy's agent-safety writing and NVIDIA NeMo Guardrails' input/output rail architecture.

**Input rail — `security-guard.py` (PreToolUse hook)**
- Fires before every `Edit`, `Write`, or `MultiEdit` call.
- Blocks patterns that are unambiguously dangerous (PEM private keys, AWS secret keys).
- Warns on advisory patterns (hardcoded tokens, high-entropy strings) without blocking.
- Skips test fixtures and lock files to keep false-positive rate low.

**Phase gates — built into `/dev`**
- Each phase requires an explicit acceptance before the next begins.
- The model **stops and waits**; it never invents a user response.
- Security phase (Phase 6) runs on changed files only, not the whole repo.

**Output rail — `security-reviewer` agent (Phase 6)**
- Reviews proposed changes for injection risks, secret leaks, and unsafe patterns before conclude.

**Session memory — `session-memory.py` (Stop hook)**
- Strips `<private>…</private>` blocks before persisting session journals.
- Optional instinct capture at session end.

Set `ECC_HOOK_PROFILE` to `minimal`, `standard` (default), or `strict` to tune hook verbosity.

*Architecture inspiration only (not bundled):* [forrestchang/andrej-karpathy-skills](https://github.com/forrestchang/andrej-karpathy-skills) (MIT) and [NVIDIA NeMo Guardrails](https://github.com/NVIDIA/NeMo-Guardrails) (NVIDIA license — see THIRD_PARTY_NOTICES.md).

---

## Design principles

- **Single shared tree in `~/Agents/`** for commands and agents the slash commands resolve to  
- **Merge, do not clobber** — existing `~/.claude/skills` files are kept on update  
- **TDD-first** in **`/dev`** unless you explicitly relax at intake  
- **Caveman/lean by default** — terse output and context-economy reads; `/normal` or `/lean off` for verbose  
- **Specialist routing** from file paths in Phase 4  
- **No npm runtime dependencies** for the CLI; hooks use Python stdlib only  

---

## Interactive checkpoints

Commands repeat a **mandatory checkpoint** table: the model must **stop and wait** for your answer at marked steps—never inventing replies. Behavior is described for Claude Code, Cursor-style ask tools, Codex **`ask_human`**, etc., in each command’s header.

---

## License

MIT — see [LICENSE](LICENSE).

Third-party MCP servers and inspiration credits are documented in [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
