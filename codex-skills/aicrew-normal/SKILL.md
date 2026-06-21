---
name: aicrew-normal
description: Disable lean mode and restore verbose, full-prose output for this session.
---

# aicrew-normal (Codex)

Codex does not support slash commands. Use this skill when the user asks for "/normal" or wants to disable terse output.

## Equivalent actions

| Method | Command |
|--------|---------|
| **CLI** | N/A (output mode, not CLI) |
| **Codex skill** | `aicrew-normal` (this skill) |
| **Claude Code slash** | `/normal` or `/lean off` |

## Default output

This skill DISABLES lean mode. After invoking, switch to verbose output.

Source of truth:
- `~/Agents/agents/caveman.md`
- `~/Agents/commands/lean.md`

## What it does

Disables caveman/lean output for the rest of this session:

- Full prose explanations allowed
- Complete sentences and transitions OK
- Context-economy read policy relaxed (whole-file reads permitted)
- Verbose responses to questions

## To re-enable terse

Use `aicrew-terse` or `aicrew-lean` (with `on` argument).

## Note

Default is terse. Use this when you need detailed explanations, onboarding walkthroughs, or verbose debugging output.
