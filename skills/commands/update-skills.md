---
description: "Maintain and evolve the skills system — update globals, generate project-specific skills, and research new best practices from the internet"
argument-hint: "[global|project|research|both|review] — default: ask"
---

> **⚠️ INTERACTIVE CHECKPOINTS — MANDATORY RULE**
> This skill contains checkpoints where you MUST pause and wait for the user's response before continuing.
> These checkpoints are marked with **"Wait for answer"**, **"Wait for confirmation"**, or similar phrasing.
>
> **How to handle checkpoints across platforms:**
> - If you have an `askQuestion`, `ask_human`, `askFollowupQuestion`, or similar interactive tool available → call it.
> - If you are in a chat UI (Cursor, Claude Code, Antigravity, Gemini) → end your response and wait for the user's next message.
> - If you are running autonomously in a script or loop → you MUST stop execution and yield control. Never fabricate or assume the user's answer.
>
> **NEVER skip a checkpoint. NEVER invent the user's response. ALWAYS stop and wait.**


# /update-skills — Skills Evolution Engine

You maintain and grow the skills system. You can refresh global skills, auto-generate project-specific skills from codebase analysis, and research the latest best practices from the internet to suggest additions or removals.

## Step 0: Bootstrap (always runs first, silently)

Before anything else, run the setup script to ensure symlinks and hooks are registered:

```bash
bash ~/.claude/skills/setup.sh
```

If the current directory has a project skills layer, also run:
```bash
bash .ai/skills/setup.sh 2>/dev/null || true
```

This is idempotent — already-linked files are skipped. Report what was created vs already existed, then continue.

---

## Step 1: Determine scope

If `$ARGUMENTS` is not provided, ask:

> What would you like to do?
> 1. Update global skills — review and refresh `~/.claude/skills/`
> 2. Generate project skills — analyze this project, create `.ai/skills/` add-ons
> 3. Internet research — find new best practices, skills, agents to add or replace
> 4. Full evolution — all three in sequence
> 5. Review only — audit what exists, show gaps, no writes

Type a number (1–5). Wait for answer before proceeding.

---

## MODE A — Update Global Skills

### A1: Audit current skills

Read all files in `~/.claude/skills/` (commands, agents, hooks).
Show the user a summary table with file names, descriptions, and last-modified dates.

### A2: Check for staleness

For each skill:
- Does it reference file paths that still exist?
- Does it conflict with recent project changes or CLAUDE.md updates?
- Has the project evolved in a way that makes this skill incomplete?

### A3: Present recommendations

Show the user a numbered list:

```
GLOBAL SKILLS REVIEW
====================
1. [skill name]  — [status: OK / STALE / GAP]  [brief reason]
2. [skill name]  — ...
...
```

Then ask:
> Which would you like to update? Type numbers (e.g. "1 3") or "all" or "none".

Wait for selection before writing anything.

### A4: Update selected skills

For each selected skill:
1. Read the current file
2. Draft improvements — targeted edits, not full rewrites
3. Show the diff to the user
4. Write only after explicit approval

---

## MODE B — Generate Project-Specific Skills

### B1: Read project context

Gather in parallel:
- `CLAUDE.md` (project instructions)
- `~/.claude/projects/[slug]/memory/MEMORY.md` and all `*.md` memory files
- `.ai/team/roles/` — list existing team role files
- `.ai/skills/` — what project skills already exist

Derive `[slug]` from the current working directory:
`slug = cwd.replace("/", "-").lstrip("-")`

### B2: Analyze the codebase

Explore to understand:
- Tech stack: languages, frameworks, test runner, lint/type-check commands
- Core domain: what does this project do? What are the key entities?
- Recurring workflows: what patterns appear frequently in git history and code?
- Known pitfalls: what bugs or mistakes appear in memory files?
- Conventions: naming, file structure, error handling patterns

Use Glob and Grep to find:
- Entry points (`main.py`, `server.js`, `App.tsx`, `lib/main.dart`)
- Test files and which framework they use
- Config files (`requirements.txt`, `package.json`, `pubspec.yaml`)

### B3: Propose project skills

Propose a specific list — be concrete, not generic. For each proposed skill, explain:
- What gap it fills
- What project-specific knowledge it encodes (cite the source: memory file or code pattern)
- How it overrides or extends a global skill

Always useful for any project:
- `AGENTS.md` — Codex entry with project non-negotiables
- `cursor-rules/[name].mdc` — Cursor rules with project patterns

