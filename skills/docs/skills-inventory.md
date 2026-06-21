# Skills Inventory

Complete audit of all aicrew skills, commands, and agents.
Last updated: 2026-06-21.

---

## Summary

| Category | Count | Verdict |
|----------|-------|---------|
| Core pipeline commands | 5 | KEEP |
| Daily utility commands | 4 (`/session`, `/handoff`, `/brainstorm`, `/lean`) | KEEP |
| Maintenance commands (rare) | 3 (`/update-skills`, `/harness-audit`, `/benchmark`) | KEEP, grouped as Maintenance |
| Style/verbosity commands | 1 active + 1 alias + 1 deprecated | KEEP lean; `/normal` = alias of `/lean off`; DEPRECATE terse |
| Setup slash commands | 5 | **REMOVED (CLI/Codex only)** — install, update, status, agent-kit, cursor-plugin |
| Pipeline-internal agents | 9 | KEEP |
| Support agents | 5 | KEEP |
| Codex skills (core) | 5 | KEEP |
| Codex skills (utility) | 9 | KEEP (incl. install/update/status/agent-kit/cursor-plugin parity wrappers) |
| Codex skills (style) | 2 active + 1 deprecated | lean + (aicrew-normal); DEPRECATE aicrew-terse |
| Codex skills (scaffold) | 2 | KEEP |

**Result: command-set trim — 5 setup slash commands removed (functionality stays via CLI `src/cli.js` + Codex `codex-skills/aicrew-*`); `/normal` kept as alias of `/lean off`; maintenance commands grouped separately; `/terse` + `aicrew-terse` remain deprecated.**

---

## Commands (`skills/commands/`)

### Core (keep — these are the product)

| Command | File | Verdict | Notes |
|---------|------|---------|-------|
| `/dev` | `dev.md` | **KEEP** | Full 9-phase dev pipeline |
| `/fix` | `fix.md` | **KEEP** | Fast bug-fix flow |
| `/quick` | `quick.md` | **KEEP** | Scout → Act single-pass |
| `/conclude` | `conclude.md` | **KEEP** | Session wrap-up |
| `/update-skills` | `update-skills.md` | **KEEP** | Project skill evolution |

### Utilities (keep — distinct use cases)

| Command | File | Verdict | Notes |
|---------|------|---------|-------|
| `/session` | `session.md` | **KEEP** | Label + checkpoint mid-session |
| `/handoff` | `handoff.md` | **KEEP** | Cross-tool state transfer |
| `/brainstorm` | `brainstorm.md` | **KEEP** | Standalone design brainstorm (also in /dev phase 2, but useful alone) |
| `/benchmark` | `benchmark.md` | **KEEP (maintenance)** | Token savings report — grouped under Maintenance (rare) |
| `/harness-audit` | `harness-audit.md` | **KEEP (maintenance)** | Audit harness health — grouped under Maintenance (rare) |
| `/update-skills` | `update-skills.md` | **KEEP (maintenance)** | Project skill evolution — grouped under Maintenance (rare) |
| ~~`/install`~~ | _(deleted)_ | **CLI/CODEX ONLY** | Slash file removed — use `aicrew install` or `aicrew-install` |
| ~~`/update`~~ | _(deleted)_ | **CLI/CODEX ONLY** | Slash file removed — use `aicrew update` or `aicrew-update` |
| ~~`/status`~~ | _(deleted)_ | **CLI/CODEX ONLY** | Slash file removed — use `aicrew status` or `aicrew-status` |

### Style / Verbosity

| Command | File | Verdict | Notes |
|---------|------|---------|-------|
| `/lean` | `lean.md` | **KEEP** | Primary toggle: default terse; `/lean on` amplifies; `/lean off` = verbose |
| `/normal` | `normal.md` | **ALIAS** | Alias of `/lean off`. File kept so the word keeps working; documented as alias, not a daily command |
| `/terse` | `terse.md` | **DEPRECATED** | Alias for `/lean on` — deprecated, kept with pointer to `/lean on` |

**Decision:** `/terse` is 100% covered by `/lean on`. Kept as a file so existing users aren't broken, but frontmatter updated with deprecation notice.

### Scaffold

| Command | File | Verdict | Notes |
|---------|------|---------|-------|
| ~~`/agent-kit`~~ | _(deleted)_ | **CLI/CODEX ONLY** | Slash file removed — use `aicrew agent-kit init` or `aicrew-agent-kit` |
| ~~`/cursor-plugin`~~ | _(deleted)_ | **CLI/CODEX ONLY** | Slash file removed — use `aicrew cursor-plugin init` or `aicrew-cursor-plugin` |

---

## Agents (`skills/agents/`)

### Pipeline-internal (used by /dev, /fix, /quick internally)

| Agent | File | Verdict | Notes |
|-------|------|---------|-------|
| `architect` | `architect.md` | **KEEP** | Phase 3 — design spec |
| `bug-analyst` | `bug-analyst.md` | **KEEP** | Phase 1 — root cause |
| `tdd-developer` | `tdd-developer.md` | **KEEP** | Phase 4 — TDD cycle |
| `test-engineer` | `test-engineer.md` | **KEEP** | Phase 5 — test review |
| `security-reviewer` | `security-reviewer.md` | **KEEP** | Phase 6 — security gate |
| `frontend-specialist` | `frontend-specialist.md` | **KEEP** | Phase 4 — frontend routing |
| `backend-specialist` | `backend-specialist.md` | **KEEP** | Phase 4 — backend routing |
| `db-migration` | `db-migration.md` | **KEEP** | Phase 8 — schema changes |
| `cloud-expert` | `cloud-expert.md` | **KEEP** | Phase 8 — infra changes |
| `performance` | `performance.md` | **KEEP** | Phase 4 — perf acceptance criterion |
| `brainstorm` | `brainstorm.md` | **KEEP** | Phase 2 — also callable standalone |

