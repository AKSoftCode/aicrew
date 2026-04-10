# state-checkpoint (usage-limit resilience)

Goal: survive usage timeouts and multi-tool parallel work by keeping durable, compact state files outside the chat.

## Where to write state

- Directory: `.ai/state/` (create if missing)
- File pattern: `.ai/state/AI_STATE.<tool>.<session>.md`

`<tool>` examples: `cursor`, `claude`, `codex`, `gemini`, `antigravity`

`<session>`: short human label (slug). If not set, use `unknown-<YYYY-MM-DD>-<HHMM>`.

## When to update

- After every explicit checkpoint ("wait for answer/confirmation")
- At the end of every phase (research/design/implement/tests/etc.)
- Before switching tools/models
- After any major decision that changes the plan

If filesystem write tools are unavailable, output the full file contents so the user can paste it.

## Format (keep compact)

- Goal:
- Current status:
- Key constraints (must not break):
- Relevant files (paths only):
- Latest errors/logs (verbatim, short):
- Next step (single exact action):
- Tests: ran / not run
- Assumptions/risks:

## Multi-tool rule

Never share a single global `AI_STATE.md` when running multiple AI tools at once. Always include `<tool>` and `<session>` in the filename to avoid overwrites.
