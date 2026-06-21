# How aicrew Saves Tokens — Plain-English Guide

This document explains every token-saving mechanism in aicrew: what the problem is, how the mechanism works, and what you can expect to save. No prerequisites — written for anyone who uses AI coding tools daily.

> **See it yourself:** `aicrew benchmark --report` scans your project and writes a per-session `TOKEN_REPORT` to `.ai/reports/`. All numbers are clearly labeled **estimated**.

---

## A. Speculative Decoding — applied to multi-agent work

### The original idea (LLM inference)

In standard LLM inference, generating each token is expensive: the model must run a full forward pass. **Speculative decoding** (Leviathan et al., 2023) cuts that cost with a two-model trick:

1. A **cheap draft model** proposes the next several tokens quickly.
2. The **capable target model** *verifies* the draft in a single forward pass — accepting tokens that are correct and rejecting those that aren't.
3. If accepted, the target model does almost no extra work; it only re-generates at the first rejection point.

The insight: verification is much cheaper than generation from scratch. The draft model does the speculation; the target model only spends full compute when the draft fails.

### How aicrew maps this to multi-agent orchestration

aicrew applies the same logic at the **agent level**, not the token level:

| Speculative decoding | aicrew multi-agent equivalent |
|---|---|
| Draft model (cheap, fast) | **Scout agent** — a fast/cheap model (Haiku, gpt-4o-mini) |
| Target model (capable, slow) | **Main (Act) agent** — a capable model (Sonnet, Opus, gpt-4o) |
| Draft token sequence | **`SCOUT:` block** — a fixed 1–2 K token schema emitted by Scout |
| Verification step | Main agent checks Scout's schema fields; rejects if incomplete or paraphrased |
| Accept → continue | Act phase proceeds; main agent never sees the raw repo |
| Reject → re-draft | Scout re-runs with a wider read policy (max 2 retries) |

**Why it saves so many tokens:** a repo-wide `grep` costs ~80,000 tokens. A Scout graph query costs ~500 tokens. The main model receives only the 1–2 K `SCOUT:` block, not the raw repository — so it pays Scout's cost, not grep's cost.

### ASCII diagram

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
│  • all fields        │
│    non-empty         │
│  • constraints       │
│    verbatim,         │   REJECT ──► re-scout
│    not paraphrased   │             (or widen read)
│  • no "unknown"      │
│    in critical       │
│    fields            │
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

### When speculative context helps

Use it when:
- You're exploring a large codebase before making changes.
- You're switching models or tools mid-session (context must stay small).
- The task has a clear discovery phase before implementation (`/quick`, Phase 1 of `/dev`).
- Your context window is at risk of filling before the implementation even starts.

Skip it when:
- The task is tiny and the Scout call would cost more than just reading one file.
- The goal is ambiguous — Scout will mis-scope. Run `/dev` intake first.
- The main agent already has full context from a prior turn.

### The `SCOUT:` schema (fixed output contract)

Scout must emit this exact block — no extra fields, no paraphrasing of constraints:

```
SCOUT:
Goal:
Status: COMPLETE | INCOMPLETE
Key constraints (verbatim): [user's exact words or "none stated"]
Relevant files: [list with line ranges if known]
Call chain (if known): [A → B → C or n/a]
Next action: [concrete imperative sentence]
Tests: ran / not run
Risks: [1–3 bullets]
```

The **verbatim constraint rule** is critical: if the user said "do not touch auth middleware", the constraint field must say exactly that — not "preserve auth layer". Paraphrasing is a schema violation and triggers a re-scout.

**Deep dive:** [`skills/docs/speculative-context.md`](./speculative-context.md) covers two-model routing, failure modes, and recommended model defaults per tool.

---

## B. Graph Memory — `codebase-memory-mcp`

### The problem with grep

When an AI agent needs to understand "what calls `authMiddleware`?", the naive approach reads many files to search. A typical repo-wide grep costs **~80,000 tokens** — most of which is irrelevant code that passes through context and is immediately discarded.

This is the biggest single source of token waste in AI coding tools.

### How graph memory works

`codebase-memory-mcp` indexes your project into a **knowledge graph** once, then answers structural questions with targeted queries.

```
┌─────────────────────────────────────────────────────┐
│  codebase-memory-mcp (knowledge graph)              │
│                                                     │
│  index_repository → builds symbol graph             │
│  search_graph     → find symbol/class/route by name │
│  trace_path       → caller/callee chain              │
│  get_code_snippet → read only the relevant slice    │
└─────────────────────────────────────────────────────┘
```

**Cost comparison:**

| Query | Approach | Token cost |
|---|---|---|
| "What calls `authMiddleware`?" | repo-wide grep | ~80,000 tokens |
| "What calls `authMiddleware`?" | `search_graph` query | ~500 tokens |
| Saving | | **~79,500 tokens (160×)** |

### The workflow: index → search → snip

