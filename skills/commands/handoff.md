---
description: "Generate a compact cross-tool handoff block from current session state"
argument-hint: "[optional: target tool or note]"
---

> **Default output: caveman/lean** — terse by default. `/normal` or `/lean off` for verbose. See `~/Agents/agents/caveman.md`.

# /handoff

## In plain English

Switching tools mid-task (e.g. Claude → Cursor)? Three steps:

1. **Early in your session,** name it: `/session cursor my-task`
   This sets the state file path: `.ai/state/AI_STATE.cursor.my-task.md`

2. **When ready to switch,** run `/handoff`. You get a compact block:
   ```
   HANDOFF:
   Target: cursor
   State file: .ai/state/AI_STATE.cursor.my-task.md
   Goal: Add rate limiting to /api/auth endpoint
   Current status: Phase 3 design confirmed — ready to implement
   Next step: Run TDD cycle for RateLimitMiddleware
   Tests: not run yet
   ```

3. **In the new tool,** paste the block or just say:
   `Continue from .ai/state/AI_STATE.cursor.my-task.md`

No chat replay. Each switch costs ~300 tokens instead of 15,000.

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
