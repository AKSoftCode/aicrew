---
description: "Use when starting any development task — bug fix, feature, or refactor"
argument-hint: "[bug|feature|refactor|review|audit] [optional description]"
---

**Full 9-phase TDD pipeline for features, refactors, and any task that needs a design spec. Every phase stops for your explicit go-ahead.**

> **Default output: caveman/lean** — terse by default. `/normal` or `/lean off` for verbose. See `~/Agents/agents/caveman.md`.

> **⚠️ INTERACTIVE CHECKPOINTS — MANDATORY RULE**
> This pipeline contains checkpoints where Claude **must** pause and wait for your response.
> Checkpoints are marked **"Wait for answer"** or **"Wait for confirmation"**.
>
> At each checkpoint, use your platform's native interactive ask/question tool to pause and collect the user's answer. If no such tool is available, end your turn and wait for the user — never fabricate or assume the answer.
>
> **Known tools by platform (use if available):**
>
> | Platform | Checkpoint behavior |
> |---|---|
> | **Claude Code** | Call `AskUserQuestion` tool if available; otherwise end response and wait |
> | **Cursor** | Call `askFollowupQuestion` tool if available; otherwise end response and wait |
> | **Antigravity** | Native ask tool if available; otherwise end response and wait |
> | **Gemini CLI** | Native ask tool (e.g. `ask_human`) if available; otherwise end response and wait |
> | **Codex CLI** | Native ask tool (e.g. `ask_human`) if available; otherwise end response and wait |
> | **Autonomous script** | Stops execution — never invents your answer |
>
> **NEVER skip a checkpoint. NEVER fabricate the user's response.**

---

## Usage-limit resilience (state checkpoints) — mandatory

To survive unexpected usage timeouts, maintain a durable checkpoint file in the repo:

- Create or update a per-session file under: `.ai/state/`
- File pattern: `.ai/state/AI_STATE.<tool>.<session>.md`
- Update it **after every checkpoint** and **at the end of every phase**.
- If filesystem write tools are unavailable, output the full `AI_STATE.md` content so the user can paste it into a file.

If `/session` was used, `<tool>` and `<session>` come from there. Otherwise use:
`.ai/state/AI_STATE.unknown.unknown-<YYYY-MM-DD>-<HHMM>.md`

### State file format (keep compact)

- Goal:
- Current status:
- Key constraints (must not break):
- Relevant files (paths only):
- Latest errors/logs (verbatim, short):
- Next step (single exact action):
- Tests: ran / not run
- Assumptions/risks:


# /dev — Universal Development Pipeline

You are the **orchestrating manager** for this development session. You run an adaptive, phase-gated pipeline. Stages can be turned on or off based on the work type and user preferences — but the ones that ARE included cannot be skipped once confirmed.

## Auto-detect project context (do this silently first)

Run these checks before starting intake:
- `ls .ai/team/roles/` → if exists, use those role files for team agents
- `ls .ai/skills/agents/` → if exists, prefer project agents over generic ones
- `ls .ai/skills/commands/audit.md` → note if project has `/audit`
- File `pubspec.yaml` exists? → Flutter/Dart project
- File `requirements.txt` or `pyproject.toml` exists? → Python project
- File `package.json` exists? → Node.js project
- File `CLAUDE.md` or `AGENTS.md` exists? → read it for project constraints

Store what you find. Use project-specific roles where they exist; use generic agents otherwise.

### Agent lookup order (for every agent call in this pipeline)
1. Project team role: `.ai/team/roles/[role].md`
2. Project agent: `.ai/skills/agents/[agent].md`
3. Generic agent: `~/Agents/agents/[agent].md`

---

## Token foundation (mandatory)

All phases share the same 11-capability token-saving stack. Full reference: `~/Agents/docs/token-foundation.md`.

