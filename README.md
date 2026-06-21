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

## CLI or skill — same action

Every aicrew action is reachable three ways. No CLI required.

| Action | CLI | Codex skill | Claude Code slash |
|--------|-----|-------------|-------------------|
| First-time setup | `aicrew install` | `aicrew-install` | `/install` |
| Pull new skills | `aicrew update` | `aicrew-update` | `/update` |
| Check install | `aicrew status` | `aicrew-status` | `/status` |
| Scaffold agent-kit | `aicrew agent-kit init` | `aicrew-agent-kit` | `/agent-kit` |
| Scaffold cursor plugin | `aicrew cursor-plugin init` | `aicrew-cursor-plugin` | `/cursor-plugin` |
| Full dev pipeline | — | `aicrew-dev` | `/dev` |
| Fast bug fix | — | `aicrew-fix` | `/fix` |
| Scout → Act | — | `aicrew-quick` | `/quick` |
| Wrap up session | — | `aicrew-conclude` | `/conclude` |
| Evolve project skills | — | `aicrew-update-skills` | `/update-skills` |
| Audit harness | — | `aicrew-harness-audit` | `/harness-audit` |
| Session checkpoint label | — | `aicrew-session` | `/session` |
| Cross-tool handoff | — | `aicrew-handoff` | `/handoff` |
| Benchmark skills | `aicrew benchmark` _(planned)_ | `aicrew-benchmark` | `/benchmark` |
| Design brainstorm | — | `brainstorm` | `/brainstorm` |
| Lean/terse output on | — | `lean` | `/lean on` |
| Lean/terse output off | — | `aicrew-normal` | `/lean off` or `/normal` |
| Re-enable terse | — | `aicrew-terse` | `/terse` |

> **Example:** install on a new machine: `aicrew install` OR skill `aicrew-install` OR `/install` in Claude Code.

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
| "I want to think through design options before coding" | `brainstorm` skill or `/brainstorm` (Claude) | Generates 3 materially different options with trade-offs before any code |
| Output is too verbose — want shorter responses | Default is already caveman/terse; use `/normal` to go verbose | aicrew defaults to lean output; `/terse` or `/lean` tighten further |
| Auditing or reviewing the harness itself | `/harness-audit` / `aicrew-harness-audit` | Checks skill health, hook registration, MCP wiring |

> **Example:** "I need to add rate limiting to our API" → use `/dev`. "I need to fix the broken OAuth redirect" → use `/fix`. "I need to rename a variable across three files" → use `/quick`.

---

## Tool-specific entry points

### Claude Code

Use slash commands — they resolve from `~/.claude/commands/` which symlinks to `~/Agents/commands/`:

```
/dev     /fix     /quick     /conclude     /update-skills     /harness-audit
/benchmark     /brainstorm     /lean     /terse     /normal
/session     /handoff
/install     /update     /status     /agent-kit     /cursor-plugin
```

### Codex

Use skill names — they live under `~/.codex/skills/` after install:

