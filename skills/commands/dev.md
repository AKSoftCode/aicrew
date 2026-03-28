---
description: "Universal development pipeline — bug fix, feature, or refactor. Full SDLC with TDD, security, and audit gates. Adaptive: you choose which stages run."
argument-hint: "[bug|feature|refactor|review|audit] [optional description]"
---

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
- File `CLAUDE.md` exists? → read it for project-specific constraints

Store what you find. Use project-specific roles where they exist; use generic agents otherwise.

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

---

### Checkpoint C — Acceptance criteria + pipeline, together

After the answers come in, present both in one message:

**First, the acceptance criteria:**
> Here's what I'll use to know we're done:
> 1. [criterion]
> 2. [criterion]
> 3. [criterion]

**Then immediately below, the pipeline + numbered choices for customisation:**

> Pipeline for this [Bug Fix / Feature / Refactor]:
> ```
> [✓] Phase 1: Research       — trace affected code before touching anything
> [✓/—] Phase 2: Brainstorm  — 3 alternatives with trade-offs
> [✓] Phase 3: Design         — spec confirmed before any code changes
> [✓] Phase 4: Implement      — TDD strict (RED → GREEN → REFACTOR)
> [✓] Phase 5: Tests          — full suite + edge cases
> [✓] Phase 6: Security       — changed files only
> [✓/—] Phase 7: Audit       — project compliance check
> [~] Phase 8: Cloud/Infra    — auto-triggers if infra files change
> [✓] Phase 9: Conclude       — memory saved, commit message ready
> ```
>
> Adjust the pipeline (or type **go** to accept defaults):
> 1. Add Brainstorm ← only shown for bug fixes (off by default)
> 2. TDD: switch to relaxed (write tests after implementation)
> 3. Skip Security review
> 4. go — accept and start

**Wait for a number (1/2/3) or "go" before starting Phase 1.**

After any adjustment, re-show the updated pipeline and ask again until the user says **go**.

Use TodoWrite to create tasks for each INCLUDED phase once confirmed.

---

## PHASE 1 — RESEARCH

**Goal:** Understand the affected code before touching anything. No guessing.

Use Glob, Grep, and Read to:
- Trace the affected code paths end-to-end
- Identify which files will need changing
- Find existing tests that cover this area
- Spot invariants, contracts, or constraints that must be preserved
- For features: find the closest existing pattern to follow as a template

For complex areas, launch a parallel sub-agent (subagent_type: Explore):
> "Trace [affected area] end-to-end. Return: key files to read, existing test coverage, invariants at risk."

Read the files the sub-agent identifies before continuing.

**Output:** List of key files, gap in test coverage, risks.

---

## PHASE 2 — BRAINSTORM (included only if confirmed in pipeline plan)

**Goal:** Explore alternatives before committing to an approach.

Use the brainstorm agent:
- Project agent: `.ai/skills/agents/brainstorm.md` (if it exists)
- Generic fallback: `~/.claude/skills/agents/brainstorm.md`

Generate 3 concrete approaches with trade-offs. Recommend one with rationale.

**Present to user. Wait for confirmation before proceeding.**

---

## PHASE 3 — DESIGN

**Goal:** A clear spec before a single line changes.

For features:
- Define the interface: API endpoints, function signatures, data model changes
- Confirm no existing contracts are broken
- Note if a migration is needed

For bug fixes:
- State the root cause (confirmed, not suspected)
- Describe the fix and why it solves the root cause
- Check: does the same bug exist elsewhere?

For refactors:
- Define the target structure
- Migration path: how do you get from here to there?
- Rollback plan: what if something breaks?

Use project architect role (`.ai/team/roles/architect.md`) if available.

**Present the spec. Get user confirmation before implementation.**

---

## PHASE 4 — IMPLEMENT

**Goal:** Build it. Tests first if TDD is ON.

### If strict TDD is ON (default):

**RED:** Write the smallest failing test that proves the acceptance criterion.
Run it. Confirm it FAILS. If it passes without code, the test is wrong — fix it.

