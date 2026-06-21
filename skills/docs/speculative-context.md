# Speculative Context — Pattern Doc

**Yes, speculative decoding maps cleanly onto multi-agent orchestration.**

---

## The Analogy

| Speculative decoding | aicrew multi-agent equivalent |
|---|---|
| Draft model (cheap, fast) | Scout agent (`haiku` / `mini` / fast model) |
| Target model (capable, slow) | Main agent (`sonnet` / `opus` / full model) |
| Draft tokens | SCOUT schema output (1–2 K tokens) |
| Verification step | Main agent checks scout for completeness; rejects and re-scouts if schema fields are missing or drift detected |
| Acceptance → continue | Act phase proceeds only when Scout `Key constraints (verbatim)` are fully populated |
| Rejection → re-draft | Scout re-runs (or main agent falls back to direct read) |

**Core insight:** the draft model in speculative decoding does the cheap speculative work; the target model does the cheap *verification* and only burns full compute when the draft is good. In multi-agent terms: Scout pays ~500 tokens (graph query) vs ~80 K (repo-wide read). Main agent consumes Scout's 1–2 K summary, not the raw repo.

---

## Architecture (ASCII)

```
User / Orchestrator
        │
        ▼
┌─────────────────────┐   cheap fast model
│   SCOUT AGENT       │   (haiku / mini / fast)
│                     │
│  1. graph query     │   ~500 tok
│  2. diff / tree     │   ~1–2 K tok
│  3. emit SCOUT:     │   fixed schema ↓
│     block (1–2 K)   │
└────────┬────────────┘
         │  SCOUT: block
         ▼
┌─────────────────────┐
│  VERIFICATION GATE  │   (orchestrator / main model)
│                     │
│  • all fields non-  │
│    empty / non-n/a  │
│  • constraints      │
│    verbatim not     │   REJECT ──► re-scout
│    paraphrased      │             (or widen read)
│  • no "unknown"     │
│    in critical      │
│    fields           │
└────────┬────────────┘
         │  ACCEPT
         ▼
┌─────────────────────┐   full capable model
│   MAIN (ACT) AGENT  │   (sonnet / opus / slow)
│                     │
│  Receives only      │
│  SCOUT: block +     │
│  original goal.     │
│  Never sees raw     │
│  repo content.      │
└─────────────────────┘
```

---

## When to use this pattern

Use speculative context when:
- Context window is at risk (long `/dev` sessions, large repos)
- You are switching models mid-session (Cursor → Codex → Claude)
- The task has a clear discovery phase before implementation
- You want `/quick` to scale to larger scopes without blowing cost

Skip it when:
- Task is tiny and Scout would cost more than just reading the file
- Goal is ambiguous enough that Scout will mis-scope (use `/dev` intake first)
- The main agent already has full context from a prior turn

---

## SCOUT: schema (fixed output contract)

Scout MUST emit this exact block — no extra fields, no paraphrasing of constraints:

```md
SCOUT:
Goal:
Status:
Key constraints (verbatim):
Relevant files:
Call chain (if known):
Next action:
Tests: ran / not run
Risks:
```

**Verbatim constraint rule:** if the user said "do not touch auth middleware", the constraint field MUST say `do not touch auth middleware` — not "preserve auth layer" or "auth safe". Paraphrasing is a schema violation and triggers re-scout.

---

## Two-model routing

### In Cursor / Claude Code

Use model picker or `@` mentions:
- Scout turn: use `claude-haiku-*` or equivalent fast model
- Act turn: switch to `claude-sonnet-*` or `claude-opus-*`

### In Codex / scripts

Pass `model` at launch or via env:
```bash
# Scout
OPENAI_DEFAULT_MODEL=gpt-4o-mini codex run --skill aicrew-quick -- scout-only "..."

# Act (feed SCOUT: block from above)
OPENAI_DEFAULT_MODEL=gpt-4o codex run --skill aicrew-quick -- act-only "..."
```

### Recommended defaults

| Role | Cursor | Codex | Claude Code |
|---|---|---|---|
| Scout | `claude-3-5-haiku` | `gpt-4o-mini` | `claude-haiku-3-5` |
| Main (Act) | `claude-sonnet-4` | `gpt-4o` | `claude-sonnet-4` |
| Fallback (deep) | `claude-opus-4` | `o3` | `claude-opus-4` |

---

## Failure modes and mitigations

| Failure mode | Symptom | Mitigation |
|---|---|---|
| **Summary drift** | Scout paraphrases constraints; Act violates user intent | Verbatim constraint rule + reject-on-paraphrase gate |
| **Scope hallucination** | Scout invents files that don't exist | Main agent cross-checks `Relevant files` with actual fs before acting |
| **Incomplete scout** | `n/a` in `Key constraints` or `Next action` | Reject-and-re-scout; allow one retry with wider read policy |
| **Over-compression** | Scout omits a critical dependency | Main agent runs one targeted `get_code_snippet` before Act if risk field is non-trivial |
| **Model capability gap** | Scout model too weak; misses subtle constraints | Use a stronger scout (bump to sonnet) or run Scout with the main model once, then cache result |
| **Cost regression** | Two model calls > one direct call for trivial tasks | Size gate: skip Scout if estimated context < 4 K tokens |

---

## Integration with existing aicrew primitives

| Primitive | Role in speculative context |
|---|---|
| `/quick` Scout phase | **IS** the draft model step |
| `SCOUT:` schema | Fixed output contract (the "token sequence") |
| `codebase-memory-mcp` | Scout's primary graph oracle — keeps draft cost ≈ 500 tok |
| `context-economy` | Read policy for Scout: diff/slice/graph before whole-file |
| `context-mode` MCP | Session-level shaping when compressing Scout output further |
| `token-optimizer-mcp` | Cache-aware response shaping for repeated Scout calls |
| `/handoff` + `.ai/state/` | Pass SCOUT: block across tool/model boundaries |
| `karpathy-guardrails` | Main agent's Act guardrails (verification already happened) |

---

## Related

- `skills/commands/quick.md` — `/quick` Scout → Act command (implements this pattern)
- `skills/agents/context-scout.md` — dedicated scout agent with schema enforcement and re-scout rules
- `skills/docs/guardrails-taxonomy.md` — NeMo/Headroom/aicrew rail mapping
- `skills/agents/context-economy.md` — read policy (Scout uses this)
