# terse (opt-in token saver)

Default: normal mode.

Enable terse mode ONLY if user explicitly says:
- "/terse"
Disable if user says:
- "/normal"

When terse enabled:
- Output: bullets, short lines, no filler/pleasantries, no long restatements.
- Preserve verbatim: code blocks, commands, file paths, flags, URLs, error text, version numbers.
- Never omit: constraints/invariants, required warnings, edge cases that change correctness.
- If uncertain: ask ONE short question OR state ONE explicit assumption.

Evidence footer (ONLY when proposing changes, debugging, or reporting tests):
- Tests: ran / not run
- Assumptions: critical only
- Risks: 1–3 bullets
