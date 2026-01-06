#!/bin/bash
# Basic Ralph Loop - runs Claude with PROMPT.md until completion
# Usage: ./loop.sh [prompt-file] [completion-promise] [max-iterations]

set -euo pipefail

PROMPT_FILE="${1:-PROMPT.md}"
COMPLETION_PROMISE="${2:-COMPLETE}"
MAX_ITERATIONS="${3:-50}"

iteration=0

echo "=== Ralph Loop Starting ==="
echo "Prompt file: $PROMPT_FILE"
echo "Completion promise: $COMPLETION_PROMISE"
echo "Max iterations: $MAX_ITERATIONS"
echo ""

while true; do
  iteration=$((iteration + 1))
  echo "=========================================="
  echo "=== Ralph Iteration $iteration ==="
  echo "=========================================="

  # Run claude with the prompt
  output=$(cat "$PROMPT_FILE" | claude --dangerously-skip-permissions 2>&1) || true
  echo "$output"

  # Check for completion
  if echo "$output" | grep -q "$COMPLETION_PROMISE"; then
    echo ""
    echo "=========================================="
    echo "=== Completion found after $iteration iterations ==="
    echo "=========================================="
    exit 0
  fi

  # Check max iterations
  if [ "$iteration" -ge "$MAX_ITERATIONS" ]; then
    echo ""
    echo "=========================================="
    echo "=== Max iterations ($MAX_ITERATIONS) reached ==="
    echo "=========================================="
    exit 1
  fi

  echo ""
  echo "--- No completion promise found, continuing... ---"
  echo ""
done
