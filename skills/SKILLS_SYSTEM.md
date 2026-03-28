# AI Skills & Agents System

Personal development pipeline for Claude Code, Cursor, and Codex.
Written from scratch — two-tier: global generic + per-project domain layer.

Last updated: 2026-03-28

---

## Philosophy

- **Single source of truth**: every skill, agent, hook lives in `~/.claude/skills/` or `[repo]/.ai/skills/`
- **Symlinks activate them**: `~/.claude/commands/` and `.cursor/rules/` point into the source files
- **No copies**: when you edit the source, every symlink picks it up instantly
- **Generic base, project overrides**: global skills work anywhere; project layers encode domain knowledge
- **Written from scratch**: no code copied from external repos — avoids inheriting unknown security issues
- **Review-gated**: skills are reviewed before merging; hooks only fire after approval

---

## Directory Structure

```
~/.claude/skills/                    ← GLOBAL source of truth (any project)
  commands/
    dev.md                           ← /dev         — universal 9-phase pipeline
    conclude.md                      ← /conclude    — session wrap-up + memory
    update-skills.md                 ← /update-skills — maintain + evolve
  agents/
    brainstorm.md                    ← 3 alternatives + trade-offs before building
    security-reviewer.md             ← real vuln detection, low false positives
    cloud-expert.md                  ← migration safety, deps, env assumptions
    tdd-developer.md                 ← strict RED → GREEN → REFACTOR enforcer
  hooks/
    session-memory.py                ← Stop hook: journals changed files per session
    security-guard.py                ← PreToolUse: blocks keys, warns on injection
  SKILLS_SYSTEM.md                   ← this file
  setup.sh                           ← creates symlinks + registers global hooks

~/.claude/commands/                  ← SYMLINKS → ~/.claude/skills/commands/
  dev.md           → ~/.claude/skills/commands/dev.md
  conclude.md      → ~/.claude/skills/commands/conclude.md
  update-skills.md → ~/.claude/skills/commands/update-skills.md

[project]/.ai/skills/                ← PROJECT layer (inside repo, version-controlled)
  commands/
    audit.md                         ← domain-specific compliance check
  agents/
    cloud-expert.md                  ← overrides generic with project infra knowledge
  hooks/
    audit-guard.py                   ← PreToolUse: domain invariant checks
  cursor-rules/
    [project].mdc                    ← Cursor rules (symlinked → .cursor/rules/)
  AGENTS.md                          ← Codex entry point (symlinked → repo root)
  setup.sh                           ← registers project hooks + creates symlinks

~/Agents/SKILLS_SYSTEM.md            ← symlink → ~/.claude/skills/SKILLS_SYSTEM.md
[repo]/Agents/SKILLS_SYSTEM.md       ← symlink → ~/.claude/skills/SKILLS_SYSTEM.md  (optional)
```

### Complete symlink map

```
~/.claude/commands/dev.md             → ~/.claude/skills/commands/dev.md
~/.claude/commands/conclude.md        → ~/.claude/skills/commands/conclude.md
~/.claude/commands/update-skills.md   → ~/.claude/skills/commands/update-skills.md
[repo]/.cursor/rules/[name].mdc       → [repo]/.ai/skills/cursor-rules/[name].mdc
[repo]/AGENTS.md                      → [repo]/.ai/skills/AGENTS.md
~/Agents/SKILLS_SYSTEM.md             → ~/.claude/skills/SKILLS_SYSTEM.md
```

Hooks registered in `~/.claude/settings.json` (global) and `[repo]/.claude/settings.json` (per-project).

---

## Setup

### First time only — bootstrap the global layer

```bash
bash ~/.claude/skills/setup.sh
```

Run this once on a new machine. Creates command symlinks, registers hooks, creates `~/Agents/SKILLS_SYSTEM.md`.
It is idempotent — safe to re-run.

### After that — one command for everything

```
/update-skills
```

`/update-skills` automatically runs `setup.sh` (global + project) as its first step, so:
- Symlinks are always up to date
- Hooks are always registered
- Then you choose: update globals / generate project skills / internet research / full evolution

