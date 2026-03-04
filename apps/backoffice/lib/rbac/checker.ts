/**
 * RBAC Permission Checker
 *
 * Universal permission checking function that works in:
 * - Browser (client components)
 * - Node.js (server components, API routes)
 * - Edge functions (middleware, edge API routes)
 *
 * This is the core of the RBAC system and is designed to be
 * extractable to a separate npm package for split-repository setups.
 */

import type {
  Permission,
  PermissionCheckOptions,
  PermissionCheckResult,
  UserPermissionsContext,
} from "./types";

/**
 * Permission categories for grouping and validation
 */
const PERMISSION_CATEGORIES = {
  USER: [
    "USER_READ_OWN",
    "USER_READ_ANY",
    "USER_UPDATE_OWN",
    "USER_UPDATE_ANY",
    "USER_DELETE_OWN",
    "USER_DELETE_ANY",
    "USER_CREATE",
  ],
  CONTENT: [
    "CONTENT_READ_OWN",
    "CONTENT_READ_ANY",
    "CONTENT_CREATE",
    "CONTENT_UPDATE_OWN",
    "CONTENT_UPDATE_ANY",
    "CONTENT_DELETE_OWN",
    "CONTENT_DELETE_ANY",
    "CONTENT_PUBLISH",
  ],
  SETTINGS: ["SETTINGS_READ", "SETTINGS_UPDATE"],
  ANALYTICS: ["ANALYTICS_VIEW", "ANALYTICS_EXPORT"],
  ADMIN: [
    "ADMIN_PANEL_ACCESS",
    "ADMIN_USERS_MANAGE",
    "ADMIN_ROLES_MANAGE",
    "ADMIN_PERMISSIONS_MANAGE",
  ],
} as const;

/**
 * Permission pairs for OWN vs ANY relationships
 * Used for automatic permission escalation (e.g., if you have ANY, you also have OWN)
 */
const OWN_ANY_PAIRS: Record<string, string> = {
  USER_READ_OWN: "USER_READ_ANY",
  USER_UPDATE_OWN: "USER_UPDATE_ANY",
  USER_DELETE_OWN: "USER_DELETE_ANY",
  CONTENT_READ_OWN: "CONTENT_READ_ANY",
  CONTENT_UPDATE_OWN: "CONTENT_UPDATE_ANY",
  CONTENT_DELETE_OWN: "CONTENT_DELETE_ANY",
};

/**
 * Check if a user has the required permissions
 *
 * @param context - User's permission context (contains permissions array)
 * @param requiredPermissions - Array of permissions to check
 * @param options - Optional configuration for resource-level checks
 * @returns True if user has required permissions, false otherwise
 *
 * @example
 * ```ts
 * // Basic check (OR logic - any permission is sufficient)
 * hasPermission(userContext, ["USER_READ_ANY"])
 *
 * // Strict check (AND logic - all permissions required)
 * hasPermission(userContext, ["USER_UPDATE_ANY", "CONTENT_DELETE_ANY"], { strict: true })
 *
 * // Resource-level check (OWN vs ANY)
 * hasPermission(userContext, ["USER_UPDATE_OWN"], {
 *   currentUserId: "user-123",
 *   resourceOwnerId: "user-123"
 * })
 * ```
 */
export function hasPermission(
  context: UserPermissionsContext | null | undefined,
  requiredPermissions: Permission[],
  options?: PermissionCheckOptions
): boolean;

/**
 * Extended version that returns detailed check result
 *
 * @param context - User's permission context
 * @param requiredPermissions - Array of permissions to check
 * @param options - Optional configuration
 * @returns Detailed permission check result
 */
export function hasPermission(
  context: UserPermissionsContext | null | undefined,
  requiredPermissions: Permission[],
  options?: PermissionCheckOptions
): PermissionCheckResult;

export function hasPermission(
  context: UserPermissionsContext | null | undefined,
  requiredPermissions: Permission[],
  options: PermissionCheckOptions = {}
): boolean | PermissionCheckResult {
  const { currentUserId, resourceOwnerId, strict = false } = options;

  // Handle missing context
  if (!context || !context.permissions) {
    return _makeResult(false, undefined, "No permission context provided");
  }

  const { permissions } = context;

  // If no permissions required, grant access
  if (requiredPermissions.length === 0) {
    return _makeResult(true, undefined, "No permissions required");
  }

  // Normalize permissions: ANY implies OWN for resource checks
  const normalizedPermissions = _normalizePermissions(permissions);

  // Check each required permission
  const results = requiredPermissions.map((requiredPerm) => {
    // Direct permission check
    if (normalizedPermissions.has(requiredPerm)) {
      return { allowed: true, grantedBy: requiredPerm };
    }

    // Resource-level check for OWN permissions
    if (requiredPerm.endsWith("_OWN") && currentUserId && resourceOwnerId) {
      const anyPermission = OWN_ANY_PAIRS[requiredPerm];

      // If user has ANY permission, they can access any resource
      if (anyPermission && normalizedPermissions.has(anyPermission as Permission)) {
        return { allowed: true, grantedBy: anyPermission as Permission };
      }

      // If user owns the resource and has OWN permission
      if (currentUserId === resourceOwnerId && normalizedPermissions.has(requiredPerm)) {
        return { allowed: true, grantedBy: requiredPerm };
      }
    }

    return { allowed: false, grantedBy: undefined };
  });

  // Apply strict (AND) vs non-strict (OR) logic
  if (strict) {
    // ALL permissions must be granted
    const allAllowed = results.every((r) => r.allowed);
    const grantedBy = allAllowed ? requiredPermissions[0] : undefined;
    const reason = allAllowed ? undefined : "Missing one or more required permissions";

    return _makeResult(allAllowed, grantedBy, reason);
  } else {
    // ANY permission is sufficient
    const anyAllowed = results.some((r) => r.allowed);
    const firstGranted = results.find((r) => r.allowed)?.grantedBy;
    const reason = anyAllowed ? undefined : "Missing required permissions";

    return _makeResult(anyAllowed, firstGranted, reason);
  }
}

