# Token Foundation — mandatory for /dev, /fix, /quick

Shared token-saving stack applied by **all three** aicrew entry-point commands.
`/dev`, `/fix`, and `/quick` carry **identical** token capabilities — only pipeline depth differs.
Commands reference this doc; do not duplicate these rules locally.

---

## The 11 capabilities (all commands, always)

### 1. Graph-first research (`codebase-memory-mcp`)

Before any `Grep`, `Glob`, or full-file `Read`:

1. `list_projects` / `index_status` — confirm indexed; call `index_repository` if not
2. `search_graph` — find symbols, routes, classes (`query` or `name_pattern`)
3. `trace_path` — callers/callees when a call chain matters
4. `get_code_snippet` — read only the smallest relevant slice (qualified name from step 2)

**Fallback** (graph unavailable or insufficient after one retry):
- `git diff --name-only` → targeted `rg` for a specific symbol → slice reads
- Never whole-file reads until graph + fallback exhausted

Cost comparison: graph query ≈ 500 tokens vs repo-wide grep ≈ 80 K tokens.

---

### 2. Speculative Scout → verify (`context-scout`, SCOUT schema)

Scout is the cheap draft step; the main agent verifies the SCOUT schema before acting.
Mirrors speculative decoding: draft model does cheap speculation; target model verifies cheaply.

#### SCOUT: schema (fixed output contract)

```md
SCOUT:
Goal: [verbatim from user]
Status: COMPLETE | INCOMPLETE
Key constraints (verbatim): [user's exact words or "none stated"]
Relevant files: [list with line ranges if known]
Call chain (if known): [A → B → C or n/a]
Next action: [concrete imperative sentence]
Tests: ran / not run
Risks: [1–3 bullets]
```

**Verbatim rule:** `Key constraints` must be the user's exact words — not paraphrased.
Paraphrasing is a schema violation and triggers re-scout.

**Verification gate** (main agent checks before Act):
- All fields non-empty / non-`n/a` (except `Call chain`)
- `Key constraints (verbatim)` not paraphrased
- `Relevant files` lists real paths (no invented paths)
- On rejection: re-scout, widen one read step; max 2 retries, then ask user

#### Per-command Scout timing

| Command | When Scout runs | Two-model routing |
|---|---|---|
| `/quick` | Phase 1 (built-in, always first) — before any Act edit | Scout: `haiku/mini` → Act: `sonnet/opus` |
| `/dev` | Start of Phase 1 Research — before Glob/Grep/Read; re-scout if context grew significantly between phases | Scout: `haiku/mini` → Research/Implement: `sonnet/opus` |
| `/fix` | Start of Phase 1 Bug Analysis — before bug-analyst deep dive | Scout: `haiku/mini` → Fix: `sonnet/opus` |

After Scout accepted: switch model, pass only `SCOUT:` block + original goal — not full conversation.

Full pattern doc: `~/Agents/docs/speculative-context.md`
Scout agent + re-scout rules: `~/Agents/agents/context-scout.md`

---

### 3. Karpathy guardrails

Load `~/Agents/agents/karpathy-guardrails.md` before every implementation step.

Lookup order:
1. `.ai/skills/agents/karpathy-guardrails.md`
2. `~/Agents/agents/karpathy-guardrails.md`

Four principles: **think first** → **simplest change** → **surgical edits** → **goal-driven execution**.

- Think before coding: state assumptions; ask when ambiguous; surface tradeoffs
- Simplicity first: minimum code; no speculative abstractions
- Surgical changes: touch only what the goal requires; match existing style
- Goal-driven execution: define verify steps; run tests when relevant

---

### 4. Layered guardrails (`guardrails-taxonomy.md`)

| Layer | Rail type | aicrew mechanism |
|---|---|---|
| Input | Secret / injection block | `hooks/security-guard.py` (PreToolUse — always active) |
| Scope | Topic control | Intake acceptance criteria (`/dev` Phase 0 Checkpoint C; `/fix` intake; `/quick` `SCOUT Goal:`) |
| Phase gate | Dialog flow | Phase gates — user confirmation required before advancing |
| Implementation | Think-before-coding | `karpathy-guardrails` (capability 3 above) |
| Output | Security scan | `security-reviewer` (Phase 6 `/dev`; Phase 4 `/fix`; end of `/quick` Act) + `conclude` |
| Context budget | Headroom rail | `/lean` read policy + phase `/compact` (capability 8 below) |

Full taxonomy: `~/Agents/docs/guardrails-taxonomy.md`

---

### 5. Context-economy read policy

