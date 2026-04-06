#!/usr/bin/env python3
"""
Session Memory Hook — fires on the Stop event (after each Claude turn).

What it does:
1. Journals changed files to a rolling session_journal.md
2. Accumulates edited JS/TS file paths for batch typecheck (runs once per turn at Stop, not per-edit)
3. Captures atomic "instincts" — small project-scoped learnings with confidence scores
4. Respects <private> tags: content marked <private>...</private> is never stored

Design principles:
- Zero external dependencies (stdlib only)
- Never crashes or slows the user's session (all errors silently swallowed)
- Idempotent: safe to fire multiple times per session
- Writes only to the user's memory directory (no project files touched)

Hook profile (set ECC_HOOK_PROFILE env var):
  minimal   — journal only, no typecheck, no instincts
  standard  — journal + typecheck (default)
  strict    — journal + typecheck + instinct capture
"""

import json
import os
import subprocess
import sys
from datetime import datetime
from pathlib import Path

HOOK_PROFILE = os.environ.get("ECC_HOOK_PROFILE", "standard")
DISABLED_HOOKS = set(os.environ.get("ECC_DISABLED_HOOKS", "").split(","))


def is_enabled(feature: str) -> bool:
    if feature in DISABLED_HOOKS:
        return False
    if HOOK_PROFILE == "minimal":
        return feature == "journal"
    if HOOK_PROFILE == "standard":
        return feature in ("journal", "typecheck")
    return True  # strict: all features enabled


def get_memory_dir() -> Path:
    """Derive memory dir from CWD (matches Claude Code project slug format)."""
    cwd = os.environ.get("CLAUDE_PROJECT_ROOT", os.getcwd())
    slug = cwd.replace("/", "-").lstrip("-")
    return Path.home() / ".claude" / "projects" / slug / "memory"


def get_project_id() -> str:
    """Get stable project ID from git remote or fallback to dir hash."""
    try:
        result = subprocess.run(
            ["git", "remote", "get-url", "origin"],
            capture_output=True, text=True, timeout=3, cwd=os.getcwd()
        )
        if result.returncode == 0:
            import hashlib
            return hashlib.md5(result.stdout.strip().encode()).hexdigest()[:8]
    except Exception:
        pass
    import hashlib
    return hashlib.md5(os.getcwd().encode()).hexdigest()[:8]


def get_changed_files() -> list[str]:
    """Return files changed relative to HEAD (staged + unstaged)."""
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


def strip_private(text: str) -> str:
    """Remove <private>...</private> blocks before storing any content."""
    import re
    return re.sub(r"<private>.*?</private>", "[REDACTED]", text, flags=re.DOTALL).strip()


def write_journal_entry(memory_dir: Path, changed_files: list[str]) -> None:
    """Append a timestamped entry to the session journal."""
    journal = memory_dir / "session_journal.md"
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M")
    project_name = Path(os.getcwd()).name

    lines = [f"\n## {timestamp} — {project_name}", "Changed:"]
    lines += [f"- `{f}`" for f in changed_files]
    lines.append("")

    with open(journal, "a") as fh:
        fh.write("\n".join(lines))


def trim_journal_if_needed(memory_dir: Path, max_entries: int = 10) -> None:
    """Keep only the most recent max_entries to prevent unbounded growth."""
    journal = memory_dir / "session_journal.md"
    if not journal.exists():
        return
    content = journal.read_text()
    sections = content.split("\n## ")
    if len(sections) <= max_entries + 1:
        return
    header = sections[0]
    recent = sections[-(max_entries):]
    trimmed = header + "\n## ".join([""] + recent)
    journal.write_text(trimmed)


def run_batch_typecheck(changed_files: list[str]) -> None:
    """
    Run typecheck once for all TS/JS files changed this turn — not per-edit.
    Batches at Stop time to avoid redundant tsc calls during multi-file edits.
    """
    ts_files = [f for f in changed_files if f.endswith((".ts", ".tsx", ".js", ".jsx")) and "/node_modules/" not in f]
    if not ts_files:
        return

    # Only run if tsconfig.json exists in the project
    cwd = Path(os.getcwd())
    if not any((cwd / name).exists() for name in ("tsconfig.json", "tsconfig.base.json")):
        return

    try:
        result = subprocess.run(
            ["npx", "tsc", "--noEmit", "--pretty", "false"],
            capture_output=True, text=True, timeout=30, cwd=cwd
        )
        if result.returncode != 0:
            # Print to stderr so user sees TS errors — but don't block session
            errors = result.stdout[:2000] if result.stdout else result.stderr[:2000]
            print(f"[session-memory] TypeScript errors detected:\n{errors}", file=sys.stderr)
    except Exception:
        pass


def capture_instinct(memory_dir: Path, hook_input: dict, changed_files: list[str]) -> None:
    """
    Lightweight instinct capture: store a small file per session summarizing
    the pattern observed. A full instinct system would use a background AI agent,
    but this lightweight version creates JSONL entries that /conclude can process.

    Format (instincts.jsonl):
    {"id": "...", "trigger": "...", "observation": "...", "confidence": 0.5,
     "domain": "...", "scope": "project", "project_id": "...", "ts": "..."}
    """
    instincts_file = memory_dir / "instincts.jsonl"
    project_id = get_project_id()

    # Detect domain from changed files
    domains: set[str] = set()
    for f in changed_files:
        if any(p in f for p in ("components", ".tsx", ".vue", ".svelte")):
            domains.add("frontend")
        if any(p in f for p in ("api", "routes", "services", "backend")):
            domains.add("backend")
        if any(p in f for p in ("migrations", "schema", "models")):
            domains.add("db")
        if "test" in f or "spec" in f:
            domains.add("testing")

    if not domains:
        return

    entry = {
        "id": f"{project_id}-{datetime.now().strftime('%Y%m%d%H%M%S')}",
        "trigger": f"session touched {', '.join(sorted(domains))} files",
        "observation": strip_private(f"Changed: {', '.join(changed_files[:10])}"),
        "confidence": 0.5,
        "domain": list(domains)[0] if len(domains) == 1 else "multi",
        "scope": "project",
        "project_id": project_id,
        "ts": datetime.now().isoformat(),
    }

    with open(instincts_file, "a") as fh:
        fh.write(json.dumps(entry) + "\n")


def main() -> None:
    hook_input = read_hook_input()

    changed = get_changed_files()
    if not changed:
        sys.exit(0)

    memory_dir = get_memory_dir()
    try:
        memory_dir.mkdir(parents=True, exist_ok=True)
    except Exception:
        sys.exit(0)

    # 1. Journal (always, unless disabled)
    if is_enabled("journal"):
        try:
            write_journal_entry(memory_dir, changed)
            trim_journal_if_needed(memory_dir)
        except Exception:
            pass

    # 2. Batch typecheck (standard + strict profiles)
    if is_enabled("typecheck"):
        try:
            run_batch_typecheck(changed)
        except Exception:
            pass

    # 3. Instinct capture (strict profile only)
    if is_enabled("instincts"):
        try:
            capture_instinct(memory_dir, hook_input, changed)
        except Exception:
            pass

    sys.exit(0)


if __name__ == "__main__":
    main()
