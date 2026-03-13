export class Player {
  constructor(events) {
    this.events = events;
  }

  play(callback) {
    return new Promise((resolve) => {
      if (this.events.length === 0) {
        resolve();
        return;
      }

      this.events.forEach((event, index) => {
        setTimeout(() => {
          callback(event.data);
          if (index === this.events.length - 1) {
            resolve();
          }
        }, event.timestamp);
      });
    });
  }
}
