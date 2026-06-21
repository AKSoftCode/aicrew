# aicrew

**A TDD-first AI development pipeline for Claude Code, Codex, and Cursor.**

Install once, use everywhere. One `install` command drops a set of slash commands, Codex skills, hooks, and MCP wiring into your tools — then you run `/dev`, `/fix`, `/quick`, or any other command from your AI tool of choice without thinking about setup again.

---

## Who is this for?

aicrew is for developers who use AI coding tools daily and want a consistent, disciplined workflow across Claude Code, Codex, and Cursor — without re-explaining your conventions on every session. It gives you a shared command vocabulary, automatic context-saving between sessions, token-saving graph-memory, and layered guardrails that block secrets before they land in files.

If you've ever lost a long session to a context-window overflow, or found your AI diverging from your stated goal mid-task, aicrew's phase-gated pipeline and Scout → Act pattern are designed for exactly that.

---

## Quick start (5 minutes)

### 1. Install

```bash
# One-off (no global binary needed):
npx aicrew install

# Or, after cloning this repo, install globally:
npm install -g .
aicrew install
```

### 2. Verify

```bash
aicrew status
```

You should see `~/Agents/` populated with commands, agents, and hooks.

### 3. Run your first command

In **Claude Code**, type:
```
/dev I want to add a login page with email + password
```

In **Codex**, invoke the skill:
```
aicrew-dev
```

In **Cursor**, ask the agent and it uses the shared `~/Agents/` rules automatically.

### Where skills land

| Location | Contents |
|---|---|
| `~/Agents/` | Single source of truth — commands, agents, hooks, docs |
| `~/.claude/commands/` | Symlinks to `~/Agents/commands/*.md` |
| `~/.codex/skills/` | Codex-native skill folders (`aicrew-dev`, `aicrew-fix`, …) |
| `~/.claude/settings.json` | Merged hook entries (`session-memory.py`, `security-guard.py`) |

---

## Which command when?

Use this table to match your situation to the right command.

| Situation | Command | Why |
|---|---|---|
| Building a new feature or doing a non-trivial refactor | `/dev` (Claude) / `aicrew-dev` (Codex) | Full 9-phase pipeline: intake → research → design → TDD → tests → security → conclude |
| "I need to fix a login bug in production — fast" | `/fix` (Claude) / `aicrew-fix` (Codex) | Three intake questions, then TDD straight to done — no 9 phases |
| Small well-scoped task, want to save tokens | `/quick` (Claude) / `aicrew-quick` (Codex) | Scout → Act: graph-first discovery, Karpathy guardrails, no pipeline overhead |
| Switching tools mid-task (Cursor → Claude, etc.) | `/handoff` then `/session` in the new tool | Writes a compact `.ai/state/` checkpoint you can paste into any tool |
| Wrapping up a session | `/conclude` (Claude) / `aicrew-conclude` (Codex) | Captures learnings, proposes commit message, updates `AGENTS.md` |
| Session feels slow or context window is filling up | `/lean on` + `codebase-memory-mcp` | Terse output + diff/tree/graph-before-read policy; 99% fewer tokens on exploration |
| "I want to think through design options before coding" | `brainstorm` skill or `/dev` (design phase) | Generates 3 materially different options with trade-offs before any code |
| Output is too verbose — want shorter responses | Default is already caveman/terse; use `/normal` to go verbose | aicrew defaults to lean output; `/terse` or `/lean` tighten further |
| Auditing or reviewing the harness itself | `/harness-audit` / `aicrew-harness-audit` | Checks skill health, hook registration, MCP wiring |

> **Example:** "I need to add rate limiting to our API" → use `/dev`. "I need to fix the broken OAuth redirect" → use `/fix`. "I need to rename a variable across three files" → use `/quick`.

---

## Tool-specific entry points

### Claude Code

Use slash commands — they resolve from `~/.claude/commands/` which symlinks to `~/Agents/commands/`:

```
/dev     /fix     /quick     /conclude     /lean     /handoff     /session
```

### Codex

