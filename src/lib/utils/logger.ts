/**
 * Structured JSON logger for Vercel Logs / log drains.
 * Outputs one JSON line per log entry for easy parsing.
 */

type LogLevel = "info" | "warn" | "error";

interface LogContext {
  requestId?: string;
  path?: string;
  method?: string;
  userId?: string;
  ip?: string;
  durationMs?: number;
  statusCode?: number;
  [key: string]: unknown;
}

function log(level: LogLevel, message: string, context?: LogContext) {
  const entry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...context,
  };

  const line = JSON.stringify(entry);

  if (level === "error") {
    console.error(line);
  } else if (level === "warn") {
    console.warn(line);
  } else {
    console.log(line);
  }
}

export const logger = {
  info: (message: string, context?: LogContext) => log("info", message, context),
  warn: (message: string, context?: LogContext) => log("warn", message, context),
  error: (message: string, context?: LogContext) => log("error", message, context),
};
