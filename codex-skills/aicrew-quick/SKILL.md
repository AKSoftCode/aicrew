---
name: aicrew-quick
description: Run the aicrew /quick scout-first, Karpathy-guarded lightweight flow in Codex.
---

# aicrew /quick (Codex)

Use for scoped tasks that don't need the full `/dev` ceremony.
Scout the relevant code first, then act with surgical, goal-driven changes.

## Token foundation (mandatory)

`/dev`, `/fix`, and `/quick` all share the same 11-capability token-saving stack — only pipeline depth differs. Full reference: `~/Agents/docs/token-foundation.md`. Stack: graph-first (`codebase-memory-mcp`), speculative Scout → verify (SCOUT schema, two-model routing), Karpathy guardrails, layered guardrails (`guardrails-taxonomy.md`), context-economy read policy, `security-guard.py` hooks, `.ai/state` checkpoints, `/compact` between phases, `/handoff` on tool switch, optional `context-mode` + `token-optimizer-mcp`, caveman default output. For `/quick`, Scout IS Phase 1 (built-in, always first); Act is Phase 2.

## Default output

Caveman/lean style by default. See `~/Agents/agents/caveman.md` and `~/Agents/agents/context-economy.md`.
`/normal` or `/lean off` restores verbose.

## Source of truth

- `~/Agents/commands/quick.md`
- `~/Agents/agents/karpathy-guardrails.md`
- Project overrides in `.ai/skills/` and repo `AGENTS.md` (if present)

## Token foundation (mandatory — both phases)

- Graph-first: codebase-memory-mcp (search_graph → trace_path → get_code_snippet) before any Grep/Read
- Speculative context: Scout IS Phase 1 (cheap model); emit SCOUT: schema; verify before Act
- Layered guardrails: security-guard.py (input) → scope lock (SCOUT Goal:) → karpathy-guardrails (Act) → context budget
- Context economy: always on; state saved at Checkpoint B
- Two-model routing: Scout on haiku/mini; Act on sonnet/opus
- See: ~/Agents/docs/token-foundation.md

## Workflow summary

1. Scout — graph-first discovery before touching anything:
   - Graph MCP (codebase-memory-mcp): `list_projects` → `search_graph` → `trace_path` → `get_code_snippet`
   - Fallback: `git diff --name-only`, targeted grep, slice-reads
   - Emit and verify SCOUT: schema (Goal / Status / Constraints verbatim / Files / Call chain / Next action / Tests / Risks)
2. Act — implement with Karpathy guardrails:
   - Think Before Coding: Scout verified before any edit
   - Simplicity First: fewest files, smallest change
   - Surgical Changes: diff-sized edits only, no unrelated reformats
   - Goal-Driven Execution: every edit traces to the Goal line; stop when done
3. Write/update `.ai/state/AI_STATE.<tool>.<session>.md` at Checkpoint B and after Act

## When to use /quick vs /fix vs /dev

| Command | Use when |
|---|---|
| `/quick` | Scoped task, any type — you want scout-first + guardrails without full ceremony |
| `/fix` | Pure bug — you need TDD reproduce-fail-fix cycle + security review |
| `/dev` | Multi-phase feature, refactor, or anything needing brainstorm + design spec |