Use skill names — they live under `~/.codex/skills/` after install:

```
aicrew-dev    aicrew-fix    aicrew-quick    aicrew-conclude
brainstorm    lean          aicrew-harness-audit
```

Invoke via your Codex UI's skill picker (exact invocation depends on your Codex product).

### Cursor

After install, the `~/Agents/` tree and `AGENTS.md` / `CLAUDE.md` provide the shared context. Use:
- The **agent-kit** to symlink `.mdc` rules into each repo's `.cursor/rules/` (run `aicrew agent-kit init ./agent-kit`)
- The **cursor-plugin** for a multi-tool terminal panel (Claude Code + Codex + Gemini in one window)
- MCP servers wired via `~/.cursor/mcp.json` (set up by `aicrew install`)

---

## MCP & token economy — plain English

**The problem:** AI tools read files to understand your codebase. A repo-wide `grep` costs ~80,000 tokens. That burns context fast on large repos.

**The solution:** aicrew wires three MCP servers and a read policy that route every query to the cheapest strategy first.

### How it works

1. **`codebase-memory-mcp`** indexes your project into a knowledge graph. A graph query for "what calls `authMiddleware`?" costs ~500 tokens — the same query via grep costs ~80,000. Index once per repo, then every session benefits.

2. **`/lean` mode** (Claude Code) or the **`lean`** skill (Codex) enables the `context-economy` policy: the agent uses `git diff`, directory trees, and graph queries *before* reading whole files. Slices only what's needed.

3. **`context-mode`** and **`token-optimizer-mcp`** shape long sessions — compressing stale context between phases, keeping the KV-cache warm so repeated prompts don't re-spend tokens.

4. **`/quick`'s Scout → Act pattern** goes further: a cheap fast model does a graph-first "Scout" pass (1–2 K tokens) and emits a fixed summary schema. The main model receives *only that summary* — never the raw repo. This mirrors speculative decoding from LLM inference. See [`skills/docs/speculative-context.md`](./skills/docs/speculative-context.md) for details.

### When to use each lever

| You want to… | Use |
|---|---|
| Explore a large codebase without burning context | `codebase-memory-mcp` graph queries |
| Keep a long `/dev` session from filling the window | `/lean on` |
| Save tokens on small, well-scoped tasks | `/quick` (Scout → Act) |
| Hand off a session to a different tool | `/handoff` (writes `.ai/state/` checkpoint) |
| Compress accumulated context between phases | `/dev` does this automatically at phase boundaries |

Use `/normal` or `/lean off` to restore full verbosity when you need it.

---

## Guardrails — what protects you

aicrew uses a layered safety model inspired by Andrej Karpathy's agent-safety writing and NVIDIA NeMo Guardrails' input/output rail architecture. **Input rail:** `security-guard.py` fires before every file write, blocking PEM private keys and AWS secrets outright, and warning on high-entropy strings or hardcoded tokens. **Output rail:** the `security-reviewer` agent scans changed files in Phase 6 of `/dev` before the session concludes. **Phase gates:** every `/dev` and `/fix` phase stops and waits for your explicit go-ahead — the agent never invents your response. **Session memory:** `session-memory.py` strips `<private>…</private>` blocks before writing session journals, so sensitive content never lands on disk. Set `ECC_HOOK_PROFILE=strict` for maximum hook verbosity, or `minimal` to quiet them down.

For the full taxonomy mapping NeMo rail types to aicrew primitives, see [`skills/docs/guardrails-taxonomy.md`](./skills/docs/guardrails-taxonomy.md).

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

```bash
cd /path/to/aicrew
npm install -g .
```

If you see **`EACCES`** on Linux (default prefix `/usr/local`), install to your home directory:

```bash
npm install -g --prefix ~/.local/npm-global .
export PATH="$HOME/.local/npm-global/bin:$PATH"
# add the export line to ~/.bashrc so new shells pick it up
```

Then run `aicrew` from any directory:

```bash
aicrew install
aicrew --help
```

**What `install` does**

