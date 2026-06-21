#!/usr/bin/env bash
# ~75s scripted session for docs/demo.cast — run: asciinema rec -c docs/record-demo.sh docs/demo.cast
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
export TERM="${TERM:-xterm-256color}"

mkdir -p /tmp/aicrew-demo-bin
cat > /tmp/aicrew-demo-bin/npx << EOF
#!/usr/bin/env bash
if [[ "\$1" == "aicrew" ]]; then
  shift
  exec node "${REPO_ROOT}/bin/aicrew.js" "\$@"
fi
exec command npx "\$@"
EOF
chmod +x /tmp/aicrew-demo-bin/npx
export PATH="/tmp/aicrew-demo-bin:${PATH}"

aicrew() { node "${REPO_ROOT}/bin/aicrew.js" "$@"; }
export -f aicrew

pause() { sleep "${1:-2}"; }

section() {
  clear
  echo
  printf '━━━ %s ━━━\n' "$1"
  echo
  pause 2
}

run() {
  printf '$ %s\n' "$1"
  shift
  "$@"
  pause "${PAUSE_AFTER:-2}"
}

reveal() {
  local file="$1"
  local delay="${2:-0.12}"
  while IFS= read -r line || [[ -n "$line" ]]; do
    echo "$line"
    sleep "$delay"
  done < "$file"
}

# ── Hook (5s) ──────────────────────────────────────────────────────────────
clear
echo
echo "  aicrew — structured agent pipelines for Cursor, Claude Code, and Codex"
echo "  One install → /dev /fix /quick with TDD, security gates, and token savings"
pause 5

# ── Install path (10s) ─────────────────────────────────────────────────────
section "1 · Install check"
PAUSE_AFTER=3
run 'npx aicrew status' npx aicrew status
echo
PAUSE_AFTER=4
run 'aicrew doctor' aicrew doctor
echo

# ── Three commands (15s) ───────────────────────────────────────────────────
section "2 · Three commands (slash commands after install)"
printf '$ %s\n' 'npx aicrew --help | sed -n "/AFTER INSTALL/,+12p"'
npx aicrew --help | sed -n '/AFTER INSTALL/,+12p'
pause 5
echo
printf '$ %s\n' 'npx aicrew --help | sed -n "/Maintenance/,+3p"'
npx aicrew --help | sed -n '/Maintenance/,+3p'
pause 5
echo

# ── Pipeline depth (20s) ───────────────────────────────────────────────────
section "3 · Pipeline depth — phase gates"
printf '$ %s\n' 'cat docs/demo-script.txt'
reveal "${REPO_ROOT}/docs/demo-script.txt" 0.15
pause 5
echo

# ── Token proof (10s) ──────────────────────────────────────────────────────
section "4 · Token savings — real benchmark"
PAUSE_AFTER=4
run 'aicrew benchmark' aicrew benchmark
pause 2
echo

# ── Close (5s) ─────────────────────────────────────────────────────────────
section "5 · Learn more"
echo "  Full reference → docs/pipeline-overview.md"
echo "  Install now      → npx aicrew install"
pause 5
