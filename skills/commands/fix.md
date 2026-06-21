---
description: "Use for a fast bug fix with minimal ceremony (3 questions, TDD, done)"
argument-hint: "[description of the bug]"
---

> **Default output: caveman/lean** — terse by default. `/normal` or `/lean off` for verbose. See `~/Agents/agents/caveman.md`.

> **⚠️ INTERACTIVE CHECKPOINTS — MANDATORY RULE**
>
> | Platform | Checkpoint behavior |
> |---|---|
> | **Claude Code** | Call `AskUserQuestion` tool if available; otherwise end response and wait |
> | **Cursor** | Call `askFollowupQuestion` tool if available; otherwise end response and wait |
> | **Antigravity** | Call ask tool if available; otherwise end response and wait |
> | **Gemini CLI** | Call `ask_human` tool if available; otherwise end response and wait |
> | **Codex CLI** | Call `ask_human` tool if available; otherwise end response and wait |
> | **Autonomous script** | Stops execution — never invents your answer |
>
> **NEVER skip a checkpoint. NEVER fabricate the user's response.**


# /fix — Fast Bug Fix

Streamlined entry point for bug fixes. Skips the full intake ceremony.
Use `/dev` instead if you need brainstorming, refactor planning, or a feature.

## Auto-detect project context (silently)

- `ls .ai/team/roles/` → use team roles if available
- `ls .ai/skills/agents/` → use project agents if available
- Detect stack: pubspec.yaml / requirements.txt / package.json
- Read CLAUDE.md or AGENTS.md if present

---

## Token foundation (mandatory)

All phases apply the shared token-saving stack from `~/Agents/docs/token-foundation.md`:

1. **Graph-first** — `codebase-memory-mcp` before any file read:
   `search_graph` → `trace_path` → `get_code_snippet`; fallback to `git diff` + targeted grep.

2. **Speculative context** — Phase 1 opens with a Scout pass (emit SCOUT: schema) before
   bug-analyst deep dive. Verify schema; two-model: Scout on `haiku/mini`, fix on `sonnet`.

3. **Layered guardrails**:
   - Input: `security-guard.py` hook (always active)
   - Scope: acceptance criteria locked at intake
   - Implementation: `karpathy-guardrails` mandatory in Phase 2 Implement
   - Output: `security-reviewer` Phase 4

4. **Context economy** — `context-economy` always on; slice reads over whole-file.

5. **State** — update `.ai/state/AI_STATE.<tool>.<session>.md` at each phase.

See full reference: `~/Agents/docs/token-foundation.md`

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
[✓] Phase 3: Tests         — full suite green, test engineer check
[✓] Phase 4: Security      — changed files only
[✓] Phase 5: Conclude      — commit message ready
```

Say **go** to start or adjust anything.

---

## PHASE 1 — BUG ANALYSIS

**Step 1 — Scout pass (mandatory, before bug-analyst):**

Use context-scout (lookup order):
1. `.ai/skills/agents/context-scout.md`
2. `~/Agents/agents/context-scout.md`

Discovery order:
1. Graph MCP: `search_graph` → `trace_path` → `get_code_snippet`
2. Fallback: `git diff --name-only` + targeted `rg` for error symbol
3. Emit SCOUT: schema (Goal / Status / Constraints verbatim / Relevant files / Call chain / Next action / Tests / Risks)
4. Verify schema — reject and re-scout if any critical field is `n/a` or constraints are paraphrased

**Step 2 — Deep trace (after Scout accepted):**

Use the bug analyst agent (lookup order):
1. `.ai/skills/agents/bug-analyst.md`
2. `~/Agents/agents/bug-analyst.md`

Trace symptom → entry point → call chain → confirmed root cause.

**Do not touch any code until root cause is confirmed.**

---

## PHASE 2 — IMPLEMENT (TDD mandatory)

**Load karpathy-guardrails before any edit** (lookup order):
1. `.ai/skills/agents/karpathy-guardrails.md`
2. `~/Agents/agents/karpathy-guardrails.md`

Think before coding → simplest change → surgical edit → stop when test passes.

1. Write the smallest test that **reproduces** the bug. Run it. Must **FAIL**.
   If it passes, the test is wrong — fix the test.
2. Fix the bug — minimum change only.
3. Run the test. Must **PASS**.
4. Run full suite. Zero new failures.

Use the TDD agent for guidance:
1. `.ai/skills/agents/tdd-developer.md`
2. `~/Agents/agents/tdd-developer.md`

**Specialist routing:** if the bug is in frontend code, also use `~/Agents/agents/frontend-specialist.md`.
If in backend API/service, also use `~/Agents/agents/backend-specialist.md`.

Test command by stack:
- Python: `venv/bin/pytest -q --tb=short`
- Node.js: `npm test` or `npx jest`
- Flutter: `flutter test`
- React/TS: `pnpm run test:unit` or `npm test`

---

## PHASE 3 — TESTS

Use the test engineer agent:
1. `.ai/skills/agents/test-engineer.md`
2. `~/Agents/agents/test-engineer.md`

Full suite passes. Coverage on changed code >= 80%. No skips. Edge cases from the bug analysis covered.

---

## PHASE 4 — SECURITY

Run the security reviewer on changed files only:
1. `.ai/skills/agents/security-reviewer.md`
2. `~/Agents/agents/security-reviewer.md`

PASS → proceed. FAIL → fix before concluding.

---

## PHASE 5 — CONCLUDE

1. One-line summary of what was fixed and why it was broken
2. `git diff --stat` — show changed files
3. Commit message: `fix(scope): description`
4. **Do not commit.** Present message, wait for approval.
