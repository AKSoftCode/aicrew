---
name: aicrew-handoff
description: Generate a compact cross-tool handoff block from current session state for switching tools or models.
---

# aicrew-handoff (Codex)

Codex does not support slash commands. Use this skill when the user asks for "/handoff" or wants to switch tools without losing context.

## Equivalent actions

| Method | Command |
|--------|---------|
| **CLI** | N/A (state management, not CLI) |
| **Codex skill** | `aicrew-handoff` (this skill) |
| **Claude Code slash** | `/handoff [target tool]` |

## Default output

Caveman/lean style. See `~/Agents/agents/caveman.md`.

Source of truth:
- `~/Agents/commands/handoff.md`

## What it does

Generates a compact, copy/paste-ready HANDOFF block from current session state.

## Inputs

- Current session state file: `.ai/state/AI_STATE.<tool>.<session>.md`
- Optional: target tool or note (e.g., `to cursor`, `to claude`)

If no state file exists, build handoff from current session facts.

## Output format

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

- Keep compact and copy/paste friendly
- Preserve technical strings verbatim (commands, paths, errors)
- Do not invent facts — if unknown, write `unknown`
- Update state file before printing handoff if write tools are available
