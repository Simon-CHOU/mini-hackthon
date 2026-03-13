# Web Terminal Time Machine MVP Hackathon Plan

Date: 2026-03-13
Status: Approved design, ready for implementation planning

## 1. Context

This repository currently contains only the hackathon prompt in [README.md](/Users/plimeor/Documents/mini-hackthon/README.md). The goal is not to build a production terminal platform. The goal is to produce a 25-minute front-end MVP demo that proves one core experience:

`open page -> type in terminal -> see mock output -> replay the session`

The project must favor demo reliability over architecture depth.

## 2. Request

Produce a 25-minute execution plan for a hackathon submission using:

- `bun` as the local toolchain
- plain `HTML/CSS/JS` as the primary implementation path
- `React` only as an emergency fallback if it clearly reduces duplication and does not slow delivery

## 3. Constraints

- No backend
- No SSH or real remote environment
- No authentication
- Single-page app
- Must include a visible terminal area
- Must support mock command interaction
- Must include recording and replay
- Must include a non-editable timeline
- Must optimize for hackathon delivery within 25 minutes

## 4. Success Criteria

The MVP is successful if a judge can watch one uninterrupted demo flow:

1. Open the page
2. See a terminal UI
3. Type commands
4. See mock command output
5. Click replay
6. Watch the typed input and output replay in sequence
7. See the timeline progress move during replay

## 5. Chosen Approach

### 5.1 Recommendation

Use:

- `bun`
- one HTML page
- one CSS file
- one or a few JS files
- `xterm.js` for terminal rendering
- a custom semantic event recorder for replay

This approach is recommended because it keeps all effort on the main demo loop and avoids framework overhead.

### 5.2 Rejected Alternatives

#### Page-level recording

Using a tool such as `rrweb` to record the whole page is heavier than needed. The terminal is the main unit of value, so replay should be driven by terminal events, not DOM snapshots.

#### React-first implementation

React helps when UI composition is the hard part. Here, the hard part is command flow, event timing, and replay. React adds lifecycle and integration cost without improving the critical path enough.

## 6. Scope

### 6.1 Must Have

- Single-page app that can run locally with `bun`
- Terminal area with prompt and input echo
- At least these mock commands:
  - `help`
  - `ls`
  - `gcc main.c`
  - `clear`
- `Record` button
- `Replay` button
- Read-only timeline showing:
  - total recorded duration
  - current replay progress
- Replay that replays both input and output, not only the final terminal state

### 6.2 Explicitly Out of Scope

- Real shell execution
- Real filesystem
- Authentication or sessions
- Persistent storage
- Timeline editing
- Dragging, trimming, scrubbing, or speed control
- Multiplayer or teacher dashboard

## 7. Delivery Strategy

### 7.1 Primary Principle

Protect the demo loop first:

`terminal input -> fake command output -> replay -> moving timeline`

No work should displace this path.

### 7.2 Downgrade Rules

- If `xterm.js` blocks progress for more than 5 minutes, fall back to a custom fake terminal view
- If per-keystroke replay becomes too expensive, downgrade to command-level replay
- If timeline polish threatens the replay feature, keep only a simple progress bar plus elapsed and total time
- In the last 3 minutes, stop adding features and only stabilize the demo

## 8. 25-Minute Execution Plan

### 8.1 Minute 0-3: Skeleton

Build:

- page shell
- terminal container
- control buttons
- timeline container

Exit condition:

- page opens
- all primary UI blocks render

### 8.2 Minute 3-8: Terminal Interaction

Build:

- terminal initialization
- prompt display
- character echo
- enter handling

Exit condition:

- user can type text and submit a command

### 8.3 Minute 8-13: Mock Command Engine

Build:

- command parser
- small command map
- output rendering

Exit condition:

- at least two commands return deterministic mock output

### 8.4 Minute 13-18: Recorder

Build:

- recording start time
- event array
- event capture for input, enter, output, clear, and prompt

Exit condition:

- a complete interaction generates a stable event stream

### 8.5 Minute 18-22: Replay + Timeline

Build:

- replay scheduler
- terminal reset before replay
- input lock during replay
- timeline progress updates

Exit condition:

