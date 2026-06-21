# AI Skills & Agents System

Universal development pipeline for Claude Code, Cursor, Codex, Gemini CLI, and Antigravity.
One `/dev` command — works in any project on tools that support slash commands. In Codex, use the `aicrew-*` skills.

Source of truth: `~/Agents/` (platform-agnostic)
Published as: `npx aicrew install` (all platforms) or `npx aicrew install <platform>` (targeted)

Platform-specific install: `aicrew install claude` | `aicrew install cursor` | `aicrew install codex` | `aicrew install gemini`

Last updated: 2026-06-21

---

## Default Communication Style

All aicrew skills and commands use **caveman/lean output by default** — no opt-in required.

- Lead with answer or action; short sentences, compact fragments OK
- No filler, pleasantries, or hedging
- Keep technical strings verbatim (paths, commands, errors, versions)
- Safety exception: destructive actions, security warnings, and multi-step instructions remain explicit; resume terse after
- Disable with `/normal` or `/lean off`; re-enable with `/lean on`

See `~/Agents/agents/caveman.md` (style) and `~/Agents/agents/context-economy.md` (read policy).

---

## Shared Token Stack

All entry-point commands (`/dev`, `/fix`, `/quick`) share a common token-saving foundation — defined once in `~/Agents/docs/token-foundation.md` and referenced (not duplicated) by each command.

> **Plain-English explanation of every token-saving mechanism:** [`~/Agents/docs/how-token-savings-work.md`](./docs/how-token-savings-work.md)

- **Graph-first research** — `codebase-memory-mcp` (`search_graph` → `trace_path` → `get_code_snippet`) runs before any `Grep`/`Glob`/file-read in every phase. Graph query ≈ 500 tokens vs repo-wide grep ≈ 80 K.
- **Speculative context** — a cheap Scout agent (haiku/mini) emits the fixed `SCOUT:` schema; the capable main agent (sonnet/opus) verifies the schema and acts from it — never from raw repo content. This is the speculative-decoding pattern applied to multi-agent orchestration.
- **Layered guardrails** — `security-guard.py` (input), intake scope lock (topic), phase gates (dialog flow), `karpathy-guardrails` (implementation), `security-reviewer` + `conclude` (output), context-economy + `/compact` (budget).
- **Context economy** — always on (not opt-in); `/lean on` amplifies; `/compact` runs between phases.

## Philosophy

- **Single source of truth in `~/Agents/`**: not inside any tool-specific directory
- **All tools consume via symlinks**: Claude Code, Cursor, Codex, Antigravity, Gemini all reference `~/Agents/`
- **No copies**: edit `~/Agents/` once — every symlink picks it up instantly
- **TDD first by default**: strict RED → GREEN → REFACTOR is the default; relaxed mode requires opt-out
- **Caveman/lean output by default**: terse answers + context-economy reads; `/normal` or `/lean off` restores verbose
- **Expert specialist routing**: /dev auto-selects the right domain specialist based on what files change
- **Generic base, project overrides**: global agents work anywhere; project layer adds domain knowledge

---

## Directory Structure

