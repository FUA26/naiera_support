# @workspace/logger

Shared logging utility for the workspace.

## Purpose

This package provides a structured logging system with:
- Log levels (debug, info, warn, error)
- Consistent formatting
- Environment-aware output (development vs production)

## Usage

```ts
import { logger } from "@workspace/logger/logger";

logger.info("User logged in", { userId: "123" });
logger.error("Database connection failed", { error: err });
logger.debug("API request", { endpoint: "/tasks", params });
```

## Log Levels

- `debug` - Detailed information for debugging
- `info` - General informational messages
- `warn` - Warning messages for potentially harmful situations
- `error` - Error messages for critical issues

## Environment Configuration

In development, logs include full stack traces and color output.
In production, logs are formatted for log aggregation services.

## See Also

- `apps/backoffice/lib/logger.ts` - App-specific logger configuration
