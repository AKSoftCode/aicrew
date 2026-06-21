# Commit attribution

All platforms using aicrew skills must follow this when proposing or creating commits:

- Do **not** add `Co-authored-by:` for AI tools (Cursor, Claude, Codex, Gemini, etc.).
- Do **not** use AI bot names or emails as git author/committer.
- Commits attribute only the human developer.

Cursor: `.cursor/rules/no-ai-coauthors.mdc` (from `templates/cursor-rules/` on project init).
Codex / Claude Code / Gemini: `AGENTS.md` non-negotiable and `/conclude` commit proposals.

## Cursor IDE

Cursor may append `Co-authored-by: Cursor <cursoragent@cursor.com>` when the agent runs `git commit`. Turn off **Cursor Settings → Agent → Attribution** (or commit from a normal terminal / use low-level `git commit-tree` if a hookless commit is required).
