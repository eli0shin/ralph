import { readFile } from 'fs/promises';

/**
 * Read prompt content from a file
 */
export async function readPromptFile(filePath: string): Promise<string> {
  const content = await readFile(filePath, 'utf-8');
  return content.trim();
}
