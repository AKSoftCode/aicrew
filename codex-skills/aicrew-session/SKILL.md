---
name: aicrew-session
description: Set session label for state checkpoints — makes .ai/state/ files multi-tool safe and easy to resume.
---

# aicrew-session (Codex)

Codex does not support slash commands. Use this skill when the user asks for "/session" or wants to label their session for checkpointing.

## Equivalent actions

| Method | Command |
|--------|---------|
| **CLI** | N/A (state management, not CLI) |
| **Codex skill** | `aicrew-session` (this skill) |
| **Claude Code slash** | `/session <tool> <label>` |

## Default output

Caveman/lean style. See `~/Agents/agents/caveman.md`.

Source of truth:
- `~/Agents/commands/session.md`

## What it does

Sets `<tool>` and `<session-label>` for this session. All state files use:

```
.ai/state/AI_STATE.<tool>.<session-label>.md
```

Fallback (if not set): `.ai/state/AI_STATE.unknown.unknown-<YYYY-MM-DD>-<HHMM>.md`

## Usage

```
aicrew-session codex my-feature-2026-06-21
aicrew-session cursor login-bug
```

After invoking:
- Remember `<tool>` = codex (or cursor/claude/gemini)
- Remember `<session-label>` = the slug you provided
- Apply to all `.ai/state/` writes in this session

## Session label guidance

- Short, slug-ish (no spaces)
- Include topic + date if helpful: `oauth-fix-2026-06-21`
