import { configure, getConsoleSink, getLogger } from "@logtape/logtape";

// Ensure configuration happens only once
let isConfigured = false;

export async function initLogger() {
  if (isConfigured) return;

  await configure({
    sinks: {
      console: getConsoleSink(),
    },
    filters: {},
    loggers: [
      {
        category: "app",
        sinks: ["console"],
        lowestLevel: process.env.NODE_ENV === "production" ? "info" : "debug",
      },
    ],
  });

  isConfigured = true;
}

// Initialize immediately (in client/server context this might run multiple times but the guard prevents re-config)
initLogger().catch(console.error);

export const logger = getLogger(["app"]);
