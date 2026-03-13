# Web Terminal Time Machine MVP Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a hackathon-ready Web Terminal Time Machine demo inside a submission folder, using Bun plus plain HTML/CSS/JS, with mock terminal commands, recording, replay, and a read-only timeline.

**Architecture:** Keep the app as a thin static frontend. Use Bun's HTML entrypoint support for local development and build output, `xterm.js` for the terminal surface, a small pure command engine for deterministic fake responses, a recorder that stores semantic terminal events with relative timestamps, and a replay runner that replays those events while driving the timeline UI.

**Tech Stack:** Bun, HTML, CSS, JavaScript ES modules, xterm.js, Bun test

---

## Assumptions

- Replace every `<team-name>` path below with the actual submission directory before you start.
- Implement inside `<team-name>/` from the start so the final hackathon submission folder is already correct.
- Use `bun ./<team-name>/index.html` for local development and `bun build ./<team-name>/index.html --minify --outdir dist/<team-name>` for the production bundle.

## File Map

- Create: `<team-name>/package.json`
- Create: `<team-name>/index.html`
- Create: `<team-name>/src/styles.css`
- Create: `<team-name>/src/main.js`
- Create: `<team-name>/src/commands.js`
- Create: `<team-name>/src/recorder.js`
- Create: `<team-name>/src/replay.js`
- Create: `<team-name>/src/terminal.js`
- Create: `<team-name>/src/timeline.js`
- Create: `<team-name>/tests/commands.test.js`
- Create: `<team-name>/tests/recorder.test.js`
- Create: `<team-name>/tests/replay.test.js`
- Create: `<team-name>/README.md`

## Behavior Contract

- `Record` starts a fresh capture:
  - clear previous events
  - mark recorder active
  - reset the timeline labels and fill
- `Replay` replays the latest captured session:
  - stop accepting live terminal input
  - clear terminal display
  - replay input and output events at recorded timing
  - advance timeline progress during playback
  - restore prompt and input when done
- If no recording exists, `Replay` should do nothing except surface a small status message

## Chunk 1: Bootstrap And Pure Logic

### Task 1: Create the Bun static app shell

**Files:**
- Create: `<team-name>/package.json`
- Create: `<team-name>/index.html`
- Create: `<team-name>/src/styles.css`
- Create: `<team-name>/src/main.js`

- [ ] **Step 1: Create `package.json` with the minimum scripts and dependency**

```json
{
  "name": "<team-name>-web-terminal-time-machine",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "bun ./index.html --console",
    "build": "bun build ./index.html --minify --outdir ../dist/<team-name>",
    "test": "bun test"
  },
  "dependencies": {
    "xterm": "^5.5.0"
  }
}
```

- [ ] **Step 2: Install dependencies**

Run: `cd <team-name> && bun install`
Expected: `bun.lock` is created and `xterm` is installed.

- [ ] **Step 3: Create the initial page shell**

Use this DOM structure in `<team-name>/index.html`:

```html
<body>
  <main class="app">
    <header class="toolbar">
      <button id="recordBtn">Record</button>
      <button id="replayBtn">Replay</button>
      <span id="statusText">Idle</span>
    </header>
    <section class="timeline">
      <span id="elapsedLabel">00:00</span>
      <div class="timeline-track"><div id="timelineFill"></div></div>
      <span id="durationLabel">00:00</span>
    </section>
    <section id="terminalRoot" class="terminal-shell"></section>
  </main>
  <script type="module" src="./src/main.js"></script>
</body>
```

- [ ] **Step 4: Add initial styles and boot message**

Use a black terminal shell, neutral controls, and a visible timeline track. In `src/main.js`, confirm the DOM elements exist and set `statusText.textContent = "Ready"` so the shell renders meaningfully before terminal logic lands.

- [ ] **Step 5: Run the shell and verify manually**

Run: `cd <team-name> && bun run dev`
Expected: Bun serves the page at `http://localhost:3000/` and the page shows toolbar, timeline, and terminal container.

- [ ] **Step 6: Commit**

```bash
git add <team-name>/package.json <team-name>/index.html <team-name>/src/styles.css <team-name>/src/main.js
git commit -m "feat: bootstrap static terminal shell"
```

### Task 2: Implement the mock command engine

**Files:**
- Create: `<team-name>/src/commands.js`
- Create: `<team-name>/tests/commands.test.js`

