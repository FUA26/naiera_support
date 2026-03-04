/**
 * RBAC Client-Side Hooks
 *
 * Custom React hooks for permission-based UI control.
 * These hooks re-export from the provider for convenience.
 *
 * @example
 * ```tsx
 * import { useCan, useRole, usePermissions } from "@/lib/rbac-client/hooks";
 *
 * function UserActions() {
 *   const canDelete = useCan(["USER_DELETE_ANY"]);
 *   const role = useRole();
 *   const permissions = usePermissions();
 *
 *   return (
 *     <div>
 *       <p>Role: {role}</p>
 *       {canDelete && <button>Delete User</button>}
 *     </div>
 *   );
 * }
 * ```
 */

// Import hook we need directly
import { usePermissionContext } from "./provider";

// Re-export all hooks from provider for convenience
export {
  useCan,
  usePermissions,
  usePermissionsError,
  usePermissionsLoading,
  useRefreshPermissions,
  useRole,
} from "./provider";

// Also export the Provider component itself
export { PermissionProvider } from "./provider";

// Re-export usePermissionContext as well
export { usePermissionContext } from "./provider";

/**
 * Advanced hook: Check if user can access own resource
 *
 * @param permission - Permission to check (should end with _OWN)
 * @param resourceOwnerId - ID of the resource owner
 * @returns True if user can access the resource
 *
 * @example
 * ```tsx
 * function EditButton({ userId, currentUserId }) {
 *   const canEditOwn = useCanAccessOwn("USER_UPDATE_OWN", userId);
 *   const canEditAny = useCan(["USER_UPDATE_ANY"]);
 *
 *   if (canEditAny || canEditOwn) {
 *     return <button>Edit</button>;
 *   }
 *   return null;
 * }
 * ```
 */
export function useCanAccessOwn(permission: string, resourceOwnerId: string): boolean {
  const { permissions } = usePermissionContext();

  if (!permissions) return false;

  // Check if user has the ANY version of the permission
  const anyPermission = permission.replace("_OWN", "_ANY");
  if (permissions.permissions.includes(anyPermission)) {
    return true;
  }

  // Check if user owns the resource and has OWN permission
  return permissions.userId === resourceOwnerId && permissions.permissions.includes(permission);
}

/**
 * Advanced hook: Check multiple permission sets (OR logic between sets)
 *
 * @param permissionSets - Array of permission arrays
 * @returns True if user has ANY of the permission sets
 *
 * @example
 * ```tsx
 * // User can either edit content OR publish content
 * const canEditOrPublish = useCanAnyOf([
 *   ["CONTENT_UPDATE_OWN"],
 *   ["CONTENT_PUBLISH"],
 * ]);
 * ```
 */
export function useCanAnyOf(permissionSets: string[][]): boolean {
  const { permissions } = usePermissionContext();

  if (!permissions) return false;

  return permissionSets.some((set) => set.some((p) => permissions.permissions.includes(p)));
}

/**
 * Advanced hook: Check multiple permission sets (AND logic between sets)
 *
 * @param permissionSets - Array of permission arrays
 * @returns True if user has ALL of the permission sets
 *
 * @example
 * ```tsx
 * // User must be able to read users AND manage roles
 * const canManageUsersAndRoles = useCanAllOf([
 *   ["USER_READ_ANY"],
 *   ["ADMIN_ROLES_MANAGE"],
 * ]);
 * ```
 */
export function useCanAllOf(permissionSets: string[][]): boolean {
  const { permissions } = usePermissionContext();

  if (!permissions) return false;

  return permissionSets.every((set) => set.some((p) => permissions.permissions.includes(p)));
}

/**
 * Hook: Get all permissions in a specific category
 *
 * @param category - Permission category (USER, CONTENT, SETTINGS, etc.)
 * @returns Array of permissions the user has in that category
 *
 * @example
 * ```tsx
 * const userPermissions = usePermissionsInCategory("USER");
 * // Returns: ["USER_READ_OWN", "USER_UPDATE_OWN", ...]
 * ```
 */
export function usePermissionsInCategory(category: string): string[] {
  const { permissions } = usePermissionContext();

  if (!permissions) return [];

  return permissions.permissions.filter((p) => p.startsWith(`${category}_`));
}

/**
 * Hook: Check if user has admin-level permissions
 *
 * @returns True if user has any admin permissions
 *
 * @example
 * ```tsx
 * const isAdmin = useIsAdmin();
 *
 * {isAdmin && <AdminPanel />}
 * ```
 */
export function useIsAdmin(): boolean {
  const { permissions } = usePermissionContext();

  if (!permissions) return false;

  // Check if user has any admin permissions
  return permissions.permissions.some((p) => p.startsWith("ADMIN_"));
}

/**
 * Hook: Check if loading state is active
 *
 * @example
 * ```tsx
 * const isPermissionsLoading = useIsPermissionsLoading();
 *
 * if (isPermissionsLoading) {
 *   return <Skeleton />;
 * }
 * ```
 */
export function useIsPermissionsLoading(): boolean {
  const { isLoading } = usePermissionContext();
  return isLoading;
}
