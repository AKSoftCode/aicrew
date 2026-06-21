---
description: "Benchmark aicrew skill quality, trigger accuracy, token efficiency, and pipeline timing"
argument-hint: "[trigger|quality|tokens|timing|all]"
---

> **Default output: caveman/lean** — terse by default. `/normal` or `/lean off` for verbose.

# /benchmark

Measure aicrew skill quality, trigger accuracy, token efficiency, and pipeline timing.

## Equivalent actions

| Method | Command |
|--------|---------|
| **CLI** | `aicrew benchmark` (planned) |
| **Codex skill** | `aicrew-benchmark` |
| **This slash command** | `/benchmark [type]` |

## Benchmark types

If not in `$ARGUMENTS`, ask:

> What should we benchmark?
> 1. **trigger** — does the right skill fire for a given prompt?
> 2. **quality** — does a skill produce the expected sections/format?
> 3. **tokens** — lean vs normal mode token counts for the same task
> 4. **timing** — wall-clock time for each /dev or /fix phase
> 5. **all** — full harness benchmark

**Wait for answer.**

## Output format

```
BENCHMARK:
Skill/Phase   | Trigger | Quality | Tokens | Timing
--------------|---------|---------|--------|-------
aicrew-dev    | ✓       | ✓       | 1200   | 4.2s
aicrew-fix    | ✓       | ✓       | 800    | 2.1s
aicrew-quick  | ✓       | ✓       | 600    | 1.8s
...
```

## Checkpoint

After each benchmark type: report results and ask "Continue with next type?"