**You never need to run `setup.sh` manually again after the first time.**

### Add doc symlink to a new location

```bash
ln -s ~/.claude/skills/SKILLS_SYSTEM.md ~/Agents/SKILLS_SYSTEM.md
# or inside a repo
ln -s ~/.claude/skills/SKILLS_SYSTEM.md [repo]/Agents/SKILLS_SYSTEM.md
```

### Projects configured

| Project | Path | Skills |
|---|---|---|
| 3DTrace.ai | `~/Workspace/3DTrace.ai` | audit.md, cloud-expert.md, audit-guard.py, 3dtrace.mdc |
| LearnShort | `~/Workspace/LearnShort` | learnshorts.mdc, AGENTS.md |

---

## Commands

### `/dev` — Universal Development Pipeline

The single entry point for any dev work in any project.

**Start:** type `/dev` — it asks what you're working on.

**What it does:**
1. Auto-detects project type (Python / Flutter / Node.js) and available team roles
2. Asks: bug fix, feature, refactor, review, or audit?
3. Asks targeted clarifying questions (all at once, waits for full answers)
4. Writes acceptance criteria — gets your confirmation before proceeding
5. Runs a 9-phase pipeline, gated at each stage

**The 9-phase pipeline:**

| # | Phase | What happens | Gate |
|---|---|---|---|
| 0 | Intake | Questions → acceptance criteria | You confirm |
| 1 | Research | Trace codebase, find affected files + invariants | Key files identified |
| 2 | Brainstorm | 3 alternatives with trade-offs *(features only)* | You pick approach |
| 3 | Design | Interface spec, API contract, root cause | You confirm spec |
| 4 | Implement | TDD: RED → GREEN → REFACTOR per criterion | All tests green |
| 5 | Tests | Full suite + edge cases + smoke path | 100% pass |
| 6 | Security | Vuln scan on changed files only | PASS required |
| 7 | Audit | Domain compliance check *(if /audit exists)* | PASS required |
| 8 | Cloud/Infra | Migration, deps, env *(if infra files changed)* | PASS required |
| 9 | Conclude | Summary, memory save, commit message draft | You approve |

**TDD enforcement (Phase 4 — mandatory):**
```
RED:      Write failing test → run it → confirm FAIL
GREEN:    Write minimum code → run → confirm PASS → full suite clean
REFACTOR: Improve without changing behavior → run → still green
```
For bugs: test must reproduce the bug and FAIL before any fix is written.

---

### `/conclude` — Session Conclusion

Run at end of a session (Phase 9 of /dev calls it automatically).

**Steps:**
1. Summarises what was done this session
2. Reads the session journal (auto-written by Stop hook)
3. Extracts non-obvious project learnings from the session
4. Writes qualifying learnings to `~/.claude/projects/[slug]/memory/`
5. Trims journal to last 5 entries
6. Shows git status + suggests a commit message

**Memory bar — only saved if ALL are true:**
- Non-obvious (not derivable from reading code)
- Project-specific (not generic advice)
- Not already in MEMORY.md
- Will still matter in 2 weeks

---

### `/update-skills` — Skills Maintenance & Evolution

Run to maintain, improve, or grow the skills system.

**5 modes:**

| Mode | What it does |
|---|---|
| 1. Update global | Audits `~/.claude/skills/`, finds stale skills, proposes + writes improvements |
| 2. Generate project | Analyzes codebase + memory → proposes + writes `.ai/skills/` add-ons |
| 3. Internet research | Searches for new best practices → ADD / UPDATE / REMOVE recommendations |
| 4. Full evolution | Modes 1 + 2 + 3 in sequence |
| 5. Review only | Read-only audit — what exists, what's stale, what's missing |

**Internet research (Mode 3) searches for:**
- Latest Claude Code skills, hooks, agent patterns
- TDD and SDLC automation improvements
- Security review automation patterns
- Stack-specific best practices (Python/FastAPI, Flutter, Node.js)
- Cursor rules and Codex AGENTS.md patterns

