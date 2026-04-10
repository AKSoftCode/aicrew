# context-economy (token-saving read policy)

Default: normal exploration.

When lean mode is enabled:
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
