#!/usr/bin/env python3
"""
Session Memory Hook — fires on the Stop event (after each Claude turn).

Captures which files changed this session into a rolling journal file.
The /conclude command synthesizes the journal into structured MEMORY.md entries.

Design principles:
- Zero external dependencies (stdlib only)
- Never crashes or slows the user's session (all errors silently swallowed)
- Idempotent: safe to fire multiple times per session
- Writes only to the user's memory directory (no project files touched)
"""

import json
import os
import subprocess
import sys
from datetime import datetime
from pathlib import Path


def get_memory_dir() -> Path:
    """
    Derive the memory directory from the current working directory.
    Matches the slug format Claude Code uses for project-scoped memory.
    """
    cwd = os.environ.get("CLAUDE_PROJECT_ROOT", os.getcwd())
    slug = cwd.replace("/", "-").lstrip("-")
    return Path.home() / ".claude" / "projects" / slug / "memory"


def get_changed_files() -> list[str]:
    """
    Return files changed relative to HEAD (staged + unstaged).
    Returns empty list if not in a git repo or git is unavailable.
    """
    try:
        unstaged = subprocess.run(
            ["git", "diff", "--name-only", "HEAD"],
            capture_output=True, text=True, timeout=5, cwd=os.getcwd()
        )
        staged = subprocess.run(
            ["git", "diff", "--name-only", "--cached"],
            capture_output=True, text=True, timeout=5, cwd=os.getcwd()
        )
        files: set[str] = set()
        for line in (unstaged.stdout + staged.stdout).splitlines():
            f = line.strip()
            if f:
                files.add(f)
        return sorted(files)
    except Exception:
        return []


def read_hook_input() -> dict:
    """Read hook payload from stdin without crashing if malformed."""
    try:
        raw = sys.stdin.read()
        return json.loads(raw) if raw.strip() else {}
    except Exception:
        return {}


def write_journal_entry(memory_dir: Path, changed_files: list[str]) -> None:
    """Append a timestamped entry to the session journal."""
    journal = memory_dir / "session_journal.md"
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M")
    project_name = Path(os.getcwd()).name

    lines = [
        f"\n## {timestamp} — {project_name}",
        "Changed:",
    ]
    lines += [f"- `{f}`" for f in changed_files]
    lines.append("")

    with open(journal, "a") as fh:
        fh.write("\n".join(lines))


def trim_journal_if_needed(memory_dir: Path, max_entries: int = 10) -> None:
    """Keep only the most recent max_entries in the journal to prevent unbounded growth."""
    journal = memory_dir / "session_journal.md"
    if not journal.exists():
        return

    content = journal.read_text()
    # Split on H2 headers (## date — project)
    sections = content.split("\n## ")
    if len(sections) <= max_entries + 1:  # +1 for the part before first header
        return

    # Keep header (before first ##) + last max_entries sections
    header = sections[0]
    recent = sections[-(max_entries):]
    trimmed = header + "\n## ".join([""] + recent)
    journal.write_text(trimmed)


def main() -> None:
    _ = read_hook_input()  # Consume stdin — required even if unused

    changed = get_changed_files()
    if not changed:
        sys.exit(0)

    memory_dir = get_memory_dir()
    try:
        memory_dir.mkdir(parents=True, exist_ok=True)
    except Exception:
        sys.exit(0)

    try:
        write_journal_entry(memory_dir, changed)
        trim_journal_if_needed(memory_dir)
    except Exception:
        pass  # Never interrupt the user's session over memory bookkeeping

    sys.exit(0)


if __name__ == "__main__":
    main()
