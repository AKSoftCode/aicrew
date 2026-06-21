---
description: "Reinforce default terse output (already on by default)"
argument-hint: ""
---

# /terse

Default output is already terse/caveman. See `~/Agents/agents/caveman.md`.

Use `/terse` to explicitly re-enable terse mode if `/normal` or `/lean off` was used earlier in the session.

Rules:
- Bullets, short lines, no filler/pleasantries.
- Preserve verbatim: code blocks, commands, file paths, flags, URLs, error text, version numbers.
- Never omit: constraints/invariants, required warnings, edge cases that change correctness.
- If uncertain: ask ONE short question OR state ONE explicit assumption.

When proposing changes, debugging, or reporting tests, add a short footer:
- Tests: ran / not run
- Assumptions: critical only
- Risks: 1–3 bullets
