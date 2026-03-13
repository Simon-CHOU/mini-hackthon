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

statusText.textContent = "Ready";
