---
description: "Use for a fast bug fix with minimal ceremony (3 questions, TDD, done)"
argument-hint: "[description of the bug]"
---

**Fast bug fix — 3 intake questions, then TDD straight to done. Use `/dev` instead for features, refactors, or anything needing a design spec.**

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

## Token foundation (mandatory)

All phases share the same 11-capability token-saving stack. Full reference: `~/Agents/docs/token-foundation.md`.

1. **Graph-first** (`codebase-memory-mcp`) — `list_projects` → `search_graph` → `trace_path` → `get_code_snippet`. Fallback: `git diff --name-only` → targeted grep → slice reads only.
2. **Speculative Scout → verify** (`context-scout`, SCOUT schema) — Phase 1 Bug Analysis **must** open with Scout before the bug-analyst deep dive. Two-model routing: Scout on `haiku/mini`, Fix on `sonnet/opus`.
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
