/**
 * RBAC Server-Side Permission Loader
 *
 * Server-only functions for loading user permissions from the database.
 * This module depends on Prisma and is NOT suitable for client-side use.
 */

import { prisma } from "@/lib/db/prisma";
import { getServerCache } from "@/lib/rbac/cache";
import type { Permission, UserPermissionsContext } from "@/lib/rbac/types";

/**
 * Cache TTL for server-side permission cache (5 minutes)
 */
const CACHE_TTL = 5 * 60 * 1000;

/**
 * Load a user's permissions from the database with caching
 *
 * @param userId - User ID to load permissions for
 * @param forceRefresh - If true, bypass cache and reload from database
 * @returns User's permission context
 *
 * @example
 * ```ts
 * const permissions = await loadUserPermissions("user-123");
 * if (hasPermission(permissions, ["USER_READ_ANY"])) {
 *   // Allow access
 * }
 * ```
 */
export async function loadUserPermissions(
  userId: string,
  forceRefresh: boolean = false
): Promise<UserPermissionsContext> {
  const cache = getServerCache();

  // Try to get from cache first
  if (!forceRefresh) {
    const cached = cache.get(userId);
    if (cached) {
      return cached;
    }
  }

  // Load from database
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      roleId: true,
      role: {
        select: {
          id: true,
          name: true,
          permissions: {
            select: {
              permission: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!user || !user.role) {
    // Return empty permissions if user or role not found
    return createEmptyContext(userId);
  }

  // Extract permission names from junction table
  const permissions = user.role.permissions.map((rp) => rp.permission.name) as Permission[];

  const context: UserPermissionsContext = {
    userId: user.id,
    roleId: user.role.id,
    roleName: user.role.name,
    permissions,
    loadedAt: Date.now(),
  };

  // Cache the result
  cache.set(userId, context, CACHE_TTL);

  return context;
}

/**
 * Load multiple users' permissions efficiently
 *
 * @param userIds - Array of user IDs to load permissions for
 * @returns Map of user ID to permission context
 */
export async function loadMultipleUserPermissions(
  userIds: string[]
): Promise<Map<string, UserPermissionsContext>> {
  const cache = getServerCache();
  const result = new Map<string, UserPermissionsContext>();
  const uncachedIds: string[] = [];

  // Try cache first
  for (const userId of userIds) {
    const cached = cache.get(userId);
    if (cached) {
      result.set(userId, cached);
    } else {
      uncachedIds.push(userId);
    }
  }

  // Load uncached users from database
  if (uncachedIds.length > 0) {
    const users = await prisma.user.findMany({
      where: {
        id: { in: uncachedIds },
      },
      select: {
        id: true,
        roleId: true,
        role: {
          select: {
            id: true,
            name: true,
            permissions: {
              select: {
                permission: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    for (const user of users) {
      if (user.role) {
        // Extract permission names from junction table
        const permissions = user.role.permissions.map((rp) => rp.permission.name) as Permission[];

        const context: UserPermissionsContext = {
          userId: user.id,
          roleId: user.role.id,
          roleName: user.role.name,
          permissions,
          loadedAt: Date.now(),
        };

        result.set(user.id, context);
        cache.set(user.id, context, CACHE_TTL);
      } else {
        result.set(user.id, createEmptyContext(user.id));
      }
    }
  }

  return result;
}

/**
 * Invalidate permission cache for a specific user
 * Call this after changing a user's role
 *
 * @param userId - User ID to invalidate cache for
 */
export function invalidateUserPermissions(userId: string): void {
  const cache = getServerCache();
  cache.invalidate(userId);
}

/**
 * Invalidate permission cache for all users
 * Call this after changing role definitions
 */
export function invalidateAllPermissions(): void {
  const cache = getServerCache();
  cache.clear();
}

/**
 * Check if a user has a specific role
 *
 * @param userId - User ID to check
 * @param roleName - Role name to check
 * @returns True if user has the specified role
 */
export async function hasRole(userId: string, roleName: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      role: {
        select: {
          name: true,
        },
      },
    },
  });

  return user?.role?.name === roleName;
}

/**
 * Get a user's role name
 *
 * @param userId - User ID to get role for
 * @returns Role name or null if not found
 */
export async function getUserRole(userId: string): Promise<string | null> {
  const permissions = await loadUserPermissions(userId);
  return permissions.roleName;
}

/**
 * Get all users with a specific role
 *
 * @param roleName - Role name to search for
 * @returns Array of users with the specified role
 */
export async function getUsersByRole(roleName: string) {
  return prisma.user.findMany({
    where: {
      role: {
        name: roleName,
      },
    },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
    },
  });
}

/**
 * Create an empty permission context (for users without roles)
 */
function createEmptyContext(userId: string): UserPermissionsContext {
  return {
    userId,
    roleId: "",
    roleName: "",
    permissions: [],
    loadedAt: Date.now(),
  };
}
