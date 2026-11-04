/*
Application logging, based on loglevel (https://github.com/pimterry/loglevel).

Usage:
  import { getLogger } from "@/logger";
  const log = getLogger("library");
  log.debug("...");

The root level is driven by the "Log level" setting. Per-area levels can be
changed from the devtools console, e.g. `moweclLog.getLogger("ws").setLevel("debug")`
(persisted in localStorage).

In production builds, recent messages are also kept in memory so users can
export them from the settings panel for bug reports. This wraps the console
methods, which hides the call site in devtools: it is skipped in development.
*/

import log from "loglevel";

export const LOG_LEVELS = ["trace", "debug", "info", "warn", "error", "silent"];
export const DEFAULT_LOG_LEVEL = import.meta.env.DEV ? "debug" : "warn";

const BUFFER_CAPACITY = 1000;

export const formatArg = (arg) => {
  if (typeof arg === "string") return arg;
  if (arg instanceof Error) return arg.stack || String(arg);
  // e.g. WebSocket "error" events, which carry no other useful data.
  if (typeof Event !== "undefined" && arg instanceof Event)
    return `[Event ${arg.type}]`;
  try {
    return JSON.stringify(arg) ?? String(arg);
  } catch {
    return String(arg);
  }
};

export const createLogBuffer = (capacity) => {
  const lines = [];
  return {
    push: (line) => {
      lines.push(line);
      if (lines.length > capacity) lines.shift();
    },
    entries: () => [...lines],
  };
};

const formatLine = (level, name, args) =>
  [
    new Date().toISOString(),
    level.toUpperCase(),
    ...(name ? [`[${String(name)}]`] : []),
    ...args.map(formatArg),
  ].join(" ");

export const installBuffer = (logger, buffer) => {
  const originalFactory = logger.methodFactory;
  logger.methodFactory = (methodName, logLevel, loggerName) => {
    const rawMethod = originalFactory(methodName, logLevel, loggerName);
    return (...args) => {
      buffer.push(formatLine(methodName, loggerName, args));
      rawMethod(...args);
    };
  };
  logger.rebuild();
};

const buffer = createLogBuffer(BUFFER_CAPACITY);

if (!import.meta.env.DEV) {
  // Must run before any child logger is created: they inherit methodFactory.
  installBuffer(log, buffer);
  // Uncaught errors are already shown by the browser console; only record them.
  window.addEventListener("error", (e) =>
    buffer.push(formatLine("error", "uncaught", [e.error ?? e.message])),
  );
  window.addEventListener("unhandledrejection", (e) =>
    buffer.push(formatLine("error", "unhandledrejection", [e.reason])),
  );
}

log.setDefaultLevel(DEFAULT_LOG_LEVEL);
window.moweclLog = log;

export const getLogger = (name) => log.getLogger(name);

export const setLogLevel = (level) => {
  // Not persisted by loglevel: the settings reducer owns this value.
  log.setLevel(LOG_LEVELS.includes(level) ? level : DEFAULT_LOG_LEVEL, false);
  // Propagate to already-created child loggers that inherit the root level.
  log.rebuild();
};

export const exportLogs = () => {
  const header = [
    `Mowecl logs exported ${new Date().toISOString()}`,
    `URL: ${window.location.href}`,
    `User agent: ${navigator.userAgent}`,
    `Log level: ${LOG_LEVELS[log.getLevel()]}`,
    import.meta.env.DEV
      ? "(development build: message capture disabled)"
      : `Last ${BUFFER_CAPACITY} messages at or above the log level:`,
    "",
  ];
  const blob = new Blob([[...header, ...buffer.entries()].join("\n")], {
    type: "text/plain",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `mowecl-logs-${new Date().toISOString()}.txt`;
  a.click();
  URL.revokeObjectURL(url);
};

export default log;
