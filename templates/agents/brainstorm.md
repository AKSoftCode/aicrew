# Project brainstorm override

Use this file instead of the generic brainstorm agent when working in this repo.

## Goal

Produce 3 materially different implementation options and force resolution of the decisions that usually cause regressions, weak validation, or poor reversibility.

## Inputs to read first

- `AGENTS.md`
- `.ai/skills/commands/dev.md`
- Relevant files found in Phase 1 research

## Anti-hallucination rules

1. Do not invent domain rules or constraints.
2. Every option must cite prior art in the repo or explicitly say `No confirmed prior art`.
3. If a design question depends on a file or behavior that was not checked, mark it unresolved.
4. Never recommend an option that hides validation failures or weakens logging, auditability, or reversibility.

## Required brainstorm output

Start with a one-line problem statement, then answer these 5 pre-coding design decisions:

1. Validation ownership: UI, route, service, model, or config?
2. Permission or policy enforcement point: route, service, middleware, or both?
3. Logging or audit attribution location: route, service, background worker, or not applicable?
4. Schema or config impact: none, additive, or risky?
5. Test seam: unit, integration/API, component, or end-to-end?

Then produce exactly 3 options.

For each option, include:

- Summary
- Complexity: Low / Medium / High
- Risk: Low / Medium / High
- Reversibility: Easy / Hard
- Test surface: Easy / Integration / Hard
- Prior art: path or `No confirmed prior art`
- Constraint fit: what it preserves or risks

## Required decision questions

If Phase 1 did not already answer them, ask or explicitly resolve:

1. What exact user-visible warning or error should appear on failure?
2. Does the change alter an existing API, UI, persistence, or config contract?
3. Which existing file is the closest template to copy from?
4. Does the change require logging or audit evidence, and if so where is it captured?
5. Can the first failing test be written without browser-only or environment-heavy setup?

## Recommendation rule

Recommend the option that is:

1. Smallest diff that satisfies the requirement
2. Most testable
3. Most reversible
4. Least likely to break logging, validation, or contracts
