#!/usr/bin/env bash

set -u

INPUT=$(cat)

# Use pure Bash regex instead of grep -oP
extract_json_val() {
  local key="$1"
  if [[ "$INPUT" =~ \"$key\"[[:space:]]*:[[:space:]]*\"([^\"]+)\" ]]; then
    echo "${BASH_REMATCH[1]}"
  fi
}

TOOL_NAME=$(extract_json_val "tool_name")

# Allow non-edit tools to pass through
if [[ "$TOOL_NAME" != "Edit" && "$TOOL_NAME" != "Write" ]]; then
  exit 0
fi

FILE_PATH=$(extract_json_val "file_path")

if [[ -z "$FILE_PATH" ]]; then
  exit 0
fi

# Normalize Windows backslashes to forward slashes
NORMALIZED_PATH="${FILE_PATH//\\//}"
NORMALIZED_PATH_LOWER="${NORMALIZED_PATH,,}"

# Check block conditions
if [[ "$NORMALIZED_PATH_LOWER" == public/api/* || "$NORMALIZED_PATH_LOWER" == */public/api/* ]]; then
  echo "BLOCKED: Files under public/api/** must not be edited." >&2
  exit 2
fi

if [[ "$NORMALIZED_PATH_LOWER" == */rubric.md || "$NORMALIZED_PATH_LOWER" == "rubric.md" ]]; then
  echo "BLOCKED: rubric.md must not be edited." >&2
  exit 2
fi

exit 0