- Copies packaged skills into **`~/Agents/`** (shared source of truth for commands, agents, hooks).
- Merges skills into **`~/.claude/skills/`** (adds missing files; does not overwrite existing).
- Symlinks **`~/.claude/commands/*.md`** → **`~/Agents/commands/*.md`**.
- Merges **`codex-skills/`** into **`~/.codex/skills/`**.
- Registers `session-memory.py` (Stop) and `security-guard.py` (PreToolUse) in `~/.claude/settings.json`.

**Requirements:** Node 18+. Hooks use Python stdlib only — no extra Python packages.

---

## CLI

| Command | Purpose |
|--------|---------|
| `aicrew install` | First-time or fresh machine; merge skills and hooks |
| `aicrew update` | Same as `install` — picks up new files from the package |
| `aicrew status` | Shows `~/Agents`, global skills, command symlinks, hooks, Codex skills, and cwd `.ai/skills/` if present |
| `aicrew agent-kit init [path]` | Scaffolds a shared Cursor `.mdc` rules layout (default `./agent-kit`) |
| `aicrew cursor-plugin init [path]` | Scaffolds a local Cursor extension for multi-tool terminals (default `./cursor-multi-tool-plugin`) |
| `aicrew --version` / `-v` | Print package version |
| `aicrew --help` / `-h` | Help |
| `aicrew` (no args) | Interactive menu |

---

## What's new

| Area | What changed |
|------|----------------|
| **`/quick` + speculative context** | Scout → Act shortcut with graph-first exploration, Karpathy guardrails, and a dedicated `context-scout` agent. See [`skills/docs/speculative-context.md`](./skills/docs/speculative-context.md). |
| **Guardrails taxonomy** | `skills/docs/guardrails-taxonomy.md` maps NeMo rail types to aicrew primitives (hooks, phase gates, session memory). |
| **Lean mode** | `/lean` (Claude Code), `context-economy` agent, and Codex `lean` skill — terse output plus diff/tree/search-before-read policy. |
| **Graph memory MCP** | `codebase-memory-mcp` indexes the repo into a knowledge graph — structural queries cost ~500 tokens vs ~80K for broad grep/file reads. |
| **State checkpoints** | Per-session files under `.ai/state/AI_STATE.<tool>.<session>.md`, set with `/session`, handed off with `/handoff`. |
| **MCP config** | `config/mcp/` is the single source of truth. `aicrew install` symlinks Claude and Cursor MCP configs and patches Codex `config.toml`. |
| **Cursor multi-tool** | `aicrew cursor-plugin init` scaffolds a local extension; `aicrew agent-kit init` shares `.mdc` rules across repos. |
| **Context compression** | `context-mode` and `token-optimizer-mcp` MCP servers for session-level context shaping and cache-aware summarisation. |

---

## MCP integration

`aicrew install` wires MCP servers from `config/mcp/` into each tool:

| Tool | Target | Source in repo |
|------|--------|----------------|
| **Claude Code** | `~/.claude/.mcp.json` (symlink) | `config/mcp/claude.json` |
| **Cursor** | `~/.cursor/mcp.json` (symlink) | `config/mcp/cursor.local.json` (created from template on first install) |
| **Codex** | `~/.codex/config.toml` (merged) | `config/mcp/codex.toml` |

**Cursor secrets:** `config/mcp/cursor.json` is the committed template — placeholders only. `config/mcp/cursor.local.json` is gitignored; install seeds it from the template, then symlinks Cursor to it so real API keys never land in git.

### Core servers (all three tools)

