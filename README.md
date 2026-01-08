# ralph

A CLI tool that runs Claude Agent SDK in a loop until completion.

`ralph` executes a prompt file against Claude Code repeatedly until a completion signal is detected, enabling autonomous multi-step tasks.

## Install

```bash
curl -fsSL https://raw.githubusercontent.com/eli0shin/ralph/main/install.sh | bash
```

Or specify a custom install directory:

```bash
INSTALL_DIR=~/.local/bin curl -fsSL https://raw.githubusercontent.com/eli0shin/ralph/main/install.sh | bash
```

## Usage

```bash
ralph [prompt-file] [options]
```

### Arguments

| Argument | Description | Default |
|----------|-------------|---------|
| `prompt-file` | Path to the prompt file | `PROMPT.md` |

### Options

| Option | Description | Default |
|--------|-------------|---------|
| `-c, --completion-promise <text>` | Text that signals completion | `<promise>COMPLETE</promise>` |
| `-n, --max-iterations <number>` | Safety limit for iterations | `10` |
| `-m, --model <model>` | Claude model to use | (default model) |
| `--cwd <directory>` | Working directory | current directory |
| `--claude-path <path>` | Path to claude executable | auto-detected |

### Example

Create a `PROMPT.md` file:

```markdown
Build a simple hello world Express server.

When complete, output: <promise>COMPLETE</promise>
```

Run ralph:

```bash
ralph PROMPT.md --max-iterations 5
```

Ralph will run Claude Code in a loop until it sees the completion promise or hits the iteration limit.

## How It Works

1. Ralph reads the prompt file
2. Runs Claude Code with the prompt
3. Checks the output for the completion promise
4. If not found, continues to the next iteration
5. Stops when the promise is found or max iterations reached

## Requirements

- [Claude Code CLI](https://docs.anthropic.com/en/docs/claude-code) installed and configured
- Valid Anthropic API key
