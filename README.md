# aicrew

Universal AI development pipeline for Claude Code, Cursor, Codex, Antigravity, and Gemini.

One `/dev` command — TDD-first by default, expert agent routing based on what files you're changing. Runs the right specialist automatically at each stage. In Codex, use the `aicrew-*` skills (no slash commands).

---

## Quick Start

### 1. Install (once per machine)

```bash
npx aicrew install
```

Sets `~/Agents/` as the source of truth (platform-agnostic, not inside any tool directory). Creates symlinks from `~/.claude/commands/`, `~/.claude/skills/`, `~/.cursor/rules/`, and `~/Workspace/aicrew/skills/` all pointing to `~/Agents/`. Installs Codex skills under `~/.codex/skills/`. Registers hooks in `~/.claude/settings.json`. Takes 2 seconds.

### 2. Use it (in any project)

Claude Code commands:
```
/dev            — full 9-phase pipeline: intake → research → design → TDD → test → security → conclude
/fix            — fast bug fix: 3 questions, root cause, TDD, done
/conclude       — save session learnings to persistent memory
/harness-audit  — audit the AI harness itself for health and completeness
```

Codex skills:
```
aicrew-dev            — full 9-phase pipeline
aicrew-fix            — fast bug fix
aicrew-conclude       — wrap up session + commit message
aicrew-harness-audit  — audit the AI harness itself
aicrew-update-skills  — maintain skills + project generation
```

The pipeline asks what you're working on (bug/feature/refactor), shows which stages will run, and lets you customise before starting.

### 3. Add project-specific skills (optional)

```
/update-skills
```

Choose option **2** (Generate project skills). Analyzes your codebase and generates `.ai/skills/` with project-specific knowledge. Commit the generated files — every team member gets the same guardrails. In Codex, run `npx aicrew update` from the repo root.

---

## Commands

In Codex, use the `aicrew-*` skills instead of slash commands.

| Command | When to use |
|---|---|
| `/dev` | Features, refactors, complex bugs — full SDLC |
| `/fix` | Quick bug fixes — 5 phases, no ceremony |
| `/conclude` | End of any session — save learnings, commit message |
| `/update-skills` | Maintain, improve, or research new practices |
| `/harness-audit` | Verify the AI harness is healthy and complete |

---

## The /dev Pipeline

```
Intake:    What are we working on? → Clarifying questions → ACs + pipeline plan
           /compact after each phase
           ↓
Phase 1:   Research        — bug analyst (bugs) or codebase exploration (features)
Phase 2:   Brainstorm      — 3 alternatives with trade-offs (features/refactors)
Phase 3:   Design          — architect: contract checks, interface spec, over/under flags
Phase 4:   Implement       — TDD-first (default): RED → GREEN → REFACTOR per criterion
                             + auto-routed specialist agents
                             + two-stage subagent review (spec compliance → code quality)
Phase 5:   Tests           — test engineer: pyramid, coverage ≥80%, quality, smoke path
Phase 6:   Security        — changed files only, no false positives
Phase 7:   Audit           — domain compliance (if project has /audit)
Phase 8:   Cloud/Infra     — auto-triggers if infra files change
Phase 9:   Conclude        — memory saved, commit message ready
```

**TDD is on by default.** Relaxed mode requires explicit opt-out at intake.

**Context:** `/compact` runs after each phase to prevent context bloat.

### Specialist routing (Phase 4 — auto from Research)

| Changed files | Specialist invoked |
|---|---|
| `*.tsx`, `*.vue`, `*/components/*` | `frontend-specialist` — React/Vue, a11y, RTL TDD, bundle |
| `*/api/*`, `*/routes/*`, `*/services/*` | `backend-specialist` — REST, auth, service layer, errors |
| `*/migrations/*`, `*models*`, `*schema*` | `db-migration` — schema safety, rollback, null safety |
| Performance is an acceptance criterion | `performance` — profiling, N+1, benchmarks |

### Two-stage subagent review (Phase 4)

For multi-file or complex changes, each task dispatches a fresh subagent with exactly the context it needs. Two review stages fire in sequence:

1. **Spec compliance** — did the implementation match the spec? No over/under-building?
2. **Code quality** — readable, correct, free of obvious issues?

Each subagent returns a status: `DONE` / `DONE_WITH_CONCERNS` / `NEEDS_CONTEXT` / `BLOCKED`.

---

## Agents

### Core

