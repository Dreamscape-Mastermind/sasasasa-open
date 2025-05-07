// hooks/useLogger.ts
type LogLevel = "info" | "warn" | "error" | "debug";

interface LoggerOptions {
  context?: string;
}

export function useLogger(options?: LoggerOptions) {
  const prefix = options?.context ? `[${options.context}]` : "";
  const timestamp = new Date().toISOString();

  const sendToServer = async (level: LogLevel, message: string, data?: any) => {
    try {
      await fetch("/api/logs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          level,
          message,
          context: options?.context || "client",
          timestamp: new Date().toISOString(),
          data,
        }),
      });
    } catch (error) {
      console.error("Failed to send log to server", error);
    }
  };

  const log = (level: LogLevel, message: string, data?: any) => {
    const formatted = `${prefix} ${message}`;
    const payload = { message, timestamp, ...(data && { data }) };

    // Console logging (dev)
    if (process.env.NODE_ENV === "development") {
      console[level](
        `[${level.toUpperCase()}] [${timestamp}] ${formatted}`,
        data ?? ""
      );
    }

    // Production logging (send to remote or custom service)
    if (process.env.NODE_ENV === "production") {
      // Example: send to your logging API
      sendToServer(level, message, data);
    }
  };

  return {
    info: (msg: string, data?: any) => log("info", msg, data),
    warn: (msg: string, data?: any) => log("warn", msg, data),
    error: (msg: string, data?: any) => log("error", msg, data),
    debug: (msg: string, data?: any) => log("debug", msg, data),
  };
}
