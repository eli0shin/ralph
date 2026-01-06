/**
 * Check if the output contains the completion promise
 */
export function checkCompletion(
  output: string,
  completionPromise: string
): boolean {
  if (completionPromise === '') {
    return true;
  }
  return output.includes(completionPromise);
}