/**
 * Check if user can perform action on own resource
 * Shortcut for resource-level checks
 *
 * @param context - User's permission context
 * @param permission - Permission to check (should end with _OWN)
 * @param resourceOwnerId - ID of the resource owner
 * @returns True if user can perform action
 */
export function canAccessOwn(
  context: UserPermissionsContext | null | undefined,
  permission: Permission,
  resourceOwnerId?: string
): boolean {
  if (!context) return false;

  // Get current user ID from context
  const currentUserId = context.userId;

  return hasPermission(context, [permission], {
    currentUserId,
    resourceOwnerId,
  }) as boolean;
}

/**
 * Check if user can perform action on any resource
 * Shortcut for ANY permission checks
 *
 * @param context - User's permission context
 * @param permission - Permission to check (should end with _ANY)
 * @returns True if user can perform action on any resource
 */
export function canAccessAny(
  context: UserPermissionsContext | null | undefined,
  permission: Permission
): boolean {
  if (!context) return false;

  return hasPermission(context, [permission]) as boolean;
}

/**
 * Get all permissions for a specific category
 *
 * @param category - Permission category (USER, CONTENT, SETTINGS, etc.)
 * @returns Array of permissions in the category
 */
export function getPermissionsByCategory(
  category: keyof typeof PERMISSION_CATEGORIES
): Permission[] {
  return [...(PERMISSION_CATEGORIES[category] || [])];
}

/**
 * Check if a permission is scoped to OWN
 *
 * @param permission - Permission to check
 * @returns True if permission is OWN-scoped
 */
export function isOwnPermission(permission: Permission): boolean {
  return permission.endsWith("_OWN");
}

/**
 * Check if a permission is scoped to ANY
 *
 * @param permission - Permission to check
 * @returns True if permission is ANY-scoped
 */
export function isAnyPermission(permission: Permission): boolean {
  return permission.endsWith("_ANY");
}

/**
 * Get the corresponding ANY permission for an OWN permission
 *
 * @param ownPermission - OWN permission
 * @returns Corresponding ANY permission or undefined
 */
export function getAnyPermission(ownPermission: Permission): Permission | undefined {
  return OWN_ANY_PAIRS[ownPermission] as Permission | undefined;
}

/**
 * Validate if a string is a valid permission
 *
 * @param permission - String to validate
 * @returns True if valid permission
 */
export function isValidPermission(permission: string): permission is Permission {
  // Check if it matches the permission format (UPPERCASE_WITH_UNDERSCORES)
  // Since permissions are now dynamic, we just validate the format
  return /^[A-Z_0-9]+$/.test(permission);
}

/**
 * Normalize permissions by adding implied permissions
 * (e.g., if you have ANY, you also get OWN)
 *
 * @param permissions - Array of user's permissions
 * @returns Set of normalized permissions
 */
function _normalizePermissions(permissions: Permission[]): Set<Permission> {
  const normalized = new Set(permissions);

  // Add implied OWN permissions for ANY permissions
  for (const [own, anyPerm] of Object.entries(OWN_ANY_PAIRS)) {
    if (normalized.has(anyPerm as Permission)) {
      normalized.add(own as Permission);
    }
  }

  return normalized;
}

/**
 * Make result object (handles both boolean and detailed result)
 */
function _makeResult(
  allowed: boolean,
  grantedBy?: Permission,
  reason?: string
): PermissionCheckResult {
  return {
    allowed,
    grantedBy,
    reason,
  };
}

/**
 * Type guard to check if value is a valid UserPermissionsContext
 */
export function isUserPermissionsContext(value: unknown): value is UserPermissionsContext {
  if (!value || typeof value !== "object") return false;

  const ctx = value as Record<string, unknown>;
  return (
    typeof ctx.userId === "string" &&
    typeof ctx.roleId === "string" &&
    typeof ctx.roleName === "string" &&
    Array.isArray(ctx.permissions) &&
    typeof ctx.loadedAt === "number"
  );
}
