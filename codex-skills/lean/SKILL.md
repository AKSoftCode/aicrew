---
name: lean
description: Default low-token operating mode for aicrew — terse output and context-economy read policy. Use /lean on to boost or re-enable after /normal.
---

> **Caveman is default.** This skill only matters if you switched to verbose with `/normal` or `/lean off`.

# Lean (Codex)

Default for all aicrew Codex skills. Not opt-in.

Applies caveman output (`~/Agents/agents/caveman.md`) and context-economy reads (`~/Agents/agents/context-economy.md`) on every session unless the user disables with `/normal` or `/lean off`.

## What lean mode does

1. Keep answers terse and structured.
2. Use diff/tree/search before reading full files.
3. Prefer targeted slices over whole-file reads.
4. Reuse prior summaries unless files changed.
5. Keep correctness and safety constraints intact.

## Session controls

- `/lean on` — explicit boost or re-enable after disable
- `/normal` or `/lean off` — verbose output and relaxed read policy

## Safety and fidelity rules

- Never drop constraints, invariants, acceptance criteria, or required warnings.
- Keep technical strings verbatim: code, commands, paths, flags, URLs, errors, versions.
- Interactive checkpoints: still pause and wait — never skip or fabricate answers.
- If uncertain, ask one short clarifying question or state one explicit assumption.

## Evidence footer (only when relevant)

When proposing changes, debugging, or reporting tests, include:
- Tests: ran / not run
- Assumptions: critical only
- Risks: 1-3 bullets

## Session resilience

When `/session` context is available, keep checkpoint updates in:
`.ai/state/AI_STATE.<tool>.<session>.md`
