---
description: "Generate a compact cross-tool handoff block from current session state"
argument-hint: "[optional: target tool or note]"
---

# /handoff

Generate a compact handoff package for switching tools/models without losing context.

## Inputs

- Current session state file:
  - `.ai/state/AI_STATE.<tool>.<session>.md`
- Optional argument in `$ARGUMENTS` (target tool or note)

If the state file does not exist, build a compact handoff from current session facts.

## Output format

Return this exact structure in markdown:

```md
HANDOFF:

Target:
- [target tool/model or "any"]

State file:
- [.ai/state/AI_STATE.<tool>.<session>.md or "not written yet"]

Goal:
- ...

Current status:
- ...

Key constraints:
- ...

Relevant files:
- ...

Latest errors/logs:
- ...

Next step:
- ...

Tests:
- ran / not run (+ short note)

Risks/assumptions:
- ...
```

## Rules

- Keep it compact and copy/paste friendly.
- Preserve technical strings verbatim (commands, paths, errors).
- Do not invent facts. If unknown, write `unknown`.
- If writing tools are available, update state file before printing handoff.
