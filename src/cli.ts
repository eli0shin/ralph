#!/usr/bin/env node
/* eslint-disable no-console */
import { Command } from 'commander';
import { resolve } from 'path';
import { readPromptFile } from './prompt';
import { runRalphLoop } from './loop';
import { findClaudePath } from './claude-path';

const DEFAULT_PROMPT_FILE = 'PROMPT.md';
const DEFAULT_MAX_ITERATIONS = 10;
const DEFAULT_COMPLETION_PROMISE = '<promise>COMPLETE</promise>';

type CLIOptions = {
  completionPromise: string;
  maxIterations: string;
  model?: string;
  cwd: string;
  claudePath?: string;
};

const program = new Command();

program
  .name('ralph')
  .description('CLI tool that runs Claude Agent SDK in a loop until completion')
  .version('0.1.0')
  .argument('[prompt-file]', 'Path to prompt file', DEFAULT_PROMPT_FILE)
  .option(
    '-c, --completion-promise <text>',
    'Text that signals completion',
    DEFAULT_COMPLETION_PROMISE
  )
  .option(
    '-n, --max-iterations <number>',
    'Safety limit for iterations',
    String(DEFAULT_MAX_ITERATIONS)
  )
  .option('-m, --model <model>', 'Claude model to use')
  .option('--cwd <directory>', 'Working directory', process.cwd())
  .option('--claude-path <path>', 'Path to claude executable')
  .action(async (promptFile: string, options: CLIOptions) => {
    const cwd = resolve(options.cwd);
    const promptPath = resolve(cwd, promptFile);

    const prompt = await readPromptFile(promptPath).catch((error: unknown) => {
      console.error(`Error reading prompt file: ${promptPath}`);
      console.error(error instanceof Error ? error.message : 'Unknown error');
      process.exit(1);
    });

    if (!prompt) {
      console.error('Error: Prompt file is empty');
      process.exit(1);
    }

    const claudePath = options.claudePath ?? findClaudePath();

    if (!claudePath) {
      console.error(
        'Error: Could not find claude executable. Please specify --claude-path or ensure claude is installed.'
      );
      process.exit(1);
    }

    const config = {
      promptFile: promptPath,
      completionPromise: options.completionPromise,
      maxIterations: parseInt(options.maxIterations, 10),
      model: options.model,
      cwd,
      claudePath,
    };

    console.log('Starting Ralph loop...');
    console.log(`  Prompt file: ${promptPath}`);
    console.log(`  Completion promise: ${config.completionPromise}`);
    console.log(`  Max iterations: ${config.maxIterations}`);
    console.log(`  Working directory: ${cwd}`);
    if (config.model) {
      console.log(`  Model: ${config.model}`);
    }

    const result = await runRalphLoop(prompt, config);

    console.log('\n--- Ralph loop finished ---');
    console.log(`  Iterations: ${result.iterations}`);
    console.log(`  Completed: ${result.completed}`);

    if (result.error) {
      console.error(`  Error: ${result.error}`);
      process.exit(1);
    }

    if (!result.completed) {
      console.warn('Warning: Loop ended without finding completion promise');
      process.exit(2);
    }

    process.exit(0);
  });

program.parse();
