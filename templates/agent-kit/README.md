# agent-kit

**Single source of truth** for Cursor rules (`.mdc`) and optional shared skills, symlinked from each product repo via that repo’s `.ai/skills/setup.sh`.

Scaffolded by [aicrew](https://github.com/abhimanyuaryan/aicrew):

```bash
npx aicrew agent-kit init ./agent-kit
```

## Layout

| Path | Purpose |
|------|---------|
| `repos/<product>/cursor-rules/*.mdc` | Canonical Cursor rules for that repo |
| `shared/skills/<name>/` | Optional shared Codex/Cursor skills (e.g. terse helpers) |
| `install.sh` | Runs each registered repo’s `setup.sh` with `AGENT_KIT_ROOT` set |

## Wire a repo

1. Put rule files under `repos/<product>/cursor-rules/`.
2. In that repo’s `.ai/skills/setup.sh`, set `AGENT_KIT_ROOT` (default: sibling `../agent-kit`) and link `.cursor/rules/*.mdc` from `$AGENT_KIT_ROOT/repos/<product>/cursor-rules/`.
3. Edit **this** `install.sh`: add the relative path to that `setup.sh` in the `SETUPS` array (paths are relative to the **parent directory of agent-kit**, i.e. your workspace root).

## Install symlinks on this machine

```bash
bash ./agent-kit/install.sh
```

Override kit location when running a single repo’s setup:

```bash
export AGENT_KIT_ROOT=/absolute/path/to/agent-kit
bash .ai/skills/setup.sh
```

## Codex / Claude Code / Antigravity

Those tools do not read this folder automatically. Keep `AGENTS.md` and global skills in each tool; use **agent-kit** only for **canonical** `.mdc` (and optional shared `SKILL.md`) that multiple repos should share.