- [ ] **Step 1: Write the failing tests**

```js
import { describe, expect, test } from "bun:test";
import { normalizeCommand, runMockCommand } from "../src/commands.js";

describe("runMockCommand", () => {
  test("normalizes repeated whitespace", () => {
    expect(normalizeCommand("  gcc   main.c  ")).toBe("gcc main.c");
  });

  test("returns known command output", () => {
    expect(runMockCommand("ls")).toEqual({
      kind: "output",
      lines: ["main.c", "README.md", "demo/"],
    });
  });

  test("returns clear sentinel", () => {
    expect(runMockCommand("clear")).toEqual({ kind: "clear", lines: [] });
  });

  test("returns fallback for unknown commands", () => {
    expect(runMockCommand("whoami")).toEqual({
      kind: "output",
      lines: ["command not found: whoami"],
    });
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `cd <team-name> && bun test tests/commands.test.js`
Expected: FAIL because `src/commands.js` does not exist yet.

- [ ] **Step 3: Write the minimal command implementation**

```js
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
  if (!command) return { kind: "noop", lines: [] };
  if (command === "clear") return { kind: "clear", lines: [] };
  const lines = COMMANDS[command] ?? [`command not found: ${command}`];
  return { kind: "output", lines };
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `cd <team-name> && bun test tests/commands.test.js`
Expected: PASS with 4 passing tests.

- [ ] **Step 5: Commit**

```bash
git add <team-name>/src/commands.js <team-name>/tests/commands.test.js
git commit -m "feat: add mock terminal commands"
```

### Task 3: Implement the recorder as a pure event store

**Files:**
- Create: `<team-name>/src/recorder.js`
- Create: `<team-name>/tests/recorder.test.js`

- [ ] **Step 1: Write the failing tests**

