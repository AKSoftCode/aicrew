#!/usr/bin/env python3
"""
Audit Guard Hook — PreToolUse hook for {{PROJECT_NAME}}.

Domain-specific invariant checks that fire before every Edit/Write.
Supplements the global security-guard.py.

Customise BLOCK_PATTERNS and WARN_CHECKS for your domain rules.

Design principles:
- Zero external dependencies (Python stdlib only)
- Low false-positive rate: skips tests, migrations, docs
- Warnings only (exit 0) unless truly destructive (exit 2)
- Never crashes or slows the session
"""

import json
import re
import sys
from pathlib import Path


# ---------------------------------------------------------------------------
# Files to skip — tests and migrations may legitimately override domain rules
# ---------------------------------------------------------------------------
SKIP_FRAGMENTS: frozenset = frozenset({
    "test_", "_test.", "/tests/", "conftest",
    "alembic/versions", "migrations/",
    "venv/", "node_modules", "__pycache__", ".pytest_cache",
    "fixture", "mock",
    ".md", ".rst", ".txt", ".mdc",
})

# ---------------------------------------------------------------------------
# Dangerous DB operations — block these (exit 2)
# ---------------------------------------------------------------------------
# Patterns are assembled at runtime to avoid self-triggering in the source.
_DDL_OPS = [
    # Detect schema destruction outside migrations
    (re.compile(r"\bDROP\s+" + "TABLE" + r"\b", re.IGNORECASE),
     "Schema destruction detected outside a migration file"),
    # Detect unfiltered bulk removal
    (re.compile(r"\b" + "DELETE" + r"\s+FROM\s+\w+\s*(?:;|$)", re.IGNORECASE),
     "Bulk removal without WHERE clause — add a filter or use a migration"),
    # Add more domain-specific blocking patterns here:
    # (re.compile(r"..."), "message"),
]

BLOCK_PATTERNS: list = _DDL_OPS

# ---------------------------------------------------------------------------
# Domain-specific warnings (exit 0, advisory)
# ---------------------------------------------------------------------------
# Add check functions here. Each receives (file_path: str, content: str) → bool.
# Return True to trigger the warning.

def _route_without_auth(fp: str, c: str) -> bool:
    """New route definition without an auth/permission guard."""
    if not re.search(r"@router\.\w+\(|router\.\w+\(", c):
        return False
    if re.search(r"require_permission|require_auth|authenticate|authorize|Depends\(get_current_user", c):
        return False
    return True


WARN_CHECKS: list = [
    (
        _route_without_auth,
        "New route detected — add an authentication/authorization guard",
    ),
    # Add more domain-specific warning checks here:
    # (_your_check_fn, "your warning message"),
]


def should_skip(file_path: str) -> bool:
    path_lower = file_path.lower()
    return any(frag in path_lower for frag in SKIP_FRAGMENTS)


def is_code_file(file_path: str) -> bool:
    code_exts = {".py", ".js", ".ts", ".tsx", ".jsx", ".sql", ".sh"}
    return Path(file_path).suffix in code_exts


def collect_content(tool_input: dict) -> str:
    parts: list = []
    if "new_string" in tool_input:
        parts.append(tool_input["new_string"])
    if "content" in tool_input:
        parts.append(tool_input["content"])
    for edit in tool_input.get("edits", []):
        if isinstance(edit, dict) and "new_string" in edit:
            parts.append(edit["new_string"])
    return "\n".join(parts)


def main() -> None:
    try:
        raw = sys.stdin.read()
        data = json.loads(raw) if raw.strip() else {}
    except Exception:
        sys.exit(0)

    tool_name = data.get("tool_name", "")
    if tool_name not in ("Edit", "Write", "MultiEdit"):
        sys.exit(0)

    tool_input = data.get("tool_input", {})
    file_path = tool_input.get("file_path", "")

    if should_skip(file_path):
        sys.exit(0)

    content = collect_content(tool_input)
    if not content.strip():
        sys.exit(0)

    file_label = Path(file_path).name
    blocks: list = []
    warns: list = []

    if is_code_file(file_path):
        for pattern, message in BLOCK_PATTERNS:
            if pattern.search(content):
                blocks.append(message)

    if file_path.endswith(".py") or is_code_file(file_path):
        for check_fn, message in WARN_CHECKS:
            try:
                if check_fn(file_path, content):
                    warns.append(message)
            except Exception:
                pass

    if blocks:
        lines = [f"BLOCKED [{file_label}]: {b}" for b in blocks]
        lines.append("")
        lines.append("Resolve the issue before writing this file.")
        print("\n".join(lines))
        sys.exit(2)

    if warns:
        lines = [f"AUDIT [{file_label}]: {w}" for w in warns]
        print("\n".join(lines))
        sys.exit(0)


if __name__ == "__main__":
    main()
