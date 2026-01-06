import { query, type SDKMessage } from '@anthropic-ai/claude-agent-sdk';
import type { RalphConfig, RalphResult, IterationResult } from './types';
import { checkCompletion } from './completion';

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
    const text = extractText(message);
    if (text) {
      process.stdout.write(text);
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
 * Extract text content from SDK message
 */
function extractText(message: SDKMessage): string {
  if (message.type === 'assistant') {
    const content = message.message.content;
    if (Array.isArray(content)) {
      return content
        .filter((block) => block.type === 'text')
        .map((block) => (block as { type: 'text'; text: string }).text)
        .join('');
    }
  }
  return '';
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
