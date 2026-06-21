---
description: "Boost or disable lean mode: terse output plus context-economy reads (default is already lean)"
argument-hint: "[on|off]"
---

> **Caveman is default.** These commands only matter if you toggled verbose with `/normal` or `/lean off`.

# /lean

Default: already lean (caveman output + context-economy reads). See `~/Agents/agents/caveman.md`.

Usage:
- `/lean on` — explicit boost for the rest of this session (re-enables if `/normal` or `/lean off` was used)
- `/lean off` — disable lean mode and return to normal verbose behavior

Aliases: `/terse` = `/lean on` (deprecated alias, kept for backward compat); `/normal` = `/lean off`.

Lean mode combines:
- Terse output with no filler
- Diff/tree/search before file reads
- Slice reads instead of whole-file reads when possible
- Reuse of prior summaries unless a file changed
- Compact context between major phases

Always preserve verbatim:
- Code blocks
- Commands
- File paths
- Flags
- URLs
- Error text
- Version numbers

Never omit:
- Constraints and invariants
- Required warnings
- Edge cases that affect correctness
- Acceptance criteria
- Interactive checkpoint pauses

When proposing changes, debugging, or reporting tests, add a short footer:
- Tests: ran / not run
- Assumptions: critical only
- Risks: 1–3 bullets
