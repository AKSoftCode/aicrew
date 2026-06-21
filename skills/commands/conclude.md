---
description: "Use at session end to save project learnings and produce a commit message"
argument-hint: "optional: topic to focus memory capture on"
---

**End-of-session wrap-up — saves learnings to project memory and proposes a commit message.**

> **Default output: caveman/lean** — terse by default. `/normal` or `/lean off` for verbose. See `~/Agents/agents/caveman.md`.

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


# /conclude — Session Conclusion + Memory Capture

Wrap up this development session. Summarize what was done and capture any non-obvious project learnings into the persistent memory system.

## Step 1: Session Summary

Generate a concise summary:
- Main task accomplished this session
- Run `git diff --name-only HEAD` — list the files that changed
- Test status (did all pass?)
- Any known remaining issues or follow-ups

Present this to the user clearly.

---

## Step 2: Check the session journal

Look for the session journal written by the Stop hook:
```
~/.claude/projects/[project-slug]/memory/session_journal.md
```
Where `[project-slug]` is the current working directory with `/` replaced by `-` and leading `-` stripped.

If the journal exists, read the most recent entries (last 3–5) for context about what the hook captured.

---

## Step 3: Read current memory index

Read the current MEMORY.md at:
```
~/.claude/projects/[project-slug]/memory/MEMORY.md
```

This tells you what is already known — do not duplicate it.

---

## Step 4: Extract project learnings

Review the session and identify learnings that meet ALL of these criteria:
- **Non-obvious**: not something you'd find just by reading the code
- **Project-specific**: not generic coding advice ("use const", "handle errors")
- **New**: not already captured in MEMORY.md
- **Durable**: will still matter in 2 weeks

### Good candidates to save:
- A workflow quirk or constraint discovered during implementation
- A design decision with non-obvious reasoning ("we chose X over Y because...")
- A bug root cause that reveals a broader systemic pattern
- A "gotcha" with a library, framework, or integration
- A rule or constraint that is easy to accidentally violate

### Do NOT save:
- What was built (that's in git history and commit messages)
- Generic programming best practices
- Temporary workarounds or in-progress state
- Things already documented in CLAUDE.md or existing memory

---

## Step 5: Write memory entries

For each qualifying learning:

1. Check MEMORY.md — is there an existing entry close enough to update? If yes, update it rather than create a new file.
2. Choose the type: `project`, `feedback`, or `reference`
3. Write the memory file to `~/.claude/projects/[project-slug]/memory/[descriptive-name].md`

File format:
```markdown
---
name: [short descriptive name — 3-6 words]
description: [one-line, specific enough to judge relevance at a glance]
type: project | feedback | reference
---

[The learning as a clear fact or rule]

**Why:** [root cause, motivation, or the incident that revealed this]
**How to apply:** [when this matters — what to do or avoid in future]
```

4. Add a pointer line to MEMORY.md:
```
- [Name](filename.md) — one-line hook (under 150 chars)
```

---

## Step 6: Trim the session journal

If `session_journal.md` has more than 10 entries, keep only the most recent 5 and remove older ones. This prevents unbounded growth.

---

## Step 7: Git housekeeping

Run `git status` to show unstaged/uncommitted changes.

If there are uncommitted changes, remind the user to commit before ending the session.

Suggest a commit message if one seems obvious from the work done.
