#!/usr/bin/env bash
set -euo pipefail

# Resolve expected PR conflicts for AI unlock feature files by taking current branch versions.
# Usage:
#   ./scripts/resolve-ai-conflicts.sh

FILES=(
  "packages/scratch-gui/src/components/ai-panel/ai-panel.css"
  "packages/scratch-gui/src/components/ai-panel/ai-panel.jsx"
  "packages/scratch-gui/src/components/gui/gui.jsx"
)

for f in "${FILES[@]}"; do
  git checkout --ours "$f"
  git add "$f"
done

echo "Marked AI files as resolved with current branch versions."
echo "Now run: git commit -m 'resolve merge conflicts for ai unlock files'"
