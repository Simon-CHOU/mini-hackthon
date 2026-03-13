import { Terminal } from "@xterm/xterm";
import "@xterm/xterm/css/xterm.css";

const PROMPT = "$ ";

export function createTerminalController({
  mountNode,
  recorder,
  runCommand,
}) {
  const terminal = new Terminal({
    cols: 88,
    rows: 22,
    cursorBlink: true,
    fontFamily: '"SF Mono", SFMono-Regular, ui-monospace, monospace',
    fontSize: 14,
    theme: {
      background: "#05070b",
      foreground: "#f2f4f8",
      cursor: "#7de5bc",
      black: "#05070b",
      brightBlack: "#4b5565",
      green: "#7de5bc",
      brightGreen: "#b2f1d4",
    },
  });

  let inputEnabled = true;
  let recordingActive = false;
  let inputBuffer = "";

  terminal.open(mountNode);

  function recordEvent(type, payload = {}) {
    if (!recordingActive) {
      return null;
    }

    return recorder.record(type, payload);
  }

  function clearDisplay({ record = false } = {}) {
    inputBuffer = "";
    terminal.reset();
    if (record) {
      recordEvent("clear");
    }
  }

  function writePrompt({ record = true } = {}) {
    inputBuffer = "";
    terminal.write(PROMPT);
    if (record) {
      recordEvent("prompt", { text: PROMPT });
    }
  }

  function writeOutputLine(text, { record = true } = {}) {
    terminal.writeln(text);
    if (record) {
      recordEvent("output", { text });
    }
  }

  function handleCommand(command) {
    const result = runCommand(command);

    if (result.kind === "clear") {
      clearDisplay({ record: true });
      writePrompt();
      return;
    }

    if (result.kind === "output") {
      for (const line of result.lines) {
        writeOutputLine(line);
      }
    }

    writePrompt();
  }

  terminal.onData((data) => {
    if (!inputEnabled) {
      return;
    }

    for (const char of data) {
      if (char === "\r") {
        const command = inputBuffer;
        terminal.write("\r\n");
        recordEvent("enter", { command });
        inputBuffer = "";
        handleCommand(command);
        continue;
      }

      if (char === "\u007f") {
        if (!inputBuffer) {
          continue;
        }

        inputBuffer = inputBuffer.slice(0, -1);
        terminal.write("\b \b");
        continue;
      }

      if (char < " ") {
        continue;
      }

      inputBuffer += char;
      terminal.write(char);
      recordEvent("input", { char });
    }
  });

  writePrompt({ record: false });

  return {
    clear() {
      clearDisplay({ record: false });
    },
    focus() {
      terminal.focus();
    },
    renderReplayEvent(event) {
      switch (event.type) {
        case "input":
          inputBuffer += event.char ?? "";
          terminal.write(event.char ?? "");
          break;
        case "enter":
          inputBuffer = "";
          terminal.write("\r\n");
          break;
        case "output":
          terminal.writeln(event.text ?? "");
          break;
        case "prompt":
          inputBuffer = "";
          terminal.write(event.text ?? PROMPT);
          break;
        case "clear":
          clearDisplay({ record: false });
          break;
        default:
          break;
      }
    },
    setInputEnabled(enabled) {
      inputEnabled = enabled;
    },
    setRecordingActive(active) {
      recordingActive = active;
    },
    writePrompt() {
      writePrompt({ record: true });
    },
  };
}
