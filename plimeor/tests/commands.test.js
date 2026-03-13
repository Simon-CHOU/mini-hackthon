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

  test("returns noop for empty input", () => {
    expect(runMockCommand("   ")).toEqual({ kind: "noop", lines: [] });
  });

  test("supports normalized gcc command", () => {
    expect(runMockCommand("  gcc   main.c ")).toEqual({
      kind: "output",
      lines: ["Compiling...", "Build succeeded."],
    });
  });
});
