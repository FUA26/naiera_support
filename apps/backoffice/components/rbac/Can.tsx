"use client";

/**
 * Can Component
 *
 * Client component for conditional rendering based on permissions.
 * Only renders children if the current user has the required permissions.
 *
 * @example
 * ```tsx
 * import { Can } from "@/components/rbac/Can";
 *
 * function UserActions() {
 *   return (
 *     <>
 *       <Can permissions={["USER_UPDATE_ANY"]}>
 *         <button>Edit User</button>
 *       </Can>
 *
 *       <Can permissions={["USER_DELETE_ANY"]}>
 *         <button>Delete User</button>
 *       </Can>
 *
 *       <Can permissions={["USER_CREATE"]} fallback={<p>Cannot create users</p>}>
 *         <button>Create User</button>
 *       </Can>
 *     </>
 *   );
 * }
 * ```
 */

import { usePermissionContext } from "@/lib/rbac-client/provider";
import type { Permission } from "@/lib/rbac/types";
import React, { useMemo } from "react";

interface CanProps {
  children: React.ReactNode;
  /** Required permissions to render children */
  permissions: Permission[];
  /** If true, ALL permissions must be present (AND logic) */
  strict?: boolean;
  /** Fallback to render if user lacks permissions */
  fallback?: React.ReactNode;
  /** Loading state to show while permissions are loading */
  loading?: React.ReactNode;
  /** Whether to show loading state (default: true) */
  showLoading?: boolean;
}

/**
 * Conditional rendering component based on user permissions
 */
export function Can({
  children,
  permissions,
  strict = false,
  fallback = null,
  loading = null,
  showLoading = true,
}: CanProps) {
  const { permissions: userPermissions, isLoading } = usePermissionContext();

  const hasAccess = useMemo(() => {
    if (!userPermissions) return false;

    if (strict) {
      // ALL permissions must be present
      return permissions.every((p) => userPermissions.permissions.includes(p));
    } else {
      // ANY permission is sufficient
      return permissions.some((p) => userPermissions.permissions.includes(p));
    }
  }, [userPermissions, permissions, strict]);

  // Show loading state while permissions are being fetched
  if (isLoading && showLoading) {
    return <>{loading}</>;
  }

  // Render children if user has access, otherwise render fallback
  return <>{hasAccess ? children : fallback}</>;
}

/**
 * CanAccessOwn component for resource-level permission checks
 * Only renders children if user can access their own resource
 *
 * @example
 * ```tsx
 * <CanAccessOwn
 *   permission="USER_UPDATE_OWN"
 *   resourceOwnerId={user.id}
 * >
 *   <button>Edit Your Profile</button>
 * </CanAccessOwn>
 * ```
 */
export function CanAccessOwn({
  children,
  permission,
  resourceOwnerId,
  fallback = null,
}: {
  children: React.ReactNode;
  permission: Permission;
  resourceOwnerId: string;
  fallback?: React.ReactNode;
}) {
  const { permissions } = usePermissionContext();

  if (!permissions) return <>{fallback}</>;

  // Check if user has the ANY version of the permission
  const anyPermission = permission.replace("_OWN", "_ANY") as Permission;
  const hasAnyPermission = permissions.permissions.includes(anyPermission);

  // Check if user owns the resource and has OWN permission
  const isOwner = permissions.userId === resourceOwnerId;
  const hasOwnPermission = permissions.permissions.includes(permission);

  if (hasAnyPermission || (isOwner && hasOwnPermission)) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
}

/**
 * Cannot component - inverse of Can
 * Only renders children if user LACKS the required permissions
 *
 * @example
 * ```tsx
 * <Cannot permissions={["USER_DELETE_ANY"]}>
 *   <p>You don't have permission to delete users</p>
 * </Cannot>
 * ```
 */
export function Cannot({
  children,
  permissions,
  strict = false,
}: {
  children: React.ReactNode;
  permissions: Permission[];
  strict?: boolean;
}) {
  const { permissions: userPermissions } = usePermissionContext();

  const hasAccess = useMemo(() => {
    if (!userPermissions) return false;

    if (strict) {
      return permissions.every((p) => userPermissions.permissions.includes(p));
    } else {
      return permissions.some((p) => userPermissions.permissions.includes(p));
    }
  }, [userPermissions, permissions, strict]);

  // Render children only if user does NOT have access
  return <>{!hasAccess ? children : null}</>;
}

/**
 * Match component - renders different content based on permissions
 *
 * @example
 * ```tsx
 * <Match
 *   permissions={["USER_DELETE_ANY"]}
 *   onMatch={<button>Delete</button>}
 *   onNoMatch={<button disabled>Need Admin Access</button>}
 * />
 * ```
 */
export function Match({
  permissions,
  strict = false,
  onMatch,
  onNoMatch = null,
  loading = null,
}: {
  permissions: Permission[];
  strict?: boolean;
  onMatch: React.ReactNode;
  onNoMatch?: React.ReactNode;
  loading?: React.ReactNode;
}) {
  const { permissions: userPermissions, isLoading } = usePermissionContext();

  const hasAccess = useMemo(() => {
    if (!userPermissions) return false;

    if (strict) {
      return permissions.every((p) => userPermissions.permissions.includes(p));
    } else {
      return permissions.some((p) => userPermissions.permissions.includes(p));
    }
  }, [userPermissions, permissions, strict]);

  if (isLoading) return <>{loading}</>;
  return <>{hasAccess ? onMatch : onNoMatch}</>;
}

export type { CanProps };
