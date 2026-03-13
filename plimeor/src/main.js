import { runMockCommand } from "./commands.js";
import { createRecorder } from "./recorder.js";
import { playRecording } from "./replay.js";
import { createTerminalController } from "./terminal.js";
import { createTimelineController } from "./timeline.js";

const recordBtn = document.querySelector("#recordBtn");
const replayBtn = document.querySelector("#replayBtn");
const statusText = document.querySelector("#statusText");
const elapsedLabel = document.querySelector("#elapsedLabel");
const durationLabel = document.querySelector("#durationLabel");
const timelineFill = document.querySelector("#timelineFill");
const terminalRoot = document.querySelector("#terminalRoot");

if (
  !(recordBtn instanceof HTMLButtonElement) ||
  !(replayBtn instanceof HTMLButtonElement) ||
  !(statusText instanceof HTMLElement) ||
  !(elapsedLabel instanceof HTMLElement) ||
  !(durationLabel instanceof HTMLElement) ||
  !(timelineFill instanceof HTMLElement) ||
  !(terminalRoot instanceof HTMLElement)
) {
  throw new Error("App shell is missing required DOM nodes.");
}

const recorder = createRecorder();
const timeline = createTimelineController({
  elapsedLabel,
  durationLabel,
  fillNode: timelineFill,
});

function setStatus(text) {
  statusText.textContent = text;
}

const terminal = createTerminalController({
  mountNode: terminalRoot,
  recorder,
  runCommand: runMockCommand,
});

let cancelReplay = null;

function stopReplay() {
  if (!cancelReplay) {
    return;
  }

  cancelReplay();
  cancelReplay = null;
  terminal.setInputEnabled(true);
}

function onRecordClick() {
  stopReplay();
  recorder.start();
  terminal.setRecordingActive(true);
  terminal.setInputEnabled(true);
  timeline.reset();
  setStatus("Recording");
  terminal.clear();
  terminal.writePrompt();
  terminal.focus();
}

function onReplayClick() {
  stopReplay();

  const events = recorder.snapshot();
  if (events.length === 0) {
    setStatus("Nothing to replay");
    terminal.focus();
    return;
  }

  recorder.stop();
  terminal.setRecordingActive(false);
  terminal.setInputEnabled(false);
  terminal.clear();
  timeline.reset();
  timeline.setDuration(recorder.getDuration());
  setStatus("Replaying");

  cancelReplay = playRecording({
    events,
    onEvent(event) {
      terminal.renderReplayEvent(event);
    },
    onProgress(elapsed, total) {
      timeline.setDuration(total);
      timeline.setProgress(elapsed, total);
    },
    onDone() {
      cancelReplay = null;
      terminal.setInputEnabled(true);
      if (events.at(-1)?.type !== "prompt") {
        terminal.writePrompt();
      }
      terminal.focus();
      setStatus("Ready");
    },
  });
}

recordBtn.addEventListener("click", onRecordClick);
replayBtn.addEventListener("click", onReplayClick);

timeline.reset();
setStatus("Ready");
terminal.focus();