### Support / Session agents

| Agent | File | Verdict | Notes |
|-------|------|---------|-------|
| `caveman` | `caveman.md` | **KEEP** | Canonical terse output spec — referenced by everything |
| `context-economy` | `context-economy.md` | **KEEP** | Read-policy spec for lean mode |
| `context-scout` | `context-scout.md` | **KEEP** | Scout-as-draft-model pattern |
| `karpathy-guardrails` | `karpathy-guardrails.md` | **KEEP** | Coding judgment guardrails |
| `state-checkpoint` | `state-checkpoint.md` | **KEEP** | Session state persistence |
| `terse` | `terse.md` | **KEEP** | Behavior spec referenced by other skills; `caveman.md` is canonical but this provides the rules summary |

---

## Codex Skills (`codex-skills/`)

### Core pipeline

| Skill | Dir | Verdict |
|-------|-----|---------|
| `aicrew-dev` | `aicrew-dev/` | **KEEP** |
| `aicrew-fix` | `aicrew-fix/` | **KEEP** |
| `aicrew-quick` | `aicrew-quick/` | **KEEP** |
| `aicrew-conclude` | `aicrew-conclude/` | **KEEP** |
| `aicrew-update-skills` | `aicrew-update-skills/` | **KEEP** |

### Utilities

| Skill | Dir | Verdict |
|-------|-----|---------|
| `aicrew-session` | `aicrew-session/` | **KEEP** |
| `aicrew-handoff` | `aicrew-handoff/` | **KEEP** |
| `aicrew-benchmark` | `aicrew-benchmark/` | **KEEP** |
| `brainstorm` | `brainstorm/` | **KEEP** |
| `aicrew-harness-audit` | `aicrew-harness-audit/` | **KEEP** |
| `aicrew-install` | `aicrew-install/` | **KEEP** — thin wrapper for CLI parity |
| `aicrew-update` | `aicrew-update/` | **KEEP** — thin wrapper for CLI parity |
| `aicrew-status` | `aicrew-status/` | **KEEP** — thin wrapper for CLI parity |
| `aicrew-agent-kit` | `aicrew-agent-kit/` | **KEEP** — scaffold |
| `aicrew-cursor-plugin` | `aicrew-cursor-plugin/` | **KEEP** — scaffold |

### Style / Verbosity

| Skill | Dir | Verdict | Notes |
|-------|-----|---------|-------|
| `lean` | `lean/` | **KEEP** | Primary: lean on/off |
| `aicrew-normal` | `aicrew-normal/` | **KEEP** | Needed: Codex skills don't take arguments, so "lean off" needs its own skill |
| `aicrew-terse` | `aicrew-terse/` | **DEPRECATED** | Covered by `lean` skill; kept for backward compat, marked deprecated in SKILL.md |

**Why keep `aicrew-normal` but deprecate `aicrew-terse`:**
- Codex skills can't take arguments, so you can't say "lean off" — you need `aicrew-normal`
- But `aicrew-terse` = "lean on" which is already what the `lean` skill does by default
- Keeping `aicrew-normal` maintains the on/off pair (lean ↔ aicrew-normal)

---

## What was removed in the command-set trim

| Item | Replacement (functionality preserved) | Reason |
|------|----------------------------------------|--------|
| `skills/commands/install.md` | `aicrew install` (CLI) / `aicrew-install` (Codex) | A slash command that only tells you to run a shell command is overhead |
| `skills/commands/update.md` | `aicrew update` / `aicrew-update` | Same — terminal action, not a chat workflow |
| `skills/commands/status.md` | `aicrew status` / `aicrew-status` | Same |
| `skills/commands/agent-kit.md` | `aicrew agent-kit init` / `aicrew-agent-kit` | Scaffold is a one-off terminal action |
| `skills/commands/cursor-plugin.md` | `aicrew cursor-plugin init` / `aicrew-cursor-plugin` | Scaffold is a one-off terminal action |

> CLI commands (`src/cli.js`) and Codex skills (`codex-skills/aicrew-*`) for all five REMAIN and keep working — only the duplicate slash-command `.md` files were deleted.

## What was deprecated and why

| Item | Replacement | Reason |
|------|-------------|--------|
| `skills/commands/terse.md` | `/lean on` | 100% covered by `/lean on`; terse is kept with deprecation note to avoid breaking existing users |
| `codex-skills/aicrew-terse/SKILL.md` | `lean` codex skill | `lean` skill already enables terse; `aicrew-terse` is a re-enable wrapper with no unique behavior |

## What was explicitly NOT removed

| Item | Reason kept |
|------|-------------|
| `skills/commands/normal.md` | Alias of `/lean off` — kept so `/lean`'s documented off-switch word keeps working |
| `codex-skills/aicrew-normal/SKILL.md` | Required — Codex has no argument support, needs a dedicated "go verbose" skill |
| All 10 install-related codex skills | CLI parity requirement — users on Codex need access to install/update/status without the CLI |
| `skills/agents/terse.md` | Behavior spec referenced by `aicrew-terse`, `aicrew-normal` as source of truth |
| `skills/docs/guardrails-taxonomy.md` | Referenced by karpathy-guardrails agent |
| `skills/docs/token-foundation.md` | Referenced in README and linked docs |
| `skills/docs/speculative-context.md` | Documents the context-scout pattern |
| `skills/docs/how-token-savings-work.md` | User-facing explainer |
| All pipeline-internal agents | Required by /dev, /fix, /quick |