| Server | Role |
|--------|------|
| **`codebase-memory-mcp`** | Graph index of functions, classes, call chains, routes. [Install separately](https://github.com/DeusData/codebase-memory-mcp). |
| **`context-mode`** | Context shaping / mode helpers for long sessions. |
| **`token-optimizer-mcp`** | Token budgeting and cache-friendly MCP responses. |

The Cursor template also lists optional servers (GitHub, filesystem, memory, Brave, Playwright, SQLite, Postgres, GitKraken, Perplexity) — enable and fill env vars in `cursor.local.json` as needed.

---

## Pipeline reference (`/dev` phases)

| Phase | Name | Notes |
|------:|------|--------|
| 0 | Intake | Work type, clarifying questions, which stages run |
| 1 | Research | Bug analyst vs exploration |
| 2 | Brainstorm | On by default for features/refactors; often off for bugs |
| 3 | Design | Contracts, interfaces, over/under-build flags |
| 4 | Implement | TDD default; specialist routing from changed file paths |
| 5 | Tests | Pyramid, coverage, smoke path |
| 6 | Security | Changed files only, low noise |
| 7 | Project audit | Only if project has an audit command |
| 8 | Cloud / infra | Auto when infra-related files change |
| 9 | Conclude | Memory + commit message prep |

TDD is the default in Phase 4; opt out explicitly at intake.

**State files:** `/dev` writes to `.ai/state/AI_STATE.<tool>.<session>.md`. Use `/session` early, `/handoff` when switching tools, and clean up old states with `~/Agents/bin/cleanup-ai-state.sh 3 .`.

### Specialist routing (Phase 4)

| Signals in changed paths | Agent |
|--------------------------|--------|
| `*.tsx`, `*.vue`, `*/components/*` | `frontend-specialist` |
| `*/api/*`, `*/routes/*`, `*/services/*` | `backend-specialist` |
| `*/migrations/*`, `*models*`, `*schema*` | `db-migration` |
| Performance as acceptance criterion | `performance` |

---

## Agent files

Shipped markdown agents (resolved from `~/Agents/agents/`, with project `.ai/skills/agents/` overrides taking precedence):

| Group | Agents |
|-------|--------|
| Core pipeline | `bug-analyst`, `brainstorm`, `architect`, `tdd-developer`, `test-engineer`, `security-reviewer`, `cloud-expert` |
| Phase 4 specialists | `frontend-specialist`, `backend-specialist`, `db-migration`, `performance` |
| Modes / utilities | `caveman`, `context-economy`, `context-scout`, `state-checkpoint`, `terse` |

---

## Hooks

| Script | Claude hook | Role |
|--------|-------------|------|
| `session-memory.py` | Stop | Session journal, optional batch typecheck, `<private>` stripping |
| `security-guard.py` | PreToolUse (Edit / Write) | Blocks obvious secrets; warns on risky patterns |

Set `ECC_HOOK_PROFILE` to `minimal`, `standard` (default), or `strict` to tune hook verbosity.

Wrap sensitive content in `<private>...</private>` so session memory does not persist it.

---

## Project layer (`.ai/skills/`)

Use `/update-skills` (Claude Code) or `aicrew-update-skills` (Codex) to generate repo-local overrides:

- `.ai/skills/commands/dev.md` — planner templates, phase goals, validation, git safety
- `.ai/skills/agents/brainstorm.md` — design decisions before coding
- `.ai/skills/commands/audit.md` — domain audit gate
- `.ai/skills/hooks/audit-guard.py` — project PreToolUse checks

Commit `.ai/skills/` so the whole team shares the same guardrails.

---

## Layout after install

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

## Design principles

- **Single shared tree** — `~/Agents/` is the source of truth all tools resolve commands from
- **Merge, do not clobber** — existing `~/.claude/skills` files are kept on update
- **TDD-first** — enforced in `/dev` unless explicitly opted out at intake
- **Lean by default** — caveman/terse output and graph-first reads; `/normal` for verbose
- **Specialist routing** — Phase 4 routes by changed file paths, not upfront configuration
- **No npm runtime deps** — CLI is plain Node.js; hooks use Python stdlib only

---

## Interactive checkpoints

Every command (`/dev`, `/fix`, `/quick`) uses **mandatory stop-and-wait gates**. The agent never invents your response. On platforms without an explicit ask tool, it ends its response and waits. This is by design — phase progression requires your explicit go-ahead.

---

## License

MIT — see [LICENSE](LICENSE).

Third-party MCP servers and inspiration credits: [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
