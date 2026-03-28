# aicrew

Adaptive AI development pipeline for Claude Code, Cursor, and Codex.

A single `/dev` command that asks what you're working on, builds a custom pipeline from your answers, and runs expert agents at each stage — TDD, security review, audit, and cloud/infra checks.

## Install

```bash
npx aicrew install
```

This puts the skills system in `~/.claude/skills/`, creates command symlinks in `~/.claude/commands/`, and registers global hooks.

## Commands (after install)

In Claude Code:

```
/dev             — start the adaptive development pipeline
/conclude        — wrap up a session and save learnings to memory
/update-skills   — maintain and evolve the skills system
```

## Add to a project

From inside your repo:

```bash
npx aicrew add-project
```

Generates `.ai/skills/` with project-specific skills (cursor rules, audit command, infra override, domain hooks). Commit them to your repo — every team member gets the same guardrails.

## The /dev pipeline

`/dev` asks what you're working on, then presents a pipeline you can customise:

| Stage | Bug Fix | Feature | Refactor | Notes |
|---|---|---|---|---|
| Research | ✓ | ✓ | ✓ | Trace affected code before touching anything |
| Brainstorm | — | ✓ | ✓ | 3 alternatives with trade-offs |
| Design | ✓ | ✓ | ✓ | Spec confirmed before writing code |
| Implement (TDD) | ✓ | ✓ | ✓ | RED → GREEN → REFACTOR per criterion |
| Tests | ✓ | ✓ | ✓ | Full suite, edge cases, smoke path |
| Security | ✓ | ✓ | ✓ | Changed files only, no noise |
| Project Audit | auto | auto | auto | If project has `/audit` command |
| Cloud/Infra | auto | auto | auto | If infra files changed |
| Conclude | ✓ | ✓ | ✓ | Memory saved, commit message ready |

You can toggle optional stages and choose TDD strictness during intake.

## Architecture

```
~/.claude/skills/          ← global source of truth
  commands/                ← /dev, /conclude, /update-skills
  agents/                  ← brainstorm, security-reviewer, cloud-expert, tdd-developer
  hooks/                   ← session-memory.py (Stop), security-guard.py (PreToolUse)
  SKILLS_SYSTEM.md         ← full documentation

~/.claude/commands/        ← symlinks → ~/.claude/skills/commands/

[repo]/.ai/skills/         ← project layer (version controlled)
  commands/audit.md        ← domain compliance check
  agents/cloud-expert.md   ← stack-specific infra override
  hooks/audit-guard.py     ← domain invariant PreToolUse hook
  cursor-rules/            ← Cursor rules (symlinked → .cursor/rules/)
  AGENTS.md                ← Codex entry point
```

## Design principles

- **Written from scratch** — no external code copied, no unknown security issues
- **Single source of truth** — one folder, symlinks everywhere
- **Zero external dependencies** — hooks use Python stdlib only
- **Generic base, project overrides** — global skills work anywhere; project layer adds domain knowledge
- **Low noise** — hooks skip tests, migrations, docs; security reviewer covers changed files only

## License

MIT
