# Guardrails Taxonomy — NeMo Rail Types mapped to aicrew

NeMo Guardrails defines a structured taxonomy of rail types for LLM pipelines.
This document maps those concepts to their aicrew equivalents without introducing
a NeMo Python dependency. Everything here runs on the existing hook + phase-gate system.

Reference: [NeMo Guardrails documentation](https://docs.nvidia.com/nemo/guardrails/latest/)

---

## Rail Type Mapping

| NeMo Rail Type | Description | aicrew Equivalent |
|---|---|---|
| **Input rails** | Intercept and validate user/tool input before the model acts | `hooks/security-guard.py` (PreToolUse) |
| **Output rails** | Inspect model output before it reaches the user or downstream | `security-reviewer` agent (Phase 6) + `conclude` phase |
| **Topic control** | Restrict the scope of what the agent addresses | Intake scope lock in `/dev` Phase 0, `/quick` SCOUT schema `Goal:` line |
| **Dialog flows** | Enforce conversation sequencing and checkpoint gates | Phase gates in `dev.md` + `fix.md` — each phase requires confirmation before proceeding |
| **Agent middleware** | Cross-cutting policies that apply across all tool calls | Hooks system + MCP tool policy in `security-guard.py` |

---

## Detail: Each Rail in aicrew

### Input rails → `hooks/security-guard.py` (PreToolUse)

Fires on every `Edit`, `Write`, `MultiEdit` tool call. Blocks:
- Secret patterns (API keys, tokens, credentials)
- Prompt injection patterns in file content
- Dangerous shell operations

Project-level extension: `templates/hooks/audit-guard.py` — add domain-specific
block and warn checks in `BLOCK_PATTERNS` and `WARN_CHECKS`.

### Output rails → `security-reviewer` + `conclude`

`security-reviewer` (Phase 6 of `/dev`, Phase 4 of `/fix`) scans changed files only.
`/conclude` is the final gate before a commit message is presented — nothing ships without it.

### Topic control → Intake scope lock

In `/dev`, Phase 0 Checkpoint C locks the acceptance criteria before any code changes.
In `/quick`, the SCOUT schema `Goal:` line plays the same role — every act-phase edit
must trace back to it. Scope creep during Act triggers a stop-and-update.

### Dialog flows → Phase gates

Every command (`/dev`, `/fix`, `/quick`) uses explicit checkpoint gates:
- The agent cannot proceed past a phase without user confirmation or a passing gate check
- Phases are listed in the state file; marking them complete is the only way to advance
- The `⚠️ INTERACTIVE CHECKPOINTS` header in every command file enforces this at the platform level

### Agent middleware → Hooks + MCP tool policy

The `hooks/` system (Stop and PreToolUse) is the middleware layer:
- `session-memory.py` (Stop): journals every changed file — creates an audit trail
- `security-guard.py` (PreToolUse): cross-cutting policy on all write operations
- `audit-guard.py` template: per-project extension point for domain invariants

MCP tool access is policy-controlled via `config/mcp/` — which servers are available
constrains what the agent can do, acting as a capability rail.

---

## Extending the taxonomy

To add a new rail type for a project:

1. **New input rail:** add a check function to your project's `audit-guard.py`
2. **New output rail:** add a check to your project's `.ai/skills/agents/security-reviewer.md`
3. **New topic control:** add scope constraints to `.ai/skills/commands/dev.md` Phase 0
4. **New dialog flow:** add a checkpoint gate to `.ai/skills/commands/audit.md`
5. **New agent middleware:** register a new hook in `.ai/skills/setup.sh`

---

## Headroom-inspired context budget rail

[Headroom](https://github.com/chopratejas/headroom) (Apache 2.0) is a context compression layer for AI agents.
aicrew borrows **patterns** — not code — from its architecture. No Headroom Python/npm dependency is added.

### Patterns borrowed

| Headroom concept | aicrew equivalent | Status |
|---|---|---|
| **CCR — Compress-Cache-Retrieve** | Slice reads in Scout (`context-economy`); `/handoff` compacts state for cross-tool hand-off. Full CCR retrieval is not automated. | Partial |
| **ContentRouter** | `/quick` Scout discovery order routes exploration to `codebase-memory-mcp` graph queries before any file reads. Different content types get different strategies. | Equivalent |
| **CacheAligner (prefix stabilization)** | `AGENTS.md` / `CLAUDE.md` are written once and stay stable — the static system prompt prefix maximises KV-cache hits. `token-optimizer-mcp` reinforces cache-aware summarisation. | Equivalent |
| **RollingWindow / IntelligentContext** | `/lean` + `context-economy` drop lower-value reads; `/handoff` prunes conversation history at phase boundaries before switching tools. | Equivalent |
| **`headroom learn` → AGENTS.md** | `/conclude` Learnings section proposes corrections to `AGENTS.md`; `session-memory.py` hook journals every session for post-hoc review. | Equivalent |
| **Token budget as a guardrail** | Context headroom is now a named rail type in this taxonomy (see below). | New |

### Context budget rail (new, Headroom-inspired)

A **context budget rail** is a policy that treats remaining context window as a resource to protect, not just an implementation detail.

In aicrew, this rail runs implicitly across every command:

- `/quick` Scout phase: forbidden to issue raw `Grep`/`Read` before graph query — preserves budget for Act
- `/lean` mode: diff/tree/search-before-read policy — every read must justify its token cost
- Phase transitions in `/dev`: `context-economy` compact step between phases prevents accumulation of stale content
- `codebase-memory-mcp` graph query: ~500 tokens vs ~80K for a repo-wide grep — 99% savings on exploration

**Extension point:** to enforce a hard token budget for a project, add a `PreToolUse` check in `audit-guard.py` that counts tokens in the current context (via `HEADROOM_CTX` env var if Headroom proxy is in use, or via a local estimate) and blocks reads when remaining headroom drops below a threshold.

---

## RTK-inspired shell output compression rail

[rtk (Rust Token Killer)](https://github.com/rtk-ai/rtk) is a CLI proxy that intercepts AI agent shell commands and compresses verbose output before it reaches the LLM — achieving 60–90% token savings on common dev commands (`git`, `cargo`, `pytest`, docker, etc.).

aicrew borrows **three patterns** — not code — from RTK. No RTK dependency is added.

| RTK pattern | aicrew equivalent | Status |
|---|---|---|
| **Thin-delegate hook** — hooks are minimal scripts that call a binary; policy logic stays in the binary, not the hook | `security-guard.py` and `session-memory.py` are thin Python scripts; policy logic is in the script body, not inlined in `settings.json` hook entries. Extension point: replace script path to swap policy without changing hook registration. | Equivalent |
| **Fail-safe graceful degradation** — if the proxy binary is missing or a rewrite fails, hook exits 0 and original command runs unchanged | `security-guard.py` exits 0 on unexpected errors (non-blocking by default). `symlinkMcp` in the installer warns and continues rather than aborting if a source file is missing. aicrew as a whole degrades gracefully: MCP servers are optional, hooks are optional, `/quick` falls back from graph to grep. | Equivalent |
| **Cross-platform hook compatibility matrix** — four tiers: shell PreToolUse hook, plugin API, rules-file instruction, no-op | aicrew hooks register via: PreToolUse (Claude Code/Cursor), hooks.json (Cursor), BeforeTool (Gemini), AGENTS.md instructions (Codex/rules-file agents). Same four-tier matrix. | Equivalent |

### Shell output compression as a future rail

RTK's core technique — compressing shell command output at the hook level before it reaches the LLM — is **not yet implemented** in aicrew but is a natural extension:

- A future `PreToolUse` hook could intercept `Bash` tool calls and pipe output through a compressor (RTK-style binary, or a Python equivalent).
- `security-guard.py` already fires on `Edit|Write|MultiEdit`; extending it or adding a sibling hook for `Bash` tool calls is the natural slot.
- Short-term workaround: agents using aicrew can `brew install rtk && rtk init -g` independently — RTK and aicrew hooks coexist because they use different `matcher` patterns (`Bash` vs `Edit|Write|MultiEdit`).

Attribution: `THIRD_PARTY_NOTICES.md` → rtk-ai/rtk section.

---

## Why no NeMo Python dependency

NeMo Guardrails is a Python runtime library designed for inference pipelines.
The aicrew system operates at the agent-prompt and hook level, not the inference level.
Adding NeMo would couple a text-file skills system to a specific Python runtime version
and GPU-centric dependency tree — unnecessary complexity for the use case.

The taxonomy here captures the *concepts* from NeMo (input/output/topic/dialog/middleware rails)
and maps them to lightweight, already-installed aicrew primitives.
