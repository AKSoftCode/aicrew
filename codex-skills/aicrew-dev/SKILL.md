---
name: aicrew-dev
description: Run the aicrew /dev pipeline in Codex (intake -> research -> design -> TDD -> tests -> security -> audit -> infra -> conclude).
---

# aicrew /dev (Codex)

Codex does not support slash commands. Use this skill when the user asks for "/dev" or a full SDLC pipeline.

## Token foundation (mandatory)

`/dev`, `/fix`, and `/quick` all share the same 11-capability token-saving stack — only pipeline depth differs. Full reference: `~/Agents/docs/token-foundation.md`. Stack: graph-first (`codebase-memory-mcp`), speculative Scout → verify (SCOUT schema, two-model routing), Karpathy guardrails, layered guardrails (`guardrails-taxonomy.md`), context-economy read policy, `security-guard.py` hooks, `.ai/state` checkpoints, `/compact` between phases, `/handoff` on tool switch, optional `context-mode` + `token-optimizer-mcp`, caveman default output. For `/dev`, Scout opens Phase 1 Research before any Glob/Grep/Read; re-scout between phases if context grew.

## Default output

Caveman/lean style by default. See `~/Agents/agents/caveman.md` and `~/Agents/agents/context-economy.md`. `/normal` or `/lean off` restores verbose.

Source of truth:
- `~/Agents/commands/dev.md`
- Project overrides in `.ai/skills/` and repo `AGENTS.md` (if present)

Token foundation (mandatory — all phases):
- Graph-first research: codebase-memory-mcp (search_graph → trace_path → get_code_snippet) before any Grep/Read
- Speculative context: Scout pass (cheap model) at start of Phase 1; emit SCOUT: schema; verify before main trace
- Layered guardrails: security-guard.py (input) → scope lock (Phase 0) → karpathy-guardrails (Phase 4) → security-reviewer (Phase 6)
- Context economy: always on; /compact between phases; /lean amplifies
- Two-model routing: Scout on haiku/mini; Research+Implement on sonnet/opus
- See: ~/Agents/docs/token-foundation.md

Workflow summary:
1. Intake: clarify bug/feature/refactor, acceptance criteria, scope, risks, test plan.
2. Research: Scout pass (graph-first) → verify SCOUT schema → confirm root cause or key code paths.
3. Brainstorm: 3 alternatives with trade-offs (features/refactors).
4. Design: interface spec, contract checks, over/under-engineering flags.
5. Implement: load karpathy-guardrails; TDD first (RED -> GREEN -> REFACTOR per acceptance criterion).
6. Tests: targeted automated tests + smoke path.
7. Security: changed files only, no false positives.
8. Audit: if project defines domain audit checks.
9. Conclude: summary, tests run, risks, commit message.

Checkpoints: pause for user confirmation at intake, design, and before concluding.