Presents: ADD / UPDATE / IGNORE / REMOVE table.
Writes nothing without your approval. Cites source URL in every file.

---

## Agents (global)

### `brainstorm` — Alternatives Explorer

Used in Phase 2 (features + refactors). Generates 3 genuinely different approaches.

Each rated on: Complexity · Risk · Reversibility · Test surface · Prior art in codebase.
Recommends one. Flags anti-patterns (hidden side effects, irreversible migrations, etc).

### `security-reviewer` — Security Reviewer

Used in Phase 6. Reviews only the files changed this session.

**Blocks release (Critical):**
Hardcoded credentials · Private keys · SQL injection · Command injection · Auth bypass · Sensitive data in responses · Path traversal

**Flags for fix (High):**
Missing rate limiting on auth · SSRF risk · Unsafe deserialization · JWT in localStorage

### `cloud-expert` — Infra Reviewer

Used in Phase 8, triggered only when infra files change.

**Checks:** Migration safety (live DB, reversible, idempotent, no data loss) · New dependency risk (CVEs, native binaries) · Environment assumptions (FS writes, hardcoded localhost, undocumented env vars) · Concurrency safety (shared state, single-process assumptions)

**Per-project override:** `.ai/skills/agents/cloud-expert.md` adds stack-specific checks.

### `tdd-developer` — TDD Enforcer

Used in Phase 4. Strict: never writes implementation before a failing test exists.
Flags untestable code rather than skipping tests.

---

## Hooks

### `session-memory.py` — Stop Hook (global, fires every turn)

**What it does:**
- `git diff --name-only HEAD` → collect changed files
- Appends timestamped entry to `~/.claude/projects/[slug]/memory/session_journal.md`
- Trims journal to last 10 entries
- Zero external dependencies, never crashes

**Journal entry format:**
```
## 2026-03-28 14:30 — ProjectName
Changed:
- `backend/api/routes.py`
- `backend/tests/test_routes.py`
```

`/conclude` reads this to synthesize memory entries.

### `security-guard.py` — PreToolUse Hook (global, fires on Edit/Write)

**Blocks (stops the write):**
- Private key content in source
- AWS access key IDs

**Warns (advisory, allows write):**
- Possible hardcoded credentials
- SQL injection risk (string formatting in queries)
- Command injection risk (user input in subprocess calls)
- `eval()` usage
- `verify=False` (SSL disabled)
- `debug=True`

Skips: test fixtures, node_modules, venv, lock files, `.md` / `.rst` docs.

### `audit-guard.py` — PreToolUse Hook (3DTrace only)

**Blocks (code files only):**
- `DROP TABLE` outside migration files
- `DELETE FROM` without WHERE clause

**Warns (Python source files only):**
- BatchEntity created without `parent_batch_id` (traceability lineage gap)
- `sieving_status` assigned directly instead of through workflow
- Weight field modified without mass-balance context
- New `@router.` route without `require_permission()` dependency
- `next(get_sync_db())` anti-pattern

Skips: test files, migrations, `.md` docs, fixtures, venv.

---

## Project Layers

### 3DTrace.ai (`.ai/skills/`)

Domain: Powder batch traceability, AS9100D compliance, v07 domain model.
Stack: FastAPI + SQLAlchemy, React + MUI + Zustand, SQLite/EngineRegistry, Heroku.

**`/audit` command — AS9100D checklist:**
- Traceability lineage: `parent_batch_id`, inheritance exceptions
- Sieve-status: sieved/unsieved rules, mass balance enforcement
- Required fields: supplier, batch_type, record_date
- Action logs: who/when/what/outcome for state-changing ops
- AS9100D: recycle limit, quarantine, NCR lifecycle, ParameterSet lifecycle
- Security: route permissions, no secrets in responses, e-signature passlib check

