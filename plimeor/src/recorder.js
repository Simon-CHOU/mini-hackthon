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
      if (!active || startAt == null) {
        return null;
      }

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
