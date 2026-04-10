---
description: "Opt-in token saver: terse output mode (style only)"
argument-hint: ""
---

# /terse

Enable terse mode for the rest of this session until `/normal`.

Rules:
- Bullets, short lines, no filler/pleasantries.
- Preserve verbatim: code blocks, commands, file paths, flags, URLs, error text, version numbers.
- Never omit: constraints/invariants, required warnings, edge cases that change correctness.
- If uncertain: ask ONE short question OR state ONE explicit assumption.

When proposing changes, debugging, or reporting tests, add a short footer:
- Tests: ran / not run
- Assumptions: critical only
- Risks: 1–3 bullets
