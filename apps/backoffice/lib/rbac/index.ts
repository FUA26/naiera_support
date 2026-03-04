/**
 * RBAC Module Exports
 *
 * Central export point for all RBAC functionality.
 * Import from this file for convenience:
 *
 * import { hasPermission, loadUserPermissions, useCan } from "@/lib/rbac";
 */

// Core types (shared between FE and BE)
export * from "./types";

// Core checker (shared between FE and BE)
export { canAccessAny, canAccessOwn, hasPermission } from "./checker";

// Cache (shared between FE and BE)
export { cacheUtils, getClientCache, getServerCache, permissionCache } from "./cache";

// Server-side only
export {
  forbiddenResponse,
  protectApiRoute,
  protectAuth,
  unauthorizedResponse,
} from "../rbac-server/api-protect";
export {
  invalidateAllPermissions,
  invalidateUserPermissions,
  loadUserPermissions,
} from "../rbac-server/loader";
export * from "../rbac-server/prisma";

// Client-side only
export * from "../rbac-client/hooks";
export {
  PermissionProvider,
  useCan,
  usePermissionContext,
  usePermissions,
  useRole,
} from "../rbac-client/provider";