- `context-economy` read policy active every session (not opt-in)
- diff/tree/search before file reads; slice over whole-file
- reuse prior summaries unless file changed
- `/lean on` amplifies enforcement — tightens to diff/tree/graph-only until explicitly overridden

See: `~/Agents/agents/context-economy.md`

---

### 6. `security-guard.py` hooks

PreToolUse hook that fires before every file write:
- Blocks PEM private keys and AWS secrets outright
- Warns on high-entropy strings or hardcoded tokens
- Always active — cannot be disabled per-command

Set `ECC_HOOK_PROFILE=strict` for maximum verbosity, `minimal` to quiet non-blocking warnings.
Hook source: `~/Agents/hooks/security-guard.py`

---

### 7. `.ai/state` checkpoints

Write/update `.ai/state/AI_STATE.<tool>.<session>.md` after every checkpoint and phase boundary.

- File pattern: `.ai/state/AI_STATE.<tool>.<session>.md`
- If `/session` was used, `<tool>` and `<session>` come from there; otherwise use `unknown-<YYYY-MM-DD>-<HHMM>`
- If filesystem write tools are unavailable, output the full state file so the user can paste it

Format spec: `~/Agents/agents/state-checkpoint.md`

---

### 8. `/compact` between phases

Run `/compact` (or equivalent context-pruning) at every phase boundary before the next phase starts.

- Prunes stale context accumulated during the previous phase
- Prevents earlier phases from crowding the context window during implementation
- Applies to all commands: `/dev` at each of 9 gates, `/fix` at each of 5 gates, `/quick` after Scout

---

### 9. `/handoff` on tool switch

When switching tool or model mid-task, run `/handoff` to prune the conversation:
- Writes a compact `.ai/state/AI_STATE.<tool>.<session>.md` (~300 tokens)
- The new tool receives only the SCOUT block + state file — not the full conversation
- Saves ~14 K tokens per tool switch vs re-pasting the whole chat

Full spec: `~/Agents/commands/handoff.md`

---

### 10. Optional: `context-mode` + `token-optimizer-mcp`

| MCP server | When to use |
|---|---|
| `codebase-memory-mcp` | Primary graph oracle (capability 1 above) — always preferred |
| `context-mode` | Session-level output shaping when Scout output needs further compression |
| `token-optimizer-mcp` | Cache-aware response shaping for repeated Scout calls; biggest impact on sessions > 30 min |

These are optional accelerators — enable when graph queries alone don't relieve window pressure.

---

### 11. Caveman default output

All commands default to terse/caveman output style:
- Lead with the answer; drop filler phrases and preamble
- `/normal` or `/lean off` restores full verbosity when prose is needed
- `/terse` or `/lean` re-enables lean mode if it was restored

See: `~/Agents/agents/caveman.md`

---

## Quick reference card

```
Stack (all 3 commands — identical):
  1  graph MCP       → list_projects → search_graph → trace_path → get_code_snippet
  2  Scout→verify    → cheap model → SCOUT: schema → verify → capable model acts
  3  Karpathy        → think → simplest → surgical → goal-driven
  4  guardrails      → security-guard (input) → scope → phase gate → karpathy → security-reviewer (output) → budget
  5  context-economy → always on; /lean amplifies; diff/tree/search before file reads
  6  security-guard  → PreToolUse hook; always active; blocks secrets
  7  .ai/state       → AI_STATE.<tool>.<session>.md at every checkpoint
  8  /compact        → between every phase boundary
  9  /handoff        → on tool switch; SCOUT block + state file only
  10 context-mode    → optional; cache-aware shaping for long sessions
  11 caveman         → terse by default; /normal for verbose

Depth only (no token difference):
  /dev   → 9 phases (intake → research → brainstorm → design → implement → tests → security → audit → conclude)
  /fix   → 5 phases (intake → bug analysis → implement → tests → security → conclude)
  /quick → 2 phases (Scout → Act)
```

---

## Related

- `~/Agents/docs/speculative-context.md` — full Scout pattern with architecture diagram + failure modes
- `~/Agents/agents/context-scout.md` — scout agent (schema, re-scout rules, model selection)
- `~/Agents/agents/karpathy-guardrails.md` — four implementation principles
- `~/Agents/agents/context-economy.md` — default read policy
- `~/Agents/docs/guardrails-taxonomy.md` — NeMo rail types ↔ aicrew mechanisms
- `~/Agents/hooks/security-guard.py` — input rail implementation
- `~/Agents/agents/state-checkpoint.md` — state file format spec
- `~/Agents/agents/caveman.md` — terse output style guide
