#!/usr/bin/env bash
# Build the frontend and Python wheel, then install into the local
# Mopidy pipx environment and restart the Mopidy service.
# Intended to run on the target server (called by deploy_to_server.sh
# or manually).
set -euo pipefail

# Build frontend
cd mowecl_react
pnpm install
pnpm build
cd ..

# Build Python wheel
pdm build

# Find the wheel that was just built
WHEEL=$(ls -t dist/*.whl | head -1)
echo "Built: $WHEEL"

# Install into mopidy pipx environment
pipx inject mopidy "./$WHEEL" --force
systemctl --user restart mopidy
echo "Mopidy restarted."
systemctl --user status mopidy