```
~/Agents/                            ← SOURCE OF TRUTH (platform-agnostic)
  commands/
    dev.md                           ← /dev   — universal 9-phase pipeline
    fix.md                           ← /fix   — fast 5-phase bug fix
    quick.md                         ← /quick — Scout → Act (graph-first, Karpathy guardrails)
    conclude.md                      ← /conclude — session wrap-up + memory
    update-skills.md                 ← /update-skills — maintain + evolve
  agents/
    brainstorm.md                    ← Phase 2: 3 alternatives + trade-offs
    architect.md                     ← Phase 3: interface spec, contract checks
    tdd-developer.md                 ← Phase 4: strict RED→GREEN→REFACTOR
    frontend-specialist.md           ← Phase 4: React/Vue/TS, a11y, RTL TDD
    backend-specialist.md            ← Phase 4: API, service layer, auth, error handling
    db-migration.md                  ← Phase 4+8: schema safety, rollback, null safety
    performance.md                   ← Phase 4/5: profiling, N+1, bundle analysis
    test-engineer.md                 ← Phase 5: pyramid, coverage, quality, smoke path
    security-reviewer.md             ← Phase 6: real vulns, no false positives
    cloud-expert.md                  ← Phase 8: migration, deps, env, concurrency
    bug-analyst.md                   ← Phase 1 (bugs): symptom → root cause
    caveman.md                       ← Default terse output style (not opt-in)
    terse.md                         ← Default output policy + evidence footer
    context-economy.md               ← Default read policy (diff/slice first)
    karpathy-guardrails.md           ← /quick Act: think, simplicity, surgical, goal-driven
    context-scout.md                 ← speculative context: cheap Scout agent with fixed SCOUT: schema and re-scout rules
    state-checkpoint.md              ← .ai/state checkpoint format
  commands/
    benchmark.md                     ← /benchmark — token savings estimate + per-session TOKEN_REPORT
  docs/
    token-foundation.md              ← shared token stack for /dev, /fix, /quick (graph-first + speculative + guardrails + economy)
    guardrails-taxonomy.md           ← NeMo rails ↔ aicrew hooks/phases (docs only)
    speculative-context.md           ← speculative context pattern: Scout-as-draft-model, two-model routing, failure modes
    how-token-savings-work.md        ← plain-English guide to every token-saving mechanism
    token-foundation.md              ← shared token stack referenced by /dev, /fix, /quick
  hooks/
    session-memory.py                ← Stop: journals changed files per session
    security-guard.py                ← PreToolUse: blocks keys, warns on injection
  SKILLS_SYSTEM.md                   ← this file
  setup.sh                           ← creates all platform symlinks + registers hooks

~/.claude/commands/                  ← SYMLINKS → ~/Agents/commands/
  dev.md           → ~/Agents/commands/dev.md
  fix.md           → ~/Agents/commands/fix.md
  conclude.md      → ~/Agents/commands/conclude.md
  update-skills.md → ~/Agents/commands/update-skills.md

~/.claude/skills/                    ← SYMLINKS → ~/Agents/ (Claude consumer)
  commands/        → ~/Agents/commands/
  agents/          → ~/Agents/agents/
  hooks/           → ~/Agents/hooks/
  SKILLS_SYSTEM.md → ~/Agents/SKILLS_SYSTEM.md
  setup.sh         → ~/Agents/setup.sh

~/Workspace/aicrew/skills/           ← SYMLINKS → ~/Agents/ (npm package)
  commands/        → ~/Agents/commands/
  agents/          → ~/Agents/agents/
  hooks/           → ~/Agents/hooks/
  SKILLS_SYSTEM.md → ~/Agents/SKILLS_SYSTEM.md
  setup.sh         → ~/Agents/setup.sh

~/.codex/skills/                     ← aicrew-* Codex skills (installed)
  aicrew-benchmark/SKILL.md         ← token savings benchmark + session report

[Cursor]  ~/.cursor/rules/           ← SYMLINKS → ~/Agents/agents/ (per rule file)
[Codex]   [repo]/AGENTS.md           → references ~/Agents/
[Antigravity/Gemini]                 → reference ~/Agents/ in their config

[project]/.ai/skills/                ← PROJECT layer (inside repo, version-controlled)
  commands/audit.md                  ← domain compliance check
  agents/cloud-expert.md             ← project-specific infra override
  agents/[specialist].md             ← project-specific specialist override
  hooks/audit-guard.py               ← domain invariant checks
  cursor-rules/[project].mdc         ← Cursor rules
  AGENTS.md                          ← Codex entry point
  setup.sh                           ← registers project hooks + symlinks
```

---

## Same action, every platform — Parity Table

Every action is reachable from every supported platform. No CLI required on any of them.