```
1. index_repository    ← one-time per project (or on new commits)
2. search_graph        ← find the symbol you care about (~500 tokens)
3. trace_path          ← optional: follow the call chain
4. get_code_snippet    ← read only the function/class you need
```

aicrew's `context-economy` policy enforces this order: **graph query before any Grep/Glob/Read**. If the graph can't answer after one retry, the fallback is `git diff --name-only` → targeted `rg` for a specific symbol → slice reads. Full-file reads are the last resort.

**Typical saving:** ~79,500 tokens per query cycle. For a `/dev` session with 3 research queries, that's ~238,500 tokens saved vs. naive grep.

---

## C. Other Token Savers

### `/lean` + context-economy (slice reads)

**Problem:** AI agents default to reading whole files even when only 3 lines matter. A 500-line file costs 500+ tokens whether you needed 3 lines or all 500.

**Mechanism:** `/lean on` activates the `context-economy` read policy:
1. `git diff` first — see only what changed (~50 tokens for a small change)
2. Directory tree — understand structure without reading files (~200 tokens)
3. Graph query — find the symbol (see B above)
4. Slice read — read only the relevant function/block, not the whole file
5. Whole-file read — only if nothing above was sufficient

**Typical saving:** ~70% fewer tokens on research phases. Reading 30 lines instead of 500 = 14× fewer read tokens for that file.

**To enable:** type `/lean on` (Claude Code) or use the `lean` skill (Codex). To disable: `/lean off` or `/normal`.

---

### Phase `/compact` in `/dev`

**Problem:** The 9-phase `/dev` pipeline accumulates context. By Phase 6, the agent's context window contains all the conversation from Phases 0–5 — most of which is no longer relevant. This "stale context" crowds out the current work and eventually fills the window.

**Mechanism:** `/dev` runs `/compact` automatically at every phase boundary. Compaction prunes the accumulated conversation, keeping only:
- The current phase goal
- Active acceptance criteria
- The state file checkpoint
- The last Scout block (if applicable)

**Typical saving:** ~60% context reduction at each phase boundary. For a 9-phase session, each phase starts fresh instead of carrying Phase 1's full conversation forward.

**No action needed** — this is automatic in `/dev`.

---

### `/handoff` + `.ai/state/` (no chat replay)

**Problem:** Switching from Cursor to Claude Code mid-task means re-pasting the full conversation. A 50-turn chat history can cost 15,000–20,000 tokens just to re-establish context in the new tool.

**Mechanism:** `/handoff` writes a compact checkpoint file at `.ai/state/AI_STATE.<tool>.<session>.md`. This file is ~300 tokens and contains everything the new tool needs:
- Goal (verbatim)
- Current status
- Key constraints (verbatim)
- Relevant files (paths only)
- Latest errors/logs (verbatim, short)
- Next step (single exact action)
- Test status

Instead of pasting the full chat, you paste just this 300-token file into the new tool.

**Typical saving:** ~14,700 tokens per tool switch (300 tokens vs. ~15,000 for a medium session replay).

**To use:** run `/handoff` before switching tools; paste the `.ai/state/` output into the new session.

---

### Caveman default (fewer output tokens)

**Problem:** AI tools produce verbose responses — explanations, caveats, rephrasing of what you said, filler. A response that could be 80 words often comes out as 200. Output tokens cost money and fill the context window.

**Mechanism:** aicrew defaults to **caveman/lean style** — no opt-in required:
- Lead with the answer or action; short sentences
- No filler, pleasantries, or hedging
- Keep technical strings verbatim (paths, commands, errors, versions)
- Safety exception: destructive actions and security warnings remain explicit

**Typical saving:** ~35% fewer output tokens. 200-word verbose answer → 80-word direct answer.

**To disable:** `/normal` or `/lean off` restores full verbosity. Use when you want prose explanations (e.g. handoff docs, planning sessions).

---

### Layered guardrails (fail fast, less wasted exploration)

**Problem:** Without guardrails, an AI agent may explore the wrong solution for multiple turns before realizing scope was wrong — burning thousands of tokens on work that gets thrown away.

