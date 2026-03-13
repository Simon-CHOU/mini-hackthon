export class CommandParser {
  constructor() {
    this.fileSystem = {
      'file1.txt': 'This is file 1',
      'file2.js': 'console.log("Hello")',
      'src/': '[DIR]'
    };
  }

  execute(input) {
    const parts = input.trim().split(/\s+/);
    const command = parts[0];
    const args = parts.slice(1);

    if (!command) return '';

    switch (command) {
      case 'help':
        return 'Available commands: help, ls, echo, clear';
      case 'ls':
        return Object.keys(this.fileSystem).join('  ');
      case 'echo':
        return args.join(' ');
      case 'clear':
        return '\x1b[2J\x1b[H'; // ANSI clear screen
      default:
        return `bash: ${command}: command not found`;
    }
  }
}
