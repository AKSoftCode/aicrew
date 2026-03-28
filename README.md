# aicrew

Adaptive AI development pipeline for Claude Code, Cursor, and Codex.

One `/dev` command — it asks what you're working on, builds a custom pipeline, and runs expert agents at each stage: architect, TDD developer, security reviewer, bug analyst, and cloud/infra expert.

---

## Quick Start

### 1. Install (once per machine)

```bash
npx aicrew install
```

This copies skills to `~/.claude/skills/`, creates command symlinks, and registers hooks. Takes 2 seconds.

### 2. Use it (in any project)

Open Claude Code in your project directory and type:

```
/dev       — full pipeline: intake, research, design, implement, test, security, conclude
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
Phase 4:   Implement       — TDD: RED → GREEN → REFACTOR per criterion
Phase 5:   Tests           — full suite, edge cases, smoke path
Phase 6:   Security        — changed files only, no noise
Phase 7:   Project Audit   — domain compliance (if project has /audit)
Phase 8:   Cloud/Infra     — auto-triggers if infra files change
Phase 9:   Conclude        — memory saved, commit message ready
```

Default stages by work type:

| Stage | Bug Fix | Feature | Refactor |
|---|---|---|---|
| Research | ON | ON | ON |
| Brainstorm | off | ON | ON |
| Design | ON | ON | ON |
| Implement (TDD) | ON | ON | ON |
| Tests | ON | ON | ON |
| Security | ON | ON | ON |
| Conclude | ON | ON | ON |

You can toggle any stage and choose TDD strictness (strict or relaxed) during intake.

## Agents

| Agent | Role | Used in |
|---|---|---|
| `architect` | Contract checks, interface spec, over/under-engineering flags | Phase 3 |
| `bug-analyst` | Symptom → entry point → call chain → confirmed root cause | Phase 1 (bugs) |
| `brainstorm` | 3 genuinely different approaches with trade-off matrix | Phase 2 |
| `tdd-developer` | Strict RED → GREEN → REFACTOR per acceptance criterion | Phase 4 |
| `security-reviewer` | Real vulnerabilities only, no false positives | Phase 6 |
| `cloud-expert` | Migration safety, dependency risk, env assumptions | Phase 8 |

## Hooks

| Hook | Event | What it does |
|---|---|---|
| `session-memory.py` | Stop (every turn) | Journals changed files to session_journal.md |
| `security-guard.py` | PreToolUse (Edit/Write) | Blocks private keys/AWS keys, warns on injection patterns |

Project-level hooks (generated via `/update-skills`):
- `audit-guard.py` — domain-specific invariant checks on every Edit/Write

## Architecture

```
~/.claude/skills/              global source of truth
  commands/                    /dev, /fix, /conclude, /update-skills
  agents/                      architect, bug-analyst, brainstorm, security-reviewer,
                               cloud-expert, tdd-developer
  hooks/                       session-memory.py, security-guard.py
  SKILLS_SYSTEM.md             full system documentation
  setup.sh                     creates symlinks + registers hooks

~/.claude/commands/            symlinks into skills/commands/

[repo]/.ai/skills/             project layer (version controlled)
  commands/audit.md            domain compliance check
  agents/cloud-expert.md       stack-specific infra override
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
- **Single source of truth** — skills live in `~/.claude/skills/`, symlinks everywhere
- **Zero external dependencies** — hooks use Python stdlib only, CLI uses Node stdlib only
- **Generic base, project overrides** — global skills work in any repo; project layer adds domain knowledge
- **Low noise** — hooks skip test files, migrations, docs; security reviewer only covers changed files

## License

MIT