> Full matrix with per-platform install paths and notes: [`skills/docs/platform-entry-points.md`](./docs/platform-entry-points.md)

| Action | CLI | Claude Code | Cursor | Codex | Gemini / Antigravity |
|--------|-----|-------------|--------|-------|----------------------|
| First-time setup | `aicrew install` | `/install` | `aicrew install cursor` | `aicrew-install` | `aicrew install gemini` |
| Platform-only setup | `aicrew install <platform>` | — | — | — | — |
| Pull new skills | `aicrew update` | `/update` | re-run install | `aicrew-update` | re-run install |
| Check install | `aicrew status` | `/status` | `aicrew status` | `aicrew-status` | `aicrew status` |
| Scaffold agent-kit | `aicrew agent-kit init` | `/agent-kit` | same CLI | `aicrew-agent-kit` | — |
| Scaffold cursor plugin | `aicrew cursor-plugin init` | `/cursor-plugin` | same CLI | `aicrew-cursor-plugin` | — |
| Full dev pipeline | — | `/dev` | `/dev` | `aicrew-dev` | `/dev` |
| Fast bug fix | — | `/fix` | `/fix` | `aicrew-fix` | `/fix` |
| Scout → Act | — | `/quick` | `/quick` | `aicrew-quick` | `/quick` |
| Wrap up session | — | `/conclude` | `/conclude` | `aicrew-conclude` | `/conclude` |
| Evolve project skills | — | `/update-skills` | `/update-skills` | `aicrew-update-skills` | `/update-skills` |
| Audit harness | — | `/harness-audit` | `/harness-audit` | `aicrew-harness-audit` | `/harness-audit` |
| Session checkpoint label | — | `/session` | `/session` | `aicrew-session` | `/session` |
| Cross-tool handoff | — | `/handoff` | `/handoff` | `aicrew-handoff` | `/handoff` |
| Benchmark skills | `aicrew benchmark` | `/benchmark` | `aicrew benchmark` | `aicrew-benchmark` | `aicrew benchmark` |
| Design brainstorm | — | `/brainstorm` | `/brainstorm` | `brainstorm` | `/brainstorm` |
| Lean/terse on | — | `/lean on` | `/lean on` | `lean` | `/lean on` |
| Lean/terse off | — | `/lean off` or `/normal` | `/lean off` | `aicrew-normal` | `/lean off` |
| Re-enable terse | — | `/terse` | `/terse` | `aicrew-terse` | `/terse` |

---

## Platform Support

All commands and agents work across:

| Tool | How it uses this system |
|---|---|
| **Claude Code** | All slash commands via `~/.claude/commands/` symlinks |
| **Cursor** | Agent rules via `.cursor/rules/` → `~/Agents/agents/` |
| **Codex CLI** | All `aicrew-*` skills from `~/.codex/skills/` (no slash commands); `AGENTS.md` in repo can reference `~/Agents/` |
| **Antigravity** | System prompt references `~/Agents/commands/dev.md` (+ `lean.md`, `session.md`) |
| **Gemini CLI** | System prompt references `~/Agents/commands/dev.md` (+ `lean.md`, `session.md`) |

Checkpoints work across all platforms — see the `⚠️ INTERACTIVE CHECKPOINTS` table in every skill file.

---

## Default output: caveman/lean

All aicrew skills and commands use terse output and context-economy reads **by default**. Not opt-in.

| Agent file | Role |
|---|---|
| `caveman.md` | Canonical style: lead with answer, short lines, no filler; safety boundaries for destructive/security/multi-step content |
| `terse.md` | Default output policy, evidence footer, fidelity rules |
| `context-economy.md` | Default read policy: diff/tree/search before reads, slice over whole-file |

| Command | Role |
|---|---|
| `/lean on` | Explicit boost or re-enable after disable |
| `/lean off` or `/normal` | Restore verbose output and relaxed read policy |
| `/terse` | Re-enable terse if previously disabled |

