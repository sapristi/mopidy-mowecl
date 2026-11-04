// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi } from "vitest";
import loglevel from "loglevel";
import { createLogBuffer, formatArg, installBuffer } from "./logger";

describe("formatArg", () => {
  it("keeps strings as-is", () => {
    expect(formatArg("hello")).toBe("hello");
  });

  it("serializes plain objects as JSON", () => {
    expect(formatArg({ code: 1006, wasClean: false })).toBe(
      '{"code":1006,"wasClean":false}',
    );
  });

  it("uses the stack of errors", () => {
    const err = new Error("boom");
    expect(formatArg(err)).toBe(err.stack);
  });

  it("describes DOM events by type", () => {
    expect(formatArg(new Event("error"))).toBe("[Event error]");
  });

  it("does not throw on circular objects", () => {
    const obj = {};
    obj.self = obj;
    expect(formatArg(obj)).toBe("[object Object]");
  });
});

describe("createLogBuffer", () => {
  it("drops the oldest entries beyond capacity", () => {
    const buffer = createLogBuffer(2);
    buffer.push("a");
    buffer.push("b");
    buffer.push("c");
    expect(buffer.entries()).toEqual(["b", "c"]);
  });
});

describe("installBuffer", () => {
  let logger;
  let buffer;
  let n = 0;

  beforeEach(() => {
    // Unique name per test: getLogger returns cached instances by name.
    logger = loglevel.getLogger(`ws${n++}`);
    logger.setLevel("info", false);
    buffer = createLogBuffer(10);
    installBuffer(logger, buffer);
    vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.spyOn(console, "info").mockImplementation(() => {});
  });

  it("records enabled messages with level and logger name", () => {
    logger.warn("close", { code: 1006 });
    const [line] = buffer.entries();
    expect(line).toMatch(/^\d{4}-\d\d-\d\dT.* WARN \[ws\d+\] close {"code":1006}$/);
  });

  it("still forwards messages to the console", () => {
    logger.warn("close");
    expect(console.warn).toHaveBeenCalled();
  });

  it("does not record messages below the logger level", () => {
    logger.debug("noise");
    expect(buffer.entries()).toEqual([]);
  });
});
