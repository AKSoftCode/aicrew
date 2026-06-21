# Pipeline overview

Canonical reference for aicrew entry-point commands, phase gates, token foundation, and when to use each command. All three commands share the same 11-capability token stack — only pipeline depth differs.

For install and daily usage, see the [README](../README.md).

---

## Command summary

| Command | Phases | Best for |
|---------|--------|----------|
| `/dev` | 9 (intake → research → brainstorm → design → implement → tests → security → audit → conclude) | Features, refactors, anything needing a design spec or touching multiple systems |
| `/fix` | 5 (intake → bug analysis → implement → tests → security → conclude) | Bug fixes with mandatory TDD and security review |
| `/quick` | 2 (Scout → Act) | Small scoped tasks — rename, tweak, quick addition |

Codex equivalents: `aicrew-dev`, `aicrew-fix`, `aicrew-quick`.

---

## `/dev` — 9-phase pipeline

Every phase stops and waits for your explicit go-ahead. The agent never invents your response.

| Phase | Name | Gate |
|------:|------|------|
| 0 | Intake | Work type, clarifying questions, acceptance criteria, pipeline customization confirmed |
| 1 | Research | Root cause confirmed (bug) or key files + change type classified (feature/refactor); Scout pass before broad reads |
| 2 | Brainstorm | 3 alternatives with trade-offs; user confirms approach (on by default for features/refactors; off for bugs) |
| 3 | Design | Architect spec confirmed before any code |
| 4 | Implement | TDD strict (RED → GREEN → REFACTOR) by default; specialist routing by changed file paths |
| 5 | Tests | Test engineer PASS; full suite green; coverage on new code ≥ 80% |
| 6 | Security | `security-reviewer` PASS on changed files only |
| 7 | Project audit | PASS only if project has `.ai/skills/commands/audit.md` and phase included at intake |
| 8 | Cloud / infra | Auto-triggers when schema, dependencies, deployment config, or workers change; must PASS if triggered |
| 9 | Conclude | Memory saved, `git diff --stat`, commit message ready (no auto-commit) |

**TDD** is the default in Phase 4; opt out explicitly at intake (Checkpoint C).

**Context compaction:** run `/compact` at the end of each phase before starting the next.

**State files:** `.ai/state/AI_STATE.<tool>.<session>.md` — update after every checkpoint and phase boundary.

Source: [`skills/commands/dev.md`](../skills/commands/dev.md)

---

## `/fix` — 5-phase fast path

Streamlined bug fix. Skips brainstorm and design. Fixed pipeline — no customization choices.

| Phase | Name | Gate |
|------:|------|------|
| 1 | Bug analysis | Scout pass, then bug analyst traces symptom → entry point → call chain → **confirmed root cause** before any code |
| 2 | Implement | TDD mandatory: failing repro test → minimum fix → PASS; full suite green |
| 3 | Tests | Test engineer PASS; coverage on changed code ≥ 80% |
| 4 | Security | `security-reviewer` PASS on changed files only |
| 5 | Conclude | Summary, `git diff --stat`, commit message ready (no auto-commit) |

Intake: 3 quick questions (symptom, location, repro steps), then **go** to start.

Source: [`skills/commands/fix.md`](../skills/commands/fix.md)

---

## `/quick` — Scout → Act

Two phases with minimal pipeline overhead. Scout is always first; Act runs only after Scout is confirmed.

| Phase | Name | Gate |
|------:|------|------|
| 1 | Scout | Graph-first discovery; emit fixed `SCOUT:` schema; user confirms before Act |
| 2 | Act | Karpathy guardrails; surgical implementation of Scout `Next action`; targeted tests when relevant |

**Two-model routing:** Scout on `haiku`/`mini`; Act on `sonnet`/`opus`. After Scout accepted, pass only the `SCOUT:` block + original goal — not full conversation.

Escalate to `/fix` for bugs needing TDD + security; to `/dev` for design spec, brainstorm, or infra changes.

