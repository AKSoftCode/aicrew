---
name: aicrew-terse
description: Re-enable terse/caveman output if it was previously disabled with aicrew-normal.
deprecated: true
deprecated-reason: "Use the lean skill instead. lean already enables terse/caveman mode. aicrew-terse is kept for backward compatibility only."
---

> **Deprecated.** Use the `lean` skill instead. `lean` enables terse/caveman output and is the canonical verbosity toggle. `aicrew-terse` is kept for backward compatibility and will not be updated.

# aicrew-terse (Codex) — deprecated, use `lean`

Codex does not support slash commands. Use this skill when the user asks for "/terse" or wants to re-enable lean output.

**Preferred:** Use the `lean` skill going forward. `lean` covers terse-on behavior. Use `aicrew-normal` to go verbose.

## What it does

Re-activates caveman/lean output mode for the rest of this session:

- Lead with answer or action
- Short sentences, compact fragments OK
- No filler, pleasantries, or hedging
- Verbatim: code blocks, commands, paths, flags, errors, versions
- Context-economy reads: diff/tree/search before file reads

## Source of truth

- `~/Agents/agents/caveman.md`
- `~/Agents/agents/terse.md`
