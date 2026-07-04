#!/usr/bin/env bash
set -euo pipefail

SOURCE_REPO="/home/salty/Documents/Personal/Gaming/TTRPG/Campaigns/Planar Pathfinders"
PREFIX="source/content"
BRANCH="main"

REPO_ROOT="$(git rev-parse --show-toplevel)"
cd "$REPO_ROOT"

if [ -n "$(git status --porcelain)" ]; then
  echo "Working tree has uncommitted changes. Commit or stash them first, then re-run." >&2
  exit 1
fi

git subtree pull --prefix="$PREFIX" "$SOURCE_REPO" "$BRANCH" --squash
