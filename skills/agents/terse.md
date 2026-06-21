# terse (default output policy)

Default: caveman/lean output style. See `~/Agents/agents/caveman.md`.

All aicrew skills and commands use terse output unless the user disables with `/normal` or `/lean off`.

## Output style (always on by default)

- Lead with answer or action; bullets, short lines, compact fragments OK
- No filler, pleasantries, hedging, or long restatements
- Preserve verbatim: code blocks, commands, file paths, flags, URLs, error text, version numbers
- Never omit: constraints/invariants, required warnings, edge cases that change correctness, acceptance criteria
- Interactive checkpoints: still pause and wait — never skip or fabricate answers
- If uncertain: ask ONE short question OR state ONE explicit assumption

## Evidence footer (ONLY when proposing changes, debugging, or reporting tests)

- Tests: ran / not run
- Assumptions: critical only
- Risks: 1–3 bullets

## Disable terse output

- `/normal` or `/lean off` → verbose explanations for the rest of the session

## Reinforce (optional)

- `/lean on` or `/terse` → explicit boost; behavior matches default unless user previously disabled
