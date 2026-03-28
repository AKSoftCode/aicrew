#!/usr/bin/env python3
"""
Security Guard Hook — fires on PreToolUse for Edit, Write, and MultiEdit.

Scans content being written for common security anti-patterns.
Warnings (exit 0): advisory, does not block the tool call.
Blocks (exit 2): only for confirmed dangerous content (private keys, AWS keys).

Design principles:
- Written from scratch, zero external dependencies
- Low false-positive rate: only flags patterns with genuine security impact
- Skips test files, fixtures, and lock files
- Never crashes: all errors silently swallowed
"""

import json
import re
import sys
from pathlib import Path


# ---------------------------------------------------------------------------
# Pattern registry
# Each entry: (compiled_regex, severity, human_readable_message)
# severity "WARN" = print warning, exit 0 (advisory)
# severity "BLOCK" = print error, exit 2 (stops the tool call)
# ---------------------------------------------------------------------------

PATTERNS: list[tuple[re.Pattern, str, str]] = [
    # --- BLOCK patterns (undeniably dangerous) ---
    (
        re.compile(r"-----BEGIN (?:RSA |EC |OPENSSH |)?PRIVATE KEY"),
        "BLOCK",
        "Private key content detected in source file — remove it immediately and rotate the key",
    ),
    (
        re.compile(r"(?:AKIA|ASIA)[0-9A-Z]{16}"),
        "BLOCK",
        "AWS access key ID pattern detected — rotate this credential immediately",
    ),
    # --- WARN patterns (require human judgement) ---
    (
        re.compile(
            r'(?i)(?:password|secret|api_key|auth_token|access_token)\s*=\s*["\'][^"\']{8,}["\']'
        ),
        "WARN",
        "Possible hardcoded credential — use environment variables or a secrets manager",
    ),
    (
        re.compile(
            r'(?i)(?:execute|query|cursor\.execute|db\.run)\s*\(\s*(?:f["\']|["\'].*%s|["\'].*\+)'
        ),
        "WARN",
        "Possible SQL injection — use parameterized queries instead of string formatting",
    ),
    (
        re.compile(r'(?i)subprocess\.(?:call|run|Popen)\s*\([^)]*\+'),
        "WARN",
        "Possible command injection — avoid concatenating user input into shell commands",
    ),
    (
        re.compile(r'\beval\s*\('),
        "WARN",
        "eval() detected — verify that input is never user-controlled",
    ),
    (
        re.compile(r'(?i)verify\s*=\s*False'),
        "WARN",
        "SSL/TLS verification disabled — this must never reach production",
    ),
    (
        re.compile(r'(?i)debug\s*=\s*True'),
        "WARN",
        "debug=True detected — ensure this is gated behind an environment check",
    ),
]

# File extensions worth scanning
SCANNABLE_EXTENSIONS: frozenset[str] = frozenset({
    ".py", ".js", ".ts", ".tsx", ".jsx", ".mjs", ".cjs",
    ".sh", ".bash", ".zsh",
    ".yaml", ".yml", ".toml",
    ".env",
})

# Path fragments that indicate files we should not scan
# (test fixtures legitimately contain example credentials)
SKIP_FRAGMENTS: frozenset[str] = frozenset({
    "node_modules",
    ".git",
    "venv",
    "__pycache__",
    ".pytest_cache",
    "fixtures",
    "mocks",
    ".lock",           # lock files
    "package-lock",
    "yarn.lock",
    "poetry.lock",
})


def should_scan(file_path: str) -> bool:
    p = Path(file_path)
    if p.suffix not in SCANNABLE_EXTENSIONS:
        return False
    path_lower = file_path.lower()
    if any(frag in path_lower for frag in SKIP_FRAGMENTS):
        return False
    return True


def scan(content: str) -> list[tuple[str, str]]:
    """Return list of (severity, message) for each pattern match."""
    findings: list[tuple[str, str]] = []
    seen_messages: set[str] = set()
    for pattern, severity, message in PATTERNS:
        if pattern.search(content) and message not in seen_messages:
            findings.append((severity, message))
            seen_messages.add(message)
    return findings


def collect_content(tool_input: dict) -> str:
    """Gather all text being written from various tool input shapes."""
    parts: list[str] = []
    if "new_string" in tool_input:
        parts.append(tool_input["new_string"])
    if "content" in tool_input:
        parts.append(tool_input["content"])
    # MultiEdit has an edits list
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

    if not should_scan(file_path):
        sys.exit(0)

    content = collect_content(tool_input)
    if not content.strip():
        sys.exit(0)

    findings = scan(content)
    if not findings:
        sys.exit(0)

    blocks = [(s, m) for s, m in findings if s == "BLOCK"]
    warns  = [(s, m) for s, m in findings if s == "WARN"]

    file_label = Path(file_path).name

    if blocks:
        lines = [f"🚨 BLOCKED [{file_label}]: {m}" for _, m in blocks]
        lines.append("")
        lines.append("Resolve the issue above before writing this file.")
        print("\n".join(lines))
        sys.exit(2)

    if warns:
        lines = [f"⚠️  SECURITY [{file_label}]: {m}" for _, m in warns]
        print("\n".join(lines))
        sys.exit(0)


if __name__ == "__main__":
    main()
