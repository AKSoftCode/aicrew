#!/usr/bin/env bash
# ~/.claude/skills/setup.sh
#
# Global skills setup: creates command symlinks and registers hooks
# in ~/.claude/settings.json.
#
# Run once after cloning or updating the skills directory:
#   bash ~/.claude/skills/setup.sh
#
# Safe to re-run: idempotent, never overwrites non-symlinks.

set -euo pipefail

SKILLS_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CLAUDE_DIR="$HOME/.claude"
SETTINGS_FILE="$CLAUDE_DIR/settings.json"

echo "=== Claude Skills — Global Setup ==="
echo "Skills: $SKILLS_DIR"
echo ""

# ── 1. Command symlinks ──────────────────────────────────────────────────────
echo "Commands:"
mkdir -p "$CLAUDE_DIR/commands"

for cmd_file in "$SKILLS_DIR/commands"/*.md; do
    [ -f "$cmd_file" ] || continue
    cmd_name="$(basename "$cmd_file")"
    link_target="$CLAUDE_DIR/commands/$cmd_name"

    if [ -L "$link_target" ]; then
        echo "  ↻  Already linked:   $cmd_name"
    elif [ -e "$link_target" ]; then
        echo "  ⚠  Exists (not symlink), skipping: $cmd_name"
    else
        ln -s "$cmd_file" "$link_target"
        echo "  ✓  Linked:           $cmd_name"
    fi
done

# ── 2. Register hooks in ~/.claude/settings.json ─────────────────────────────
echo ""
echo "Hooks:"

python3 - "$SKILLS_DIR" "$SETTINGS_FILE" <<'PYEOF'
import json
import sys
from pathlib import Path

skills_dir = sys.argv[1]
settings_path = Path(sys.argv[2])

# Load existing settings safely
settings: dict = {}
if settings_path.exists():
    try:
        settings = json.loads(settings_path.read_text())
    except (json.JSONDecodeError, OSError):
        pass

hooks: dict = settings.setdefault("hooks", {})


def already_registered(hook_list: list, script_basename: str) -> bool:
    """Check if a hook script is already in the list (by basename)."""
    return any(script_basename in json.dumps(entry) for entry in hook_list)


# ── Stop hook: session memory ────────────────────────────────────────────────
stop_hooks: list = hooks.setdefault("Stop", [])
mem_script = f"{skills_dir}/hooks/session-memory.py"
if not already_registered(stop_hooks, "session-memory.py"):
    stop_hooks.append({
        "hooks": [{"type": "command", "command": f"python3 {mem_script}"}]
    })
    print(f"  ✓  Registered:       Stop → session-memory.py")
else:
    print(f"  ↻  Already registered: session-memory.py")

# ── PreToolUse hook: security guard ─────────────────────────────────────────
pre_hooks: list = hooks.setdefault("PreToolUse", [])
sec_script = f"{skills_dir}/hooks/security-guard.py"
if not already_registered(pre_hooks, "security-guard.py"):
    pre_hooks.append({
        "matcher": "Edit|Write|MultiEdit",
        "hooks": [{"type": "command", "command": f"python3 {sec_script}"}]
    })
    print(f"  ✓  Registered:       PreToolUse → security-guard.py")
else:
    print(f"  ↻  Already registered: security-guard.py")

# Write back
settings_path.write_text(json.dumps(settings, indent=4))
PYEOF

# ── 3. ~/Agents doc symlink ──────────────────────────────────────────────────
echo ""
echo "Docs:"
mkdir -p "$HOME/Agents"
doc_target="$HOME/Agents/SKILLS_SYSTEM.md"
doc_source="$SKILLS_DIR/SKILLS_SYSTEM.md"
if [ -L "$doc_target" ]; then
    echo "  ↻  Already linked:   ~/Agents/SKILLS_SYSTEM.md"
elif [ -e "$doc_target" ]; then
    echo "  ⚠  Exists (not symlink), skipping: ~/Agents/SKILLS_SYSTEM.md"
else
    ln -s "$doc_source" "$doc_target"
    echo "  ✓  Linked:           ~/Agents/SKILLS_SYSTEM.md"
fi

# ── 4. Summary ───────────────────────────────────────────────────────────────
echo ""
echo "=== Setup complete ==="
cmd_count=$(ls "$CLAUDE_DIR/commands/"*.md 2>/dev/null | wc -l | tr -d ' ')
echo "Commands available: $cmd_count"
echo ""
echo "You only need ONE command from here:"
echo "  /update-skills   — runs setup automatically, then lets you generate/update/research"
echo ""
echo "Other commands:"
echo "  /dev             — start the development pipeline"
echo "  /conclude        — wrap up a session and save learnings"