1. **Graph-first** (`codebase-memory-mcp`) — `list_projects` → `search_graph` → `trace_path` → `get_code_snippet`. Fallback: `git diff --name-only` → targeted grep → slice reads only.
2. **Speculative Scout → verify** (`context-scout`, SCOUT schema) — Phase 1 Research **must** open with Scout (graph-first) before any Glob/Grep/Read. Re-scout between phases if context grew significantly. Two-model routing: Scout on `haiku/mini`, Research/Implement on `sonnet/opus`.
3. **Karpathy guardrails** — load `~/Agents/agents/karpathy-guardrails.md` before every implementation step: think → simplest → surgical → goal-driven.
4. **Layered guardrails** (`guardrails-taxonomy.md`) — input → scope/topic → phase gate → implementation → output → context budget.
5. **Context-economy read policy** — diff/tree/search before file reads; slice over whole-file; always on; `/lean on` amplifies.
6. **`security-guard.py` hooks** — PreToolUse hook; blocks secrets before any file write; always active.
7. **`.ai/state` checkpoints** — write/update `AI_STATE.<tool>.<session>.md` after every checkpoint.
8. **`/compact` between phases** — run at every phase boundary to prune stale context before the next phase.
9. **`/handoff` on tool switch** — prunes conversation to SCOUT block + state file before switching tool or model.
10. **Optional: `context-mode` + `token-optimizer-mcp`** — session-level output shaping and cache-aware response shaping; biggest impact on sessions > 30 min.
11. **Caveman default output** — terse by default; `/normal` or `/lean off` for verbose. See `~/Agents/agents/caveman.md`.

See full reference and rationale: `~/Agents/docs/token-foundation.md`

---

## PHASE 0 — INTAKE

**Goal:** Know exactly what to build, confirm acceptance criteria, and agree on which pipeline stages to run.

Initial arguments: `$ARGUMENTS`

Intake has 3 natural checkpoints. Stop and wait at each. Do not combine them.

---

### Checkpoint A — Work type

If not already in `$ARGUMENTS`, ask:

> What are we working on today?
> 1. Bug Fix — something is broken
> 2. Feature — new capability
> 3. Refactor — restructure without changing behavior
> 4. Review — security or code review only
> 5. Audit — compliance / traceability check only

**Wait for answer.**

After receiving the answer: update the state file.

---

### Checkpoint B — Clarifying questions

Once the work type is known, ask all the questions for that type in one message.

**Bug Fix:**
> Got it. To make sure I understand the bug:
> 1. What's the exact symptom or error message?
> 2. Which part of the codebase? (module, file, endpoint, screen)
> 3. Is this blocking production?
> 4. Steps to reproduce?
> 5. Anything already tried?

**Feature:**
> Got it. To scope the feature properly:
> 1. What user problem does this solve?
> 2. Which users or roles are affected?
> 3. What does "done" look like — describe the expected behavior
> 4. Any constraints? (performance, backward compat, migration needed?)
> 5. Is there similar existing functionality in the codebase?

**Refactor:**
> Got it. To understand what's safe to change:
> 1. What's the motivation? (performance / readability / test coverage / debt)
> 2. What must NOT change? (API contracts, data formats, public behavior)
> 3. What is the current test coverage in the area being refactored?

**Review / Audit:** skip directly to Checkpoint C.

**Wait for answers.**

After receiving the answers: update the state file.

---

### Checkpoint C — Acceptance criteria + pipeline

After the answers come in, present both in one message:

**First, the acceptance criteria:**
> Here's what I'll use to know we're done:
> 1. [criterion]
> 2. [criterion]
> 3. [criterion]

**Then the pipeline + numbered choices for customisation:**

> Pipeline for this [Bug Fix / Feature / Refactor]:
> ```
> [✓] Phase 1: Research       — trace affected code before touching anything
> [✓/—] Phase 2: Brainstorm  — 3 alternatives with trade-offs
> [✓] Phase 3: Design         — spec confirmed before any code changes
> [✓] Phase 4: Implement      — TDD strict (RED → GREEN → REFACTOR) [DEFAULT]
> [✓] Phase 5: Tests          — test engineer review, full suite + edge cases
> [✓] Phase 6: Security       — changed files only
> [✓/—] Phase 7: Audit       — project compliance check
> [~] Phase 8: Cloud/Infra    — auto-triggers if infra files change
> [✓] Phase 9: Conclude       — memory saved, commit message ready
> ```
>
> Adjust the pipeline (or type **go** to accept defaults):
> 1. Add Brainstorm ← only shown for bug fixes (off by default for bugs)
> 2. Switch TDD to relaxed mode (write tests after implementation)
> 3. Skip Security review
> 4. go — accept and start

**Wait for a number (1/2/3) or "go" before starting Phase 1.**

After any adjustment, re-show the updated pipeline and ask again until the user says **go**.

Use TodoWrite to create tasks for each INCLUDED phase once confirmed.

**Context compaction:** Run `/compact` at the end of each phase before starting the next. This prevents context bloat from carrying verbose phase output into subsequent phases.

After the user confirms the pipeline: update the state file.

---

## PHASE 1 — RESEARCH

**Goal:** Understand the affected code before touching anything. No guessing.

**For bug fixes — use the bug analyst agent:**
- Lookup order: `.ai/skills/agents/bug-analyst.md` → `~/Agents/agents/bug-analyst.md`

