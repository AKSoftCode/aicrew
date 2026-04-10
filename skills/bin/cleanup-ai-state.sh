#!/usr/bin/env bash
set -euo pipefail

# Deletes stale state files to avoid clutter.
# Target: .ai/state/AI_STATE.*.md files older than N days (default: 3).
#
# Usage:
#   cleanup-ai-state.sh [days] [root]
# Examples:
#   cleanup-ai-state.sh
#   cleanup-ai-state.sh 7
#   cleanup-ai-state.sh 3 /home/abhi/Workspace/3DTrace.ai

DAYS="${1:-3}"
ROOT="${2:-$(pwd)}"

STATE_DIR="$ROOT/.ai/state"

if [ ! -d "$STATE_DIR" ]; then
  exit 0
fi

find "$STATE_DIR" -maxdepth 1 -type f -name "AI_STATE.*.md" -mtime "+$DAYS" -print -delete
