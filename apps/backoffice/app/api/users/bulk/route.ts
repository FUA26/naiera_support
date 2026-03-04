/**
 * Bulk User Actions API Route
 *
 * POST /api/users/bulk - Bulk operations on users (delete, change role)
 */

import { prisma } from "@/lib/db/prisma";
import { protectApiRoute } from "@/lib/rbac-server/api-protect";
import { invalidateUserPermissions } from "@/lib/rbac-server/loader";
import { Permission } from "@/lib/rbac/types";
import { bulkUpdateUsersSchema } from "@/lib/validations/user";
import { NextResponse } from "next/server";

/**
 * POST /api/users/bulk
 * Perform bulk operations on users
 * Requires: USER_UPDATE_ANY or USER_DELETE_ANY permission (depending on action)
 */
export const POST = protectApiRoute({
  permissions: ["USER_UPDATE_ANY", "USER_DELETE_ANY"] as Permission[],
  strict: false,
  handler: async (req, { user }) => {
    const body = await req.json();

    // Validate input
    const { userIds, action, roleId } = bulkUpdateUsersSchema.parse(body);

    // Check if trying to delete/change role of yourself
    if (userIds.includes(user.id)) {
      return NextResponse.json(
        {
          error: "Forbidden",
          message: "You cannot perform bulk actions on your own account",
        },
        { status: 403 }
      );
    }

    if (action === "delete") {
      // Check all users exist first
      const existingUsers = await prisma.user.findMany({
        where: { id: { in: userIds } },
        select: { id: true },
      });

      if (existingUsers.length !== userIds.length) {
        return NextResponse.json(
          {
            error: "Not Found",
            message: "One or more users not found",
          },
          { status: 404 }
        );
      }

      // Delete users
      await prisma.user.deleteMany({
        where: { id: { in: userIds } },
      });

      return NextResponse.json({
        success: true,
        deleted: userIds.length,
      });
    } else if (action === "changeRole") {
      if (!roleId) {
        return NextResponse.json(
          {
            error: "Validation Error",
            message: "Role ID is required for changeRole action",
          },
          { status: 400 }
        );
      }

      // Check role exists
      const role = await prisma.role.findUnique({
        where: { id: roleId },
      });

      if (!role) {
        return NextResponse.json({ error: "Role not found" }, { status: 404 });
      }

      // Check all users exist first
      const existingUsers = await prisma.user.findMany({
        where: { id: { in: userIds } },
        select: { id: true },
      });

      if (existingUsers.length !== userIds.length) {
        return NextResponse.json(
          {
            error: "Not Found",
            message: "One or more users not found",
          },
          { status: 404 }
        );
      }

      // Update users' roles
      const result = await prisma.user.updateMany({
        where: { id: { in: userIds } },
        data: { roleId },
      });

      // Invalidate cache for all affected users
      for (const userId of userIds) {
        invalidateUserPermissions(userId);
      }

      return NextResponse.json({
        success: true,
        updated: result.count,
      });
    }

    return NextResponse.json(
      {
        error: "Validation Error",
        message: "Invalid action",
      },
      { status: 400 }
    );
  },
});
