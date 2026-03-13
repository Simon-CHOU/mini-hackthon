import { describe, expect, test } from "bun:test";
import { buildReplayPlan, playRecording } from "../src/replay.js";

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

describe("playRecording", () => {
  test("replays events in order, reports progress, and completes once", () => {
    const scheduled = [];
    const onEventCalls = [];
    const onProgressCalls = [];
    const onDoneCalls = [];

    const setTimeoutFn = (callback, delay) => {
      const timer = { callback, delay, cleared: false };
      scheduled.push(timer);
      return timer;
    };

    const clearTimeoutFn = (timer) => {
      timer.cleared = true;
    };

    playRecording({
      events: [
        { type: "input", char: "l", at: 120 },
        { type: "enter", command: "ls", at: 280 },
      ],
      onEvent(event) {
        onEventCalls.push(event);
      },
      onProgress(elapsed, total) {
        onProgressCalls.push([elapsed, total]);
      },
      onDone() {
        onDoneCalls.push("done");
      },
      setTimeoutFn,
      clearTimeoutFn,
    });

    expect(scheduled).toHaveLength(1);
    expect(scheduled[0].delay).toBe(120);

    scheduled[0].callback();
    expect(onEventCalls).toEqual([{ type: "input", char: "l", at: 120 }]);
    expect(onProgressCalls).toEqual([[120, 280]]);
    expect(onDoneCalls).toEqual([]);
    expect(scheduled).toHaveLength(2);
    expect(scheduled[1].delay).toBe(160);

    scheduled[1].callback();
    expect(onEventCalls).toEqual([
      { type: "input", char: "l", at: 120 },
      { type: "enter", command: "ls", at: 280 },
    ]);
    expect(onProgressCalls).toEqual([
      [120, 280],
      [280, 280],
    ]);
    expect(onDoneCalls).toEqual(["done"]);
  });

  test("cleanup cancels pending replay work", () => {
    const scheduled = [];
    const onEventCalls = [];
    const onDoneCalls = [];

    const cleanup = playRecording({
      events: [
        { type: "input", char: "l", at: 120 },
        { type: "enter", command: "ls", at: 280 },
      ],
      onEvent(event) {
        onEventCalls.push(event);
      },
      onDone() {
        onDoneCalls.push("done");
      },
      setTimeoutFn(callback, delay) {
        const timer = { callback, delay, cleared: false };
        scheduled.push(timer);
        return timer;
      },
      clearTimeoutFn(timer) {
        timer.cleared = true;
      },
    });

    cleanup();

    expect(scheduled[0].cleared).toBe(true);
    scheduled[0].callback();

    expect(onEventCalls).toEqual([]);
    expect(onDoneCalls).toEqual([]);
  });
});
