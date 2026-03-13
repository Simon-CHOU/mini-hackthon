const COMMANDS = {
  help: ["Available commands: help, ls, gcc main.c, clear"],
  ls: ["main.c", "README.md", "demo/"],
  "gcc main.c": ["Compiling...", "Build succeeded."],
};

export function normalizeCommand(raw) {
  return raw.trim().replace(/\s+/g, " ");
}

export function runMockCommand(raw) {
  const command = normalizeCommand(raw);

  if (!command) {
    return { kind: "noop", lines: [] };
  }

  if (command === "clear") {
    return { kind: "clear", lines: [] };
  }

  const lines = COMMANDS[command] ?? [`command not found: ${command}`];
  return { kind: "output", lines };
}
