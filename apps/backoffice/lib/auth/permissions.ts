/**
 * Permission Check Helpers
 *
 * @pattern Authentication/Authorization
 * @pattern RBAC (Role-Based Access Control)
 * @pattern Guard Pattern
 *
 * Server-side helper functions for checking user permissions in API routes.
 * These functions throw errors when permission checks fail, making them
 * suitable for use in route handlers and server actions.
 *
 * Dependencies:
 * - @/lib/auth/config: For session authentication
 * - @/lib/rbac/checker: Core permission checking logic
 * - @/lib/rbac-server/loader: For loading user permissions from database
 *
 * Usage:
 * ```ts
 * import { requireAuth, requirePermission } from "@/lib/auth/permissions";
 *
 * export async function DELETE(req: Request) {
 *   const session = await requireAuth();
 *   await requirePermission(session.user.id, "users.delete");
 *   // ... proceed with deletion
 * }
 * ```
 *
 * @see @/lib/rbac/checker.ts for core permission checking logic
 * @see @/lib/rbac-server/api-protect.ts for declarative API protection
 */

import { auth } from "@/lib/auth/config";
import { hasPermission } from "@/lib/rbac/checker";
import { loadUserPermissions } from "@/lib/rbac-server/loader";

/**
 * Check if a user has a specific permission.
 * Throws an error if permission check fails.
 *
 * Use this when an endpoint requires exactly one permission.
 * For checking multiple permissions with OR logic, use requireAnyPermission.
 *
 * @param userId - The ID of the user to check permissions for
 * @param permission - The permission string to verify (e.g., "users.create")
 * @throws {Error} With message "Forbidden: Missing required permission: {permission}"
 * @returns Promise that resolves if user has permission, rejects otherwise
 *
 * @example
 * ```ts
 * // In an API route
 * export async function POST(req: Request) {
 *   const session = await auth();
 *   await requirePermission(session.user.id, "users.create");
 *   // User has permission - proceed
 * }
 * ```
 */
export async function requirePermission(userId: string, permission: string): Promise<void> {
  // Load user's permissions from database (cached)
  const userPermissions = await loadUserPermissions(userId);

  // Check if user has the required permission
  const allowed = hasPermission(userPermissions, [permission]);

  // Throw error if permission not granted
  if (!allowed) {
    throw new Error(`Forbidden: Missing required permission: ${permission}`);
  }
}

/**
 * Check if a user has ANY of the specified permissions.
 * Throws an error only if NONE of the permissions are granted.
 *
 * Use this when an endpoint can be accessed with multiple different permissions.
 * The check uses OR logic - having at least one permission is sufficient.
 *
 * @param userId - The ID of the user to check permissions for
 * @param permissions - Array of permission strings to check (OR logic)
 * @throws {Error} With message listing all required permissions
 * @returns Promise that resolves if user has any permission, rejects otherwise
 *
 * @example
 * ```ts
 * // User can edit content if they have either permission
 * export async function PUT(req: Request) {
 *   const session = await auth();
 *   await requireAnyPermission(session.user.id, [
 *     "content.edit_own",
 *     "content.edit_any"
 *   ]);
 *   // User has at least one permission - proceed
 * }
 * ```
 */
export async function requireAnyPermission(userId: string, permissions: string[]): Promise<void> {
  // Load user's permissions from database (cached)
  const userPermissions = await loadUserPermissions(userId);

  // Check if user has at least one of the required permissions
  const allowed = hasPermission(userPermissions, permissions, { strict: false });

  // Throw error if no permissions granted
  if (!allowed) {
    throw new Error(`Forbidden: Missing one of required permissions: ${permissions.join(", ")}`);
  }
}

/**
 * Get the current authenticated session.
 * Returns the session with user attached, or throws if not authenticated.
 *
 * This is the first guard function you should call in protected API routes.
 * It ensures the request has a valid authentication session.
 *
 * @returns Auth session with user info including id, email, name, roleId, role, and permissions
 * @throws {Error} With message "Unauthorized: Authentication required"
 *
 * @example
 * ```ts
 * // Standard pattern for protected API routes
 * import { requireAuth, requirePermission } from "@/lib/auth/permissions";
 *
 * export async function GET(req: Request) {
 *   // First, ensure user is authenticated
 *   const session = await requireAuth();
 *
 *   // Then, check specific permission
 *   await requirePermission(session.user.id, "users.read");
 *
 *   // Both auth and permission verified - proceed
 *   const data = await fetchData();
 *   return Response.json(data);
 * }
 * ```
 */
export async function requireAuth() {
  const session = await auth();

  // Ensure session exists and has user data
  if (!session?.user) {
    throw new Error("Unauthorized: Authentication required");
  }

  return session;
}