**Mechanism:** aicrew uses a layered guardrail stack (inspired by NVIDIA NeMo Guardrails' rail taxonomy):

| Layer | What it does | Token saving |
|---|---|---|
| **Input rail** (`security-guard.py`) | Blocks secrets before they land in files — catches the problem in 1 turn instead of after a failed commit | Prevents multi-turn rollback cycles |
| **Scope lock** (Intake Phase 0) | Locks acceptance criteria before any code changes — prevents mid-task scope drift | Prevents wasted implementation turns |
| **Phase gates** | Each phase requires explicit confirmation — agent never invents your response and proceeds | Prevents multi-phase rollbacks |
| **Karpathy guardrails** (Act phase) | Think first, simplest change, surgical edits — prevents over-engineering before it happens | Prevents large unwanted diffs |
| **Output rail** (`security-reviewer`) | Scans changed files before the session concludes — catches issues before a re-implementation cycle | Prevents costly rework |

**Typical saving:** Hard to quantify precisely, but guardrails prevent the most expensive failure mode: a multi-phase implementation that turns out to be wrong. Each prevented rollback saves thousands of tokens.

**Deep dive:** [`skills/docs/guardrails-taxonomy.md`](./guardrails-taxonomy.md) maps NeMo rail types to every aicrew primitive.

---

### `context-mode` / `token-optimizer-mcp` (optional MCP)

**Problem:** Long sessions (30+ minutes) accumulate KV-cache misses as context grows. Each new turn re-encodes the growing history, and repeated prompts "re-spend" tokens that should have been cached.

**Mechanism:**
- **`context-mode`** shapes session output — compresses stale context between phases and keeps the active window focused on current work.
- **`token-optimizer-mcp`** provides cache-aware response shaping for repeated Scout calls — if the same Scout query runs twice (e.g. after a tool switch), the cached version is returned instead of re-generating.

**Typical saving:** Varies by session length. Biggest on sessions over 30 minutes or with many repeated queries. Small sessions see minimal benefit; very long `/dev` sessions can see 20–40% cache efficiency improvement.

**To use:** Both are optional MCP servers. Install and configure via `config/mcp/` — `aicrew install` wires them automatically if present.

---

### Headroom-inspired CCR / rolling window (context budget rail)

**Problem:** Context window space is a resource. Most agents treat it as infinite until it suddenly isn't. By the time the window fills, you lose mid-session work or must restart.

**Mechanism:** Inspired by [chopratejas/headroom](https://github.com/chopratejas/headroom) (Apache 2.0), aicrew implements several of Headroom's compression patterns as lightweight agent policy — no Python dependency added:

| Headroom concept | aicrew equivalent |
|---|---|
| **CCR — Compress-Cache-Retrieve** | Scout slice reads + `/handoff` state compaction |
| **ContentRouter** | `/quick` Scout routes exploration to graph before file reads |
| **CacheAligner** | `AGENTS.md`/`CLAUDE.md` stay stable — maximises KV-cache prefix hits |
| **RollingWindow** | `/lean` + `context-economy` drop lower-value reads between turns |
| **`headroom learn` → AGENTS.md** | `/conclude` learnings section proposes corrections to `AGENTS.md` |

The **context budget rail** in aicrew treats remaining context window as a named guardrail: every read must justify its token cost, and the budget is protected across all command phases.

**Deep dive:** The full Headroom-pattern mapping is in [`skills/docs/guardrails-taxonomy.md`](./guardrails-taxonomy.md#headroom-inspired-context-budget-rail).

---

### aicrew benchmark — how estimates work

**Problem:** Token savings are invisible by default. Without numbers, it's hard to know which lever to pull for your specific project.

**Mechanism:** `aicrew benchmark --report` scans your project and estimates token usage:

1. **Baseline** — naive full-read approach: counts files and estimates the cost if every research query read whole files via grep. Formula: `(total file bytes / 4)` per typical grep scan.

2. **aicrew estimate** — same queries routed through the aicrew stack: graph query (~500 tok) + Scout block (~1.5 K tok) + targeted slice reads.

3. **Per-feature breakdown** — shows which lever saves the most for your specific codebase size.

4. **Writes to** `.ai/reports/TOKEN_REPORT.<timestamp>.md` — a human-readable report you can compare across sessions.

**All figures are estimated** — exact counts require your tool's token-usage log. The benchmark uses documented ratios (grep ~80K vs graph ~500 tok) applied to your actual file count and size.

```bash
aicrew benchmark --report        # scan cwd and write report
aicrew benchmark -s "my-session" -r  # label the report
```

---

## Quick reference card

```
Research:     graph MCP → diff → targeted grep → slice read (in that order)
Scout:        cheap model → SCOUT: schema → verify → capable model acts
Guardrails:   security-guard (input) → scope lock → phase gate → karpathy → security-reviewer (output) → budget
Economy:      context-economy always on; /lean amplifies; /compact between phases
State:        .ai/state/AI_STATE.*.md at every checkpoint; /handoff to switch tools
Output:       caveman by default; /normal for prose; /terse to re-enable
```

---

## Related docs

- [`skills/docs/speculative-context.md`](./speculative-context.md) — deep dive: two-model routing, SCOUT schema, failure modes, model selection table
- [`skills/docs/token-foundation.md`](./token-foundation.md) — shared token stack reference used by all entry-point commands
- [`skills/docs/guardrails-taxonomy.md`](./guardrails-taxonomy.md) — NeMo rail types ↔ aicrew mechanisms, Headroom pattern mapping
- [THIRD_PARTY_NOTICES.md](../../THIRD_PARTY_NOTICES.md) — attribution for all inspiration sources and MCP dependencies
