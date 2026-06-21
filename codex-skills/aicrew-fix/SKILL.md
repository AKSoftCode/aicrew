---
name: aicrew-fix
description: Run the aicrew /fix fast bug fix flow in Codex (triage -> root cause -> TDD -> verify).
---

# aicrew /fix (Codex)

Use for fast bug fixes. This mirrors the `/fix` command but runs inline in Codex.

## Token foundation (mandatory)

`/dev`, `/fix`, and `/quick` all share the same 11-capability token-saving stack — only pipeline depth differs. Full reference: `~/Agents/docs/token-foundation.md`. Stack: graph-first (`codebase-memory-mcp`), speculative Scout → verify (SCOUT schema, two-model routing), Karpathy guardrails, layered guardrails (`guardrails-taxonomy.md`), context-economy read policy, `security-guard.py` hooks, `.ai/state` checkpoints, `/compact` between phases, `/handoff` on tool switch, optional `context-mode` + `token-optimizer-mcp`, caveman default output. For `/fix`, Scout opens Phase 1 Bug Analysis before the bug-analyst deep dive.

## Default output

Caveman/lean style by default. See `~/Agents/agents/caveman.md` and `~/Agents/agents/context-economy.md`. `/normal` or `/lean off` restores verbose.

Source of truth:
- `~/Agents/commands/fix.md`
- Project overrides in `.ai/skills/` and repo `AGENTS.md` (if present)

Token foundation (mandatory — all phases):
- Graph-first: codebase-memory-mcp (search_graph → trace_path → get_code_snippet) before any file read
- Speculative context: Scout pass at start of Phase 1 Bug Analysis; emit SCOUT: schema; verify before bug-analyst deep dive
- Layered guardrails: security-guard.py (input) → karpathy-guardrails (Phase 2 implement) → security-reviewer (Phase 4)
- Context economy: always on; slice reads only during Scout
- Two-model routing: Scout on haiku/mini; fix on sonnet
- See: ~/Agents/docs/token-foundation.md

Workflow summary:
1. Ask the 3 clarifying questions (symptom, expected behavior, repro).
2. Scout pass (graph-first) → emit SCOUT: schema → verify → bug-analyst deep trace → confirm root cause.
3. Load karpathy-guardrails; write the smallest failing test or reproducible check.
4. Implement the minimal fix to make it pass.
5. Run targeted tests + smoke path.
6. Security review on changed files.
7. Conclude with summary, tests run, and any risks.
