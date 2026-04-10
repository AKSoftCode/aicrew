#!/usr/bin/env bash
# ~/Agents/setup.sh
#
# Global skills setup — source of truth is ~/Agents/
# Creates symlinks for: Claude Code, Cursor, Codex, Antigravity, Gemini
# Registers hooks in ~/.claude/settings.json
#
# Run once after first install or when adding new platforms:
#   bash ~/Agents/setup.sh
#
# Safe to re-run: idempotent, never overwrites non-symlinks.

set -euo pipefail

AGENTS_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CLAUDE_DIR="$HOME/.claude"
SETTINGS_FILE="$CLAUDE_DIR/settings.json"
AICREW_DIR="$HOME/Workspace/aicrew/skills"

echo "=== AI Skills — Global Setup ==="
echo "Source of truth: $AGENTS_DIR"
echo ""

# ── Helper ───────────────────────────────────────────────────────────────────
link_item() {
    local src="$1"
    local dst="$2"
    local label="$3"

    if [ -L "$dst" ]; then
        current_target="$(readlink "$dst")"
        if [ "$current_target" = "$src" ]; then
            echo "  ↻  Already linked:   $label"
        else
            ln -sfn "$src" "$dst"
            echo "  ↺  Re-linked:        $label  ($current_target → $src)"
        fi
    elif [ -e "$dst" ]; then
        echo "  ⚠  Exists (not symlink), skipping: $label  — remove manually if you want the symlink"
    else
        ln -s "$src" "$dst"
        echo "  ✓  Linked:           $label"
    fi
}

