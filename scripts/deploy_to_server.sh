#!/usr/bin/env bash
# Deploy the current branch to a remote server.
# Connects via SSH, checks out the current branch, pulls latest changes,
# and runs the build & install script on the remote.
# Requires REMOTE and REMOTE_DIR to be set in .env (see .env.example).
set -euo pipefail

cd "$(dirname "$0")/.."

if [ ! -f .env ]; then
    echo "Error: .env file not found. Copy .env.example and fill in your values." >&2
    exit 1
fi
source .env

if [ -z "${REMOTE:-}" ] || [ -z "${REMOTE_DIR:-}" ]; then
    echo "Error: REMOTE and REMOTE_DIR must be set in .env" >&2
    exit 1
fi

BRANCH=$(git rev-parse --abbrev-ref HEAD)

ssh "$REMOTE" "cd $REMOTE_DIR && git checkout $BRANCH && git pull && ./scripts/build_and_install.sh"
