import { describe, expect, test } from 'bun:test';
import { checkCompletion } from '../src/completion';

describe('checkCompletion', () => {
  test('returns true when completion promise is found', () => {
    const output = 'Some output text <promise>COMPLETE</promise> more text';
    expect(checkCompletion(output, '<promise>COMPLETE</promise>')).toBe(true);
  });

  test('returns false when completion promise is not found', () => {
    const output = 'Some output text without the promise';
    expect(checkCompletion(output, '<promise>COMPLETE</promise>')).toBe(false);
  });

  test('handles empty output', () => {
    expect(checkCompletion('', '<promise>COMPLETE</promise>')).toBe(false);
  });

  test('handles empty completion promise', () => {
    const output = 'Some output';
    expect(checkCompletion(output, '')).toBe(true);
  });

  test('is case sensitive', () => {
    const output = '<PROMISE>COMPLETE</PROMISE>';
    expect(checkCompletion(output, '<promise>COMPLETE</promise>')).toBe(false);
  });

  test('handles multiline output', () => {
    const output = `Line 1
Line 2
<promise>COMPLETE</promise>
Line 4`;
    expect(checkCompletion(output, '<promise>COMPLETE</promise>')).toBe(true);
  });

  test('handles completion promise at start of output', () => {
    const output = '<promise>COMPLETE</promise> then more text';
    expect(checkCompletion(output, '<promise>COMPLETE</promise>')).toBe(true);
  });

  test('handles completion promise at end of output', () => {
    const output = 'Some text then <promise>COMPLETE</promise>';
    expect(checkCompletion(output, '<promise>COMPLETE</promise>')).toBe(true);
  });
});
