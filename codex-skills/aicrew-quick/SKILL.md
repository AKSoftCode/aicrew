---
name: aicrew-quick
description: Run the aicrew /quick scout-first, Karpathy-guarded lightweight flow in Codex.
---

# aicrew /quick (Codex)

Use for scoped tasks that don't need the full `/dev` ceremony.
Scout the relevant code first, then act with surgical, goal-driven changes.

## Default output

Caveman/lean style by default. See `~/Agents/agents/caveman.md` and `~/Agents/agents/context-economy.md`.
`/normal` or `/lean off` restores verbose.

## Source of truth

- `~/Agents/commands/quick.md`
- `~/Agents/agents/karpathy-guardrails.md`
- Project overrides in `.ai/skills/` and repo `AGENTS.md` (if present)

## Workflow summary

1. Scout — locate the relevant code before touching anything:
   - Try graph MCP (codebase-memory-mcp): `list_projects` → `search_graph` → `trace_path` → `get_code_snippet`
   - Fallback: `git diff --name-only`, targeted grep, slice-reads
   - Output the fixed SCOUT schema: Goal / Files / Call chain / Constraints / Next action / Tests
2. Act — implement with Karpathy guardrails:
   - Think Before Coding: confirmed scout before any edit
   - Simplicity First: fewest files, smallest change
   - Surgical Changes: diff-sized edits only, no unrelated reformats
   - Goal-Driven Execution: every edit traces to the Goal line; stop when done
3. Optionally write or update `.ai/state/AI_STATE.<tool>.<session>.md`

## When to use /quick vs /fix vs /dev

| Command | Use when |
|---|---|
| `/quick` | Scoped task, any type — you want scout-first + guardrails without full ceremony |
| `/fix` | Pure bug — you need TDD reproduce-fail-fix cycle + security review |
| `/dev` | Multi-phase feature, refactor, or anything needing brainstorm + design spec |
