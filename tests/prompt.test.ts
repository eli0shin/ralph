import { describe, expect, test, beforeEach, afterEach } from 'bun:test';
import { readPromptFile } from '../src/prompt';
import { mkdtemp, rm, writeFile } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';

describe('readPromptFile', () => {
  let tempDir: string;

  beforeEach(async () => {
    tempDir = await mkdtemp(join(tmpdir(), 'ralph-test-'));
  });

  afterEach(async () => {
    await rm(tempDir, { recursive: true });
  });

  test('reads prompt from file', async () => {
    const promptFile = join(tempDir, 'PROMPT.md');
    await writeFile(promptFile, 'This is the prompt content');

    const result = await readPromptFile(promptFile);
    expect(result).toBe('This is the prompt content');
  });

  test('trims whitespace from prompt', async () => {
    const promptFile = join(tempDir, 'PROMPT.md');
    await writeFile(promptFile, '  \n  Prompt content  \n  ');

    const result = await readPromptFile(promptFile);
    expect(result).toBe('Prompt content');
  });

  test('throws error for non-existent file', async () => {
    const promptFile = join(tempDir, 'nonexistent.md');

    await expect(readPromptFile(promptFile)).rejects.toThrow();
  });

  test('handles empty file', async () => {
    const promptFile = join(tempDir, 'empty.md');
    await writeFile(promptFile, '');

    const result = await readPromptFile(promptFile);
    expect(result).toBe('');
  });

  test('handles multiline prompt', async () => {
    const promptFile = join(tempDir, 'multi.md');
    const content = `# Title

## Section 1
Content here

## Section 2
More content`;
    await writeFile(promptFile, content);

    const result = await readPromptFile(promptFile);
    expect(result).toBe(content);
  });
});
