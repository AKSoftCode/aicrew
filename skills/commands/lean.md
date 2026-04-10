---
description: "Enable or disable lean mode: terse output plus context-economy reads"
argument-hint: "[on|off]"
---

# /lean

Usage:
- `/lean on` — enable lean mode for the rest of this session
- `/lean off` — disable lean mode and return to normal behavior

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

When proposing changes, debugging, or reporting tests, add a short footer:
- Tests: ran / not run
- Assumptions: critical only
- Risks: 1–3 bullets
