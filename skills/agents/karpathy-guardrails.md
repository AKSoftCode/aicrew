# karpathy-guardrails

Four principles for disciplined, goal-driven coding — derived from
[forrestchang/andrej-karpathy-skills](https://github.com/forrestchang/andrej-karpathy-skills) (MIT).
Adapted and extended for the aicrew pipeline.

Apply these principles throughout any session. They merge cleanly with project rules
and other aicrew agents; nothing here conflicts with TDD, security review, or specialist routing.

---

## The Four Principles

### 1. Think Before Coding

Before touching any file:
- State the goal in one sentence
- Identify the entry point and call chain
- Name the files that will change (and those that must NOT change)
- Confirm you understand why the change is needed

Forbidden: jumping straight to an edit without a scout pass.

### 2. Simplicity First

Always prefer the simpler solution:
- Fewer files touched is better
- Fewer new abstractions is better
- Shortest path from current code to passing tests
- If two approaches achieve the same outcome, pick the one with less surface area
- No new dependencies unless the scout confirmed they are required

Ask: "Is there a version of this change with one fewer file?"

### 3. Surgical Changes

Edits must be diff-sized, not rewrite-sized:
- Change only what is required to meet the goal
- Do not reformat, rename, or reorganize code outside the affected region
- Do not fix unrelated issues unless they block the current goal (log them instead)
- Keep the diff reviewable: a human should be able to read it in under 2 minutes

Red flags: editing files not mentioned in the scout, adding imports not needed by the change,
deleting comments or whitespace in unrelated sections.

### 4. Goal-Driven Execution

Every action must trace back to the stated goal:
- Before each edit, ask: "Does this directly advance the goal?"
- When a new sub-problem appears, note it and continue on the main path
- Stop when the acceptance criterion is met — do not gold-plate
- Report done clearly: what changed, what tests passed, what risks remain

---

## Integration with aicrew

- Referenced by `/quick` as the primary guardrail agent
- Optionally referenced by `/fix` when working in large repos
- Compatible with all specialist agents (`frontend-specialist`, `backend-specialist`, etc.)
- Does not replace TDD — these principles wrap around the TDD cycle, not instead of it

---

## Per-phase application

| Phase | Principle in focus |
|---|---|
| Scout / Research | Think Before Coding |
| Design / Brainstorm | Simplicity First |
| Implement | Surgical Changes |
| All phases | Goal-Driven Execution |

---

## Attribution

Derived from [forrestchang/andrej-karpathy-skills](https://github.com/forrestchang/andrej-karpathy-skills),
originally inspired by Andrej Karpathy's public commentary on software engineering discipline.
Licensed MIT. Adapted for the aicrew pipeline by the aicrew project.
