/**
 * Role Detail API Route
 *
 * GET /api/roles/[id] - Get single role
 * PUT /api/roles/[id] - Update role
 * DELETE /api/roles/[id] - Delete role
 */

import { prisma } from "@/lib/db/prisma";
import { protectApiRoute } from "@/lib/rbac-server/api-protect";
import { invalidateAllPermissions } from "@/lib/rbac-server/loader";
import { Permission } from "@/lib/rbac/types";
import { updateRoleSchema } from "@/lib/validations/role";
import { NextResponse } from "next/server";

/**
 * GET /api/roles/[id]
 * Get single role details
 * Requires: ADMIN_ROLES_MANAGE permission
 */
export const GET = protectApiRoute({
  permissions: ["ADMIN_ROLES_MANAGE"] as Permission[],
  handler: async (req, { user }, ...args) => {
    const paramsData = args[0] as { params: Promise<{ id: string }> };
    const params = await paramsData.params;
    const role = await prisma.role.findUnique({
      where: { id: params.id },
      include: {
        _count: { select: { users: true } },
        permissions: {
          include: {
            permission: true,
          },
        },
      },
    });

    if (!role) {
      return NextResponse.json({ error: "Role not found" }, { status: 404 });
    }

    // Transform permissions to array of permission names for the form
    const permissions = role.permissions.map((rp) => rp.permission.name);

    return NextResponse.json({
      role: {
        ...role,
        permissions,
      },
    });
  },
});

/**
 * PUT /api/roles/[id]
 * Update role details
 * Requires: ADMIN_ROLES_MANAGE permission
 */
export const PUT = protectApiRoute({
  permissions: ["ADMIN_ROLES_MANAGE"] as Permission[],
  handler: async (req, { user }, ...args) => {
    const paramsData = args[0] as { params: Promise<{ id: string }> };
    const params = await paramsData.params;
    const body = await req.json();

    // Validate input
    const validatedData = updateRoleSchema.parse(body);

    // Check if role exists
    const existingRole = await prisma.role.findUnique({
      where: { id: params.id },
    });

    if (!existingRole) {
      return NextResponse.json({ error: "Role not found" }, { status: 404 });
    }

    // Check if new name conflicts with existing role
    if (validatedData.name && validatedData.name !== existingRole.name) {
      const nameConflict = await prisma.role.findUnique({
        where: { name: validatedData.name },
      });

      if (nameConflict) {
        return NextResponse.json(
          {
            error: "Conflict",
            message: "Role with this name already exists",
          },
          { status: 409 }
        );
      }
    }

    // Prepare update data
    type RoleUpdateData = {
      name?: string;
      permissions?: {
        create: Array<{ permissionId: string }>;
      };
    };
    const updateData: RoleUpdateData = {};

    if (validatedData.name) {
      updateData.name = validatedData.name;
    }

    if (validatedData.permissions) {
      // Get permission IDs for the given permission names
      const permissionRecords = await prisma.permission.findMany({
        where: {
          name: {
            in: validatedData.permissions,
          },
        },
        select: {
          id: true,
        },
      });

      // Delete existing junction records and create new ones
      await prisma.rolePermission.deleteMany({
        where: { roleId: params.id },
      });

      // Create new junction records
      updateData.permissions = {
        create: permissionRecords.map((p) => ({
          permissionId: p.id,
        })),
      };
    }

    // Update role
    const role = await prisma.role.update({
      where: { id: params.id },
      data: updateData,
    });

    // Invalidate all permission caches since role definitions changed
    invalidateAllPermissions();

    return NextResponse.json({ role });
  },
});

/**
 * DELETE /api/roles/[id]
 * Delete role
 * Requires: ADMIN_ROLES_MANAGE permission
 */
export const DELETE = protectApiRoute({
  permissions: ["ADMIN_ROLES_MANAGE"] as Permission[],
  handler: async (req, { user }, ...args) => {
    const paramsData = args[0] as { params: Promise<{ id: string }> };
    const params = await paramsData.params;

    // Check if role exists
    const existingRole = await prisma.role.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: { users: true },
        },
      },
    });

    if (!existingRole) {
      return NextResponse.json({ error: "Role not found" }, { status: 404 });
    }

    // Prevent deleting role with assigned users
    if (existingRole._count.users > 0) {
      return NextResponse.json(
        {
          error: "Conflict",
          message: "Cannot delete role with assigned users. Please reassign users first.",
        },
        { status: 400 }
      );
    }

    // Delete role
    await prisma.role.delete({
      where: { id: params.id },
    });

    // Invalidate all permission caches since role definitions changed
    invalidateAllPermissions();

    return NextResponse.json({ success: true });
  },
});
