/**
 * User Profile API Route
 *
 * GET /api/users/[id]/profile - Get user's own profile
 * PUT /api/users/[id]/profile - Update user's own profile
 *
 * Users can only access/update their own profile
 * Admins can access/update any user's profile
 */

import { prisma } from "@/lib/db/prisma";
import { protectApiRoute } from "@/lib/rbac-server/api-protect";
import { Permission } from "@/lib/rbac/types";
import { updateProfileSchema } from "@/lib/validations/user";
import { NextResponse } from "next/server";

/**
 * GET /api/users/[id]/profile
 * Get user profile
 * - Users can view their own profile
 * - Admins can view any user's profile
 * - Others get 403 Forbidden
 */
export const GET = protectApiRoute({
  permissions: [], // No specific permission required - handled by logic below
  handler: async (req, { user, permissions: userPermissions }, ...args) => {
    const paramsData = args[0] as { params: Promise<{ id: string }> };
    const params = await paramsData.params;
    const targetUserId = params.id;

    // Check if user is accessing their own profile or has admin permission
    const isOwnProfile = user.id === targetUserId;
    const hasAdminPermission = userPermissions.permissions.includes("USER_READ_ANY" as Permission);

    if (!isOwnProfile && !hasAdminPermission) {
      return NextResponse.json(
        {
          error: "Forbidden",
          message: "You can only view your own profile",
        },
        { status: 403 }
      );
    }

    // Fetch user profile
    const userProfile = await prisma.user.findUnique({
      where: { id: targetUserId },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        bio: true,
        emailVerified: true,
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

    if (!userProfile) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ profile: userProfile });
  },
});

/**
 * PUT /api/users/[id]/profile
 * Update user profile
 * - Users can update their own profile (name, email, avatar, bio)
 * - Admins can update any user's profile
 * - Others get 403 Forbidden
 * - Email uniqueness is checked if email is changed
 */
export const PUT = protectApiRoute({
  permissions: [], // No specific permission required - handled by logic below
  handler: async (req, { user, permissions: userPermissions }, ...args) => {
    const paramsData = args[0] as { params: Promise<{ id: string }> };
    const params = await paramsData.params;
    const targetUserId = params.id;

    // Check if user is updating their own profile or has admin permission
    const isOwnProfile = user.id === targetUserId;
    const hasAdminPermission = userPermissions.permissions.includes(
      "USER_UPDATE_ANY" as Permission
    );

    if (!isOwnProfile && !hasAdminPermission) {
      return NextResponse.json(
        {
          error: "Forbidden",
          message: "You can only update your own profile",
        },
        { status: 403 }
      );
    }

    // Parse and validate request body
    const body = await req.json();
    const validatedData = updateProfileSchema.parse(body);

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: targetUserId },
    });

    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if email is being changed and if it's already taken
    if (validatedData.email && validatedData.email !== existingUser.email) {
      const emailTaken = await prisma.user.findUnique({
        where: { email: validatedData.email },
      });

      if (emailTaken) {
        return NextResponse.json(
          {
            error: "Conflict",
            message: "Email is already in use by another account",
          },
          { status: 409 }
        );
      }
    }

    // Update user profile
    const updatedUser = await prisma.user.update({
      where: { id: targetUserId },
      data: {
        ...(validatedData.name !== undefined && { name: validatedData.name }),
        ...(validatedData.email !== undefined && { email: validatedData.email }),
        ...(validatedData.avatarId !== undefined && {
          avatarId: validatedData.avatarId || null,
          avatarUrl: validatedData.avatarUrl || null,
        }),
        ...(validatedData.bio !== undefined && { bio: validatedData.bio }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        bio: true,
        emailVerified: true,
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

    return NextResponse.json({
      profile: updatedUser,
      message: "Profile updated successfully",
    });
  },
});