- one recorded interaction can replay from start to end

### 8.6 Minute 22-25: Stabilization + Submission

Build:

- fix only demo-breaking issues
- write submission README in team folder
- verify folder layout
- prepare PR title

Exit condition:

- the demo can be shown once without manual repair

## 9. Suggested File Structure

Preferred:

- `index.html`
- `style.css`
- `main.js`
- `terminal.js`
- `recorder.js`
- `replay.js`

Emergency compact mode:

- `index.html`
- `style.css`
- `main.js`

The compact mode is acceptable if time pressure is high. Internal logical sections should still remain separate in the file.

## 10. Event Model

Use semantic terminal events rather than DOM recording.

Example:

```js
[
  { type: "input", char: "l", at: 120 },
  { type: "input", char: "s", at: 180 },
  { type: "enter", command: "ls", at: 260 },
  { type: "output", text: "main.c  README.md  demo/", at: 340 },
  { type: "prompt", text: "$ ", at: 360 }
]
```

### 10.1 Event Types

- `input`: a typed character
- `enter`: command submission
- `output`: mock command output
- `prompt`: prompt rendering after command completion
- `clear`: terminal clear action

### 10.2 Why This Model

- It is cheap to implement
- It enables visible replay of typing
- It is easier to debug than DOM or screen recording
- It supports a clean downgrade to command-level replay if needed

## 11. Terminal Command Strategy

Use a small deterministic command map.

Example:

```js
{
  help: ["Available commands: help, ls, gcc main.c, clear"],
  ls: ["main.c", "README.md", "demo/"],
  "gcc main.c": ["Compiling...", "Build succeeded."],
  clear: "__CLEAR__"
}
```

Rules:

- known command -> predefined output
- unknown command -> `command not found`
- `clear` -> emit a special clear event and reset terminal display

## 12. Replay Behavior

Replay should:

1. Disable input
2. Clear the terminal
3. Re-run events according to their relative timestamps
4. Update the timeline as replay advances
5. Restore prompt and input ability after completion

Implementation can use `setTimeout` or a small scheduler keyed by `event.at`.

## 13. Timeline Design

The timeline is display-only.

Required UI:

- elapsed time label
- total time label
- progress bar fill

Not required:

- scrubbing
- markers
- editing
- speed control

## 14. AI Coding Prompt

Recommended first prompt:

```text
Use bun to build a front-end single-page MVP. Do not build any backend, auth, or SSH integration.

Goal: a Web Terminal Time Machine demo with:
- a black terminal area
- a Record button
- a Replay button
- a read-only timeline that shows total duration and replay progress

Behavior:
- use xterm.js or an equivalent lightweight approach
- local mock terminal only
- support help, ls, gcc main.c, and clear
- echo typed input
- on Enter, run the mock command and print fake output
- record typed input and output with timestamps
- on Replay, clear the terminal and replay the session at the original pace
- keep the main demo loop working first
- if per-keystroke replay is too expensive, downgrade to command-level replay but keep the timeline

Engineering rules:
- keep the file structure minimal
- plain HTML/CSS/JS first
- do not introduce React unless it clearly saves time

First, show the smallest workable file structure, then output runnable code.
```

## 15. Demo Checklist

Before submission, verify:

- page loads locally
- terminal accepts input
- mock commands produce output
- at least one session can replay
- timeline moves during replay
- README for submission is present in the team folder

## 16. Risks

### 16.1 Main Risk

Spending too much time on fidelity instead of the demo loop.

### 16.2 Secondary Risks

- terminal library setup friction
- replay timing bugs
- overbuilding timeline UI
- unnecessary framework setup

## 17. Definition of Done

The work is done when:

- the approved approach remains `bun + HTML/CSS/JS`
- the 25-minute plan is explicit and sequenced
- downgrade rules are defined
- implementation structure is documented
- replay event model is documented
- AI prompt and submission checklist are included

## 18. Verification Status

Verified:

- repository currently contains only the hackathon README
- the README defines a front-end MVP with mock terminal and replay

Not yet verified:

- actual runtime behavior, because implementation has not started
- git commit success in this environment, because `/usr/bin/git` is currently blocked by an Xcode license prompt
