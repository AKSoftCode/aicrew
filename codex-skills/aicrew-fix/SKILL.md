---
name: aicrew-fix
description: Run the aicrew /fix fast bug fix flow in Codex (triage -> root cause -> TDD -> verify).
---

# aicrew /fix (Codex)

Use for fast bug fixes. This mirrors the `/fix` command but runs inline in Codex.

Source of truth:
- `~/Agents/commands/fix.md`
- Project overrides in `.ai/skills/` and repo `AGENTS.md` (if present)

Workflow summary:
1. Ask the 3 clarifying questions (symptom, expected behavior, repro).
2. Confirm root cause with a minimal trace.
3. Write the smallest failing test or reproducible check.
4. Implement the minimal fix to make it pass.
5. Run targeted tests + smoke path.
6. Conclude with summary, tests run, and any risks.