Interactive checkpoints, constraints, acceptance criteria, and security warnings are never compressed away.

---

## Setup

### First time only — bootstrap everything

```bash
npx aicrew install
# or manually:
bash ~/Agents/setup.sh
```

This:
1. Creates `~/.claude/commands/` symlinks → `~/Agents/commands/`
2. Replaces `~/.claude/skills/` subdirs with symlinks → `~/Agents/`
3. Registers hooks in `~/.claude/settings.json`
4. Replaces `~/Workspace/aicrew/skills/` subdirs with symlinks → `~/Agents/`
5. Installs Codex skills under `~/.codex/skills/`
6. Sets up `~/.cursor/rules/` symlinks for Cursor
7. Outputs Codex / Antigravity / Gemini setup instructions

### After that — one command for everything

```
/update-skills
```

`/update-skills` runs `setup.sh` automatically, then lets you update, generate project skills, or research. **You never need to run `setup.sh` manually again.**

### Edit skills

**All edits go in `~/Agents/`** — every tool picks them up immediately:

```bash
vim ~/Agents/commands/dev.md
vim ~/Agents/agents/frontend-specialist.md

# Commit via aicrew repo
cd ~/Workspace/aicrew && git add skills/ && git commit
```

---

## Commands

### `/benchmark` — Token savings estimate + session report

Scans the project, estimates baseline (naive full-read) vs aicrew token usage, and writes
`.ai/reports/TOKEN_REPORT.<timestamp>.md`.

```bash
aicrew benchmark                        # print summary for cwd
aicrew benchmark --report               # also write markdown report
aicrew benchmark --project ./myapp -r   # scan a specific project
aicrew benchmark -s "session-name" -r   # label the report
```

All figures are **estimated** (bytes/4 rule + documented grep/graph ratio from codebase-memory-mcp).

---

### `/quick` — Scout → Act (graph-first)

Two phases: **Scout** (graph MCP or diff/tree/search; fixed `SCOUT:` schema) then **Act** (Karpathy guardrails). No full `/dev` pipeline.

| Phase | What | Gate |
|---|---|---|
| Intake | Goal, constraints, done-when | User confirms |
| Scout | `search_graph` → `trace_path` → `get_code_snippet`; fallback diff/tree | User confirms Scout block |
| Act | `karpathy-guardrails` + minimal implementation | Acceptance criteria |

Read policy: no raw Grep/Read whole files until Scout completes or user overrides. Integrates with `/lean` via `context-economy`. State file updated after Scout.

See also: `docs/guardrails-taxonomy.md` for NeMo-style rail mapping.

---

### `/dev` — Universal Development Pipeline

| # | Phase | Agent(s) | Gate |
|---|---|---|---|
| 0 | Intake | — | You confirm |
| 1 | Research | `bug-analyst` (bugs), Explore (features) | Root cause / key files |
| 2 | Brainstorm | `brainstorm` | You pick approach |
| 3 | Design | `architect` | You confirm spec |
| 4 | Implement | `tdd-developer` + specialist(s) | All tests green |
| 5 | Tests | `test-engineer` | PASS required |
| 6 | Security | `security-reviewer` | PASS required |
| 7 | Audit | project `/audit` | PASS required |
| 8 | Cloud/Infra | `cloud-expert` + `db-migration` | PASS required |
| 9 | Conclude | `/conclude` | You approve commit |

**TDD default (Phase 4):**
RED → GREEN → REFACTOR per acceptance criterion. Relaxed mode requires opt-out at intake.

**Specialist routing (Phase 4 — auto from Research):**

| Changed files | Specialist |
|---|---|
| `*.tsx`, `*.vue`, `*/components/*` | `frontend-specialist` |
| `*/api/*`, `*/routes/*`, `*/services/*` | `backend-specialist` |
| `*/migrations/*`, `*models*`, `*schema*` | `db-migration` |
| Performance is an acceptance criterion | `performance` |

