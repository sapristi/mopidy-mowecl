// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import {
  LIBRARY_RELOAD_MIN_DOWNTIME_MS,
  shouldReloadLibrary,
} from "./mopidy";

describe("shouldReloadLibrary", () => {
  const now = 1_000_000;

  it("reloads on first connection", () => {
    expect(shouldReloadLibrary(true, null, now)).toBe(true);
    expect(shouldReloadLibrary(true, now - 1000, now)).toBe(true);
  });

  it("keeps the library after a short disconnection", () => {
    expect(shouldReloadLibrary(false, now - 3000, now)).toBe(false);
    expect(
      shouldReloadLibrary(false, now - LIBRARY_RELOAD_MIN_DOWNTIME_MS + 1, now),
    ).toBe(false);
  });

  it("reloads after a long disconnection", () => {
    expect(
      shouldReloadLibrary(false, now - LIBRARY_RELOAD_MIN_DOWNTIME_MS, now),
    ).toBe(true);
    expect(shouldReloadLibrary(false, now - 60_000, now)).toBe(true);
  });

  it("reloads when the disconnection time is unknown", () => {
    expect(shouldReloadLibrary(false, null, now)).toBe(true);
  });
});
