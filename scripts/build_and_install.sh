#!/usr/bin/env bash
set -euo pipefail

# cd "$(dirname "$0")"

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
