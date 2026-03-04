export interface ErrorContext {
  [key: string]: unknown;
}

export interface ErrorLog {
  message: string;
  stack?: string;
  context?: ErrorContext;
  timestamp: string;
  userAgent?: string;
  url?: string;
}

export function logError(error: Error, context?: ErrorContext): void {
  const errorLog: ErrorLog = {
    message: error.message,
    stack: error.stack,
    context,
    timestamp: new Date().toISOString(),
    userAgent: typeof window !== "undefined" ? window.navigator.userAgent : undefined,
    url: typeof window !== "undefined" ? window.location.href : undefined,
  };

  if (process.env.NODE_ENV === "development") {
    console.error("Error:", errorLog);
  }
}

export function logInfo(message: string, context?: ErrorContext): void {
  const log = {
    message,
    context,
    timestamp: new Date().toISOString(),
  };

  if (process.env.NODE_ENV === "development") {
    console.info("Info:", log);
  }
}

export function logWarning(message: string, context?: ErrorContext): void {
  const log = {
    message,
    context,
    timestamp: new Date().toISOString(),
  };

  if (process.env.NODE_ENV === "development") {
    console.warn("Warning:", log);
  }
}
