#!/usr/bin/env bash
# codex-image-gen.sh
#
# Thin wrapper around the Codex CLI image-generation command for the Smitch LP
# workflow. Validates required arguments and assembles the codex invocation;
# if Codex CLI is not installed locally the script still parses arguments and
# returns a clear status (useful for CI / spec tests).
#
# Usage:
#   bash scripts/codex-image-gen.sh --prompt-file <path> [--refs <dir>] [--n <int>] [--size <WxH>]
#
# Exit codes:
#   0  help shown / generation succeeded
#   1  bad / missing arguments
#   2  Codex CLI not installed locally (parse-only mode after argument validation)
#   3  Codex invocation failed

set -uo pipefail

PROMPT_FILE=""
REFS_DIR=""
N_VARIANTS="4"
SIZE="2048x1152"

print_help() {
  cat <<USAGE
codex-image-gen.sh — Smitch LP image generation wrapper around Codex CLI

Usage:
  bash scripts/codex-image-gen.sh --prompt-file <path> [options]

Required:
  --prompt-file <path>   Path to the filled section prompt template
                         (see docs/design/prompts/section-prompt-template.md)

Options:
  --refs <dir>           Directory containing brand reference images
                         (default: docs/design/brand-references)
  --n <int>              Number of variants to generate (default: 4)
  --size <WxH>           Output size (default: 2048x1152, i.e. 16:9 2K)
  -h, --help             Show this help

Examples:
  bash scripts/codex-image-gen.sh \\
    --prompt-file docs/design/prompts/hero.md \\
    --refs docs/design/brand-references \\
    --n 4 --size 2048x1152

  bash scripts/codex-image-gen.sh --help

Exit codes:
  0  success
  1  missing required arguments
  2  Codex CLI not installed (validation succeeded but cannot generate)
  3  Codex CLI invocation failed
USAGE
}

if [ $# -eq 0 ]; then
  echo "error: missing required argument --prompt-file" >&2
  echo "" >&2
  print_help >&2
  exit 1
fi

while [ $# -gt 0 ]; do
  case "$1" in
    --prompt-file)
      PROMPT_FILE="${2:-}"
      if [ -z "$PROMPT_FILE" ]; then
        echo "error: --prompt-file requires a path argument" >&2
        exit 1
      fi
      shift 2
      ;;
    --refs)
      REFS_DIR="${2:-}"
      if [ -z "$REFS_DIR" ]; then
        echo "error: --refs requires a directory argument" >&2
        exit 1
      fi
      shift 2
      ;;
    --n)
      N_VARIANTS="${2:-}"
      if [ -z "$N_VARIANTS" ]; then
        echo "error: --n requires an integer argument" >&2
        exit 1
      fi
      shift 2
      ;;
    --size)
      SIZE="${2:-}"
      if [ -z "$SIZE" ]; then
        echo "error: --size requires a WxH argument" >&2
        exit 1
      fi
      shift 2
      ;;
    -h|--help)
      print_help
      exit 0
      ;;
    *)
      echo "error: unknown argument: $1" >&2
      print_help >&2
      exit 1
      ;;
  esac
done

if [ -z "$PROMPT_FILE" ]; then
  echo "error: --prompt-file is required" >&2
  exit 1
fi

if [ ! -f "$PROMPT_FILE" ]; then
  echo "error: prompt file not found: $PROMPT_FILE" >&2
  exit 1
fi

# Validate optional refs dir if supplied
if [ -n "$REFS_DIR" ] && [ ! -d "$REFS_DIR" ]; then
  echo "error: refs directory not found: $REFS_DIR" >&2
  exit 1
fi

# Validate N is integer
if ! [[ "$N_VARIANTS" =~ ^[0-9]+$ ]]; then
  echo "error: --n must be a positive integer, got: $N_VARIANTS" >&2
  exit 1
fi

# Validate SIZE matches WxH
if ! [[ "$SIZE" =~ ^[0-9]+x[0-9]+$ ]]; then
  echo "error: --size must be in WxH format (e.g. 2048x1152), got: $SIZE" >&2
  exit 1
fi

# Detect Codex CLI
if ! command -v codex >/dev/null 2>&1; then
  echo "Codex CLI not found in PATH. Arguments parsed successfully:" >&2
  echo "  prompt-file: $PROMPT_FILE" >&2
  echo "  refs:        ${REFS_DIR:-<none>}" >&2
  echo "  n:           $N_VARIANTS" >&2
  echo "  size:        $SIZE" >&2
  echo "Install Codex CLI (https://developers.openai.com/codex/cli) and re-run." >&2
  exit 2
fi

# Build Codex invocation
codex_args=("image" "--prompt-file" "$PROMPT_FILE" "--n" "$N_VARIANTS" "--size" "$SIZE")
if [ -n "$REFS_DIR" ]; then
  codex_args+=("--refs" "$REFS_DIR")
fi

echo "Invoking: codex ${codex_args[*]}"
if codex "${codex_args[@]}"; then
  exit 0
else
  echo "error: codex invocation failed" >&2
  exit 3
fi
