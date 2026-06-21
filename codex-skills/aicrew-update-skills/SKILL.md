---
name: aicrew-update-skills
description: Update aicrew global and project skills in Codex (runs aicrew update and optional project generation).
---

# aicrew /update-skills (Codex)

Use when the user asks to update skills or regenerate project-specific rules.

## Default output

Caveman/lean style by default. See `~/Agents/agents/caveman.md` and `~/Agents/agents/context-economy.md`. `/normal` or `/lean off` restores verbose.

Steps:
1. Run `npx aicrew update` from the repo root (global merge, keeps edits).
2. If project skills are needed, generate `.ai/skills/` using the aicrew workflow and commit the results.
3. Restart Codex if new skills were installed.
