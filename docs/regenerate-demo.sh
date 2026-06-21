#!/usr/bin/env bash
# Regenerate docs/demo.cast and assets/demo.gif from docs/record-demo.sh
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$REPO_ROOT"

export TERM=xterm-256color
export PATH="${HOME}/.local/bin:${PATH}"

CAST="docs/demo.cast"
GIF="assets/demo.gif"
SCRIPT="docs/record-demo.sh"

command -v asciinema >/dev/null || { echo "asciinema required"; exit 1; }
command -v agg >/dev/null || { echo "agg required — https://github.com/asciinema/agg"; exit 1; }

echo "Recording ${CAST} ..."
asciinema rec -c "$SCRIPT" "$CAST" --overwrite -i 5 --cols 80 --rows 24 -t "aicrew ~75s demo"

echo "Rendering ${GIF} ..."
agg --theme monokai --font-size 10 --fps-cap 8 --cols 80 --rows 24 \
  --idle-time-limit 2 "$CAST" "$GIF"

python3 - <<'PY'
import json, hashlib, pathlib
cast = pathlib.Path("docs/demo.cast")
gif = pathlib.Path("assets/demo.gif")
lines = cast.read_text().splitlines()
meta = json.loads(lines[0])
events = [json.loads(l) for l in lines[1:]]
print(f"cast: {len(events)} events, {events[-1][0]:.1f}s, {meta.get('width')}x{meta.get('height')}")
print(f"gif:  {gif.stat().st_size} bytes, sha256={hashlib.sha256(gif.read_bytes()).hexdigest()}")
PY
