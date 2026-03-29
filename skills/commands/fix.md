---
description: "Fast bug fix — 3 questions, straight to root cause and fix. No ceremony."
argument-hint: "[description of the bug]"
---

> **⚠️ INTERACTIVE CHECKPOINTS — MANDATORY RULE**
> This skill contains checkpoints where you MUST pause and wait for the user's response before continuing.
> These checkpoints are marked with **"Wait for answer"**, **"Wait for confirmation"**, or similar phrasing.
>
> **How to handle checkpoints across platforms:**
> - If you have an `askQuestion`, `ask_human`, `askFollowupQuestion`, or similar interactive tool available → call it.
> - If you are in a chat UI (Cursor, Claude Code, Antigravity, Gemini) → end your response and wait for the user's next message.
> - If you are running autonomously in a script or loop → you MUST stop execution and yield control. Never fabricate or assume the user's answer.
>
> **NEVER skip a checkpoint. NEVER invent the user's response. ALWAYS stop and wait.**


# /fix — Fast Bug Fix

Streamlined entry point for bug fixes. Skips the full intake ceremony.
Use `/dev` instead if you need brainstorming, refactor planning, or a feature.

## Auto-detect project context (silently)

- `ls .ai/team/roles/` → use team roles if available
- `ls .ai/skills/agents/` → use project agents if available
- Detect stack: pubspec.yaml / requirements.txt / package.json
- Read CLAUDE.md if present

---

## INTAKE — 3 questions only

If `$ARGUMENTS` describes the bug clearly, use it and skip straight to question 3.
Otherwise ask all three at once:

> Quick bug questions:
> 1. What's the exact symptom or error message?
> 2. Which file, endpoint, or screen?
> 3. Steps to reproduce? (or "not sure" is fine)

**Wait for answers.**

Then state the acceptance criteria in one line:
> Fix confirmed when: [the symptom no longer occurs and the test suite passes]

Pipeline (fixed — no choices needed):
```
[✓] Phase 1: Bug Analysis  — root cause confirmed before touching code
[✓] Phase 2: Implement     — TDD: reproduce bug in test first, then fix
[✓] Phase 3: Tests         — full suite green
[✓] Phase 4: Security      — changed files only
[✓] Phase 5: Conclude      — commit message ready
```

Say **go** to start or adjust anything.

---

## PHASE 1 — BUG ANALYSIS

Use the bug analyst agent:
- Project agent: `.ai/skills/agents/bug-analyst.md` (if exists)
- Generic fallback: `~/.claude/skills/agents/bug-analyst.md`

Trace symptom → entry point → call chain → confirmed root cause.

**Do not touch any code until root cause is confirmed.**

---

## PHASE 2 — IMPLEMENT (TDD mandatory)

1. Write the smallest test that **reproduces** the bug. Run it. Must **FAIL**.
   If it passes, the test is wrong — fix the test.
2. Fix the bug — minimum change only.
3. Run the test. Must **PASS**.
4. Run full suite. Zero new failures.

Use the TDD agent for guidance:
- `~/.claude/skills/agents/tdd-developer.md`

Test command by stack:
- Python: `venv/bin/pytest -q --tb=short`
- Node.js: `npm test` or `npx jest`
- Flutter: `flutter test`
- React/TS: `pnpm run test:unit` or `npm test`

---

## PHASE 3 — TESTS

Full suite passes. No skips. Edge cases from the bug analysis covered.

---

## PHASE 4 — SECURITY

Run the security reviewer on changed files only:
- `~/.claude/skills/agents/security-reviewer.md`

PASS → proceed. FAIL → fix before concluding.

---

## PHASE 5 — CONCLUDE

1. One-line summary of what was fixed and why it was broken
2. `git diff --stat` — show changed files
3. Commit message: `fix(scope): description`
4. **Do not commit.** Present message, wait for approval.
