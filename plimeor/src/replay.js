export function buildReplayPlan(events) {
  return events.map((event, index) => ({
    delay: index === 0 ? event.at : event.at - events[index - 1].at,
    event,
  }));
}

export function playRecording({
  events,
  onEvent,
  onProgress,
  onDone,
  setTimeoutFn = globalThis.setTimeout,
  clearTimeoutFn = globalThis.clearTimeout,
}) {
  const plan = buildReplayPlan(events);
  const total = events.at(-1)?.at ?? 0;
  let timerId = null;
  let cancelled = false;

  function runStep(index) {
    if (cancelled) {
      return;
    }

    if (index >= plan.length) {
      onDone?.();
      return;
    }

    const { delay, event } = plan[index];
    timerId = setTimeoutFn(() => {
      if (cancelled) {
        return;
      }

      onEvent?.(event);
      onProgress?.(event.at, total);
      runStep(index + 1);
    }, delay);
  }

  runStep(0);

  return () => {
    cancelled = true;
    if (timerId != null) {
      clearTimeoutFn(timerId);
    }
  };
}