**Cloud expert override adds:**
- Alembic: must use `_column_exists()` / `_table_exists()` (SQLite has no `IF NOT EXISTS`)
- Multi-tenant: `Depends(get_sync_db)` / `Depends(get_db)` — never `next(get_sync_db())`
- Heroku: no writes to local disk that need to persist
- SQLAlchemy: `.is_(False)` not `== False`

**Cursor rules (`3dtrace.mdc`) cover:**
Traceability lineage · Sieve-status rules · FastAPI route patterns · Batch ID generation · Frontend navigation · Alembic patterns · Test environment setup

### LearnShort (`.ai/skills/`)

Domain: Short-form learning app.
Stack: Flutter/Dart, Express.js, SQLite via better-sqlite3.

**Cursor rules (`learnshorts.mdc`) cover:**
SQL parameterization · `flutter analyze` zero warnings · Express security middleware · TDD enforcement · No hardcoded config

---

## How Memory Works

```
Each Claude turn
      │
      ▼ (automatic)
[Stop hook: session-memory.py]
      │  git diff → append to session_journal.md
      ▼
/conclude is run (manual or by /dev Phase 9)
      │  reads journal + reads MEMORY.md (de-duplicate)
      │  extracts non-obvious project learnings
      ▼
~/.claude/projects/[slug]/memory/[topic].md  ← new memory file
MEMORY.md                                    ← index updated
      │
      ▼ (next session starts)
MEMORY.md auto-loaded into context
Claude picks up where it left off
```

---

## Adding a New Project

**Fast path — let `/update-skills` do it:**
```bash
cd /path/to/new-project
/update-skills   → choose Mode 2 (Generate project skills)
```
It reads the codebase + memory, proposes files, writes after your approval, runs setup.

**Manual path:**
```bash
mkdir -p .ai/skills/{commands,agents,hooks,cursor-rules}
# write .ai/skills/AGENTS.md
# write .ai/skills/cursor-rules/[project].mdc
# write .ai/skills/setup.sh  (copy LearnShort pattern)
bash .ai/skills/setup.sh
```

---

## Extending the System

### New global agent
Write `~/.claude/skills/agents/[name].md`. Reference it from `/dev`. No setup needed.

### New global command
Write `~/.claude/skills/commands/[name].md`. Re-run `bash ~/.claude/skills/setup.sh` to symlink it.

### New global hook
Write `~/.claude/skills/hooks/[name].py`. Add the registration block to `setup.sh`. Re-run setup.

### New project-specific skill
From inside the project: `/update-skills` → Mode 2. Or write manually and run `bash .ai/skills/setup.sh`.

---

## Files Quick Reference

| File | Edit when |
|---|---|
| `~/.claude/skills/commands/dev.md` | Pipeline phases need changing |
| `~/.claude/skills/commands/conclude.md` | Memory format changes |
| `~/.claude/skills/commands/update-skills.md` | Research sources or modes change |
| `~/.claude/skills/agents/brainstorm.md` | Output format or dimensions change |
| `~/.claude/skills/agents/security-reviewer.md` | New vulnerability patterns |
| `~/.claude/skills/agents/cloud-expert.md` | New infra patterns |
| `~/.claude/skills/agents/tdd-developer.md` | TDD process changes |
| `~/.claude/skills/hooks/session-memory.py` | Journal format changes |
| `~/.claude/skills/hooks/security-guard.py` | New security anti-patterns |
| `~/.claude/skills/setup.sh` | New commands or hooks added |
| `[3dtrace]/.ai/skills/commands/audit.md` | Domain compliance rules change |
| `[3dtrace]/.ai/skills/agents/cloud-expert.md` | Stack or infra changes |
| `[3dtrace]/.ai/skills/hooks/audit-guard.py` | Domain invariants change |
| `[3dtrace]/.ai/skills/cursor-rules/3dtrace.mdc` | Code patterns change |
| `[3dtrace]/.ai/skills/AGENTS.md` | Non-negotiables change |
| `[learnshort]/.ai/skills/cursor-rules/learnshorts.mdc` | Flutter/Node patterns change |
