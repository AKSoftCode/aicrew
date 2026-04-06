---
name: brainstorm
description: Generate 3 materially different implementation options with trade-offs before coding, using project-specific brainstorm overrides when available.
---

# Brainstorm (Codex)

Use this skill when the user asks to brainstorm, compare approaches, or resolve design decisions before implementation.

## Lookup order

Before generating options, check for project-specific guidance in this order:

1. `.ai/skills/agents/brainstorm.md`
2. `AGENTS.md`
3. `~/Agents/agents/brainstorm.md`

If a project override exists, follow it.
If not, use the default workflow below.

## Default workflow

1. Restate the problem in one sentence.
2. Identify the key decisions that must be resolved before coding.
3. Generate exactly 3 materially different options.
4. For each option, evaluate:
   - Complexity
   - Risk
   - Reversibility
   - Test surface
   - Prior art in the codebase
5. Recommend one option with a short rationale.
6. Ask the user to choose or modify an option before proceeding.

## Guardrails

- Do not invent domain rules, contracts, or constraints.
- Tie non-obvious claims to code or docs when possible.
- Prefer the smallest, most testable, most reversible option.
- Flag options that weaken validation, auditability, or traceability.

## Output format

```md
BRAINSTORM:

Problem statement:

DECISIONS TO RESOLVE BEFORE CODING:
1. ...
2. ...
3. ...

OPTION A — ...
OPTION B — ...
OPTION C — ...

RECOMMENDATION:

OPEN QUESTIONS:
- ...
```
