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

  test("does not record when inactive", () => {
    const recorder = createRecorder(() => 0);

    expect(recorder.record("input", { char: "x" })).toBeNull();
    expect(recorder.snapshot()).toEqual([]);
  });

  test("start begins a fresh capture and stop blocks later writes", () => {
    let now = 0;
    const recorder = createRecorder(() => now);

    recorder.start();
    recorder.record("input", { char: "a" });
    recorder.stop();
    now = 50;
    expect(recorder.record("input", { char: "b" })).toBeNull();
    expect(recorder.snapshot()).toEqual([{ type: "input", char: "a", at: 0 }]);

    now = 100;
    recorder.start();
    now = 180;
    recorder.record("input", { char: "c" });

    expect(recorder.snapshot()).toEqual([{ type: "input", char: "c", at: 80 }]);
    expect(recorder.getDuration()).toBe(80);
  });
});
