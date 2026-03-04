export interface RateLimitOptions {
  max: number;
  windowMs: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: Date;
}

interface RateLimitEntry {
  count: number;
  resetTime: Date;
}

export interface RateLimiter {
  check(identifier: string): Promise<RateLimitResult>;
  reset(identifier: string): void;
  cleanup(): void;
}

export function createRateLimiter(options: RateLimitOptions): RateLimiter {
  const store = new Map<string, RateLimitEntry>();

  return {
    async check(identifier: string): Promise<RateLimitResult> {
      const now = new Date();
      const entry = store.get(identifier);

      if (entry && entry.resetTime <= now) {
        store.delete(identifier);
      }

      const currentEntry = store.get(identifier);
      const resetTime = new Date(now.getTime() + options.windowMs);

      if (!currentEntry) {
        store.set(identifier, { count: 1, resetTime });
        return {
          allowed: true,
          remaining: options.max - 1,
          resetTime,
        };
      }

      if (currentEntry.count >= options.max) {
        return {
          allowed: false,
          remaining: 0,
          resetTime: currentEntry.resetTime,
        };
      }

      currentEntry.count++;
      return {
        allowed: true,
        remaining: options.max - currentEntry.count,
        resetTime: currentEntry.resetTime,
      };
    },

    reset(identifier: string): void {
      store.delete(identifier);
    },

    cleanup(): void {
      const now = new Date();
      for (const [key, entry] of store.entries()) {
        if (entry.resetTime <= now) {
          store.delete(key);
        }
      }
    },
  };
}

export const apiRateLimiter = createRateLimiter({
  max: 100,
  windowMs: 60000,
});
