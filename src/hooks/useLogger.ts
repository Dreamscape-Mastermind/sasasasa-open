import { useCallback } from "react";

type LogLevel = "info" | "warn" | "error" | "debug";

interface LoggerOptions {
  context?: string;
  enabled?: boolean;
}

interface LogEntry {
  level: LogLevel;
  message: string;
  data?: any;
  timestamp: string;
  context: string;
}

export function useLogger(options: LoggerOptions = {}) {
  const { context = "app", enabled = process.env.NODE_ENV === "development" } = options;

  // Log function - sends immediately
  const log = useCallback(
    async (level: LogLevel, message: string, data?: any) => {
      if (!enabled) return;

      const timestamp = new Date().toISOString();
      const entry: LogEntry = {
        level,
        message,
        data,
        timestamp,
        context,
      };

      // Console logging in development
      if (process.env.NODE_ENV === "development") {
        const formatted = `[${level.toUpperCase()}] [${timestamp}] [${context}] ${message}`;
        console[level](formatted, data ?? "");
      }

      // Send to server in production
      if (process.env.NODE_ENV === "production") {
        try {
          await fetch("/api/logs", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(entry),
          });
        } catch (error) {
          console.error("Failed to send log to server", error);
        }
      }
    },
    [context, enabled]
  );

  // Expose logging methods - memoized to prevent recreation
  const info = useCallback((msg: string, data?: any) => log("info", msg, data), [log]);
  const warn = useCallback((msg: string, data?: any) => log("warn", msg, data), [log]);
  const error = useCallback((msg: string, data?: any) => log("error", msg, data), [log]);
  const debug = useCallback((msg: string, data?: any) => log("debug", msg, data), [log]);

  return {
    info,
    warn,
    error,
    debug,
  };
}
