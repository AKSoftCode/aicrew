#!/usr/bin/env bash
# Run each registered repo's .ai/skills/setup.sh with AGENT_KIT_ROOT set.
# Paths in SETUPS are relative to the parent of this agent-kit directory (your workspace root).

set -euo pipefail

AGENT_KIT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
export AGENT_KIT_ROOT
WORKSPACE="$(cd "$AGENT_KIT_ROOT/.." && pwd)"

# shellcheck disable=SC2034
declare -a SETUPS=(
  # Add one line per repo (path relative to WORKSPACE):
  # "my-app/.ai/skills/setup.sh"
)

echo "=== agent-kit install ==="
echo "Kit:       $AGENT_KIT_ROOT"
if [ -f "$AGENT_KIT_ROOT/VERSION" ]; then
  echo "Version:   $(tr -d '\n' <"$AGENT_KIT_ROOT/VERSION")"
fi
echo "Workspace: $WORKSPACE"
echo ""

run_setup() {
  local rel="$1"
  local script="$WORKSPACE/$rel"
  if [ -f "$script" ]; then
    echo "→ $rel"
    bash "$script"
    echo ""
  else
    echo "○ Skip (missing): $rel"
    echo ""
  fi
}

if [ "${#SETUPS[@]}" -eq 0 ]; then
  echo "No repos registered. Edit install.sh and add paths to the SETUPS array."
  echo ""
  exit 0
fi

for rel in "${SETUPS[@]}"; do
  run_setup "$rel"
done

echo "=== agent-kit install complete ==="
