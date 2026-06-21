---
name: aicrew-harness-audit
description: Audit the aicrew harness health and completeness in Codex.
---

# aicrew /harness-audit (Codex)

Use to verify the harness itself (skills, hooks, commands, and platform wiring).

## Default output

Caveman/lean style by default. See `~/Agents/agents/caveman.md` and `~/Agents/agents/context-economy.md`. `/normal` or `/lean off` restores verbose.

Source of truth:
- `~/Agents/commands/harness-audit.md`
- `~/Agents/SKILLS_SYSTEM.md`

Checklist:
- Skills/commands present where expected
- Hooks registered (if supported)
- Project overrides detected (`.ai/skills/`)
- Any missing or stale links reported with remediation steps
