---
description: "Generate 3 materially different implementation options with trade-offs before coding"
argument-hint: "[topic or design question]"
---

> **Default output: caveman/lean** — terse by default. `/normal` or `/lean off` for verbose.

# /brainstorm

Generate 3 materially different approaches with trade-offs before committing to implementation.

## Equivalent actions

| Method | Command |
|--------|---------|
| **CLI** | N/A (design tool, not CLI) |
| **Codex skill** | `brainstorm` |
| **This slash command** | `/brainstorm [topic]` |

## When to use

- Before implementing a non-trivial feature
- When multiple valid architectures exist
- When you want to surface trade-offs before committing
- Use inside `/dev` Phase 2 (brainstorm phase) or standalone

## What it does

Source of truth: `~/Agents/agents/brainstorm.md`

Uses the brainstorm agent to produce exactly 3 concrete options:
- Each option has: approach name, description, pros, cons, and effort estimate
- Ends with a recommended option + rationale
- Does not start coding — outputs decision material only

## Usage

```
/brainstorm add rate limiting to the API
/brainstorm how to handle session state
/brainstorm architecture for the new notification system
```

## Note

If `$ARGUMENTS` is present, use it as the topic. Otherwise ask:
> What are we brainstorming? (one-line description of the design question)

**Wait for answer.**