# ── 1. Claude Code: command symlinks ─────────────────────────────────────────
echo "Claude Code commands (~/.claude/commands/):"
mkdir -p "$CLAUDE_DIR/commands"
for cmd_file in "$AGENTS_DIR/commands"/*.md; do
    [ -f "$cmd_file" ] || continue
    cmd_name="$(basename "$cmd_file")"
    link_item "$cmd_file" "$CLAUDE_DIR/commands/$cmd_name" "$cmd_name"
done

# ── 2. Claude Code: skills/ subdirs → Agents ─────────────────────────────────
echo ""
echo "Claude Code skills (~/.claude/skills/):"
mkdir -p "$CLAUDE_DIR/skills"

for subdir in commands agents hooks; do
    src="$AGENTS_DIR/$subdir"
    dst="$CLAUDE_DIR/skills/$subdir"
    if [ -d "$dst" ] && [ ! -L "$dst" ]; then
        # Directory exists and is NOT a symlink — it has real files (legacy install)
        # We keep it so existing files aren't lost; user can migrate manually
        echo "  ⚠  skills/$subdir is a real directory (legacy). To migrate: rm -rf $dst && bash $AGENTS_DIR/setup.sh"
    else
        link_item "$src" "$dst" "skills/$subdir"
    fi
done
link_item "$AGENTS_DIR/SKILLS_SYSTEM.md" "$CLAUDE_DIR/skills/SKILLS_SYSTEM.md" "skills/SKILLS_SYSTEM.md"
link_item "$AGENTS_DIR/setup.sh"         "$CLAUDE_DIR/skills/setup.sh"         "skills/setup.sh"

# ── 3. aicrew/skills/ subdirs → Agents ───────────────────────────────────────
echo ""
echo "aicrew package (~/Workspace/aicrew/skills/):"
if [ -d "$HOME/Workspace/aicrew" ]; then
    mkdir -p "$AICREW_DIR"
    for subdir in commands agents hooks; do
        src="$AGENTS_DIR/$subdir"
        dst="$AICREW_DIR/$subdir"
        if [ -d "$dst" ] && [ ! -L "$dst" ]; then
            echo "  ⚠  aicrew/skills/$subdir is a real directory. To migrate: rm -rf $dst && bash $AGENTS_DIR/setup.sh"
        else
            link_item "$src" "$dst" "aicrew/skills/$subdir"
        fi
    done
    link_item "$AGENTS_DIR/SKILLS_SYSTEM.md" "$AICREW_DIR/SKILLS_SYSTEM.md" "aicrew/skills/SKILLS_SYSTEM.md"
    link_item "$AGENTS_DIR/setup.sh"         "$AICREW_DIR/setup.sh"         "aicrew/skills/setup.sh"
else
    echo "  —  ~/Workspace/aicrew not found, skipping"
fi

# ── 4. Register hooks in ~/.claude/settings.json ─────────────────────────────
echo ""
echo "Hooks (~/.claude/settings.json):"
python3 - "$AGENTS_DIR" "$SETTINGS_FILE" <<'PYEOF'
import json
import sys
from pathlib import Path

agents_dir = sys.argv[1]
settings_path = Path(sys.argv[2])

settings: dict = {}
if settings_path.exists():
    try:
        settings = json.loads(settings_path.read_text())
    except (json.JSONDecodeError, OSError):
        pass

hooks: dict = settings.setdefault("hooks", {})


def already_registered(hook_list: list, script_basename: str) -> bool:
    return any(script_basename in json.dumps(entry) for entry in hook_list)


# Stop hook: session memory
stop_hooks: list = hooks.setdefault("Stop", [])
mem_script = f"{agents_dir}/hooks/session-memory.py"
if not already_registered(stop_hooks, "session-memory.py"):
    stop_hooks.append({"hooks": [{"type": "command", "command": f"python3 {mem_script}"}]})
    print(f"  ✓  Registered:       Stop → session-memory.py")
else:
    print(f"  ↻  Already registered: session-memory.py")

# PreToolUse hook: security guard
pre_hooks: list = hooks.setdefault("PreToolUse", [])
sec_script = f"{agents_dir}/hooks/security-guard.py"
if not already_registered(pre_hooks, "security-guard.py"):
    pre_hooks.append({
        "matcher": "Edit|Write|MultiEdit",
        "hooks": [{"type": "command", "command": f"python3 {sec_script}"}]
    })
    print(f"  ✓  Registered:       PreToolUse → security-guard.py")
else:
    print(f"  ↻  Already registered: security-guard.py")

settings_path.write_text(json.dumps(settings, indent=4))
PYEOF

# ── 5. Cursor ─────────────────────────────────────────────────────────────────
echo ""
echo "Cursor (~/.cursor/rules/):"
CURSOR_RULES_DIR="$HOME/.cursor/rules"
mkdir -p "$CURSOR_RULES_DIR"
# Link each global agent as a Cursor rule
for agent_file in "$AGENTS_DIR/agents"/*.md; do
    [ -f "$agent_file" ] || continue
    agent_name="$(basename "$agent_file")"
    link_item "$agent_file" "$CURSOR_RULES_DIR/$agent_name" "rules/$agent_name"
done

# ── 6. Agents reference symlink ───────────────────────────────────────────────
# ~/Agents/ IS the source — no self-symlink needed.
# The SKILLS_SYSTEM.md here is the actual file.
echo ""
echo "~/Agents/ is the source of truth — no additional symlinks needed."

# ── 7. Summary and other platforms ───────────────────────────────────────────
echo ""
echo "=== Setup complete ==="
echo ""
echo "Other platforms — manual steps:"
echo ""
echo "Codex (per project):"
echo "  cat ~/Agents/SKILLS_SYSTEM.md > [repo]/AGENTS.md"
echo "  # or: ln -s ~/Agents/commands/dev.md [repo]/AGENTS.md"
echo ""
echo "Antigravity / Gemini CLI:"
echo "  Add this to your system prompt:"
echo "  'You have access to a dev pipeline. Load and follow: ~/Agents/commands/dev.md'"
echo "  'For bug fixes use: ~/Agents/commands/fix.md'"
echo "  'For low-token mode use: ~/Agents/commands/lean.md'"
echo "  'For session-safe checkpoints use: ~/Agents/commands/session.md'"
echo ""
cmd_count=$(ls "$CLAUDE_DIR/commands/"*.md 2>/dev/null | wc -l | tr -d ' ')
agent_count=$(ls "$AGENTS_DIR/agents/"*.md 2>/dev/null | wc -l | tr -d ' ')
echo "Commands available:  $cmd_count"
echo "Agents available:    $agent_count"
echo ""
echo "Edit skills in: ~/Agents/"
echo "  /update-skills  — runs setup automatically, update/generate/research"
echo "  /dev            — start the development pipeline"
echo "  /fix            — fast bug fix"
echo "  /conclude       — wrap up session"
