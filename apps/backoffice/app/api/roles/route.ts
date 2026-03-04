/**
 * Roles API Route
 *
 * GET /api/roles - List all roles
 * POST /api/roles - Create new role
 */

import { prisma } from "@/lib/db/prisma";
import { protectApiRoute } from "@/lib/rbac-server/api-protect";
import { invalidateAllPermissions } from "@/lib/rbac-server/loader";
import { Permission } from "@/lib/rbac/types";
import { createRoleSchema } from "@/lib/validations/role";
import { NextResponse } from "next/server";

/**
 * GET /api/roles
 * Get all roles with user counts
 * Requires: ADMIN_ROLES_MANAGE permission
 */
export const GET = protectApiRoute({
  permissions: ["ADMIN_ROLES_MANAGE"] as Permission[],
  handler: async () => {
    const roles = await prisma.role.findMany({
      include: {
        _count: {
          select: { users: true },
        },
        permissions: {
          include: {
            permission: true,
          },
        },
      },
      orderBy: { name: "asc" },
    });

    // Transform permissions to array of permission names for each role
    const transformedRoles = roles.map((role) => ({
      ...role,
      permissions: role.permissions.map((rp) => rp.permission.name),
    }));

    return NextResponse.json({ roles: transformedRoles });
  },
});

/**
 * POST /api/roles
 * Create new role
 * Requires: ADMIN_ROLES_MANAGE permission
 */
export const POST = protectApiRoute({
  permissions: ["ADMIN_ROLES_MANAGE"] as Permission[],
  handler: async (req) => {
    const body = await req.json();

    // Validate input
    const { name, description, permissions } = createRoleSchema.parse(body);

    // Check if role name already exists
    const existingRole = await prisma.role.findUnique({
      where: { name },
    });

    if (existingRole) {
      return NextResponse.json(
        {
          error: "Conflict",
          message: "Role with this name already exists",
        },
        { status: 409 }
      );
    }

    // Get permission IDs for the given permission names
    const permissionRecords = await prisma.permission.findMany({
      where: {
        name: {
          in: permissions,
        },
      },
      select: {
        id: true,
      },
    });

    // Create role with junction records
    const role = await prisma.role.create({
      data: {
        name,
        permissions: {
          create: permissionRecords.map((p) => ({
            permissionId: p.id,
          })),
        },
      },
    });

    // Invalidate all permission caches since role definitions changed
    invalidateAllPermissions();

    return NextResponse.json({ role }, { status: 201 });
  },
});