Source: [`skills/commands/quick.md`](../skills/commands/quick.md)

---

## Token foundation (11 capabilities)

All three commands carry **identical** token capabilities. Full detail: [`skills/docs/token-foundation.md`](../skills/docs/token-foundation.md).

| # | Capability | Role |
|---|------------|------|
| 1 | Graph-first research (`codebase-memory-mcp`) | `search_graph` → `trace_path` → `get_code_snippet` before grep or whole-file reads |
| 2 | Speculative Scout → verify (`context-scout`, SCOUT schema) | Cheap model drafts; main model verifies before acting |
| 3 | Karpathy guardrails | Think → simplest → surgical → goal-driven before every edit |
| 4 | Layered guardrails | Input → scope → phase gate → implementation → output → context budget |
| 5 | Context-economy read policy | Diff/tree/search before file reads; always on |
| 6 | `security-guard.py` hooks | PreToolUse secret blocking; always active |
| 7 | `.ai/state` checkpoints | Durable session state at every gate |
| 8 | `/compact` between phases | Prune stale context at phase boundaries |
| 9 | `/handoff` on tool switch | Compact state file when switching tools or models |
| 10 | Optional `context-mode` + `token-optimizer-mcp` | Session shaping for long runs (> 30 min) |
| 11 | Caveman default output | Terse by default; `/normal` or `/lean off` for verbose |

### Token figures (illustrative — project-dependent)

| Lever | Approximate cost | vs (illustrative baseline) |
|-------|------------------|-----|
| Graph query (`codebase-memory-mcp`) | ~500 tokens | Repo-wide grep ~80 K tokens (documented ratio) |
| Scout block (`SCOUT:` schema from `context-scout`) | ~1–2 K tokens | Raw grep/file dumps (often 10–80 K+ depending on repo) |
| `/handoff` state file | ~300 tokens | ~15 K chat replay (estimated) |

Run `aicrew benchmark --report` for repo-specific estimates (writes `.ai/reports/TOKEN_REPORT.<timestamp>.md`; all numbers labeled **estimated**).

---

## Benefits

- **TDD-first** — `/dev` Phase 4 and `/fix` Phase 2 enforce tests before or with implementation; strict RED → GREEN → REFACTOR by default.
- **Phase gates** — every `/dev` and `/fix` phase stops for explicit user confirmation; no fabricated answers.
- **Security review** — `security-reviewer` scans changed files in `/dev` Phase 6 and `/fix` Phase 4; `security-guard.py` blocks secrets on every write.
- **Specialist routing** — Phase 4 (`/dev`) and bug fixes route to `frontend-specialist`, `backend-specialist`, `db-migration`, or `performance` based on changed paths.

---

## Scout in plain English

Think of Scout as **drawing a map before the hike**. You do not start walking (Act) until someone checks the map (Verify).

1. **Scout** — a fast, graph-first pass finds the few files and constraints that matter.
2. **Verify** — you (or the main agent) confirm the map: constraints copied verbatim, paths real, nothing invented.
3. **Act** — the capable model implements only what Scout's `Next action` says.

The **Scout block** is a fixed `SCOUT:` schema (from the [`context-scout`](../skills/agents/context-scout.md) agent): goal, verbatim constraints, relevant files, call chain, next action, risks. The Act phase receives that block plus your original goal — not the whole repo.

| Command | When Scout runs |
|---------|-----------------|
| `/quick` | Phase 1 — always, before any Act edit |
| `/dev` | Phase 1 Research only — before broad Glob/Grep/Read |
| `/fix` | Phase 1 Bug Analysis only — before the bug-analyst deep dive |

**Honest cost split (illustrative, project-dependent):** a graph query is ~500 tokens (documented ratio vs repo-wide grep ~80 K). Scout may also use optional targeted diff or tree reads. The emitted `SCOUT:` block is ~1–2 K. Do not treat ~500 as the whole Scout pass — it is the graph-query line item only.

