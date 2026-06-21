# Token Foundation — mandatory for /dev, /fix, /quick

Shared token-saving stack applied by all aicrew entry-point commands.
Commands reference this doc; do not duplicate these rules locally.

---

## 1. Graph-first research (codebase-memory-mcp)

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

## 2. Speculative context (Scout → verify → Act)

Scout is the cheap draft step; main agent verifies the SCOUT schema before acting.
Mirrors speculative decoding: draft model does cheap speculation; target model verifies cheaply.

### SCOUT: schema (fixed output contract)

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

### Per-command integration

| Command | Scout step | Timing |
|---|---|---|
| `/quick` | Phase 1 (built-in) | Always; before any Act edit |
| `/dev` | Start of Phase 1 Research | Before Glob/Grep/Read; re-scout if context grew significantly between phases |
| `/fix` | Start of Phase 1 Bug Analysis | Before bug-analyst deep dive |

### Two-model routing (optional)

| Step | Recommended model |
|---|---|
| Scout (cheap draft) | `claude-3-5-haiku` / `gpt-4o-mini` |
| Research / Implement (capable) | `claude-sonnet-4` / `gpt-4o` |
| Deep fallback | `claude-opus-4` / `o3` |

After Scout accepted: switch model, pass only `SCOUT:` block + original goal — not full conversation.

Full pattern doc: `~/Agents/docs/speculative-context.md`
Scout agent + re-scout rules: `~/Agents/agents/context-scout.md`

---

## 3. Layered guardrails

| Layer | Rail type | aicrew mechanism |
|---|---|---|
| Input | Secret / injection block | `hooks/security-guard.py` (PreToolUse — always active) |
| Scope | Topic control | Intake acceptance criteria (`/dev` Phase 0 Checkpoint C; `/quick` `SCOUT Goal:`) |
| Phase gate | Dialog flow | Phase gates — user confirmation required before advancing |
| Implementation | Think-before-coding | `karpathy-guardrails` in Phase 4 Implement (and `/quick` Act) |
| Output | Security scan | `security-reviewer` (Phase 6 `/dev`; Phase 4 `/fix`) + `conclude` |
| Context budget | Headroom rail | `/lean` read policy + phase `/compact` |

**Load karpathy-guardrails for every implementation step:**
1. `.ai/skills/agents/karpathy-guardrails.md`
2. `~/Agents/agents/karpathy-guardrails.md`

Summary: think first → simplest change → surgical edits → goal-driven execution.

Full taxonomy: `~/Agents/docs/guardrails-taxonomy.md`

---

## 4. Context economy (always on, not opt-in)

- `context-economy` read policy active every session
- diff/tree/search before file reads; slice over whole-file
- reuse prior summaries unless file changed
- `/lean on` amplifies enforcement
- Run `/compact` between major phases (prevents stale context accumulation)

See: `~/Agents/agents/context-economy.md`

---

## 5. State / handoff

- Write/update `.ai/state/AI_STATE.<tool>.<session>.md` at every checkpoint
- `/handoff` prunes conversation before tool/model switch — pass only SCOUT block + state file
- Format spec: `~/Agents/agents/state-checkpoint.md`

---

## 6. Optional MCP accelerators

| MCP server | When to use |
|---|---|
| `codebase-memory-mcp` | Primary graph oracle (step 1 above) |
| `context-mode` | Session-level output shaping when Scout output needs further compression |
| `token-optimizer-mcp` | Cache-aware response shaping for repeated Scout calls |

---

## Quick reference card

```
Research:   graph MCP → diff → targeted grep → slice read (in that order)
Scout:      cheap model → SCOUT: schema → verify → capable model acts
Guardrails: security-guard (input) → scope lock → phase gate → karpathy → security-reviewer (output) → budget
Economy:    context-economy always on; /lean amplifies; /compact between phases
State:      .ai/state/AI_STATE.*.md at every checkpoint
```

---

## Related

- `~/Agents/docs/speculative-context.md` — full Scout pattern with architecture diagram + failure modes
- `~/Agents/agents/context-scout.md` — scout agent (schema, re-scout rules, model selection)
- `~/Agents/agents/karpathy-guardrails.md` — four implementation principles
- `~/Agents/agents/context-economy.md` — default read policy
- `~/Agents/docs/guardrails-taxonomy.md` — NeMo rail types ↔ aicrew mechanisms
- `~/Agents/hooks/security-guard.py` — input rail implementation
