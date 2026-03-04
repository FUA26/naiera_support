/**
 * Change Password API Route
 *
 * POST /api/users/[id]/password - Change user's password
 *
 * Users can only change their own password
 * Admins can change any user's password
 */

import { prisma } from "@/lib/db/prisma";
import { protectApiRoute } from "@/lib/rbac-server/api-protect";
import { Permission } from "@/lib/rbac/types";
import { changePasswordSchema } from "@/lib/validations/user";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

/**
 * POST /api/users/[id]/password
 * Change user password
 * - Users can change their own password (requires current password)
 * - Admins can change any user's password (requires current password)
 * - New password must be different from current
 * - New password and confirmation must match
 */
export const POST = protectApiRoute({
  permissions: [], // No specific permission required - handled by logic below
  handler: async (req, { user, permissions: userPermissions }, ...args) => {
    const paramsData = args[0] as { params: Promise<{ id: string }> };
    const params = await paramsData.params;
    const targetUserId = params.id;

    // Check if user is changing their own password or has admin permission
    const isOwnProfile = user.id === targetUserId;
    const hasAdminPermission = userPermissions.permissions.includes(
      "USER_UPDATE_ANY" as Permission
    );

    if (!isOwnProfile && !hasAdminPermission) {
      return NextResponse.json(
        {
          error: "Forbidden",
          message: "You can only change your own password",
        },
        { status: 403 }
      );
    }

    // Parse and validate request body
    const body = await req.json();
    const validatedData = changePasswordSchema.parse(body);

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: targetUserId },
      select: {
        id: true,
        password: true,
      },
    });

    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // User must have a password set (not OAuth-only account)
    if (!existingUser.password) {
      return NextResponse.json(
        {
          error: "Bad Request",
          message:
            "This account does not have a password set. Please use your OAuth provider to sign in.",
        },
        { status: 400 }
      );
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(
      validatedData.currentPassword,
      existingUser.password
    );

    if (!isCurrentPasswordValid) {
      return NextResponse.json(
        {
          error: "Unauthorized",
          message: "Current password is incorrect",
        },
        { status: 401 }
      );
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(validatedData.newPassword, 10);

    // Update password
    await prisma.user.update({
      where: { id: targetUserId },
      data: {
        password: hashedPassword,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Password changed successfully",
    });
  },
});
