import { prisma } from "@/lib/db/prisma";
import { protectApiRoute } from "@/lib/rbac-server/api-protect";
import { NextResponse } from "next/server";

interface SearchResult {
  users: Array<{ id: string; name: string | null; email: string; avatarId: string | null }>;
  roles: Array<{ id: string; name: string; _count: { permissions: number } }>;
  permissions: Array<{ id: string; name: string; category: string | null }>;
}

export const GET = protectApiRoute({
  permissions: [], // Empty array - we filter results based on permissions
  handler: async (req, { user, permissions }) => {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q")?.trim() ?? "";

    if (!query || query.length < 2) {
      return NextResponse.json<SearchResult>({
        users: [],
        roles: [],
        permissions: [],
      });
    }

    const results: SearchResult = {
      users: [],
      roles: [],
      permissions: [],
    };

    // Check permissions for each entity type
    const canReadUsers = permissions.permissions?.includes("USER_READ_ANY") ?? false;
    const canManageRoles = permissions.permissions?.includes("ADMIN_ROLES_MANAGE") ?? false;
    const canManagePermissions =
      permissions.permissions?.includes("ADMIN_PERMISSIONS_MANAGE") ?? false;

    // Search users
    if (canReadUsers) {
      results.users = await prisma.user.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { email: { contains: query, mode: "insensitive" } },
          ],
        },
        select: {
          id: true,
          name: true,
          email: true,
          avatarId: true,
        },
        take: 5,
      });
    }

    // Search roles
    if (canManageRoles) {
      results.roles = await prisma.role.findMany({
        where: {
          name: { contains: query, mode: "insensitive" },
        },
        select: {
          id: true,
          name: true,
          _count: {
            select: { permissions: true },
          },
        },
        take: 5,
      });
    }

    // Search permissions
    if (canManagePermissions) {
      results.permissions = await prisma.permission.findMany({
        where: {
          name: { contains: query, mode: "insensitive" },
        },
        select: {
          id: true,
          name: true,
          category: true,
        },
        take: 5,
      });
    }

    return NextResponse.json(results);
  },
});
