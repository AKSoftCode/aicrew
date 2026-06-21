# context-economy (default read policy)

Default: apply on every session. Not opt-in via `/lean on`.

Combine with `~/Agents/agents/terse.md` default output style unless user disables with `/normal` or `/lean off`.

## Read policy (always on by default)

- Use diff/tree/search before reading file contents.
- Prefer changed files first: `git diff --name-only`, then nearest related tests and dependencies.
- Prefer targeted reads over whole-file reads.
- Read only the smallest useful slice around a symbol, match, error, or changed region.
- Reuse prior summaries unless the file changed.
- Read full files only when the file is small, the task is structural, or partial context is insufficient.
- Keep tree views compact and filtered; avoid generated, vendored, or build output paths unless required.
- Compact context between major phases so stale exploration does not accumulate.

Never compress or summarize away:

- Code blocks
- Commands
- File paths
- Flags
- URLs
- Error messages
- Version numbers
- Explicit constraints, invariants, and acceptance criteria

## Disable

- `/normal` or `/lean off` → relax read policy; fuller exploration and explanations OK for the session

## Reinforce (optional)

- `/lean on` → explicit boost; behavior matches default unless user previously disabled