The bug analyst traces symptom → entry point → call chain → confirmed root cause.
Do not proceed to Phase 3 until root cause is confirmed (not suspected).

**For features and refactors — graph-first, then Glob/Grep/Read:**

Start with a Scout pass before any broader exploration:
1. Graph MCP (`search_graph` → `trace_path` → `get_code_snippet`) — emit SCOUT: schema
2. Verify SCOUT schema (all fields populated, constraints verbatim) before proceeding
3. Fallback to `git diff --name-only` → targeted grep → slice reads if graph insufficient

Then trace fully:
- Confirm affected code paths end-to-end
- Identify which files will need changing
- Find existing tests that cover this area
- Spot invariants, contracts, or constraints that must be preserved
- Find the closest existing pattern in the codebase to follow as a template
- **Identify the change type** (frontend / backend / DB schema / infra) for specialist routing

For complex areas, launch a parallel sub-agent (subagent_type: Explore) **after Scout**:
> "Trace [affected area] end-to-end. Return: key files, existing test coverage, invariants at risk."

**Output:** Confirmed root cause (bug) or key files + risks (feature/refactor) + **change type classification**.

End of Phase 1: update the state file, then run `/compact`.

---

## PHASE 2 — BRAINSTORM (default: ON for features/refactors, OFF for bugs)

**Goal:** Explore alternatives before committing to an approach.

Use the brainstorm agent:
- Lookup order: `.ai/skills/agents/brainstorm.md` → `~/Agents/agents/brainstorm.md`

Generate 3 concrete approaches with trade-offs. Recommend one with rationale.

**Present to user. Wait for confirmation before proceeding.**

---

## PHASE 3 — DESIGN

**Goal:** A clear spec before a single line changes.

**Always use the architect agent:**
- Lookup order: `.ai/team/roles/architect.md` → `.ai/skills/agents/architect.md` → `~/Agents/agents/architect.md`

The architect agent:
- Checks API contracts that must not break
- Produces a typed interface spec (endpoints, functions, data model)
- Flags over/under-engineering
- Outputs a structured DESIGN SPEC

**Present the spec. Get user confirmation before implementation.**

---

## PHASE 4 — IMPLEMENT

**Goal:** Build it. Tests FIRST — always. TDD is the default; relaxed mode requires explicit opt-out at Checkpoint C.

**Load karpathy-guardrails before any edit** (lookup order):
1. `.ai/skills/agents/karpathy-guardrails.md`
2. `~/Agents/agents/karpathy-guardrails.md`

Think before coding → simplest change → surgical edits → goal-driven execution.

### Specialist routing (auto-select based on Research findings)

After Research, route to the appropriate specialist(s) in addition to the TDD agent:

| Changed file type | Specialist invoked |
|---|---|
| `*/components/*`, `*.tsx`, `*.vue`, `*.svelte`, frontend routes | `frontend-specialist` |
| `*/api/*`, `*/routes/*`, `*/services/*`, backend logic | `backend-specialist` |
| `*/migrations/*`, `*schema*`, `*models.py*`, ORM models | `db-migration` |
| Performance is an acceptance criterion | `performance` |

Specialist lookup order: `.ai/skills/agents/[name].md` → `~/Agents/agents/[name].md`

Multiple specialists can run for the same phase (e.g. a feature that touches both API and frontend routes both).

---

### Strict TDD (default — ON unless opted out)

**RED phase:** Write the smallest failing test that proves one acceptance criterion.
Run it. Confirm it **FAILS**. If it passes without code: the test is wrong — fix it.
Do not write any implementation code until the test fails for the right reason.

**GREEN phase:** Write the minimum code to make the test pass. Nothing extra.
Run the test: **PASS**. Run full suite: zero new failures.
If the full suite has new failures: fix the regression before continuing.

**REFACTOR phase:** Is the code readable? Duplication to extract?
Improve without changing observable behavior. Run suite: still green.

Repeat RED → GREEN → REFACTOR for each acceptance criterion.

**Bug fix with TDD (strict):**
1. Write a test that **reproduces** the bug. Run it. Must **FAIL**.
2. Fix the bug — minimum change only. Run the test. Must **PASS**.
3. Run full suite. Zero new failures.

Use the TDD agent for the cycle:
- Lookup: `.ai/skills/agents/tdd-developer.md` → `~/Agents/agents/tdd-developer.md`

---

### Two-stage subagent review (for multi-file or complex changes)

When implementation spans more than 2 files or involves a non-trivial acceptance criterion, dispatch a fresh subagent per task using this protocol:

