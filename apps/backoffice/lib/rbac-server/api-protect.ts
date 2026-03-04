/**
 * RBAC API Route Protection Wrapper
 *
 * Higher-order function wrapper for protecting API routes with RBAC.
 * Provides automatic authentication and authorization checks.
 *
 * @example
 * ```ts
 * export const GET = protectApiRoute({
 *   permissions: ["USER_READ_ANY"],
 *   handler: async (req, context) => {
 *     const users = await prisma.user.findMany();
 *     return NextResponse.json({ users });
 *   },
 * });
 * ```
 */

import { auth } from "@/lib/auth/config";
import { hasPermission } from "@/lib/rbac/checker";
import type {
  ApiRouteProtectionConfig,
  Permission,
  PermissionCheckResult,
  UserPermissionsContext,
} from "@/lib/rbac/types";
import { NextResponse } from "next/server";
import { loadUserPermissions } from "./loader";

type ApiHandler = (
  request: Request,
  context: {
    user: { id: string; email?: string | null; name?: string | null };
    permissions: UserPermissionsContext;
  },
  ...args: unknown[]
) => Promise<Response> | Response;

interface ProtectApiRouteOptions extends ApiRouteProtectionConfig {
  handler: ApiHandler;
}

/**
 * Wrap an API route handler with authentication and authorization checks
 *
 * @param options - Protection configuration and handler function
 * @returns Protected API route handler
 */
export function protectApiRoute(options: ProtectApiRouteOptions) {
  return async (request: Request, ...args: unknown[]): Promise<Response> => {
    const { permissions, strict = false, handler, onUnauthorized, onUnauthenticated } = options;

    // Check authentication
    const session = await auth();

    if (!session?.user) {
      if (onUnauthenticated) {
        return onUnauthenticated();
      }

      return NextResponse.json(
        {
          error: "Unauthorized",
          message: "Authentication required",
        },
        { status: 401 }
      );
    }

    // Load user permissions
    const userPermissions = await loadUserPermissions(session.user.id);

    // Check authorization
    const permissionCheck = hasPermission(userPermissions, permissions, { strict });

    // Handle both boolean and PermissionCheckResult return types
    const isAllowed =
      typeof permissionCheck === "boolean"
        ? permissionCheck
        : (permissionCheck as PermissionCheckResult).allowed;

    if (!isAllowed) {
      if (onUnauthorized) {
        return onUnauthorized();
      }

      const reason =
        typeof permissionCheck === "boolean"
          ? undefined
          : (permissionCheck as PermissionCheckResult).reason;

      return NextResponse.json(
        {
          error: "Forbidden",
          message: "Insufficient permissions",
          requiredPermissions: permissions,
          reason,
        },
        { status: 403 }
      );
    }

    // Call the actual handler
    try {
      return await handler(
        request,
        {
          user: session.user,
          permissions: userPermissions,
        },
        ...args
      );
    } catch (error) {
      console.error("API route error:", error);

      return NextResponse.json(
        {
          error: "Internal Server Error",
          message: "An error occurred while processing your request",
        },
        { status: 500 }
      );
    }
  };
}

/**
 * Simplified wrapper for routes that only require authentication
 *
 * @param handler - API route handler
 * @returns Protected API route handler (authentication only)
 *
 * @example
 * ```ts
 * export const GET = protectAuth(async (req, { user }) => {
 *   return NextResponse.json({ user });
 * });
 * ```
 */
export function protectAuth(
  handler: (
    request: Request,
    context: {
      user: { id: string; email?: string | null; name?: string | null };
    }
  ) => Promise<Response> | Response
) {
  return protectApiRoute({
    permissions: [],
    handler,
  });
}

/**
 * Create a standard unauthorized response
 */
export function unauthorizedResponse(message?: string): Response {
  return NextResponse.json(
    {
      error: "Unauthorized",
      message: message || "Authentication required",
    },
    { status: 401 }
  );
}

/**
 * Create a standard forbidden response
 */
export function forbiddenResponse(requiredPermissions?: Permission[], message?: string): Response {
  return NextResponse.json(
    {
      error: "Forbidden",
      message: message || "Insufficient permissions",
      requiredPermissions,
    },
    { status: 403 }
  );
}

/**
 * Type helper for extracting request context from protected routes
 */
export type ProtectedRequestContext = {
  user: { id: string; email: string | null; name: string | null };
  permissions: UserPermissionsContext;
};
