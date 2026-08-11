#!/usr/bin/env bash

set -u

INPUT=$(cat)

TOOL_NAME=$(printf '%s' "$INPUT" | jq -r '.tool_name // empty')

if [[ "$TOOL_NAME" != "Edit" && "$TOOL_NAME" != "Write" ]]; then
  exit 0
fi

FILE_PATH=$(printf '%s' "$INPUT" | jq -r '
  .tool_input.file_path //
  .tool_input.path //
  empty
')

NORMALIZED_PATH="${FILE_PATH//\\//}"

if [[ "$NORMALIZED_PATH" != */src/* && "$NORMALIZED_PATH" != src/* ]]; then
  exit 0
fi

echo "PostToolUse: running tests for $FILE_PATH..." >&2

npx vitest run tests/ src/

EXIT_CODE=$?

if [[ $EXIT_CODE -ne 0 ]]; then
  echo "PostToolUse: tests failed after editing $FILE_PATH" >&2
  exit "$EXIT_CODE"
fi

echo "PostToolUse: tests passed." >&2
exit 0