---
name: aicrew-conclude
description: Wrap up a session in Codex with summary, tests, risks, and a commit message proposal.
---

# aicrew /conclude (Codex)

Use to wrap up any session with a clean, reviewable summary.

Source of truth:
- `~/Agents/commands/conclude.md`
- Project overrides in `.ai/skills/` and repo `AGENTS.md` (if present)

Checklist:
- Summary of changes and why
- Tests run (or why not)
- Risks or follow-ups
- Proposed commit message (no co-author lines unless explicitly requested)
