import { existsSync } from 'fs';
import { execSync } from 'child_process';
import { join } from 'path';
import { homedir } from 'os';

/**
 * Find the claude executable path
 * Checks common installation locations and uses `which` as fallback
 */
export function findClaudePath(): string | undefined {
  const home = homedir();

  // Common installation paths
  const commonPaths = [
    join(home, '.local', 'bin', 'claude'),
    join(home, '.claude', 'local', 'claude'),
    '/usr/local/bin/claude',
    '/opt/homebrew/bin/claude',
  ];

  // Check common paths first
  for (const path of commonPaths) {
    if (existsSync(path)) {
      return path;
    }
  }

  // Try using `which` command as fallback
  try {
    const result = execSync('which claude', { encoding: 'utf-8' }).trim();
    if (result && existsSync(result)) {
      return result;
    }
    return undefined;
  } catch {
    return undefined;
  }
}
