/**
 * Permissions API Route
 *
 * GET /api/permissions - List all permissions
 * POST /api/permissions - Create new permission
 */

import { protectApiRoute } from "@/lib/rbac-server/api-protect";
import {
  createPermission,
  getAllPermissions,
  getPermissionStats,
} from "@/lib/rbac-server/permission-crud";
import type { CreatePermissionInput } from "@/lib/validations/permission";
import { Permission } from "@/lib/rbac/types";
import { createPermissionSchema, permissionQuerySchema } from "@/lib/validations/permission";
import { NextResponse } from "next/server";

/**
 * GET /api/permissions
 * Get all permissions with optional filters
 * Requires: ADMIN_PERMISSIONS_MANAGE permission
 */
export const GET = protectApiRoute({
  permissions: ["ADMIN_PERMISSIONS_MANAGE"] as Permission[],
  handler: async (req) => {
    // Parse query parameters
    const { searchParams } = new URL(req.url);
    const filters = permissionQuerySchema.parse({
      category: searchParams.get("category") || undefined,
      search: searchParams.get("search") || undefined,
      page: searchParams.get("page") || "1",
      limit: searchParams.get("limit") || "20",
      sortBy: searchParams.get("sortBy") || "name",
      sortOrder: searchParams.get("sortOrder") || "asc",
    });

    const includeUsage = searchParams.get("includeUsage") === "true";

    // Get permissions
    const permissions = await getAllPermissions({
      category: filters.category,
      search: filters.search,
      includeUsage,
    });

    // Get stats if requested
    const statsParam = searchParams.get("stats");
    let stats = null;
    if (statsParam === "true") {
      stats = await getPermissionStats();
    }

    return NextResponse.json({
      permissions,
      stats,
      meta: {
        total: permissions.length,
        page: filters.page,
        limit: filters.limit,
      },
    });
  },
});

/**
 * POST /api/permissions
 * Create new permission
 * Requires: ADMIN_PERMISSIONS_MANAGE permission
 */
export const POST = protectApiRoute({
  permissions: ["ADMIN_PERMISSIONS_MANAGE"] as Permission[],
  handler: async (req) => {
    try {
      const body = await req.json();

      // Validate input
      const validatedData = createPermissionSchema.parse(body);

      // Create permission
      const permission = await createPermission({
        name: validatedData.name!,
        category: validatedData.category,
        description: validatedData.description,
      });

      return NextResponse.json(
        {
          permission,
          message: "Permission created successfully",
        },
        { status: 201 }
      );
    } catch (error) {
      // Handle validation errors
      if (error && typeof error === "object" && "name" in error && error.name === "ZodError") {
        return NextResponse.json(
          {
            error: "Validation Error",
            details: "errors" in error ? error.errors : undefined,
          },
          { status: 400 }
        );
      }

      // Handle unique constraint violation
      if (error && typeof error === "object" && "code" in error && error.code === "P2002") {
        return NextResponse.json(
          {
            error: "Conflict",
            message: "Permission with this name already exists",
          },
          { status: 409 }
        );
      }

      // Handle other errors
      const message = error instanceof Error ? error.message : "Failed to create permission";
      return NextResponse.json(
        {
          error: "Server Error",
          message,
        },
        { status: 500 }
      );
    }
  },
});
