/* eslint-disable no-console */
import { query, type SDKMessage } from '@anthropic-ai/claude-agent-sdk';
import type { RalphConfig, RalphResult, IterationResult } from './types';
import { checkCompletion } from './completion';

type TextBlock = {
  type: 'text';
  text: string;
};

type ToolUseBlock = {
  type: 'tool_use';
  id: string;
  name: string;
  input: unknown;
};

function isTextBlock(block: unknown): block is TextBlock {
  return (
    typeof block === 'object' &&
    block !== null &&
    'type' in block &&
    block.type === 'text' &&
    'text' in block &&
    typeof block.text === 'string'
  );
}

function isToolUseBlock(block: unknown): block is ToolUseBlock {
  return (
    typeof block === 'object' &&
    block !== null &&
    'type' in block &&
    block.type === 'tool_use' &&
    'name' in block &&
    typeof block.name === 'string'
  );
}

/**
 * Run a single iteration of the Ralph loop
 */
async function runIteration(
  prompt: string,
  config: RalphConfig,
  iteration: number
): Promise<IterationResult> {
  let output = '';

  const q = query({
    prompt,
    options: {
      cwd: config.cwd,
      model: config.model,
      permissionMode: 'bypassPermissions',
      allowDangerouslySkipPermissions: true,
      pathToClaudeCodeExecutable: config.claudePath,
      systemPrompt: {
        type: 'preset',
        preset: 'claude_code',
      },
      tools: {
        type: 'preset',
        preset: 'claude_code',
      },
      settingSources: ['project'],
    },
  });

  for await (const message of q) {
    const display = extractAndFormatMessage(message);
    if (display) {
      process.stdout.write(display);
      // Only accumulate text output for completion checking
      const text = extractText(message);
      output += text;
    }
  }

  // Ensure newline after output
  if (output && !output.endsWith('\n')) {
    process.stdout.write('\n');
  }

  return {
    iteration,
    output,
    completed: checkCompletion(output, config.completionPromise),
  };
}

/**
 * Extract and format message for display, including tool calls
 */
function extractAndFormatMessage(message: SDKMessage): string {
  if (message.type === 'assistant') {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access -- SDK types mark content as potentially error type
    const content: unknown = message.message.content;
    if (Array.isArray(content)) {
      const parts: string[] = [];

      for (const block of content) {
        if (isTextBlock(block)) {
          parts.push(block.text);
        } else if (isToolUseBlock(block)) {
          // Format tool use as: ToolName(args)
          const args = formatToolArgs(block.input);
          parts.push(`\n${block.name}(${args})\n`);
        }
      }

      return parts.join('');
    }
  }
  return '';
}

/**
 * Extract text content only from SDK message
 */
function extractText(message: SDKMessage): string {
  if (message.type === 'assistant') {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access -- SDK types mark content as potentially error type
    const content: unknown = message.message.content;
    if (Array.isArray(content)) {
      return content
        .filter(isTextBlock)
        .map((block) => block.text)
        .join('');
    }
  }
  return '';
}

/**
 * Format tool arguments for display
 */
function formatToolArgs(input: unknown): string {
  if (!input || typeof input !== 'object') return '';

  if (!isRecord(input)) return '';

  const keys = Object.keys(input);

  // For file operations, show the file path
  if ('file_path' in input && typeof input.file_path === 'string') {
    return input.file_path;
  }

  // For other tools, show key parameters
  const importantKeys = keys
    .filter(
      (k) =>
        k !== 'description' && k !== 'timeout' && typeof input[k] !== 'object'
    )
    .slice(0, 2);

  if (importantKeys.length === 0) return '';

  return importantKeys.map((k) => String(input[k])).join(', ');
}

/**
 * Type guard for Record<string, unknown>
 */
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Run the Ralph loop until completion or max iterations
 */
export async function runRalphLoop(
  prompt: string,
  config: RalphConfig
): Promise<RalphResult> {
  let lastOutput = '';

  for (let i = 1; i <= config.maxIterations; i++) {
    console.log(`\n--- Iteration ${i}/${config.maxIterations} ---\n`);

    const result = await runIteration(prompt, config, i);
    lastOutput = result.output;

    if (result.completed) {
      return {
        iterations: i,
        completed: true,
        output: lastOutput,
      };
    }

    if (result.error) {
      return {
        iterations: i,
        completed: false,
        output: lastOutput,
        error: result.error,
      };
    }
  }

  return {
    iterations: config.maxIterations,
    completed: false,
    output: lastOutput,
    error: `Max iterations (${config.maxIterations}) reached without completion`,
  };
}
