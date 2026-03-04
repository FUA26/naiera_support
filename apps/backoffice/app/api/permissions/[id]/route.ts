/**
 * Single Permission API Route
 *
 * GET /api/permissions/[id] - Get single permission
 * PUT /api/permissions/[id] - Update permission
 * DELETE /api/permissions/[id] - Delete permission
 */

import { protectApiRoute } from "@/lib/rbac-server/api-protect";
import {
  deletePermission,
  getPermissionById,
  getPermissionUsageCount,
  updatePermission,
} from "@/lib/rbac-server/permission-crud";
import { Permission } from "@/lib/rbac/types";
import { updatePermissionSchema } from "@/lib/validations/permission";
import { NextResponse } from "next/server";

/**
 * GET /api/permissions/[id]
 * Get single permission details
 * Requires: ADMIN_PERMISSIONS_MANAGE permission
 */
export const GET = protectApiRoute({
  permissions: ["ADMIN_PERMISSIONS_MANAGE"] as Permission[],
  handler: async (req, _user, ...args) => {
    const paramsData = args[0] as { params: Promise<{ id: string }> };
    const params = await paramsData.params;

    const permission = await getPermissionById(params.id);

    if (!permission) {
      return NextResponse.json(
        {
          error: "Not Found",
          message: "Permission not found",
        },
        { status: 404 }
      );
    }

    // Get usage count
    const usageCount = await getPermissionUsageCount(params.id);

    return NextResponse.json({
      permission: {
        ...permission,
        usageCount,
      },
    });
  },
});

/**
 * PUT /api/permissions/[id]
 * Update permission
 * Requires: ADMIN_PERMISSIONS_MANAGE permission
 */
export const PUT = protectApiRoute({
  permissions: ["ADMIN_PERMISSIONS_MANAGE"] as Permission[],
  handler: async (req, _user, ...args) => {
    try {
      const paramsData = args[0] as { params: Promise<{ id: string }> };
      const params = await paramsData.params;
      const body = await req.json();

      // Validate input (include ID in validation)
      const validatedData = updatePermissionSchema.parse({
        id: params.id,
        ...body,
      });

      // Update permission
      const { id, ...updateData } = validatedData;
      const permission = await updatePermission(params.id, updateData);

      return NextResponse.json({
        permission,
        message: "Permission updated successfully",
      });
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

      const message = error instanceof Error ? error.message : "";
      // Handle not found
      if (message.includes("not found")) {
        return NextResponse.json(
          {
            error: "Not Found",
            message,
          },
          { status: 404 }
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
      return NextResponse.json(
        {
          error: "Server Error",
          message: message || "Failed to update permission",
        },
        { status: 500 }
      );
    }
  },
});

/**
 * DELETE /api/permissions/[id]
 * Delete permission
 * Requires: ADMIN_PERMISSIONS_MANAGE permission
 */
export const DELETE = protectApiRoute({
  permissions: ["ADMIN_PERMISSIONS_MANAGE"] as Permission[],
  handler: async (req, _user, ...args) => {
    try {
      const paramsData = args[0] as { params: Promise<{ id: string }> };
      const params = await paramsData.params;

      // Delete permission
      const permission = await deletePermission(params.id);

      return NextResponse.json({
        permission,
        message: "Permission deleted successfully",
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "";
      // Handle not found
      if (message.includes("not found")) {
        return NextResponse.json(
          {
            error: "Not Found",
            message,
          },
          { status: 404 }
        );
      }

      // Handle permission in use
      if (message.includes("assigned to")) {
        return NextResponse.json(
          {
            error: "Conflict",
            message,
          },
          { status: 409 }
        );
      }

      // Handle other errors
      return NextResponse.json(
        {
          error: "Server Error",
          message: message || "Failed to delete permission",
        },
        { status: 500 }
      );
    }
  },
});
