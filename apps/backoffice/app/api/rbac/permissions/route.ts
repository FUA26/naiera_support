/**
 * RBAC Permissions API Endpoint
 *
 * Returns the current user's permissions and role information.
 * Used by the client-side PermissionProvider to fetch permissions.
 *
 * GET /api/rbac/permissions
 *
 * Response:
 * {
 *   "userId": "user-123",
 *   "roleId": "role-456",
 *   "roleName": "ADMIN",
 *   "permissions": ["USER_READ_ANY", "USER_DELETE_ANY", ...],
 *   "loadedAt": 1234567890
 * }
 */

import { auth } from "@/lib/auth/config";
import { loadUserPermissions } from "@/lib/rbac-server/loader";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Check authentication
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        {
          error: "Unauthorized",
          message: "Authentication required",
        },
        { status: 401 }
      );
    }

    // Load user permissions
    const permissions = await loadUserPermissions(session.user.id);

    return NextResponse.json(permissions);
  } catch (error) {
    console.error("Failed to load permissions:", error);

    return NextResponse.json(
      {
        error: "Internal Server Error",
        message: "Failed to load permissions",
      },
      { status: 500 }
    );
  }
}
