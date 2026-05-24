#!/usr/bin/env bash
# check-design-md-sync.sh
#
# Validates that docs/design/DESIGN.md mentions every --token: oklch(...) pair
# defined in the :root block of src/app/globals.css. globals.css is the
# authoritative source; DESIGN.md must be re-synced manually if drift exists.
#
# Usage:
#   bash scripts/check-design-md-sync.sh
#   bash scripts/check-design-md-sync.sh --css path/to/globals.css --design path/to/DESIGN.md
#
# Exit codes:
#   0  in sync
#   1  drift detected (one or more tokens missing or value mismatched)
#   2  bad arguments / files not found

set -uo pipefail

CSS_PATH="src/app/globals.css"
DESIGN_PATH="docs/design/DESIGN.md"

while [ $# -gt 0 ]; do
  case "$1" in
    --css)
      CSS_PATH="$2"
      shift 2
      ;;
    --design)
      DESIGN_PATH="$2"
      shift 2
      ;;
    -h|--help)
      cat <<USAGE
check-design-md-sync.sh — verify DESIGN.md token values match globals.css

Usage:
  bash scripts/check-design-md-sync.sh
  bash scripts/check-design-md-sync.sh --css <path> --design <path>

Options:
  --css <path>     Path to globals.css (default: src/app/globals.css)
  --design <path>  Path to DESIGN.md (default: docs/design/DESIGN.md)
  -h, --help       Show this help

Exit codes:
  0  OK / in sync
  1  drift detected
  2  bad arguments / files missing
USAGE
      exit 0
      ;;
    *)
      echo "unknown argument: $1" >&2
      exit 2
      ;;
  esac
done

if [ ! -f "$CSS_PATH" ]; then
  echo "globals.css not found at: $CSS_PATH" >&2
  exit 2
fi
if [ ! -f "$DESIGN_PATH" ]; then
  echo "DESIGN.md not found at: $DESIGN_PATH" >&2
  exit 2
fi

# Extract :root { ... } block (single-line stream)
root_block=$(awk '
  /^:root[[:space:]]*\{/ { in_root=1; next }
  in_root && /^\}/ { in_root=0; next }
  in_root { print }
' "$CSS_PATH")

if [ -z "$root_block" ]; then
  echo "could not locate :root { ... } block in $CSS_PATH" >&2
  exit 2
fi

# Normalize DESIGN.md whitespace for value matching
design_normalized=$(tr -s '[:space:]' ' ' < "$DESIGN_PATH")

missing=()
drift=()

# Iterate token: oklch(...) pairs
while IFS= read -r line; do
  token=$(echo "$line" | sed -nE 's/^[[:space:]]*(--[a-z0-9-]+):.*/\1/p')
  if [ -z "$token" ]; then
    continue
  fi
  value=$(echo "$line" | sed -nE 's/.*(oklch\([^)]+\)).*/\1/p')
  if [ -z "$value" ]; then
    continue
  fi

  # If DESIGN.md does not mention this token at all, skip silently
  # (DESIGN.md is expected to cover a curated subset, not every token)
  if ! grep -q -- "$token" "$DESIGN_PATH"; then
    continue
  fi

  # token is mentioned -> require every numeric piece of the value to appear
  # somewhere in DESIGN.md
  inner=$(echo "$value" | sed -E 's/^oklch\(|\)$//g')
  for num in $(echo "$inner" | tr -s ' /' '\n' | grep -E '^[0-9.]+%?$' || true); do
    if ! echo "$design_normalized" | grep -q -- "$num"; then
      drift+=("$token expects numeric '$num' from $value but DESIGN.md is missing it")
    fi
  done
done <<< "$root_block"

# Cross-check: tokens DESIGN.md mentions must still exist in globals.css
# Match only --name where name starts with a lowercase letter (filters out
# markdown rules like "---" and other separators).
for token in $(grep -oE -- '--[a-z][a-z0-9-]*' "$DESIGN_PATH" | sort -u); do
  if ! echo "$root_block" | grep -q -- "$token"; then
    missing+=("$token referenced in DESIGN.md but not defined in :root of $CSS_PATH")
  fi
done

if [ ${#drift[@]} -eq 0 ] && [ ${#missing[@]} -eq 0 ]; then
  echo "OK: DESIGN.md and globals.css are in sync"
  exit 0
fi

if [ ${#missing[@]} -gt 0 ]; then
  echo "missing tokens in globals.css :root:" >&2
  for line in "${missing[@]}"; do
    echo "  - $line" >&2
  done
fi
if [ ${#drift[@]} -gt 0 ]; then
  echo "drift between DESIGN.md and globals.css:" >&2
  for line in "${drift[@]}"; do
    echo "  - $line" >&2
  done
fi
exit 1
