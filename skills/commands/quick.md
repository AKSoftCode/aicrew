---
description: "Scout → Act flow with graph-first discovery, speculative context, and Karpathy guardrails (no full /dev pipeline)"
argument-hint: "[goal or task description]"
---

**Lowest-overhead entry point — Scout → Act. Graph-first discovery (graph query ~500 tok; Scout pass may also use targeted diff/tree reads) emits a fixed `SCOUT:` schema (~1–2 K); the main model acts from that block only. Use for small, well-scoped tasks where you don't need the full `/dev` pipeline.**

> **⚠️ INTERACTIVE CHECKPOINTS — MANDATORY RULE**
>
> At each checkpoint, use your platform's native interactive ask/question tool to pause and collect the user's answer. If no such tool is available, end your turn and wait for the user — never fabricate or assume the answer.
>
> **Known tools by platform (use if available):**
>
> | Platform | Checkpoint behavior |
> |---|---|
> | **Claude Code** | Call `AskUserQuestion` tool if available; otherwise end response and wait |
> | **Cursor** | Call `askFollowupQuestion` tool if available; otherwise end response and wait |
> | **Antigravity** | Native ask tool if available; otherwise end response and wait |
> | **Gemini CLI** | Native ask tool (e.g. `ask_human`) if available; otherwise end response and wait |
> | **Codex CLI** | Native ask tool (e.g. `ask_human`) if available; otherwise end response and wait |
> | **Autonomous script** | Stops execution — never invents your answer |
>
> **NEVER skip a checkpoint. NEVER fabricate the user's response.**

---

## Usage-limit resilience (state checkpoints) — mandatory

Create or update a per-session file under `.ai/state/`:

- File pattern: `.ai/state/AI_STATE.<tool>.<session>.md`
- Update **after Scout** (Checkpoint B) and **at the end of Act**.
- If `/session` was used, `<tool>` and `<session>` come from there. Otherwise use:
  `.ai/state/AI_STATE.unknown.unknown-<YYYY-MM-DD>-<HHMM>.md`

If filesystem write tools are unavailable, output the full state file so the user can paste it.

Format: `~/Agents/agents/state-checkpoint.md`

---

# /quick — Scout → Act (graph-first, Karpathy guardrails)

Lightweight alternative to `/dev`. Two phases: **Scout** (discover) then **Act** (implement).

Use `/dev` when you need brainstorming, design spec, security phase, or full pipeline gates.
Use `/fix` for bugs with mandatory TDD and security review.

## Auto-detect project context (silently)

- `ls .ai/team/roles/` → use team roles if available
- `ls .ai/skills/agents/` → prefer project agents
- Detect stack: `pubspec.yaml` / `requirements.txt` / `package.json`
- Read `CLAUDE.md` or `AGENTS.md` if present
- Check `codebase-memory-mcp` availability (`index_status` or `list_projects`)

### Agent lookup order

1. Project: `.ai/skills/agents/[agent].md`
2. Global: `~/Agents/agents/[agent].md`

---

## CHECKPOINT A — Intake

If `$ARGUMENTS` states the goal clearly, confirm in one line. Otherwise ask:

> What should we accomplish?
> 1. One-line goal
> 2. Must-not-break constraints (or "none known")
> 3. Done when: [acceptance criterion]

**Wait for answers.**

State acceptance criteria, then say **go** to start Scout (or adjust).

---

## Token foundation (mandatory)

All phases share the same 11-capability token-saving stack. Full reference: `~/Agents/docs/token-foundation.md`.

1. **Graph-first** (`codebase-memory-mcp`) — `list_projects` → `search_graph` → `trace_path` → `get_code_snippet`. Fallback: `git diff --name-only` → targeted grep → slice reads only.
2. **Speculative Scout → verify** (`context-scout`, SCOUT schema) — Scout **IS** Phase 1 (built-in, always first); Act is Phase 2. Two-model routing: Scout on `haiku/mini`, Act on `sonnet/opus`.
3. **Karpathy guardrails** — load `~/Agents/agents/karpathy-guardrails.md` before every implementation step: think → simplest → surgical → goal-driven.
4. **Layered guardrails** (`guardrails-taxonomy.md`) — input → scope/topic → phase gate → implementation → output → context budget.
5. **Context-economy read policy** — diff/tree/search before file reads; slice over whole-file; always on; `/lean on` amplifies.
6. **`security-guard.py` hooks** — PreToolUse hook; blocks secrets before any file write; always active.
7. **`.ai/state` checkpoints** — write/update `AI_STATE.<tool>.<session>.md` after every checkpoint.
8. **`/compact` between phases** — run at every phase boundary to prune stale context before the next phase.
9. **`/handoff` on tool switch** — prunes conversation to SCOUT block + state file before switching tool or model.
10. **Optional: `context-mode` + `token-optimizer-mcp`** — session-level output shaping and cache-aware response shaping; biggest impact on sessions > 30 min.
11. **Caveman default output** — terse by default; `/normal` or `/lean off` for verbose. See `~/Agents/agents/caveman.md`.