Domain-specific (create only if the project has distinct rules):
- `commands/audit.md` — compliance or domain-specific quality checks
- `agents/cloud-expert.md` — project-specific infra override
- `agents/domain-expert.md` — domain knowledge for intake phase

Show the proposed list. Ask for selection. Wait before writing.

### B4: Generate approved skills

For each approved skill:
1. Read all relevant context: memory files + key source files + existing roles
2. Draft the skill with project-specific knowledge embedded
3. Show the draft to the user
4. Write only after approval
5. Update `setup.sh` to include new files

### B5: Run setup

After writing:
```
bash .ai/skills/setup.sh
```

Also offer to create a doc symlink in the project:
```
ln -s ~/.claude/skills/SKILLS_SYSTEM.md [repo]/Agents/SKILLS_SYSTEM.md
```
This gives any team member in the repo a direct link to the full system reference.

---

## MODE C — Internet Research

This mode searches for the latest best practices, tools, and patterns, then recommends changes to the current skills system.

### C1: Research phase

Launch a research sub-agent with these search tasks:

**Search 1:** Latest Claude Code skills, hooks, and agent patterns (past 6 months)
- Query: "best claude code skills hooks agents 2026"
- Focus: new hook event types, improved orchestration patterns, security hooks

**Search 2:** TDD and SDLC automation improvements
- Query: "test-driven development automation AI agents best practices 2026"
- Focus: better RED-GREEN-REFACTOR enforcement, test generation agents

**Search 3:** Security review automation
- Query: "automated security code review agents hooks patterns 2026"
- Focus: new vulnerability patterns, improved detection heuristics

**Search 4:** Project-type-specific patterns
- Detect the current project's tech stack (Python/FastAPI, Flutter, Node.js, etc.)
- Query: "[stack] best practices AI coding agent 2026"
- Focus: stack-specific lint checks, migration patterns, testing approaches

**Search 5:** Cursor rules and Codex agent patterns
- Query: "cursor rules best practices 2026" + "AGENTS.md openai codex patterns"
- Focus: new glob pattern syntax, alwaysApply improvements, Codex agent config

Collect findings from the research sub-agent.

### C2: Gap analysis

Compare research findings against current skills:

For each finding from research:
- Does a current skill already cover this? If yes, is the current version complete?
- Is this pattern relevant to this project's tech stack?
- Is this from a credible source? (official docs, established repos, security firms)

Mark each finding as:
- **Add**: new skill/hook/agent that fills a genuine gap
- **Update**: current skill exists but finding reveals an improvement
- **Ignore**: duplicate, irrelevant to this stack, or low-quality source
- **Remove**: current skill is outdated and finding shows a better replacement

### C3: Present recommendations

Show the user a structured report:

```
INTERNET RESEARCH FINDINGS
==========================

TO ADD (new):
- [skill name]: [what it does] — Source: [repo/blog URL]

TO UPDATE (existing skill needs improvement):
- [skill name]: [what should change] — Source: [URL]

TO CONSIDER REMOVING (outdated or superseded):
- [skill name]: [why it may be outdated]

TO IGNORE (already covered or not relevant):
- [N items]
```

Ask: "Which additions/updates would you like me to implement?"

### C4: Implement approved changes

For each approved change:
1. Draft the new or updated content
2. Show the diff or full draft
3. Write only after user approval
4. Cite the source in a comment at the top of the file

---

## MODE D — Full Evolution (A + B + C in sequence)

Run modes A, B, and C in sequence.
After each mode, summarize what was done before moving to the next.

---

## MODE E — Review Only

Produce a read-only audit report:

```
SKILLS AUDIT
============
Global skills: [N commands, N agents, N hooks]
Project skills: [N commands, N agents, N hooks, N cursor-rules]

Active hooks: [list from settings.json]

Gaps identified:
- [workflow/pattern that exists in the project but has no skill]

Potentially stale:
- [skills that reference outdated paths or patterns]

Recommendation summary:
[3-5 sentences on the overall health of the skills system]
```

No files are written in this mode.

---

## Rules for all modes

- **Never overwrite without showing a diff first**
- **Never add features the user didn't ask for**
- **Project skills must cite their source** (memory file, codebase pattern, or internet URL)
- **Skills must be concise** — if a skill is longer than 150 lines it won't be read
- **After any writes**, remind the user to run setup if hooks changed:
  ```
  bash ~/.claude/skills/setup.sh    # global hooks
  bash .ai/skills/setup.sh          # project hooks
  ```
