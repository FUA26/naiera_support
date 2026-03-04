/**
 * ProtectedRoute Component
 *
 * Server component that wraps pages and routes with permission checks.
 * Redirects to unauthorized page if user lacks required permissions.
 *
 * @example
 * ```tsx
 * import { ProtectedRoute } from "@/components/rbac/ProtectedRoute";
 *
 * export default function AdminPage() {
 *   return (
 *     <ProtectedRoute permissions={["ADMIN_PANEL_ACCESS"]}>
 *       <AdminDashboard />
 *     </ProtectedRoute>
 *   );
 * }
 * ```
 */

import { auth } from "@/lib/auth/config";
import { loadUserPermissions } from "@/lib/rbac-server/loader";
import { hasPermission } from "@/lib/rbac/checker";
import type { Permission } from "@/lib/rbac/types";
import { redirect } from "next/navigation";
import React from "react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  /** Required permissions to access this route */
  permissions: Permission[];
  /** Redirect path if unauthorized (default: "/unauthorized") */
  unauthorizedRedirect?: string;
  /** Redirect path if unauthenticated (default: "/login") */
  loginRedirect?: string;
  /** If true, ALL permissions must be present (AND logic) */
  strict?: boolean;
  /** Fallback component to show if unauthorized (instead of redirect) */
  fallback?: React.ReactNode;
}

/**
 * Server component wrapper for protecting pages with RBAC
 */
export async function ProtectedRoute({
  children,
  permissions,
  unauthorizedRedirect = "/unauthorized",
  loginRedirect = "/login",
  strict = false,
  fallback,
}: ProtectedRouteProps) {
  // Check authentication
  const session = await auth();

  if (!session?.user) {
    redirect(loginRedirect);
  }

  // Load user permissions
  const userPermissions = await loadUserPermissions(session.user.id);

  // Check authorization
  const permissionCheck = hasPermission(userPermissions, permissions, { strict });

  // Handle both boolean and PermissionCheckResult return types
  const hasAccess =
    typeof permissionCheck === "boolean"
      ? permissionCheck
      : (permissionCheck as { allowed: boolean }).allowed;

  if (!hasAccess) {
    if (fallback) {
      return <>{fallback}</>;
    }

    redirect(unauthorizedRedirect);
  }

  // User has required permissions, render children
  return <>{children}</>;
}

/**
 * HOC for protecting pages with RBAC
 * Alternative to using the component directly
 *
 * @example
 * ```tsx
 * import { withProtection } from "@/components/rbac/ProtectedRoute";
 *
 * function AdminDashboard() {
 *   return <div>Admin content</div>;
 * }
 *
 * export default withProtection(AdminDashboard, {
 *   permissions: ["ADMIN_PANEL_ACCESS"],
 * });
 * ```
 */
export function withProtection<P extends object>(
  Component: React.ComponentType<P>,
  options: Omit<ProtectedRouteProps, "children">
) {
  return async function ProtectedComponent(props: P) {
    return (
      <ProtectedRoute {...options}>
        <Component {...props} />
      </ProtectedRoute>
    );
  };
}

/**
 * Wrapper for protecting admin-only routes
 *
 * @example
 * ```tsx
 * import { AdminRoute } from "@/components/rbac/ProtectedRoute";
 *
 * export default function AdminPage() {
 *   return (
 *     <AdminRoute>
 *       <AdminContent />
 *     </AdminRoute>
 *   );
 * }
 * ```
 */
export async function AdminRoute({
  children,
  unauthorizedRedirect = "/unauthorized",
}: {
  children: React.ReactNode;
  unauthorizedRedirect?: string;
}) {
  return (
    <ProtectedRoute
      permissions={["ADMIN_PANEL_ACCESS"]}
      unauthorizedRedirect={unauthorizedRedirect}
    >
      {children}
    </ProtectedRoute>
  );
}

/**
 * Type alias for convenience
 */
export type { ProtectedRouteProps };
