/**
 * RBAC Components Exports
 *
 * Central export point for all RBAC UI components.
 *
 * Import from this file for convenience:
 *
 * import { ProtectedRoute, Can, Shield } from "@/components/rbac";
 */

export { AdminRoute, ProtectedRoute, withProtection } from "./ProtectedRoute";
export type { ProtectedRouteProps } from "./ProtectedRoute";

export { Can, CanAccessOwn, Cannot, Match } from "./Can";
export type { CanProps } from "./Can";

export { PermissionBadge, RoleBadge, Shield, ShieldButton } from "./Shield";
export type { ShieldProps } from "./Shield";
