/**
 * User Detail API Route
 *
 * GET /api/users/[id] - Get single user
 * PUT /api/users/[id] - Update user
 * DELETE /api/users/[id] - Delete user
 */

import { prisma } from "@/lib/db/prisma";
import { protectApiRoute } from "@/lib/rbac-server/api-protect";
import { invalidateUserPermissions } from "@/lib/rbac-server/loader";
import { Permission } from "@/lib/rbac/types";
import { updateUserSchema } from "@/lib/validations/user";
import { NextResponse } from "next/server";

/**
 * GET /api/users/[id]
 * Get single user details
 * Requires: USER_READ_ANY permission
 */
export const GET = protectApiRoute({
  permissions: ["USER_READ_ANY"] as Permission[],
  handler: async (req, { user }, ...args) => {
    const params = await (args[0] as { params: Promise<{ id: string }> }).params;
    const userId = params.id;

    const userDetail = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        updatedAt: true,
        role: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!userDetail) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user: userDetail });
  },
});

/**
 * PUT /api/users/[id]
 * Update user details
 * Requires: USER_UPDATE_ANY permission
 */
export const PUT = protectApiRoute({
  permissions: ["USER_UPDATE_ANY"] as Permission[],
  handler: async (req, { user }, ...args) => {
    const params = await (args[0] as { params: Promise<{ id: string }> }).params;
    const userId = params.id;
    const body = await req.json();

    // Validate input
    const validatedData = updateUserSchema.parse(body);

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if email is already taken by another user
    if (validatedData.email && validatedData.email !== existingUser.email) {
      const emailTaken = await prisma.user.findUnique({
        where: { email: validatedData.email },
      });

      if (emailTaken) {
        return NextResponse.json(
          {
            error: "Conflict",
            message: "Email already in use",
          },
          { status: 409 }
        );
      }
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(validatedData.name !== undefined && { name: validatedData.name }),
        ...(validatedData.email !== undefined && { email: validatedData.email }),
        ...(validatedData.roleId !== undefined && { roleId: validatedData.roleId }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        updatedAt: true,
        role: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Invalidate permission cache for this user if role changed
    if (validatedData.roleId !== undefined && validatedData.roleId !== existingUser.roleId) {
      invalidateUserPermissions(userId);
    }

    return NextResponse.json({ user: updatedUser });
  },
});

/**
 * DELETE /api/users/[id]
 * Delete user
 * Requires: USER_DELETE_ANY permission
 */
export const DELETE = protectApiRoute({
  permissions: ["USER_DELETE_ANY"] as Permission[],
  handler: async (req, { user }, ...args) => {
    const params = await (args[0] as { params: Promise<{ id: string }> }).params;
    const userId = params.id;

    // Prevent deleting yourself
    if (userId === user.id) {
      return NextResponse.json(
        {
          error: "Forbidden",
          message: "You cannot delete your own account",
        },
        { status: 403 }
      );
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Delete user
    await prisma.user.delete({
      where: { id: userId },
    });

    return NextResponse.json({ success: true });
  },
});
