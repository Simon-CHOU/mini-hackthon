import { describe, it, expect } from 'vitest';
import { CommandParser } from '../src/CommandParser';

describe('CommandParser', () => {
  const parser = new CommandParser();

  it('should handle empty input', () => {
    expect(parser.execute('')).toBe('');
    expect(parser.execute('   ')).toBe('');
  });

  it('should handle echo command', () => {
    expect(parser.execute('echo hello')).toBe('hello');
    expect(parser.execute('echo hello world')).toBe('hello world');
  });

  it('should handle help command', () => {
    expect(parser.execute('help')).toContain('Available commands');
  });

  it('should handle ls command', () => {
    const output = parser.execute('ls');
    expect(output).toContain('file1.txt');
    expect(output).toContain('src/');
  });

  it('should handle unknown command', () => {
    expect(parser.execute('foobar')).toBe('bash: foobar: command not found');
  });
});
