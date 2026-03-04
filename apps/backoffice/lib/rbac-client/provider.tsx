/**
 * RBAC Permission Provider
 *
 * @pattern Provider Pattern
 * @pattern React Context API
 * @pattern RBAC (Role-Based Access Control)
 *
 * Client-side React Context Provider for permission management.
 * Fetches user permissions from the API and provides them to all
 * child components via React Context.
 *
 * Dependencies:
 * - @/lib/rbac/cache: Client-side caching for permissions
 * - @/lib/rbac/types: TypeScript type definitions
 * - react: Context, hooks for state management
 *
 * Features:
 * - Server-rendering support with initialPermissions
 * - Automatic permission fetching from API
 * - Client-side caching with TTL
 * - Configurable polling for permission updates
 * - Permission checking via can() method
 * - Manual refresh capability
 *
 * Usage:
 * ```tsx
 * // In your root layout or app component
 * import { PermissionProvider } from "@/lib/rbac-client/provider";
 *
 * export default function RootLayout({ children }) {
 *   return (
 *     <PermissionProvider
 *       endpoint="/api/rbac/permissions"
 *       pollingInterval={60000}
 *     >
 *       {children}
 *     </PermissionProvider>
 *   );
 * }
 * ```
 *
 * @see @/lib/rbac-client/hooks.ts for convenience hooks
 * @see @/lib/rbac-server for server-side RBAC implementation
 */

"use client";

import { getClientCache } from "@/lib/rbac/cache";
import type { Permission, UserPermissionsContext } from "@/lib/rbac/types";
import React, { createContext, useContext, useEffect, useRef, useState } from "react";

/**
 * Shape of the context value provided by PermissionProvider
 */
interface PermissionContextValue {
  /** User's permissions including userId, roleName, and permissions array */
  permissions: UserPermissionsContext | null;
  /** True while permissions are being fetched */
  isLoading: boolean;
  /** Error that occurred during permission fetch, if any */
  error: Error | null;
  /** Function to manually refresh permissions from the API */
  refresh: () => Promise<void>;
  /** Function to check if user has any of the given permissions (OR logic) */
  can: (requiredPermissions: Permission[]) => boolean;
}

/**
 * React Context for permission data
 * Undefined outside of PermissionProvider boundaries
 */
const PermissionContext = createContext<PermissionContextValue | undefined>(undefined);

/**
 * Props for the PermissionProvider component
 */
interface PermissionProviderProps {
  /** Child components that will have access to permissions */
  children: React.ReactNode;

  /**
   * Initial permissions from server-side rendering.
   * When provided, prevents initial client fetch.
   * Use this for SSR/SSG to avoid waterfalls.
   */
  initialPermissions?: UserPermissionsContext | null;

  /** API endpoint to fetch permissions from */
  endpoint?: string;

  /** Enable client-side caching of permissions */
  enableCache?: boolean;

  /** Cache time-to-live in milliseconds (default: 5 minutes) */
  cacheTTL?: number;

  /**
   * Polling interval in milliseconds.
   * Set to null to disable polling.
   * Default: 60 seconds.
   *
   * Polling ensures permissions stay up-to-date across browser tabs
   * and when permissions are changed by administrators.
   */
  pollingInterval?: number | null;
}

/**
 * Permission Provider Component
 *
 * Wraps your app to provide permission context to all children.
 * Handles fetching, caching, and updating permissions.
 *
 * @example
 * ```tsx
 * <PermissionProvider pollingInterval={30000}>
 *   <App />
 * </PermissionProvider>
 * ```
 */
