/**
 * RBAC Permission Cache
 *
 * In-memory caching layer for permission data to reduce database queries.
 * Works in both browser and Node.js environments.
 *
 * Designed for extraction to a separate npm package.
 */

import type { PermissionCacheEntry, UserPermissionsContext } from "./types";

/**
 * Default cache TTL: 5 minutes (in milliseconds)
 */
const DEFAULT_CACHE_TTL = 5 * 60 * 1000;

/**
 * Permission cache class for managing in-memory permission data
 */
class PermissionCache {
  private cache: Map<string, PermissionCacheEntry> = new Map();
  private isServer: boolean;

  constructor() {
    // Detect if we're in a server environment
    this.isServer = typeof window === "undefined";
  }

  /**
   * Get cached permissions for a user
   * @param userId - User ID to look up
   * @returns Cached permission context or null if not found/expired
   */
  get(userId: string): UserPermissionsContext | null {
    const entry = this.cache.get(userId);

    if (!entry) {
      return null;
    }

    // Check if cache entry has expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(userId);
      return null;
    }

    return entry.context;
  }

  /**
   * Set cached permissions for a user
   * @param userId - User ID to cache
   * @param context - Permission context to cache
   * @param ttl - Time-to-live in milliseconds (default: 5 minutes)
   */
  set(userId: string, context: UserPermissionsContext, ttl: number = DEFAULT_CACHE_TTL): void {
    const entry: PermissionCacheEntry = {
      context,
      expiresAt: Date.now() + ttl,
    };

    this.cache.set(userId, entry);
  }

  /**
   * Invalidate cache for a specific user
   * @param userId - User ID to invalidate
   */
  invalidate(userId: string): void {
    this.cache.delete(userId);
  }

  /**
   * Clear all cached permissions
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get cache size (useful for monitoring)
   */
  get size(): number {
    return this.cache.size;
  }

  /**
   * Clean up expired entries (useful for maintenance)
   */
  cleanup(): number {
    const now = Date.now();
    let removedCount = 0;

    for (const [userId, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(userId);
        removedCount++;
      }
    }

    return removedCount;
  }
}

/**
 * Server-side singleton cache instance
 * In Node.js, we use a singleton pattern to share cache across requests
 */
let serverCacheInstance: PermissionCache | null = null;

/**
 * Get the server-side cache singleton
 */
export function getServerCache(): PermissionCache {
  if (!serverCacheInstance) {
    serverCacheInstance = new PermissionCache();
  }
  return serverCacheInstance;
}

/**
 * Client-side singleton cache instance
 * In the browser, we use a singleton pattern to share cache across components
 */
let clientCacheInstance: PermissionCache | null = null;

/**
 * Get a client-side cache singleton
 * Returns a shared instance across all components to prevent cache misses
 */
export function getClientCache(): PermissionCache {
  if (!clientCacheInstance) {
    clientCacheInstance = new PermissionCache();
  }
  return clientCacheInstance;
}

/**
 * Default cache export
 * Returns singleton on server, new instance on client
 */
export const permissionCache = typeof window === "undefined" ? getServerCache() : getClientCache();

/**
 * Cache utilities
 */
export const cacheUtils = {
  /**
   * Generate cache key from user ID
   */
  key: (userId: string): string => `permissions:${userId}`,

  /**
   * Parse cache key to extract user ID
   */
  parseKey: (key: string): string => key.replace("permissions:", ""),

  /**
   * Check if a cache entry is still valid
   */
  isValid: (entry: PermissionCacheEntry): boolean => {
    return Date.now() <= entry.expiresAt;
  },

  /**
   * Calculate expiry timestamp
   */
  calculateExpiry: (ttl: number = DEFAULT_CACHE_TTL): number => {
    return Date.now() + ttl;
  },
};