See full reference and rationale: `~/Agents/docs/token-foundation.md`

---

## READ POLICY — graph first, lean integrated

**Forbidden until Scout completes or user explicitly overrides:** raw `Grep`, `Glob`, or `Read` of whole files.

Apply **context-economy** (`~/Agents/agents/context-economy.md`). When `/lean on` is active, follow it strictly; when `/lean off` or `/normal`, still prefer graph/slice reads during Scout.

### Scout discovery order

1. **Graph MCP** (if `codebase-memory-mcp` is available):
   - `list_projects` / `index_status` — confirm indexed; call `index_repository` if not
   - `search_graph` — find symbols, routes, classes (`query` or `name_pattern`)
   - `trace_path` — callers/callees when a call chain matters
   - `get_code_snippet` — read only the smallest relevant slice (qualified name from search)
2. **Fallback** (only if graph is unavailable or insufficient after one retry):
   - `git diff --name-only`, `git diff`, compact tree/list
   - Targeted search to locate files — still no whole-file reads

If Scout cannot locate the target after graph + fallback, **stop and ask** for a file hint or permission to broaden reads.

---

## PHASE 1 — SCOUT

**Goal:** Map the problem space before touching code. No implementation in this phase.

Produce exactly this block (fill every field; use `n/a` when unknown):

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

### CHECKPOINT B — Confirm Scout

**Wait for confirmation** before Act — user may correct Scout or say **go**.

After Scout confirmed: write/update `.ai/state/AI_STATE.<tool>.<session>.md`.

---

## PHASE 2 — ACT

**Goal:** Execute the Scout `Next action` with Karpathy guardrails.

Load and follow **karpathy-guardrails** (lookup order):
1. `.ai/skills/agents/karpathy-guardrails.md`
2. `~/Agents/agents/karpathy-guardrails.md`

### Karpathy guardrails (summary)

1. **Think Before Coding** — state assumptions; ask when ambiguous; surface tradeoffs
2. **Simplicity First** — minimum code; no speculative abstractions
3. **Surgical Changes** — touch only what the goal requires; match existing style
4. **Goal-Driven Execution** — define verify steps; run tests when relevant

### Act rules

- Implement only what Scout identified and the user confirmed
- If scope grows: stop, update SCOUT, re-confirm
- Run targeted tests when the goal involves behavior
- TypeScript: `tsc --noEmit` when types may be affected
- After Act: update state file; show `git diff --stat` if files changed
- **Do not commit** unless the user asks

Test commands by stack:
- Python: `venv/bin/pytest -q --tb=short`
- Node.js: `npm test` or `npx jest`
- Flutter: `flutter test`
- React/TS: `pnpm run test:unit` or `npm test`

### CHECKPOINT C — Act complete

Report summary, diff stat, and proposed commit message (if applicable). **Wait** if user asked for review before commit.

### Act footer

- Tests: ran / not run
- Assumptions: critical only
- Risks: 1–3 bullets

---

## When to escalate

| Situation | Use instead |
|---|---|
| Bug needs reproduce-first TDD + security | `/fix` |
| Feature needs design spec or 3 options | `/dev` |
| Schema/migration or infra deps changed | `/dev` (Phase 8) |
| User says "override scout" | May use Grep/Read — note override in Scout block |

---

## Related docs

- Token foundation (shared stack): `~/Agents/docs/token-foundation.md`
- Speculative context pattern: `~/Agents/docs/speculative-context.md`
- Scout agent (schema + re-scout rules): `~/Agents/agents/context-scout.md`
- NeMo-style guardrails mapping: `~/Agents/docs/guardrails-taxonomy.md`
- Lean mode: `/lean on` + `~/Agents/commands/lean.md`
- Session labels: `/session <tool> <label>`