| Agent | Phase | Role |
|---|---|---|
| `bug-analyst` | 1 | Symptom → entry point → call chain → confirmed root cause |
| `brainstorm` | 2 | 3 genuinely different approaches with trade-off matrix |
| `architect` | 3 | Contract checks, interface spec, over/under-engineering flags |
| `tdd-developer` | 4 | Strict RED → GREEN → REFACTOR per acceptance criterion |
| `test-engineer` | 5 | Pyramid balance, coverage gaps, quality, flaky detection, smoke path |
| `security-reviewer` | 6 | Real vulnerabilities only, no false positives |
| `cloud-expert` | 8 | Migration safety, dependency risk, env assumptions, concurrency |

### Specialists (Phase 4 — auto-routed)

| Agent | Expertise |
|---|---|
| `frontend-specialist` | React/Vue/TS, a11y, RTL TDD, bundle analysis, state management |
| `backend-specialist` | REST API design, auth/authz, service layer, error handling |
| `db-migration` | Schema safety, rollback, null safety, idempotency, index planning |
| `performance` | Profiling, N+1 detection, bundle analysis, caching strategy |

---

## Hooks

| Hook | Event | What it does |
|---|---|---|
| `session-memory.py` | Stop | Journals changed files, batch TS typecheck, `<private>` tag filtering, instinct capture |
| `security-guard.py` | PreToolUse | Blocks private keys/AWS keys, warns on injection patterns |

**Hook profiles** (`ECC_HOOK_PROFILE` env var):
- `minimal` — journal only
- `standard` — journal + batch typecheck (default)
- `strict` — journal + typecheck + instinct capture

**`<private>` tags:** Wrap any content in `<private>...</private>` and it will be stripped from session memory before storage.

Project-level hooks (generated via `/update-skills`):
- `audit-guard.py` — domain-specific invariant checks on every Edit/Write

---

## Architecture

```
~/Agents/                      source of truth (platform-agnostic)
  commands/                    /dev, /fix, /conclude, /update-skills, /harness-audit
  agents/                      11 agents: 7 core + 4 specialists
  hooks/                       session-memory.py, security-guard.py
  SKILLS_SYSTEM.md             full system documentation
  setup.sh                     creates all platform symlinks + registers hooks

~/.claude/commands/            symlinks → ~/Agents/commands/
~/.claude/skills/              symlinks → ~/Agents/ subdirs
~/.cursor/rules/               symlinks → ~/Agents/agents/ (Cursor)
~/.codex/skills/               aicrew-* Codex skills (installed)
~/Workspace/aicrew/skills/     symlinks → ~/Agents/ (this package)

[repo]/.ai/skills/             project layer (version controlled)
  commands/audit.md            domain compliance check
  agents/[specialist].md       project-specific specialist override
  hooks/audit-guard.py         domain invariant checks
  cursor-rules/[project].mdc   Cursor rules
  AGENTS.md                    Codex entry point
  setup.sh                     project hook registration
```

---

## CLI Reference

```bash
npx aicrew install     # first-time setup
npx aicrew update      # merge new skills (keeps your edits)
npx aicrew status      # show installed skills, hooks, commands
npx aicrew --version
npx aicrew --help
```

---

## Design Principles

- **Source of truth in `~/Agents/`** — not inside any tool-specific directory; symlinks everywhere
- **TDD-first** — strict RED → GREEN → REFACTOR is the default; relaxed mode requires opt-out
- **Expert specialist routing** — right agent for the job, auto-selected from what files change
- **Two-stage review** — spec compliance before code quality; never reversed
- **Written from scratch** — no external code copied, no unknown security issues
- **Zero external dependencies** — hooks use Python stdlib only, CLI uses Node stdlib only
- **Low noise** — hooks skip test files; security reviewer covers changed files only

---

## Interactive Checkpoints

Every command and agent includes checkpoints where the AI **must** pause and wait for your input. Uses native ask tools per platform:

| Platform | Checkpoint behavior |
|---|---|
| **Claude Code** | Calls `AskUserQuestion` tool; otherwise ends response and waits |
| **Cursor** | Calls `askFollowupQuestion` tool; otherwise ends response and waits |
| **Antigravity** | Calls ask tool if available; otherwise ends response and waits |
| **Gemini CLI** | Calls `ask_human` tool; otherwise ends response and waits |
| **Codex CLI** | Calls `ask_human` tool; otherwise ends response and waits |
| **Autonomous agents** | Stops execution — never fabricates your answer |

The pipeline will **never** skip a checkpoint or invent your response.

---

## License

MIT
