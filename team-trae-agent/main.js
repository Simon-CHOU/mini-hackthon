import 'xterm/css/xterm.css';
import { Terminal } from 'xterm';
import { CommandParser } from './src/CommandParser';
import { Recorder } from './src/Recorder';
import { Player } from './src/Player';

// Initialize Terminal
const term = new Terminal({
  cursorBlink: true,
  theme: {
    background: '#000000',
    foreground: '#ffffff'
  },
  rows: 24,
  cols: 80
});

const container = document.getElementById('terminal-container');
term.open(container);

// Initialize Logic
const parser = new CommandParser();
const recorder = new Recorder();
let currentBuffer = '';
const PROMPT = '\r\n$ ';

// Initial Prompt
term.write('Welcome to Web Terminal Time Machine v1.0');
term.write(PROMPT);

// Handle Single Character Logic
function handleChar(char) {
  // Handle Enter
  if (char === '\r') {
    term.write('\r\n');
    const output = parser.execute(currentBuffer);
    if (output) {
      term.write(output);
    }
    currentBuffer = '';
    term.write(PROMPT);
  }
  // Handle Backspace
  else if (char === '\x7f') {
    if (currentBuffer.length > 0) {
      currentBuffer = currentBuffer.slice(0, -1);
      term.write('\b \b');
    }
  }
  // Handle printable characters (simple check)
  else if (char >= ' ' && char <= '~') {
    currentBuffer += char;
    term.write(char);
  }
}

// Event Listeners
term.onData(data => {
  if (document.body.classList.contains('replaying')) return;

  if (recorder.isRecording) {
    recorder.record(data);
  }
  
  // Process each character in the input
  for (let i = 0; i < data.length; i++) {
    handleChar(data[i]);
  }
});

// UI Controls
const recordBtn = document.getElementById('record-btn');
const replayBtn = document.getElementById('replay-btn');
const statusSpan = document.getElementById('status');

recordBtn.addEventListener('click', () => {
  if (recorder.isRecording) {
    recorder.stop();
    recordBtn.textContent = 'Record';
    recordBtn.classList.remove('recording');
    statusSpan.textContent = 'Recorded ' + recorder.getEvents().length + ' events';
  } else {
    recorder.start();
    recordBtn.textContent = 'Stop Recording';
    recordBtn.classList.add('recording');
    statusSpan.textContent = 'Recording...';
    // Clear buffer? No, keep current state.
  }
});

replayBtn.addEventListener('click', async () => {
  const events = recorder.getEvents();
  if (events.length === 0) {
    statusSpan.textContent = 'No recording found!';
    return;
  }

  // Set Replay Mode
  document.body.classList.add('replaying');
  replayBtn.disabled = true;
  recordBtn.disabled = true;
  statusSpan.textContent = 'Replaying...';
  replayBtn.classList.add('replaying');

  // Clear Terminal and Reset State
  term.reset();
  term.write('Welcome to Web Terminal Time Machine v1.0');
  term.write(PROMPT);
  currentBuffer = '';

  // Play
  const player = new Player(events);
  await player.play((data) => {
    for (let i = 0; i < data.length; i++) {
      handleChar(data[i]);
    }
  });

  // Finish Replay
  document.body.classList.remove('replaying');
  replayBtn.disabled = false;
  recordBtn.disabled = false;
  statusSpan.textContent = 'Replay Finished';
  replayBtn.classList.remove('replaying');
});
