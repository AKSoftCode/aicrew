#!/usr/bin/env bash
# Scripted ~60s session for docs/demo.cast — run via asciinema rec -c
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"

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

pause() { sleep "${1:-1}"; }

run() {
  printf '$ %s\n' "$1"
  shift
  "$@"
  pause "${PAUSE_AFTER:-1.2}"
}

card() {
  echo
  cat <<'EOF'
┌─ The three commands ─────────────────────────────────────────────┐
│  /dev    9-phase pipeline — features, refactors, design spec   │
│  /fix    5-phase fast path — bug fixes with TDD + security     │
│  /quick  Scout → Act — small scoped tasks, lowest tokens       │
└────────────────────────────────────────────────────────────────┘
EOF
  pause 4
}

echo "aicrew — install check, pipelines, token savings (~60s)"
pause 3

PAUSE_AFTER=5
run 'npx aicrew status' npx aicrew status
echo
PAUSE_AFTER=5
run 'aicrew doctor' aicrew doctor
echo

printf '$ %s\n' 'echo "── commands ──" && card'
echo "── commands ──"
card
echo

PAUSE_AFTER=3
run 'npx aicrew --help | sed -n "/AFTER INSTALL/,+7p"' \
  bash -c 'npx aicrew --help | sed -n "/AFTER INSTALL/,+7p"'
echo

PAUSE_AFTER=8
run 'cat docs/demo-pipeline.txt' cat "${REPO_ROOT}/docs/demo-pipeline.txt"
echo

PAUSE_AFTER=5
run 'aicrew benchmark' aicrew benchmark
echo
echo "→ Full reference: docs/pipeline-overview.md  |  npx aicrew install"
pause 3