```js
import { describe, expect, test } from "bun:test";
import { createRecorder } from "../src/recorder.js";

describe("createRecorder", () => {
  test("stores relative timestamps", () => {
    let now = 1000;
    const recorder = createRecorder(() => now);

    recorder.start();
    now = 1120;
    recorder.record("input", { char: "l" });
    now = 1280;
    recorder.record("enter", { command: "ls" });

    expect(recorder.snapshot()).toEqual([
      { type: "input", char: "l", at: 120 },
      { type: "enter", command: "ls", at: 280 },
    ]);
  });

  test("clears previous events on reset", () => {
    let now = 0;
    const recorder = createRecorder(() => now);

    recorder.start();
    recorder.record("input", { char: "x" });
    recorder.reset();

    expect(recorder.snapshot()).toEqual([]);
    expect(recorder.getDuration()).toBe(0);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `cd <team-name> && bun test tests/recorder.test.js`
Expected: FAIL because `src/recorder.js` does not exist yet.

- [ ] **Step 3: Write the minimal recorder**

```js
export function createRecorder(now = () => performance.now()) {
  let startAt = null;
  let active = false;
  let events = [];

  return {
    start() {
      startAt = now();
      active = true;
      events = [];
    },
    stop() {
      active = false;
    },
    reset() {
      startAt = null;
      active = false;
      events = [];
    },
    isActive() {
      return active;
    },
    record(type, payload = {}) {
      if (!active || startAt == null) return null;
      const event = { type, ...payload, at: Math.round(now() - startAt) };
      events.push(event);
      return event;
    },
    snapshot() {
      return events.map((event) => ({ ...event }));
    },
    getDuration() {
      return events.at(-1)?.at ?? 0;
    },
  };
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `cd <team-name> && bun test tests/recorder.test.js`
Expected: PASS with 2 passing tests.

- [ ] **Step 5: Commit**

```bash
git add <team-name>/src/recorder.js <team-name>/tests/recorder.test.js
git commit -m "feat: add replay event recorder"
```

## Chunk 2: Terminal UI, Replay, And Timeline

### Task 4: Mount xterm.js and wire command execution

**Files:**
- Create: `<team-name>/src/terminal.js`
- Modify: `<team-name>/src/main.js`
- Modify: `<team-name>/src/styles.css`

- [ ] **Step 1: Implement a focused terminal controller**

Use `src/terminal.js` to expose a factory like this:

```js
export function createTerminalController({
  mountNode,
  recorder,
  runCommand,
  onStatus,
}) {
  // returns { focus, clear, setInputEnabled, setRecordingActive, writePrompt }
}
```

Responsibilities:

- initialize `xterm`
- manage the current input buffer
- echo printable characters
- handle backspace
- on Enter:
  - write a newline
  - record an `enter` event
  - execute the mock command
  - print output or clear terminal
  - emit a prompt
- while recording is active:
  - record each typed character as an `input` event
  - record output lines as `output` events
  - record prompt writes as `prompt` events
  - record terminal clears as `clear` events

- [ ] **Step 2: Define the terminal event semantics explicitly**

Use these write rules inside `terminal.js`:

```js
recorder.record("input", { char });
recorder.record("enter", { command });
recorder.record("output", { text: line });
recorder.record("prompt", { text: "$ " });
recorder.record("clear");
```

Only emit events when the recorder is active. Keep terminal rendering separate from recorder decisions.

- [ ] **Step 3: Wire the shell in `main.js`**

In `src/main.js`:

- query `recordBtn`, `replayBtn`, `statusText`, `elapsedLabel`, `durationLabel`, `timelineFill`, and `terminalRoot`
- create the recorder
- create the command engine
- create the terminal controller
- set initial status to `Ready`

- [ ] **Step 4: Run the app and verify terminal interaction manually**

Run: `cd <team-name> && bun run dev`
Manual check:

- page loads
- terminal receives focus
- typing `help` prints the help output
- typing `ls` prints the fake directory listing
- typing `clear` clears the display and shows a fresh prompt

- [ ] **Step 5: Commit**

```bash
git add <team-name>/src/terminal.js <team-name>/src/main.js <team-name>/src/styles.css
git commit -m "feat: add interactive mock terminal"
```

### Task 5: Build the replay planner and runner

**Files:**
- Create: `<team-name>/src/replay.js`
- Create: `<team-name>/tests/replay.test.js`

- [ ] **Step 1: Write the failing tests for replay timing**

```js
import { describe, expect, test } from "bun:test";
import { buildReplayPlan } from "../src/replay.js";

describe("buildReplayPlan", () => {
  test("preserves event timing as cumulative delays", () => {
    const plan = buildReplayPlan([
      { type: "input", char: "l", at: 120 },
      { type: "enter", command: "ls", at: 280 },
      { type: "output", text: "main.c", at: 340 },
    ]);

    expect(plan).toEqual([
      { delay: 120, event: { type: "input", char: "l", at: 120 } },
      { delay: 160, event: { type: "enter", command: "ls", at: 280 } },
      { delay: 60, event: { type: "output", text: "main.c", at: 340 } },
    ]);
  });

  test("returns an empty plan for no events", () => {
    expect(buildReplayPlan([])).toEqual([]);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `cd <team-name> && bun test tests/replay.test.js`
Expected: FAIL because `src/replay.js` does not exist yet.

- [ ] **Step 3: Implement the pure planner and imperative runner**

`buildReplayPlan(events)`:

```js
export function buildReplayPlan(events) {
  return events.map((event, index) => ({
    delay: index === 0 ? event.at : event.at - events[index - 1].at,
    event,
  }));
}
```

`playRecording({ events, onEvent, onProgress, onDone })` should:

- build the plan
- schedule each event with chained `setTimeout`
- call `onEvent(event)` for rendering
- call `onProgress(elapsed, total)` after every event
- return a cleanup function that clears pending timers

- [ ] **Step 4: Run the tests to verify they pass**

Run: `cd <team-name> && bun test tests/replay.test.js`
Expected: PASS with 2 passing tests.

- [ ] **Step 5: Commit**

```bash
git add <team-name>/src/replay.js <team-name>/tests/replay.test.js
git commit -m "feat: add replay planner"
```

### Task 6: Wire Record, Replay, and the read-only timeline

**Files:**
- Create: `<team-name>/src/timeline.js`
- Modify: `<team-name>/src/main.js`
- Modify: `<team-name>/src/terminal.js`
- Modify: `<team-name>/src/styles.css`

- [ ] **Step 1: Implement a small timeline controller**

Use `src/timeline.js` to expose:

```js
export function createTimelineController({
  elapsedLabel,
  durationLabel,
  fillNode,
}) {
  // returns { reset, setDuration, setProgress }
}
```

Behavior:

- `reset()` -> `00:00`, empty fill
- `setDuration(ms)` -> update total duration label
- `setProgress(elapsed, total)` -> update elapsed label and fill width

- [ ] **Step 2: Define the button flow in `main.js`**

Implement these handlers:

- `onRecordClick`
  - cancel any replay in progress
  - `recorder.start()`
  - timeline reset
  - status `Recording`
- `onReplayClick`
  - get `events = recorder.snapshot()`
  - if `events.length === 0`, set status `Nothing to replay`
  - `recorder.stop()`
  - disable live input
  - clear terminal
  - run replay
  - update timeline via `onProgress`
  - restore prompt and input on completion

- [ ] **Step 3: Implement event rendering for replay**

Add a replay-safe render API to `terminal.js`:

```js
{
  clear(),
  setInputEnabled(enabled),
  renderReplayEvent(event),
  writePrompt(),
}
```

Replay mapping:

- `input` -> write the character
- `enter` -> write newline
- `output` -> write the line and newline
- `prompt` -> write the prompt text
- `clear` -> clear terminal

Do not send replay writes back into the recorder.

- [ ] **Step 4: Run the full manual smoke test**

Run: `cd <team-name> && bun run dev`
Manual flow:

1. Click `Record`
2. Type `help`
3. Type `ls`
4. Click `Replay`
5. Confirm:
   - terminal clears first
   - typed text reappears in sequence
   - fake output reappears in sequence
   - timeline fill advances during replay
   - prompt returns when replay completes

- [ ] **Step 5: Build the production bundle**

Run: `cd <team-name> && bun run build`
Expected: built assets appear under `dist/<team-name>/`.

- [ ] **Step 6: Commit**

```bash
git add <team-name>/src/timeline.js <team-name>/src/main.js <team-name>/src/terminal.js <team-name>/src/styles.css
git commit -m "feat: add session replay timeline"
```

## Chunk 3: Submission And Final Verification

### Task 7: Write the submission README and package the deliverable

**Files:**
- Create: `<team-name>/README.md`

- [ ] **Step 1: Fill the hackathon README fields**

Use this template:

```md
# Web Terminal Time Machine

- Team / Members:
- Agentic Coder:
- Completion self-review:
- First prompt to AI:
```

- [ ] **Step 2: Add one short implementation note**

Include:

- Bun dev/build command
- key MVP features completed
- known gaps, if any

- [ ] **Step 3: Run the final verification pass**

Run:

- `cd <team-name> && bun test`
- `cd <team-name> && bun run build`
- `cd <team-name> && bun run dev`

Manual check:

- page loads
- record starts a fresh session
- replay works after at least one recorded interaction
- timeline advances during replay
- no real backend is required

- [ ] **Step 4: Commit**

```bash
git add <team-name>/README.md
git commit -m "docs: add hackathon submission notes"
```

### Task 8: Prepare the fork submission

**Files:**
- Modify: repository root only if needed for documentation links

- [ ] **Step 1: Verify the repository layout**

Expected shape:

```text
README.md
<team-name>/
  package.json
  index.html
  src/
  tests/
  README.md
```

- [ ] **Step 2: Verify the PR metadata**

Use this format:

```text
[Hackathon] <team-name> - Web Terminal Time Machine
```

- [ ] **Step 3: Stop scope creep**

Do not add:

- real backend
- authentication
- editable timeline
- extra commands beyond demo value
- framework migration unless the current code is blocked

- [ ] **Step 4: Final commit**

```bash
git add <team-name>
git commit -m "feat: finalize hackathon terminal time machine demo"
```

## Implementation Notes

- Prefer one responsibility per file even though the app is small.
- Keep `commands.js`, `recorder.js`, and the pure part of `replay.js` testable without the DOM.
- Treat `terminal.js` as the only module allowed to touch xterm-specific APIs.
- Treat `main.js` as orchestration only: button handlers, wiring, status text, and high-level flow.
- Keep the timeline display-only. Do not implement scrubbing.
- If xterm integration blocks progress for more than 5 minutes, replace it with a styled `div` terminal and keep the same recorder/replay interfaces.

## Definition Of Ready To Execute

You are ready to code when:

- the team folder name is chosen
- the file structure above is accepted
- you agree to keep React out unless implementation is actually blocked
- you accept the downgrade rule of command-level replay if per-keystroke replay gets too expensive
