export class Recorder {
  constructor() {
    this.events = [];
    this.isRecording = false;
    this.startTime = 0;
  }

  start() {
    this.isRecording = true;
    this.events = [];
    this.startTime = Date.now();
  }

  stop() {
    this.isRecording = false;
  }

  record(data) {
    if (!this.isRecording) return;
    this.events.push({
      timestamp: Date.now() - this.startTime,
      data
    });
  }

  getEvents() {
    return this.events;
  }

  clear() {
    this.events = [];
  }
}
