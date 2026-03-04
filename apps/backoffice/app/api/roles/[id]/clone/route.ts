/**
 * Clone Role API Route
 *
 * POST /api/roles/[id]/clone - Clone an existing role
 */

import { prisma } from "@/lib/db/prisma";
import { protectApiRoute } from "@/lib/rbac-server/api-protect";
import { Permission } from "@/lib/rbac/types";
import { cloneRoleSchema } from "@/lib/validations/role";
import { NextResponse } from "next/server";

/**
 * POST /api/roles/[id]/clone
 * Clone an existing role with a new name
 * Requires: ADMIN_ROLES_MANAGE permission
 */
export const POST = protectApiRoute({
  permissions: ["ADMIN_ROLES_MANAGE"] as Permission[],
  handler: async (req, { user }, ...args) => {
    const paramsData = args[0] as { params: Promise<{ id: string }> };
    const params = await paramsData.params;
    const body = await req.json();

    // Validate input
    const { name } = cloneRoleSchema.parse({ ...body, sourceRoleId: params.id });

    // Check if source role exists and get its permissions
    const sourceRole = await prisma.role.findUnique({
      where: { id: params.id },
      include: {
        permissions: {
          include: {
            permission: true,
          },
        },
      },
    });

    if (!sourceRole) {
      return NextResponse.json({ error: "Source role not found" }, { status: 404 });
    }

    // Check if new role name already exists
    const nameConflict = await prisma.role.findUnique({
      where: { name },
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

    // Clone role with junction records
    const clonedRole = await prisma.role.create({
      data: {
        name,
        permissions: {
          create: sourceRole.permissions.map((rp) => ({
            permissionId: rp.permissionId,
          })),
        },
      },
    });

    return NextResponse.json({ role: clonedRole }, { status: 201 });
  },
});
