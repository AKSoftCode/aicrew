---
name: lean
description: Enable low-token operating mode with terse output and context-economy read policy.
---

# Lean (Codex)

Use this skill when the user asks for lower token usage, terse replies, or says `/lean on`.

## What lean mode does

1. Keep answers terse and structured.
2. Use diff/tree/search before reading full files.
3. Prefer targeted slices over whole-file reads.
4. Reuse prior summaries unless files changed.
5. Keep correctness and safety constraints intact.

## Safety and fidelity rules

- Never drop constraints, invariants, acceptance criteria, or required warnings.
- Keep technical strings verbatim: code, commands, paths, flags, URLs, errors, versions.
- If uncertain, ask one short clarifying question or state one explicit assumption.

## Evidence footer (only when relevant)

When proposing changes, debugging, or reporting tests, include:
- Tests: ran / not run
- Assumptions: critical only
- Risks: 1-3 bullets

## Session resilience

When `/session` context is available, keep checkpoint updates in:
`.ai/state/AI_STATE.<tool>.<session>.md`