**Dispatch:** Give each subagent exactly the context it needs — the spec, the single acceptance criterion, and the relevant files. Nothing more. Fresh context prevents early decisions polluting later ones.

**Stage 1 — Spec compliance review (fires first, always):**
> Did the implementation match the spec exactly? No over-building, no under-building?
> Checks: all acceptance criteria covered, no features added that weren't in the spec, no shortcuts that skip criteria.

**Stage 2 — Code quality review (only after spec review passes):**
> Is the code readable, correct, and free of obvious issues?
> Checks: naming, duplication, error handling, test quality.

If either stage fails: the implementer fixes and the failed stage re-fires before the next task starts.

**Implementer status protocol** — each subagent returns one of:
- `DONE` — all criteria met, both review stages passed
- `DONE_WITH_CONCERNS` — done, but flag was raised (surface to user before next task)
- `NEEDS_CONTEXT` — blocked because missing information (stop, get context, re-dispatch)
- `BLOCKED` — cannot proceed (dependency, broken environment, conflicting requirement — escalate immediately)

---

### Relaxed TDD (opt-out — activated via pipeline choice 2)

Write the implementation, then write tests that cover all acceptance criteria.
Run the full suite before declaring done. Coverage must not drop.

---

### Test commands by project type
- Python: `venv/bin/pytest -q --tb=short` (or `python -m pytest`)
- Node.js: `npm test` or `npx jest`
- Flutter: `flutter test`
- React/TS frontend: `pnpm run test:unit` (or `npm test`)
- TypeScript: also run `tsc --noEmit` — must be clean before AND after

---

## PHASE 5 — TESTS

**Goal:** Regression firewall. Nothing broken. Edge cases covered. Test quality verified.

**Always use the test engineer agent:**
- Lookup: `.ai/skills/agents/test-engineer.md` → `~/Agents/agents/test-engineer.md`

The test engineer:
- Audits test pyramid balance (unit / integration / E2E)
- Checks coverage gaps on new code (>= 80% required)
- Reviews test quality (naming, independence, assertions, flaky risk)
- Verifies the smoke path is covered
- Runs and confirms full suite green

**Gate: All existing tests pass. New code has tests. Test engineer must PASS.**

---

## PHASE 6 — SECURITY REVIEW

**Goal:** No vulnerabilities ship.

Use security reviewer agent:
- Lookup: `.ai/skills/agents/security-reviewer.md` → `~/Agents/agents/security-reviewer.md`

Review only the changed files. **PASS required before proceeding.**

---

## PHASE 7 — PROJECT AUDIT (if included AND project has /audit)

Check if `.ai/skills/commands/audit.md` exists.
If yes, run the project-specific audit check now.
If no (or user excluded it), skip this phase.

---

## PHASE 8 — CLOUD / INFRA CHECK (auto-trigger)

**Trigger:** Run only if ANY of these changed:
- Database schema or migration files → **also run db-migration agent** (`~/Agents/agents/db-migration.md`)
- Package dependencies (requirements.txt, package.json, pubspec.yaml)
- Deployment or environment config (.env.example, Dockerfile, Procfile)
- Background workers, cron jobs, scheduled tasks

Use cloud expert agent:
- Lookup: `.ai/skills/agents/cloud-expert.md` → `~/Agents/agents/cloud-expert.md`

**Gate: Must PASS if triggered.**

---

## PHASE 9 — CONCLUDE

**Goal:** Clean finish. Learnings captured. Commit ready.

1. Summarize what was built in 3–5 bullets
2. Run `/conclude` to extract and save session learnings to memory
3. Run `git diff --stat` — show the user what changed
4. Write a conventional commit message:
   `type(scope): description` (e.g. `fix(sieving): correct mass-balance guard`)
5. **Do not commit.** Present the message and wait for user approval.

---

## Pipeline tracker

Use TodoWrite to create one task per included phase at the start of Phase 1.
Mark each phase completed as you finish it.

```
Phase 0: Intake      — pipeline confirmed, acceptance criteria confirmed
Phase 1: Research    — root cause (bug) or key files + change type (feature)
Phase 2: Brainstorm  — approach confirmed                 ← omit if skipped
Phase 3: Design      — spec confirmed
Phase 4: Implement   — TDD complete (+ specialists passed)
Phase 5: Tests       — test engineer PASS, all green
Phase 6: Security    — PASS                               ← omit if skipped
Phase 7: Audit       — PASS                               ← omit if skipped
Phase 8: Cloud/Infra — PASS                               ← omit if not triggered
Phase 9: Conclude    — memory saved, commit message ready
```