**Test engineer (Phase 5 — always):** pyramid, coverage ≥80%, quality, smoke path.

---

## Agents

### Core

| Agent | Phase | Role |
|---|---|---|
| `bug-analyst` | 1 | Symptom → root cause (confirmed, not guessed) |
| `brainstorm` | 2 | 3 approaches with trade-off matrix |
| `architect` | 3 | Contract checks, interface spec |
| `tdd-developer` | 4 | Strict RED → GREEN → REFACTOR |
| `test-engineer` | 5 | Pyramid, coverage, quality, smoke |
| `security-reviewer` | 6 | Real vulns, changed files only |
| `cloud-expert` | 8 | Migration, deps, env, concurrency |
| `karpathy-guardrails` | `/quick` Act | Think, simplicity, surgical changes, goal-driven |
| `context-economy` | `/lean` | Token-saving read policy |
| `context-scout` | `/quick` Scout (two-model) | Speculative-context draft: fixed SCOUT: schema, re-scout rules |
| `state-checkpoint` | All pipelines | `.ai/state/AI_STATE.*.md` format |

### Specialists (Phase 4 — auto-routed)

| Agent | Triggered by | Focus |
|---|---|---|
| `frontend-specialist` | Frontend files | React/Vue, a11y, RTL TDD, bundle, state |
| `backend-specialist` | API/service files | REST, auth, service layer, errors |
| `db-migration` | Schema/model files | Migration safety, rollback, null safety |
| `performance` | Perf in AC | Profiling, N+1, benchmarks |

---

## Hooks

| Hook | Event | What it does |
|---|---|---|
| `session-memory.py` | Stop | Journals changed files to session_journal.md |
| `security-guard.py` | PreToolUse | Blocks keys, warns on injection patterns |

---

## Files Quick Reference

| Edit | When |
|---|---|
| `~/Agents/commands/dev.md` | Pipeline phases or specialist routing |
| `~/Agents/commands/fix.md` | Fast-fix flow |
| `~/Agents/commands/quick.md` | Scout → Act flow |
| `~/Agents/commands/benchmark.md` | Token savings benchmark + report |
| `~/Agents/agents/karpathy-guardrails.md` | Karpathy coding principles |
| `~/Agents/agents/context-scout.md` | Speculative context scout agent |
| `~/Agents/docs/token-foundation.md` | Shared token stack for /dev, /fix, /quick (graph-first + speculative + guardrails + economy) |
| `~/Agents/docs/how-token-savings-work.md` | Plain-English guide: speculative decoding, graph memory, lean, handoff, guardrails, benchmark |
| `~/Agents/docs/guardrails-taxonomy.md` | NeMo ↔ aicrew guardrails map |
| `~/Agents/docs/speculative-context.md` | Speculative context pattern (two-model routing) |
| `~/Agents/agents/frontend-specialist.md` | Frontend TDD patterns |
| `~/Agents/agents/backend-specialist.md` | Backend API patterns |
| `~/Agents/agents/db-migration.md` | Migration safety rules |
| `~/Agents/agents/performance.md` | Profiling strategy |
| `~/Agents/agents/test-engineer.md` | Test quality standards |
| `~/Agents/agents/security-reviewer.md` | Vuln patterns |
| `~/Agents/agents/tdd-developer.md` | TDD cycle |
| `~/Agents/agents/architect.md` | Design spec format |
| `~/Agents/agents/bug-analyst.md` | Root cause tracing |
| `~/Agents/agents/cloud-expert.md` | Infra patterns |
| `~/Agents/agents/brainstorm.md` | Alternatives format |
| `~/Agents/hooks/session-memory.py` | Journal format |
| `~/Agents/hooks/security-guard.py` | Security anti-patterns |
| `~/Agents/setup.sh` | Platforms, symlinks, hooks |