export function PermissionProvider({
  children,
  initialPermissions = null,
  endpoint = "/api/rbac/permissions",
  enableCache = true,
  cacheTTL = 5 * 60 * 1000, // 5 minutes
  pollingInterval = 60000, // Default: 60 seconds
}: PermissionProviderProps) {
  // State for permissions data
  const [permissions, setPermissions] = useState<UserPermissionsContext | null>(initialPermissions);
  const [isLoading, setIsLoading] = useState(initialPermissions === null);
  const [error, setError] = useState<Error | null>(null);

  // Store config in ref to avoid stale closures in effects
  const configRef = useRef({ endpoint, enableCache, cacheTTL, pollingInterval });
  configRef.current = { endpoint, enableCache, cacheTTL, pollingInterval };

  // Stable references for functions that shouldn't change on re-renders
  const refreshRef = useRef<(() => Promise<void>) | null>(null);
  const permissionsRef = useRef<UserPermissionsContext | null>(permissions);
  permissionsRef.current = permissions;

  /**
   * Refresh function - fetches permissions from API
   * Created once and stored in ref to maintain referential identity
   */
  if (!refreshRef.current) {
    refreshRef.current = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const { endpoint: currentEndpoint } = configRef.current;
        const response = await fetch(currentEndpoint);

        // Handle unauthorized - clear permissions
        if (!response.ok) {
          if (response.status === 401) {
            setPermissions(null);
            setIsLoading(false);
            return;
          }
          throw new Error(`Failed to fetch permissions: ${response.statusText}`);
        }

        const data: UserPermissionsContext = await response.json();
        setPermissions(data);

        // Cache the permissions for future use
        const { enableCache: currentEnableCache, cacheTTL: currentCacheTTL } = configRef.current;
        if (currentEnableCache && data.userId) {
          const cache = getClientCache();
          cache.set(data.userId, data, currentCacheTTL);
        }
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Unknown error");
        setError(error);
        console.error("Failed to load permissions:", error);
      } finally {
        setIsLoading(false);
      }
    };
  }

  /**
   * Permission checker function
   * Uses OR logic - returns true if user has ANY of the required permissions
   */
  const canRef = useRef<((requiredPermissions: Permission[]) => boolean) | null>(null);
  if (!canRef.current) {
    canRef.current = (requiredPermissions: Permission[]): boolean => {
      const currentPermissions = permissionsRef.current;
      if (!currentPermissions) return false;
      return requiredPermissions.some((p) => currentPermissions.permissions.includes(p));
    };
  }

  /**
   * Effect: Load permissions on mount
   * - Checks cache first
   * - Falls back to API fetch
   * - Sets up polling interval if configured
   */
  useEffect(() => {
    // If we have initial permissions from SSR, skip initial fetch
    if (initialPermissions) {
      return;
    }

    let mounted = true;
    let pollTimer: NodeJS.Timeout | null = null;

    /**
     * Load permissions from cache or API
     */
    async function loadPermissions() {
      // Try to get cached permissions first
      try {
        const sessionResponse = await fetch("/api/auth/session");
        if (sessionResponse.ok) {
          const session = await sessionResponse.json();
          if (session?.user?.id) {
            const cache = getClientCache();
            const cached = cache.get(session.user.id);
            if (cached && mounted) {
              setPermissions(cached);
              setIsLoading(false);
              return;
            }
          }
        }
      } catch {
        // Ignore cache errors, proceed to fetch
      }

      // Fetch from API
      if (mounted && refreshRef.current) {
        await refreshRef.current();
      }
    }

    // Initial load
    loadPermissions();

    // Set up polling interval for periodic updates
    const { pollingInterval: currentPollingInterval } = configRef.current;
    if (currentPollingInterval !== null && currentPollingInterval > 0) {
      console.log(`[PermissionProvider] Setting up polling every ${currentPollingInterval}ms`);

      pollTimer = setInterval(() => {
        if (mounted && refreshRef.current) {
          console.log("[PermissionProvider] Refreshing permissions...");
          refreshRef.current();
        }
      }, currentPollingInterval);
    }

    // Cleanup
    return () => {
      mounted = false;
      if (pollTimer) {
        console.log("[PermissionProvider] Clearing polling interval");
        clearInterval(pollTimer);
      }
    };
  }, []); // Empty deps - run once on mount

  // Memoize context value to prevent unnecessary re-renders
  const value: PermissionContextValue = React.useMemo(
    () => ({
      permissions,
      isLoading,
      error,
      refresh: refreshRef.current!,
      can: canRef.current!,
    }),
    [permissions, isLoading, error]
  );

  return <PermissionContext.Provider value={value}>{children}</PermissionContext.Provider>;
}

/**
 * Hook to access the full permission context
 * Throws an error if used outside of PermissionProvider
 *
 * @returns The complete permission context value
 * @throws {Error} If used outside PermissionProvider
 */
export function usePermissionContext(): PermissionContextValue {
  const context = useContext(PermissionContext);
  if (!context) {
    throw new Error("usePermissionContext must be used within a PermissionProvider");
  }
  return context;
}

/**
 * Hook to get user's permissions
 *
 * @returns User permissions context or null if not loaded
 *
 * @example
 * ```tsx
 * const permissions = usePermissions();
 * console.log(permissions?.roleName); // e.g., "Admin"
 * ```
 */
export function usePermissions(): UserPermissionsContext | null {
  const { permissions } = usePermissionContext();
  return permissions;
}

/**
 * Hook to check if user has any of the specified permissions
 * Uses OR logic - returns true if ANY permission matches
 *
 * @param requiredPermissions - Array of permissions to check
 * @returns True if user has any of the permissions
 *
 * @example
 * ```tsx
 * const canEdit = useCan(["USER_UPDATE_OWN", "USER_UPDATE_ANY"]);
 * ```
 */
export function useCan(requiredPermissions: Permission[]): boolean {
  const { permissions } = usePermissionContext();
  if (!permissions) return false;
  return requiredPermissions.some((p) => permissions.permissions.includes(p));
}

/**
 * Hook to get the user's role name
 *
 * @returns Role name or null if not loaded
 *
 * @example
 * ```tsx
 * const role = useRole();
 * return <div>Logged in as: {role}</div>;
 * ```
 */
export function useRole(): string | null {
  const { permissions } = usePermissionContext();
  return permissions?.roleName ?? null;
}

/**
 * Hook to check if permissions are currently loading
 *
 * @returns True while permissions are being fetched
 *
 * @example
 * ```tsx
 * const isLoading = usePermissionsLoading();
 * if (isLoading) return <Skeleton />;
 * ```
 */
export function usePermissionsLoading(): boolean {
  const { isLoading } = usePermissionContext();
  return isLoading;
}

/**
 * Hook to get any error that occurred during permission fetch
 *
 * @returns Error object or null
 *
 * @example
 * ```tsx
 * const error = usePermissionsError();
 * if (error) return <ErrorMessage>{error.message}</ErrorMessage>;
 * ```
 */
export function usePermissionsError(): Error | null {
  const { error } = usePermissionContext();
  return error;
}

/**
 * Hook to get the refresh function for manually reloading permissions
 *
 * @returns Function that triggers a permission refresh
 *
 * @example
 * ```tsx
 * const refresh = useRefreshPermissions();
 * return <button onClick={refresh}>Refresh Permissions</button>;
 * ```
 */
export function useRefreshPermissions(): () => Promise<void> {
  const { refresh } = usePermissionContext();
  return refresh;
}
