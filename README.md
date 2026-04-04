# aicrew

Universal AI development pipeline for Claude Code, Cursor, Codex, Antigravity, and Gemini.

One `/dev` command — TDD-first by default, expert agent routing based on what files you're changing. Runs the right specialist (frontend, backend, DB migration, performance) automatically at each stage.

---

## Quick Start

### 1. Install (once per machine)

```bash
npx aicrew install
```

Sets `~/Agents/` as the source of truth, creates symlinks from `~/.claude/commands/`, `~/.claude/skills/`, `~/.cursor/rules/`, and `~/Workspace/aicrew/skills/` all pointing to `~/Agents/`. Registers hooks in `~/.claude/settings.json`. Takes 2 seconds.

### 2. Use it (in any project)

Open Claude Code in your project directory and type:

```
/dev       — full pipeline: intake → research, brainstorm, design, implement, test, security, audit, conclude
/fix       — fast bug fix: 3 questions, root cause analysis, TDD fix, done
/conclude  — save session learnings to persistent memory
```

That's it. The pipeline asks you what you're working on (bug/feature/refactor), shows which stages will run, and lets you customise before starting.

### 3. Add project-specific skills (optional)

For domain-specific checks (audit rules, cursor rules, infra overrides):

```
/update-skills
```

Choose option **2** (Generate project skills). It analyzes your codebase and generates `.ai/skills/` with project-specific knowledge. Commit the generated files — every team member gets the same guardrails.

---

## Available Commands

| Command | What it does | When to use |
|---|---|---|
| `/dev` | Full SDLC pipeline with 9 phases | Features, refactors, complex bugs |
| `/fix` | Streamlined 5-phase bug fix | Quick bug fixes |
| `/conclude` | Save session learnings to memory | End of any session |
| `/update-skills` | Maintain + evolve the skills system | Add project skills, update globals, research new practices |

## The /dev Pipeline

`/dev` guides you through 3 checkpoints during intake, then runs the phases you approved:

```
Intake:    What are we working on? → Clarifying questions → ACs + pipeline plan
           ↓
Phase 1:   Research        — bug analyst (bugs) or codebase exploration (features)
Phase 2:   Brainstorm      — 3 alternatives with trade-offs (features/refactors)
Phase 3:   Design          — architect agent: contract checks, interface spec
Phase 4:   Implement       — TDD-first (default): RED → GREEN → REFACTOR per criterion
                             + auto-routed specialists (frontend/backend/db/performance)
Phase 5:   Tests           — test engineer: pyramid, coverage ≥80%, quality, smoke path
Phase 6:   Security        — changed files only, no noise
Phase 7:   Audit           — domain compliance (if project has /audit)
Phase 8:   Cloud/Infra     — auto-triggers if infra files change
Phase 9:   Conclude        — memory saved, commit message ready
```

**TDD is on by default.** Relaxed mode (write tests after) requires explicit opt-out at intake.

**Specialist routing (Phase 4 — auto from Research):**

| Changed files | Specialist invoked |
|---|---|
| `*.tsx`, `*.vue`, `*/components/*` | `frontend-specialist` — React/Vue, a11y, RTL TDD |
| `*/api/*`, `*/routes/*`, `*/services/*` | `backend-specialist` — REST, auth, service layer |
| `*/migrations/*`, `*models*`, `*schema*` | `db-migration` — schema safety, rollback, null safety |
| Performance is an acceptance criterion | `performance` — profiling, N+1, benchmarks |

## Agents

### Core agents

| Agent | Phase | Role |
|---|---|---|
| `bug-analyst` | 1 | Symptom → entry point → call chain → confirmed root cause |
| `brainstorm` | 2 | 3 genuinely different approaches with trade-off matrix |
| `architect` | 3 | Contract checks, interface spec, over/under-engineering flags |
| `tdd-developer` | 4 | Strict RED → GREEN → REFACTOR per acceptance criterion |
| `test-engineer` | 5 | Pyramid balance, coverage gaps, test quality, smoke path |
| `security-reviewer` | 6 | Real vulnerabilities only, no false positives |
| `cloud-expert` | 8 | Migration safety, dependency risk, env assumptions |

### Specialist agents (Phase 4 — auto-routed)

| Agent | Expertise |
|---|---|
| `frontend-specialist` | React/Vue/TS, a11y, RTL TDD, bundle analysis, state management |
| `backend-specialist` | REST API design, auth/authz, service layer, error handling |
| `db-migration` | Schema safety, rollback, null safety, idempotency, index planning |
| `performance` | Profiling, N+1 detection, bundle analysis, caching strategy |

## Hooks

| Hook | Event | What it does |
|---|---|---|
| `session-memory.py` | Stop (every turn) | Journals changed files to session_journal.md |
| `security-guard.py` | PreToolUse (Edit/Write/MultiEdit) | Blocks private keys/AWS keys, warns on injection patterns |

Project-level hooks (generated via `/update-skills`):
- `audit-guard.py` — domain-specific invariant checks on every Edit/Write

## Architecture

```
~/Agents/                      source of truth (platform-agnostic)
  commands/                    /dev, /fix, /conclude, /update-skills
  agents/                      11 agents: core + specialists
  hooks/                       session-memory.py, security-guard.py
  SKILLS_SYSTEM.md             full system documentation
  setup.sh                     creates all platform symlinks + registers hooks

~/.claude/commands/            symlinks → ~/Agents/commands/
~/.claude/skills/              symlinks → ~/Agents/ subdirs
~/.cursor/rules/               symlinks → ~/Agents/agents/ (Cursor)
~/Workspace/aicrew/skills/     symlinks → ~/Agents/ (this package)

[repo]/.ai/skills/             project layer (version controlled)
  commands/audit.md            domain compliance check
  agents/[specialist].md       project-specific specialist override
  hooks/audit-guard.py         domain invariant checks
  cursor-rules/[project].mdc   Cursor rules
  AGENTS.md                    Codex entry point
  setup.sh                     project hook registration
```

## CLI Reference

```bash
npx aicrew install     # first-time setup
npx aicrew update      # merge new skills (keeps your edits)
npx aicrew status      # show installed skills, hooks, commands
npx aicrew --version
npx aicrew --help
```

## Design Principles

- **Written from scratch** — no external code copied, no unknown security issues
- **Single source of truth** — skills live in `~/Agents/` (platform-agnostic), symlinks everywhere
- **Zero external dependencies** — hooks use Python stdlib only, CLI uses Node stdlib only
- **Generic base, project overrides** — global skills work in any repo; project layer adds domain knowledge
- **Low noise** — hooks skip test files, migrations, docs; security reviewer only covers changed files

## Interactive Checkpoints

Every command and agent skill includes checkpoints where the AI **must pause and wait** for your input before continuing. This works across all supported platforms:

| Platform | How checkpoints work |
|---|---|
| **Claude Code** (chat) | AI ends its response, waits for your next message |
| **Cursor** (chat panel) | AI ends its response, waits for your next message |
| **Antigravity** (chat) | AI ends its response, waits for your next message |
| **Gemini CLI** | AI calls `askQuestion` or similar tool if available, otherwise yields |
| **Codex CLI** | AI calls `ask_human` or similar tool if available, otherwise yields |
| **Autonomous agents** | AI stops execution and yields control — never fabricates your answer |

The pipeline will **never** skip a checkpoint or invent your response, regardless of which tool runs it.

## License

MIT
