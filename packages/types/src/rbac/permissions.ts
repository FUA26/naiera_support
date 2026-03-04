/**
 * RBAC Core Types
 *
 * This file contains all TypeScript definitions for the RBAC system.
 * These types are designed to work in both frontend and backend environments,
 * making them suitable for extraction to a separate npm package.
 */

/**
 * All available permissions in the system.
 * This is a string union type that supports both predefined permissions
 * and dynamic/custom permissions created through the UI.
 */
export type Permission =
  // User Management
  | "USER_READ_OWN"
  | "USER_READ_ANY"
  | "USER_UPDATE_OWN"
  | "USER_UPDATE_ANY"
  | "USER_DELETE_OWN"
  | "USER_DELETE_ANY"
  | "USER_CREATE"
  // Content Management
  | "CONTENT_READ_OWN"
  | "CONTENT_READ_ANY"
  | "CONTENT_CREATE"
  | "CONTENT_UPDATE_OWN"
  | "CONTENT_UPDATE_ANY"
  | "CONTENT_DELETE_OWN"
  | "CONTENT_DELETE_ANY"
  | "CONTENT_PUBLISH"
  // File Management
  | "FILE_UPLOAD_OWN"
  | "FILE_UPLOAD_ANY"
  | "FILE_READ_OWN"
  | "FILE_READ_ANY"
  | "FILE_DELETE_OWN"
  | "FILE_DELETE_ANY"
  | "FILE_MANAGE_ORPHANS"
  | "FILE_ADMIN"
  // Settings
  | "SETTINGS_READ"
  | "SETTINGS_UPDATE"
  // Analytics
  | "ANALYTICS_VIEW"
  | "ANALYTICS_EXPORT"
  // Admin
  | "ADMIN_PANEL_ACCESS"
  | "ADMIN_USERS_MANAGE"
  | "ADMIN_ROLES_MANAGE"
  | "ADMIN_PERMISSIONS_MANAGE"
  | "ADMIN_SYSTEM_SETTINGS_MANAGE"
  // Allow dynamic/custom permissions (any string)
  | string;

/**
 * Definition of a permission with its metadata
 */
export interface PermissionDefinition {
  /** The permission identifier */
  permission: Permission;
  /** Human-readable description */
  description: string;
  /** Resource category (e.g., "USER", "CONTENT", "ADMIN") */
  category: string;
  /** Whether this is an "OWN" scoped permission */
  isOwnScoped: boolean;
  /** Whether this is an "ANY" scoped permission */
  isAnyScoped: boolean;
}

/**
 * Database permission record interface
 * Represents a Permission stored in the database
 */
export interface PermissionRecord {
  id: string;
  name: string;
  category: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Permission record with usage count
 */
export interface PermissionRecordWithUsage extends PermissionRecord {
  _count: {
    rolePermissions: number;
  };
}

/**
 * Permission CRUD input types
 */
export interface CreatePermissionInput {
  name: string;
  category: string;
  description?: string;
}

export interface UpdatePermissionInput {
  name?: string;
  category?: string;
  description?: string;
}

/**
 * Context containing user's permissions and role information
 */
export interface UserPermissionsContext {
  /** User ID */
  userId: string;
  /** Role ID */
  roleId: string;
  /** Role name */
  roleName: string;
  /** List of permissions assigned to the user's role */
  permissions: Permission[];
  /** Timestamp when permissions were loaded */
  loadedAt: number;
}

/**
 * Options for resource-level permission checks
 */
export interface PermissionCheckOptions {
  /** ID of the currently authenticated user */
  currentUserId?: string;
  /** ID of the resource owner (for OWN vs ANY checks) */
  resourceOwnerId?: string;
  /** If true, ALL permissions must be present (AND logic). Default: false (OR logic) */
  strict?: boolean;
}

/**
 * Configuration for protecting React Server Component routes
 */
export interface RouteProtectionConfig {
  /** Required permissions to access the route */
  permissions: Permission[];
  /** Redirect path if unauthorized (default: "/unauthorized") */
  unauthorizedRedirect?: string;
  /** Redirect path if unauthenticated (default: "/login") */
  loginRedirect?: string;
}

/**
 * Configuration for protecting API routes
 */
export interface ApiRouteProtectionConfig {
  /** Required permissions to access the API route */
  permissions: Permission[];
  /** If true, ALL permissions must be present (AND logic). Default: false (OR logic) */
  strict?: boolean;
  /** Custom handler for unauthorized access */
  onUnauthorized?: () => Response;
  /** Custom handler for unauthenticated access */
  onUnauthenticated?: () => Response;
}

/**
 * Result of a permission check
 */
export interface PermissionCheckResult {
  /** Whether the permission check passed */
  allowed: boolean;
  /** The specific permission that granted access (if any) */
  grantedBy?: Permission;
  /** Reason for denial (useful for debugging/UI feedback) */
  reason?: string;
}

/**
 * Role definition with permissions
 */
export interface RoleDefinition {
  id: string;
  name: string;
  permissions: Permission[];
}

/**
 * Cache entry for permission data
 */
export interface PermissionCacheEntry {
  context: UserPermissionsContext;
  expiresAt: number;
}
