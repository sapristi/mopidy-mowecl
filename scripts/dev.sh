#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

# Build frontend into mopidy_mowecl/static
cd mowecl_react
pnpm install
pnpm build
cd ..

# Create/update venv with access to system packages (for gi/GStreamer)
VENV_DIR=.venv-dev
if [ ! -d "$VENV_DIR" ]; then
    uv venv "$VENV_DIR" --system-site-packages
fi
uv pip install --python "$VENV_DIR/bin/python" 'setuptools<81' pygobject pylast mopidy -e .

# Open browser once mopidy is listening, then run mopidy in foreground
(while ! curl -s -o /dev/null http://localhost:6680; do sleep 0.5; done; xdg-open http://localhost:6680/mowecl/) &
"$VENV_DIR/bin/mopidy"
