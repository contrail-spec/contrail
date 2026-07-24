#!/usr/bin/env bash
#
# Creates the standard Contrail issue labels on GitHub.
# Requires: gh CLI authenticated with repo write access.
#
# Run once after creating the GitHub repo:
#   bash scripts/create-labels.sh
#
# Labels match CONTRIBUTING.md §Issue Labels.

set -euo pipefail

LABELS=(
  "spec-question:Student question about schema or semantics:1d76db"
  "bug:Something is broken:d73a4a"
  "good-first-issue:Suitable for new contributors:7057ff"
  "wontfix-out-of-scope:Explicitly not in scope (embeddings, signing, access control):b60205"
  "enhancement:New feature or improvement:a2eeef"
)

echo "Creating Contrail issue labels..."

for entry in "${LABELS[@]}"; do
  IFS=':' read -r name description color <<< "$entry"
  if gh label create "$name" --description "$description" --color "$color" --force 2>/dev/null; then
    echo "  ✓ $name"
  else
    echo "  ⊘ $name (already exists or gh not authenticated)"
  fi
done

echo "Done."
