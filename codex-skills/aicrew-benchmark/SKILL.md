---
name: aicrew-benchmark
description: Run a benchmark to measure skill quality, response time, and token efficiency for aicrew skills.
---

# aicrew-benchmark (Codex)

Use when: measuring aicrew skill output quality, latency, or token usage across skills or pipelines.

## Equivalent actions

| Method | Command |
|--------|---------|
| **CLI** | `aicrew benchmark` (planned) |
| **Codex skill** | `aicrew-benchmark` (this skill) |
| **Claude Code slash** | `/benchmark` |

## Default output

Caveman/lean style. See `~/Agents/agents/caveman.md`.

Source of truth:
- `~/Agents/commands/harness-audit.md` (for harness health)

## What to benchmark

Ask the user which dimension to measure:

> What should we benchmark?
> 1. **Skill trigger accuracy** — does the right skill fire for a given prompt?
> 2. **Output quality** — does a skill produce the expected sections/format?
> 3. **Token efficiency** — lean vs normal mode token counts for the same task
> 4. **Pipeline timing** — wall-clock time for each /dev or /fix phase
> 5. **All of the above** (full harness benchmark)

**Wait for answer.**

## Steps per benchmark type

### 1. Skill trigger accuracy
- List all skills and their `description` fields
- For each skill, present a sample prompt and confirm the right skill triggers
- Flag any ambiguous descriptions

### 2. Output quality
- Run a skill against a standard input
- Check required sections are present (e.g. SCOUT: block, HANDOFF: block, phase gates)
- Flag missing or malformed sections

### 3. Token efficiency
- Compare output token count with lean vs normal mode
- Run the same task in both modes; measure diff

### 4. Pipeline timing
- Record start/end of each phase in `/dev` or `/fix`
- Output phase timings as a table

### 5. Full harness
- Run all checks above in sequence
- Output a summary table: skill → trigger ✓/✗ → quality ✓/✗ → tokens → timing

## Output format

```
BENCHMARK:
Skill/Phase   | Trigger | Quality | Tokens | Timing
--------------|---------|---------|--------|-------
aicrew-dev    | ✓       | ✓       | 1200   | 4.2s
aicrew-fix    | ✓       | ✓       | 800    | 2.1s
...
```

## Checkpoint

After each benchmark type completes: report results and ask "Continue with next type?" before proceeding.