```
aicrew-dev    aicrew-fix    aicrew-quick    aicrew-conclude    aicrew-update-skills
aicrew-harness-audit    aicrew-benchmark    brainstorm    lean

aicrew-install    aicrew-update    aicrew-status
aicrew-agent-kit    aicrew-cursor-plugin

aicrew-session    aicrew-handoff    aicrew-terse    aicrew-normal
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

> **Plain-English guide to every token-saving mechanism:** [`skills/docs/how-token-savings-work.md`](./skills/docs/how-token-savings-work.md)

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

## How aicrew saves tokens

Every aicrew feature targets a specific source of token waste. Here's what each one does in plain English, with concrete numbers.

> **Full guide with diagrams and worked examples:** [`skills/docs/how-token-savings-work.md`](./skills/docs/how-token-savings-work.md)

> **Measure it yourself:** `aicrew benchmark --report` scans your project and writes a per-session TOKEN_REPORT to `.ai/reports/`. All numbers are clearly labeled **estimated** — exact counts need your tool's token-usage log.

### The sources of waste (and the fix for each)

| Feature | The problem | What aicrew does | Typical saving |
|---------|-------------|------------------|----------------|
| **`/quick` Scout → Act** | Exploring a codebase with raw grep reads every file it touches — ~80,000 tokens for a typical scan | Scout runs a graph query instead: one `search_graph` call returns the relevant symbol in ~500 tokens. The main model only sees the compact `SCOUT:` block, never the raw repo. | ~79K tokens per session |
| **`/lean` slice reads** | Reading a whole 500-line file to change 3 lines costs 500+ tokens | `/lean` enforces `git diff` → directory tree → slice-read order. You get the 20–30 lines you need, not the whole file. | ~70% fewer read tokens |
| **graph MCP (`codebase-memory-mcp`)** | "What calls `authMiddleware`?" via grep scans every file: ~80K tokens | The same query via `search_graph` costs ~500 tokens — a 160× reduction. Index once; every session benefits. | ~79.5K per 3 queries |
| **`/handoff` + `.ai/state`** | Switching from Cursor to Claude Code mid-task means re-pasting the full chat — 10–20K tokens | `/handoff` writes a compact `.ai/state/AI_STATE.<tool>.<session>.md` (~300 tokens). Paste that instead of the whole conversation. | ~14.7K per tool switch |
| **`/dev` phase compaction** | A full 9-phase `/dev` session accumulates context. Later phases carry everything from earlier ones. | `/dev` runs `/compact` automatically at every phase boundary, pruning stale context before the next phase starts. | ~60% context at each boundary |
| **caveman/terse output** | Verbose AI responses add 30–40% more output tokens with no extra information | aicrew defaults to caveman/lean style — lead with the answer, drop filler. Use `/normal` when you want prose. | ~35% fewer output tokens |
| **speculative Scout → Act** | On large context windows, even the discovery step fills the window before coding starts | `/quick` routes Scout to a cheap fast model (Haiku/gpt-4o-mini) and hands only the `SCOUT:` block to the capable model. See [`skills/docs/speculative-context.md`](./skills/docs/speculative-context.md). | Context window stays headroom |
| **`context-mode` / `token-optimizer-mcp`** | Long sessions accumulate KV-cache misses as context grows | These optional MCP servers shape long-session context and keep the cache warm so repeated prompts don't re-spend tokens. | Varies; biggest on sessions > 30min |

### Concrete scenarios

**"I need to fix a login bug in a large monorepo"**
→ Open with `/quick`. Scout runs a graph query (~500 tok) instead of grepping 1,000 files (~80K tok). Act makes the surgical fix. Total cost: ~1–2K tokens vs 80K+ for a naive grep-and-read approach.

**"I'm doing a multi-day feature with `/dev`"**
→ Turn on `/lean` at the start. Phase compaction fires at each gate. Each phase starts with a clean context instead of carrying everything from Phase 1 forward. For a 9-phase session this can halve total context spend.

**"I keep switching between Cursor and Claude Code"**
→ Run `/handoff` before switching. Paste the `.ai/state/` file into the new tool. No chat replay, no re-explaining the goal. Each switch costs ~300 tokens instead of 15,000.

**"The AI keeps writing long explanations I don't need"**
→ aicrew is already in caveman mode by default. If it slipped to verbose, type `/terse` or check `~/Agents/agents/caveman.md`. Use `/normal` when you actually want the prose.

### See the numbers for your project

```bash
aicrew benchmark --report
```

Opens a report at `.ai/reports/TOKEN_REPORT.<timestamp>.md` showing baseline vs aicrew estimates for your specific codebase size. The biggest win varies by repo — small projects benefit most from lean reads; large ones from graph MCP.

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

Each CLI action also has a Codex skill and a Claude Code slash command — see the [parity table](#cli-or-skill--same-action) above.

| Command | Codex skill | Claude Code | Purpose |
|---------|-------------|-------------|---------|
| `aicrew install` | `aicrew-install` | `/install` | First-time or fresh machine; merge skills and hooks |
| `aicrew update` | `aicrew-update` | `/update` | Same as `install` — picks up new files from the package |
| `aicrew status` | `aicrew-status` | `/status` | Shows `~/Agents`, global skills, command symlinks, hooks, Codex skills, and cwd `.ai/skills/` |
| `aicrew agent-kit init [path]` | `aicrew-agent-kit` | `/agent-kit` | Scaffolds shared Cursor `.mdc` rules layout (default `./agent-kit`) |
| `aicrew cursor-plugin init [path]` | `aicrew-cursor-plugin` | `/cursor-plugin` | Scaffolds Cursor extension for multi-tool terminals (default `./cursor-multi-tool-plugin`) |
| `aicrew benchmark` _(planned)_ | `aicrew-benchmark` | `/benchmark` | Measure skill quality, token efficiency, and pipeline timing |
| `aicrew --version` / `-v` | — | — | Print package version |
| `aicrew --help` / `-h` | — | — | Help |
| `aicrew` (no args) | — | — | Interactive menu |

---

## What's new

| Area | What changed |
|------|----------------|
| **`/benchmark`** | `aicrew benchmark --report` scans your project and writes a per-session `TOKEN_REPORT` to `.ai/reports/` — shows baseline vs aicrew token estimates, savings by feature, and top recommendations. |
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

## Inspired by

aicrew draws **architectural inspiration** (no code copied) from:

- **[forrestchang/andrej-karpathy-skills](https://github.com/forrestchang/andrej-karpathy-skills)** (MIT) — Karpathy-style agent safety heuristics informed the guardrail layer and phase-gate checkpoints.
- **[NVIDIA/NeMo-Guardrails](https://github.com/NVIDIA/NeMo-Guardrails)** (NVIDIA license) — input/output/dialog rail taxonomy inspired `security-guard.py`, phase gates, and the `security-reviewer` pattern.
- **[chopratejas/headroom](https://github.com/chopratejas/headroom)** (Apache 2.0) — CCR, ContentRouter, RollingWindow, and `headroom learn` patterns informed the context budget rail.
- **Academic:** Leviathan et al. speculative decoding (2023), Anthropic context engineering guidance, ReSum, CoMem.

Full attribution with license details: [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).

---

## License

aicrew is MIT — see [LICENSE](LICENSE).

Third-party components and inspirations: [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
