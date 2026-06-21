---
name: aicrew-terse
description: Re-enable terse/caveman output if it was previously disabled with aicrew-normal.
---

# aicrew-terse (Codex)

Codex does not support slash commands. Use this skill when the user asks for "/terse" or wants to re-enable lean output.

## Equivalent actions

| Method | Command |
|--------|---------|
| **CLI** | N/A (output mode, not CLI) |
| **Codex skill** | `aicrew-terse` (this skill) |
| **Claude Code slash** | `/terse` |

## Default output

Already terse — this re-enables if you used `aicrew-normal`.

Source of truth:
- `~/Agents/agents/caveman.md`
- `~/Agents/agents/terse.md`

## What it does

Re-activates caveman/lean output mode for the rest of this session:

- Lead with answer or action
- Short sentences, compact fragments OK
- No filler, pleasantries, or hedging
- Verbatim: code blocks, commands, paths, flags, errors, versions
- Context-economy reads: diff/tree/search before file reads

## Note

Default is already terse. Use `aicrew-normal` if you need verbose output. Use `aicrew-terse` to switch back.
