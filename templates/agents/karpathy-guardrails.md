# Project karpathy-guardrails override

Use this file to extend the global `karpathy-guardrails` agent for this repo.

Base agent: `~/Agents/agents/karpathy-guardrails.md`  
Attribution: [forrestchang/andrej-karpathy-skills](https://github.com/forrestchang/andrej-karpathy-skills) (MIT)

## Project-specific additions

Add rules that apply on top of the four global principles:

```markdown
## Project-specific guardrails

- [Example] All API changes require a test in `tests/api/`
- [Example] Do not modify generated files under `src/generated/`
- [Example] Match error handling in `src/utils/errors.ts`
```

## When this override applies

- `/quick` Act phase when `.ai/skills/agents/karpathy-guardrails.md` exists (project lookup wins)
- Optional: reference from project `/fix` or custom commands

Keep additions short. Do not duplicate the four global principles — extend them.
