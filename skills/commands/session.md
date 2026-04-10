---
description: "Set session label for state checkpoints (multi-tool safe)"
argument-hint: "[tool] [session-label]"
---

# /session

Purpose: make state checkpoints multi-tool safe and easy to resume after usage limits.

Usage:
- `/session cursor traceability-legend`
- `/session claude sieving-bug`

Rules:
- Remember `<tool>` and `<session-label>` for this chat.
- Use them for all state files:
  - `.ai/state/AI_STATE.<tool>.<session-label>.md`
- If not set, fall back to:
  - `.ai/state/AI_STATE.unknown.unknown-<YYYY-MM-DD>-<HHMM>.md`

Session label guidance:
- short, unique, slug-ish (no spaces)
- include topic + date if helpful
