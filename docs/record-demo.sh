#!/usr/bin/env bash
# Short scripted session for docs/demo.cast — run via asciinema rec -c
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

run() {
  printf '$ %s\n' "$1"
  shift
  "$@"
  sleep 0.5
}

run 'npx aicrew status' npx aicrew status
echo
run 'aicrew doctor' aicrew doctor
echo
run 'npx aicrew --help | grep -E "/dev|/fix|/quick"' \
  bash -c 'npx aicrew --help | grep -E "/dev|/fix|/quick"'