---

## Who picks the model?

aicrew defines **roles** (Scout vs Act); your **host tool** assigns which model runs each role.

Cursor, Claude Code, Codex, Gemini CLI, and Antigravity each pick the model for the active session unless the orchestrator explicitly spawns a subagent with a different model (best-effort — platform APIs vary).

**Token savings from a "cheap Scout" apply only when the platform actually runs Scout on a cheaper model** (e.g. Haiku, gpt-4o-mini). If Scout and Act share the same expensive model, you still get graph-first and schema compression savings — not the two-tier model discount.

**Best-effort routing:** when subagents are supported, spawn Scout on the cheapest model that can reliably graph-query. In Cursor, a Task/subagent with an explicit `model` parameter is the typical pattern; other platforms may require a separate session or tool-specific hook. aicrew does not guarantee per-platform model APIs — it specifies intent; the host enforces capability.

Orchestrators **SHOULD** use the cheapest available model for Scout when the platform supports subagents. See [`context-scout`](../skills/agents/context-scout.md) model selection for platform hints.

---

## Scout → verify pattern

Mirrors speculative decoding: a cheap draft model (Scout) does graph-first discovery; the capable model (Act / main agent) verifies the fixed `SCOUT:` schema before burning full context on implementation.

```
User goal
    │
    ▼
Scout (`context-scout`) ── graph ~500 tok + diff/tree reads + SCOUT block ~1–2 K
    │
    ▼
Verification gate ── reject if constraints paraphrased, fields missing, or paths invented
    │
    ▼
Main agent (sonnet/opus) ── receives SCOUT block + goal only
```

Per-command Scout timing:

| Command | When Scout runs |
|---------|-----------------|
| `/quick` | Phase 1 — always first, before any Act edit |
| `/dev` | Start of Phase 1 Research — before Glob/Grep/Read |
| `/fix` | Start of Phase 1 Bug Analysis — before bug-analyst deep dive |

Full pattern: [`skills/docs/speculative-context.md`](../skills/docs/speculative-context.md)

---

## When to use `/dev` vs `/fix` vs `/quick`

| Situation | Command |
|-----------|---------|
| New feature, refactor, or anything needing a design spec | `/dev` |
| Multiple systems, brainstorm, or architect spec required | `/dev` |
| Schema/migration or infra deps changed | `/dev` (Phase 8 auto-triggers) |
| Bug — you know what's broken; need TDD + security | `/fix` |
| Small scoped task — rename, tweak, quick addition | `/quick` |
| Scout-first discovery without full pipeline overhead | `/quick` |
| Bug needs reproduce-first TDD + security review | `/fix` (not `/quick`) |
| Goal ambiguous — needs intake and acceptance criteria | `/dev` |

---

## Specialist routing (Phase 4 / implement)

| Signals in changed paths | Agent |
|--------------------------|--------|
| `*.tsx`, `*.vue`, `*/components/*`, frontend routes | `frontend-specialist` |
| `*/api/*`, `*/routes/*`, `*/services/*`, backend logic | `backend-specialist` |
| `*/migrations/*`, `*models*`, `*schema*` | `db-migration` |
| Performance as acceptance criterion | `performance` |

Lookup order: `.ai/skills/agents/[name].md` → `~/Agents/agents/[name].md`

---

## Related docs

- [README](../README.md) — install, demo, three commands, advanced reference
- [`skills/docs/token-foundation.md`](../skills/docs/token-foundation.md) — full 11-capability spec
- [`skills/docs/speculative-context.md`](../skills/docs/speculative-context.md) — Scout architecture and failure modes
- [`skills/docs/guardrails-taxonomy.md`](../skills/docs/guardrails-taxonomy.md) — input/output rail mapping
- [`skills/docs/how-token-savings-work.md`](../skills/docs/how-token-savings-work.md) — worked examples
