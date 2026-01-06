# Ralph Loop CLI

Build a CLI tool that runs the Claude Agent SDK in a loop until a completion condition is met.

## What is Ralph?

Ralph is a technique by Geoffrey Huntley where you continuously feed an AI agent the same prompt, letting it iterate on its work until completion. The agent sees its previous work (modified files, git history) on each iteration and refines until done.

Reference: https://ghuntley.com/ralph/

## Requirements

### CLI Interface

```
ralph [prompt-file] [options]

Arguments:
  prompt-file              Path to prompt file (default: PROMPT.md)

Options:
  -c, --completion-promise  Text that signals completion
  -n, --max-iterations      Safety limit for iterations
  -m, --model               Claude model to use
  --cwd                     Working directory
```

### Core Behavior

1. Read prompt from file
2. Call Claude Agent SDK `query()` with bypass permissions enabled
3. Stream output to stdout
4. When Claude finishes, check output for completion promise
5. If found, exit successfully
6. If max iterations reached, exit with warning
7. Otherwise, loop back to step 2 with same prompt

### Tech Stack

- Runtime: Bun
- Language: TypeScript
- CLI: Commander
- Agent: `@anthropic-ai/claude-agent-sdk`

### Build & Release

Mirror the setup from `../repos/`:

- Bun compile to standalone binaries
- GitHub Actions with changesets for versioning
- Cross-platform builds (linux-x64, linux-arm64, darwin-x64, darwin-arm64)
- install.sh script for easy installation
- GitHub repo: `eli0shin/ralph`

### Quality

- ESLint with eslint-for-ai
- Prettier formatting
- TypeScript strict mode
- Husky pre-commit hooks
- Tests with bun:test

## Success Criteria

When ALL are met, output `<promise>COMPLETE</promise>`:

1. `bun run typecheck` passes
2. `bun run lint` passes
3. `bun run test` passes
4. `bun run build` produces working binary
5. GitHub Actions workflows exist
6. install.sh works
7. create a test-prompt.md file and run ralph with it. the prompt should instruct ralph to create or update state.txt qith a number starting and increment it by exactly 1. when the number is 5 the task is complete
8. each message from ralph appears on a new line in the console output, that means there are newlines characters between messages within the same ralph iteration. USE THE OUTPUT TO VERIFY THIS, DO NOT FUCK THIS UP. YOU HAVECLAIMED MANY TIMES THAT THIS WORKS BUT IT ABSOLUTELY DOES NOT
9. ralph outputs the claude code stdout to the console including tool calls, it MUST show file reads edits etc instdout (not the content but edit(file)
