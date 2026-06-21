---
description: "Use when auditing the Claude Code / AI harness setup for reliability, cost, and completeness"
argument-hint: "[quick|full]"
---

**Health-check your aicrew install — verifies hooks, symlinks, MCP wiring, and Codex skill coverage.**

> **⚠️ INTERACTIVE CHECKPOINTS — MANDATORY RULE**
>
> | Platform | Checkpoint behavior |
> |---|---|
> | **Claude Code** | Call `AskUserQuestion` tool if available; otherwise end response and wait |
> | **Cursor** | Call `askFollowupQuestion` tool if available; otherwise end response and wait |
> | **Antigravity** | Call ask tool if available; otherwise end response and wait |
> | **Gemini CLI** | Call `ask_human` tool if available; otherwise end response and wait |
> | **Codex CLI** | Call `ask_human` tool if available; otherwise end response and wait |
> | **Autonomous script** | Stops execution — never invents your answer |
>
> **NEVER skip a checkpoint. NEVER fabricate the user's response.**


# /harness-audit — AI Harness Self-Audit

Audits the Claude Code / AI agent setup itself: skills, agents, hooks, commands, memory, and platform coverage. Finds gaps, stale configs, and reliability issues.

Mode from `$ARGUMENTS`: `quick` (5-10 min read-only) or `full` (complete + recommendations). Default: `quick`.

---

## Step 1: Skills & Agents inventory

Check `~/Agents/`:
```bash
ls ~/Agents/commands/
ls ~/Agents/agents/
ls ~/Agents/hooks/
```

For each file, verify:
- [ ] Has `description:` field with trigger conditions only (not workflow summary)
- [ ] Has `⚠️ INTERACTIVE CHECKPOINTS` table with all 5 platforms
- [ ] Platform table uses native ask tools (`AskUserQuestion`, `askFollowupQuestion`, `ask_human`) not just "end response"
- [ ] Agent cross-references use `~/Agents/agents/` path (not `~/.claude/skills/`)

---

## Step 2: Symlink integrity

Verify all symlinks resolve correctly:
```bash
# Claude Code commands
for f in ~/.claude/commands/*.md; do [ -L "$f" ] && readlink "$f" | grep -q "Agents" && echo "OK: $f" || echo "BROKEN: $f"; done

# Claude skills subdirs
for d in commands agents hooks; do
  [ -L ~/.claude/skills/$d ] && echo "OK: ~/.claude/skills/$d" || echo "BROKEN/REAL: ~/.claude/skills/$d"
done

# Cursor rules
ls ~/.cursor/rules/ 2>/dev/null | wc -l
```

Flag any broken symlinks or real directories where symlinks are expected.

---

## Step 3: Hook registration

Check `~/.claude/settings.json`:
```bash
cat ~/.claude/settings.json | python3 -c "import json,sys; s=json.load(sys.stdin); print(json.dumps(s.get('hooks',{}), indent=2))"
```

Verify:
- [ ] `Stop` hook: `session-memory.py` registered, pointing to `~/Agents/hooks/`
- [ ] `PreToolUse` hook: `security-guard.py` registered, pointing to `~/Agents/hooks/`
- [ ] No hooks pointing to old `~/.claude/skills/` path

---

## Step 4: /dev pipeline completeness

Read `~/Agents/commands/dev.md` and verify:
- [ ] Phase 4 has specialist routing table (frontend/backend/db/performance)
- [ ] Phase 5 has test-engineer agent
- [ ] Two-stage subagent review section present
- [ ] Implementer status protocol (DONE/DONE_WITH_CONCERNS/NEEDS_CONTEXT/BLOCKED) present
- [ ] `/compact` after each phase mentioned
- [ ] TDD is described as default (not opt-in)

---

## Step 5: Memory system health

Check `~/.claude/projects/[slug]/memory/`:
```bash
SLUG=$(pwd | sed 's|/|-|g' | sed 's/^-//')
ls ~/.claude/projects/$SLUG/memory/ 2>/dev/null || echo "No memory dir for this project"
wc -l ~/.claude/projects/$SLUG/memory/session_journal.md 2>/dev/null
wc -l ~/.claude/projects/$SLUG/memory/MEMORY.md 2>/dev/null
wc -l ~/.claude/projects/$SLUG/memory/instincts.jsonl 2>/dev/null || echo "No instincts yet"
```

Flag if:
- Journal has > 10 entries (trim needed)
- MEMORY.md doesn't exist (conclude was never run)
- MEMORY.md index is near 200 lines (approaching truncation)

---

## Step 6: Platform coverage (full mode only)

Only run if `$ARGUMENTS` is `full`:

Check Cursor rules:
```bash
ls ~/.cursor/rules/ | wc -l
ls ~/.cursor/rules/ | sort
```

Check Codex (project-level):
```bash
[ -f AGENTS.md ] && echo "Codex: AGENTS.md present" || echo "Codex: no AGENTS.md"
[ -f .ai/skills/AGENTS.md ] && echo "Codex: .ai/skills/AGENTS.md present"
```

Check for `.ai/skills/` project layer:
```bash
ls .ai/skills/ 2>/dev/null || echo "No project skills layer"
```

---

## Output format

```
HARNESS AUDIT
=============
Mode: quick | full
Date: [date]

Skills & Agents:
  Commands:    [N] found — [issues or "OK"]
  Agents:      [N] found — [issues or "OK"]
  Hooks:       [N] found — [issues or "OK"]

Symlink integrity: PASS | ISSUES — [list]
Hook registration: PASS | ISSUES — [list]
/dev pipeline:     PASS | ISSUES — [list]
Memory health:     PASS | ISSUES — [list]
Platform coverage: PASS | ISSUES — [list] (full mode only)

Action items:
  [HIGH] [description of critical fix]
  [MED]  [description of improvement]
  [LOW]  [description of minor tweak]

Overall: HEALTHY | NEEDS ATTENTION [N issues]
```

Present the report. If there are HIGH issues, ask:

> Found [N] high-priority harness issues.
> 1. Fix them now
> 2. Show details for a specific issue
> 3. Skip — just noting for later
