/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi } from "vitest";
import { buildMopidyUrl, getWsAddress } from "./utils";

describe("buildMopidyUrl", () => {
  it("simple host and port", () => {
    expect(buildMopidyUrl("localhost", 6680, null, "http:")).toBe(
      "http://localhost:6680",
    );
  });

  it("host with path and port", () => {
    expect(buildMopidyUrl("gidouille.local/mopidy", 443, null, "https:")).toBe(
      "https://gidouille.local:443/mopidy",
    );
  });

  it("host with path, port and extra path", () => {
    expect(
      buildMopidyUrl("gidouille.local/mopidy", 443, "mopidy/ws", "wss:"),
    ).toBe("wss://gidouille.local:443/mopidy/mopidy/ws");
  });

  it("simple host with extra path", () => {
    expect(buildMopidyUrl("localhost", 6680, "mopidy/ws", "ws:")).toBe(
      "ws://localhost:6680/mopidy/ws",
    );
  });

  it("no port", () => {
    expect(buildMopidyUrl("localhost", null, "mopidy/ws", "ws:")).toBe(
      "ws://localhost/mopidy/ws",
    );
  });

  it("no path", () => {
    expect(buildMopidyUrl("myhost", 8080, null, "http:")).toBe(
      "http://myhost:8080",
    );
  });

  it("path with leading slash is normalized", () => {
    expect(buildMopidyUrl("localhost", 6680, "/mopidy/ws", "ws:")).toBe(
      "ws://localhost:6680/mopidy/ws",
    );
  });

  it("host with deep path", () => {
    expect(
      buildMopidyUrl("proxy.local/reverse/mopidy", 8443, "api/ws", "wss:"),
    ).toBe("wss://proxy.local:8443/reverse/mopidy/api/ws");
  });

  it("falls back to window.location.protocol when protocol is omitted", () => {
    Object.defineProperty(window, "location", {
      value: { protocol: "https:" },
      writable: true,
    });
    expect(buildMopidyUrl("localhost", 6680)).toBe("https://localhost:6680");
  });
});

describe("getWsAddress", () => {
  const setProtocol = (protocol) => {
    Object.defineProperty(window, "location", {
      value: { protocol },
      writable: true,
    });
  };

  it("uses wss when page is https", () => {
    setProtocol("https:");
    expect(getWsAddress("localhost", 6680, "mopidy")).toBe(
      "wss://localhost:6680/mopidy/ws",
    );
  });

  it("uses ws when page is http", () => {
    setProtocol("http:");
    expect(getWsAddress("localhost", 6680, "mopidy")).toBe(
      "ws://localhost:6680/mopidy/ws",
    );
  });

  it("handles host with path correctly", () => {
    setProtocol("https:");
    expect(getWsAddress("gidouille.local/mopidy", 443, "mopidy")).toBe(
      "wss://gidouille.local:443/mopidy/mopidy/ws",
    );
  });

  it("handles bookmarks endpoint", () => {
    setProtocol("http:");
    expect(getWsAddress("myhost", 6680, "bookmarks")).toBe(
      "ws://myhost:6680/bookmarks/ws",
    );
  });
});
