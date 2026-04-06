# Project override for `/dev`

Use this file together with `~/Agents/commands/dev.md`.
If there is any conflict, precedence is:

1. Repo `AGENTS.md`
2. This file
3. `~/Agents/commands/dev.md`

This override exists so projects can make `/dev` concrete instead of generic.

## Codex availability note

- Files under `.ai/skills/` are project overrides, not globally installed Codex skills.
- They refine how `aicrew-dev` and `brainstorm` run inside a repo.
- They do not automatically add new global skills to Codex by themselves.

## Mandatory preload before Phase 0

Read these before feature, bug, refactor, review, or audit work:

- `AGENTS.md`
- `.ai/skills/commands/dev.md`
- `.ai/skills/commands/audit.md` if present
- Relevant files under `.ai/team/` if the project defines them
- The closest existing implementation and tests for the area being changed

## Team roster for `/dev`

Use this role order unless the task is strictly read-only:

1. Manager
2. Research
3. Brainstorm
4. Architect
5. Developer
6. Tester
7. Security Specialist
8. Auditor
9. Cloud Expert only if infra or migration impact exists

## Phase map with goals, micro-phases, and activations

| Phase | Goal | Micro-phases | Required output | Primary activations |
|---|---|---|---|---|
| 0 Intake | Confirm scope and acceptance criteria | 0A classify work, 0B gather constraints, 0C define AC | Scope card | `aicrew-dev` |
| 1 Research | Gather facts without guessing | 1A source scan, 1B code-path trace, 1C risk map | Research evidence log | Research |
| 2 Brainstorm | Compare real options before coding | 2A decision questions, 2B 3 options, 2C recommendation | Decision brief | `brainstorm` |
| 3 Design | Lock spec and ownership | 3A contracts, 3B ownership, 3C failure modes | Design spec | Architect |
| 4 Implement | Make the smallest safe change | 4A RED, 4B GREEN, 4C REFACTOR, 4D docs/config as needed | Patch + TDD evidence | Developer + specialists |
| 5 Tests | Prove behavior and guard regressions | 5A targeted tests, 5B smoke path, 5C regression pass | Validation record | Tester |
| 6 Security | Review changed files only | 6A auth, 6B secrets/logs, 6C abuse cases | Security findings | Security reviewer |
| 7 Audit | Check audit-readiness with evidence | 7A validations, 7B attribution, 7C user-facing proof | Audit verdict | Auditor |
| 8 Cloud/Infra | Review deployment and migration impact | 8A config/schema impact, 8B rollback path | Infra note | Cloud expert |
| 9 Conclude | Finish cleanly | 9A summary, 9B diff stats, 9C commit message | Close-out note | `aicrew-conclude` |

## Planner templates

### Template A — Scope card

```md
WORK TYPE:
GOAL:

IN SCOPE:
- ...

OUT OF SCOPE:
- ...

ACCEPTANCE CRITERIA:
1. ...
2. ...
3. ...

RISKS:
- Data integrity:
- Compatibility:
- UX / operator impact:

INITIAL TEST PLAN:
- Smallest failing test:
- Targeted suite:
- Smoke path:
```

### Template B — Research evidence log

```md
SOURCES CHECKED:
- [path] — why it matters

FACTS CONFIRMED:
- Fact:
  Source:
  Impact:

UNKNOWNS TO RESOLVE:
- ...

FILES LIKELY TO CHANGE:
- ...
```

### Template C — Design spec

```md
SURFACE AREA:

INVARIANTS TO PRESERVE:
- ...

OWNERSHIP BY LAYER:
- UI:
- API / route:
- Service:
- Model / DB:

FAILURE MODES:
- Trigger:
  User-visible outcome:
  Logging / audit outcome:

ROLLBACK / REVERSIBILITY:
- ...
```

### Template D — Validation and demo record

```md
AUTOMATED TESTS:
- Command:
- Result:

SMOKE / MANUAL FLOW:
1. ...
2. ...
3. ...

EVIDENCE:
- Validation evidence:
- Traceability / logging evidence:
- Error / warning evidence:

OPEN RISKS:
- ...
```

## Anti-hallucination protocol

1. Do not invent domain rules, workflows, fields, or contracts.
2. Prefer primary sources in this order:
   - repo `AGENTS.md`
   - project `.ai/skills/` files
   - relevant code and tests
   - upstream aicrew command or agent files
3. Every non-obvious claim must be tied to a file or code path.
4. If the source is ambiguous, say `unknown until confirmed`.
5. Treat existing tests as evidence of current behavior, not automatically desired behavior.
6. Do not infer permissions, audit logging, or validations from naming alone.

## Architectural constraints

- Keep diffs minimal and task-scoped.
- Preserve existing public contracts unless acceptance criteria explicitly allow changes.
- Keep validation failures explicit and user-safe.
- Prefer one clear owner per rule: UI, route, service, or model.
- Keep audit and logging semantics stable for state-changing operations.
- Prefer additive, reversible schema and config changes.

## Git safety

1. Start with `git status --short`.
2. Do not overwrite unrelated user changes.
3. Never use destructive git commands unless explicitly requested.
4. Do not commit or amend unless explicitly requested.
5. Before concluding, inspect `git diff --stat` and verify the changed files match the agreed scope.

## Brainstorm questions and 5 design decisions to resolve before coding

Phase 2 must answer these questions before Phase 3:

1. Which layer should own the rule?
2. Is the change additive or compatibility-breaking?
3. What exact warning, error, or audit signal should appear on failure?
4. What is the narrowest automated test seam that proves the requirement?
5. What existing file is the closest prior art?

The brainstorm output must explicitly resolve:

1. Validation ownership
2. Permission / policy enforcement point
3. Audit or logging attribution location
4. Data migration or config impact
5. Rollback and reversibility strategy

## Validation steps per phase

- Phase 0: acceptance criteria are explicit and testable
- Phase 1: each key claim cites a file or code path
- Phase 2: 3 materially different options exist, with one recommendation
- Phase 3: invariants, ownership, and failure modes are documented
- Phase 4: failing test exists before implementation for behavior changes
- Phase 5: targeted tests pass and smoke path is written or executed
- Phase 6: changed files reviewed for auth, secrets, and misuse paths
- Phase 7: audit or validation checks use evidence, not assertions
- Phase 8: rollback path is recorded when infra or schema changes are involved
- Phase 9: diff stat, residual risks, and commit message are prepared

## Concrete end-to-end demo scenario for proving the phases

Use this when you need a fully worked demo of the `/dev` pipeline:

- Add a protected mutation endpoint or action
- Add validation that rejects bad input with a clear error
- Emit an audit or action log entry on success and failure where applicable
- Add the smallest failing integration test first
- Add a smoke path that proves the user-visible flow end-to-end

### Demo validation checklist

```md
[ ] Invalid input fails with the expected error or warning
[ ] Valid input succeeds and returns the expected response shape
[ ] Permissions or policy checks are enforced
[ ] Logging / audit evidence exists for the state change
[ ] Tests cover the new behavior at the narrowest useful seam
[ ] Rollback or downgrade path is described for schema/config changes
```

## Skill and specialist activation guide

- Always: `aicrew-dev`
- Phase 2: `brainstorm`
- UI-heavy change: frontend specialist
- API or service-heavy change: backend specialist
- Schema or migration change: db-migration
- Performance-sensitive change: performance specialist
- Security-sensitive auth or data change: security reviewer
- Wrap-up: `aicrew-conclude`
