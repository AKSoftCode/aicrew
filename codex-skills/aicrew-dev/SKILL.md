---
name: aicrew-dev
description: Run the aicrew /dev pipeline in Codex (intake -> research -> design -> TDD -> tests -> security -> audit -> infra -> conclude).
---

# aicrew /dev (Codex)

Codex does not support slash commands. Use this skill when the user asks for "/dev" or a full SDLC pipeline.

Source of truth:
- `~/Agents/commands/dev.md`
- Project overrides in `.ai/skills/` and repo `AGENTS.md` (if present)

Workflow summary:
1. Intake: clarify bug/feature/refactor, acceptance criteria, scope, risks, test plan.
2. Research: confirm root cause or key code paths.
3. Brainstorm: 3 alternatives with trade-offs (features/refactors).
4. Design: interface spec, contract checks, over/under-engineering flags.
5. Implement: TDD first (RED -> GREEN -> REFACTOR per acceptance criterion).
6. Tests: targeted automated tests + smoke path.
7. Security: changed files only, no false positives.
8. Audit: if project defines domain audit checks.
9. Conclude: summary, tests run, risks, commit message.

Checkpoints: pause for user confirmation at intake, design, and before concluding.