**GREEN:** Write the minimum code to make the test pass. Nothing extra.
Run the test. Confirm it PASSES. Run full suite — zero new failures.

**REFACTOR:** Is the code readable? Any duplication to extract?
Make improvements without changing behavior. Run suite again — still green.

Repeat for each acceptance criterion.

**Bug fix with TDD ON — mandatory order:**
1. Write a test that **reproduces** the bug. Run it. Must FAIL.
2. Fix the bug — minimum change only.
3. Run the test. Must PASS.
4. Run full test suite. Zero new failures.

### If strict TDD is OFF (relaxed):

Write the implementation, then write tests that cover all acceptance criteria. Run the full suite before declaring done. Coverage must not drop.

### Route by project type:
- Python: `venv/bin/pytest -q --tb=short` (or `python -m pytest`)
- Node.js: `npm test` or `npx jest`
- Flutter: `flutter test`
- React/TS frontend: `pnpm run test:unit` (or `npm test`)
- TypeScript: run `tsc --noEmit` before and after — must be clean both times

Use project developer role (`.ai/team/roles/developer.md`) if available.
Use project frontend specialist (`.ai/team/roles/frontend_specialist.md`) for UI changes.
Use project migration specialist (`.ai/team/roles/migration_specialist.md`) for schema changes.

---

## PHASE 5 — TESTS

**Goal:** Regression firewall. Nothing broken. Edge cases covered.

Run the full test suite. If any test fails:
- Diagnose the root cause
- Fix the underlying issue — never skip or comment out a test
- Re-run until clean

Add tests for edge cases discovered during implementation that weren't in the original spec.

Run the smoke path (most critical user-facing flow) manually or via E2E if available.

**Gate: All existing tests must pass. New code must have tests. No exceptions.**

---

## PHASE 6 — SECURITY REVIEW (included only if confirmed in pipeline plan)

**Goal:** No vulnerabilities ship.

Use security reviewer agent:
- Generic: `~/.claude/skills/agents/security-reviewer.md`

Review only the changed files for:
- Hardcoded credentials or tokens
- SQL / command / template injection
- Missing authentication or authorization on new endpoints
- Sensitive data exposed in responses or logs
- Path traversal, SSRF, unsafe deserialization

**Output:** PASS or FAIL with specific file:line findings.
**Gate: Must PASS before proceeding.**

---

## PHASE 7 — PROJECT AUDIT (if included AND project has /audit)

Check if `.ai/skills/commands/audit.md` exists.
If yes, run the project-specific audit check now.
If no (or user excluded it), skip this phase.

---

## PHASE 8 — CLOUD / INFRA CHECK (auto-trigger)

**Trigger:** Run only if ANY of these changed:
- Database schema or migration files
- Package dependencies (requirements.txt, package.json, pubspec.yaml, Podfile)
- Deployment or environment config (.env.example, Dockerfile, Procfile)
- Background workers, cron jobs, or scheduled tasks

If the user excluded Cloud/Infra in the pipeline plan, still flag if infra files changed — just don't block on it.

Use cloud expert agent:
- Project override: `.ai/skills/agents/cloud-expert.md` (if it exists)
- Generic fallback: `~/.claude/skills/agents/cloud-expert.md`

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

Maintain this via TodoWrite throughout. Each task reflects the agreed pipeline:
```
[ ] PHASE 0: Intake — pipeline confirmed, acceptance criteria confirmed
[ ] PHASE 1: Research — key files identified
[ ] PHASE 2: Brainstorm — approach confirmed    ← remove if skipped
[ ] PHASE 3: Design — spec confirmed
[ ] PHASE 4: Implement — TDD complete
[ ] PHASE 5: Tests — all green, edge cases covered
[ ] PHASE 6: Security — PASS                   ← remove if skipped
[ ] PHASE 7: Audit — PASS                      ← remove if skipped
[ ] PHASE 8: Cloud/Infra — PASS                ← remove if not triggered
[ ] PHASE 9: Conclude — memory saved, commit message ready
```
