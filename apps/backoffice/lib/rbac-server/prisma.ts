/**
 * RBAC Prisma Helpers
 *
 * Database helper functions for role and permission management.
 * Provides a clean API for common RBAC operations.
 */

import { prisma } from "@/lib/db/prisma";
import type { Permission, RoleDefinition } from "@/lib/rbac/types";
import { invalidateAllPermissions, invalidateUserPermissions } from "./loader";

/**
 * Create a new role
 *
 * @param name - Role name (must be unique)
 * @param permissions - Array of permission names to assign
 * @returns Created role
 */
export async function createRole(name: string, permissions: Permission[]) {
  // Get permission IDs for the given permission names
  const permissionRecords = await prisma.permission.findMany({
    where: {
      name: {
        in: permissions as string[],
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

  return role;
}

/**
 * Update an existing role
 *
 * @param roleId - Role ID to update
 * @param data - Update data
 * @returns Updated role
 */
export async function updateRole(
  roleId: string,
  data: {
    name?: string;
    permissions?: Permission[];
  }
) {
  const updateData: { name?: string; permissions?: { create: { permissionId: string }[] } } = {};

  if (data.name) {
    updateData.name = data.name;
  }

  if (data.permissions) {
    // Get permission IDs for the given permission names
    const permissionRecords = await prisma.permission.findMany({
      where: {
        name: {
          in: data.permissions as string[],
        },
      },
      select: {
        id: true,
      },
    });

    // Delete existing junction records and create new ones
    // First, get existing role permissions to delete
    const existingPermissions = await prisma.rolePermission.findMany({
      where: { roleId },
      select: { roleId: true, permissionId: true },
    });

    // Delete existing junction records
    await prisma.rolePermission.deleteMany({
      where: { roleId },
    });

    // Create new junction records
    updateData.permissions = {
      create: permissionRecords.map((p) => ({
        permissionId: p.id,
      })),
    };
  }

  const role = await prisma.role.update({
    where: { id: roleId },
    data: updateData,
  });

  // Invalidate all permission caches since role definitions changed
  invalidateAllPermissions();

  return role;
}

/**
 * Delete a role
 *
 * @param roleId - Role ID to delete
 * @note Will fail if users are assigned to this role
 */
export async function deleteRole(roleId: string) {
  await prisma.role.delete({
    where: { id: roleId },
  });

  // Invalidate all permission caches
  invalidateAllPermissions();
}

/**
 * Get all roles with their permissions
 *
 * @returns Array of all roles
 */
export async function getAllRoles(): Promise<RoleDefinition[]> {
  const roles = await prisma.role.findMany({
    select: {
      id: true,
      name: true,
      permissions: {
        select: {
          permission: {
            select: {
              name: true,
            },
          },
        },
      },
    },
    orderBy: {
      name: "asc",
    },
  });

  return roles.map((role) => ({
    id: role.id,
    name: role.name,
    permissions: role.permissions.map((rp) => rp.permission.name) as Permission[],
  }));
}

/**
 * Get a role by ID
 *
 * @param roleId - Role ID
 * @returns Role or null if not found
 */
export async function getRoleById(roleId: string): Promise<RoleDefinition | null> {
  const role = await prisma.role.findUnique({
    where: { id: roleId },
    select: {
      id: true,
      name: true,
      permissions: {
        select: {
          permission: {
            select: {
              name: true,
            },
          },
        },
      },
    },
  });

  if (!role) return null;

  return {
    id: role.id,
    name: role.name,
    permissions: role.permissions.map((rp) => rp.permission.name) as Permission[],
  };
}

/**
 * Get a role by name
 *
 * @param name - Role name
 * @returns Role or null if not found
 */
export async function getRoleByName(name: string): Promise<RoleDefinition | null> {
  const role = await prisma.role.findUnique({
    where: { name },
    select: {
      id: true,
      name: true,
      permissions: {
        select: {
          permission: {
            select: {
              name: true,
            },
          },
        },
      },
    },
  });

  if (!role) return null;

  return {
    id: role.id,
    name: role.name,
    permissions: role.permissions.map((rp) => rp.permission.name) as Permission[],
  };
}

/**
 * Assign a role to a user
 *
 * @param userId - User ID
 * @param roleId - Role ID to assign
 * @returns Updated user
 */
export async function assignRoleToUser(userId: string, roleId: string) {
  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      roleId,
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  // Invalidate this user's permission cache
  invalidateUserPermissions(userId);

  return user;
}

/**
 * Remove a user's role (assign to empty/default role)
 *
 * @param userId - User ID
 * @note You should create a default role (e.g., "USER") before calling this
 */
export async function removeUserRole(userId: string) {
  // Get default USER role
  const defaultRole = await prisma.role.findUnique({
    where: { name: "USER" },
  });

  if (!defaultRole) {
    throw new Error("Default USER role not found. Please create it first.");
  }

  return assignRoleToUser(userId, defaultRole.id);
}

/**
 * Get all users with a specific role
 *
 * @param roleId - Role ID
 * @returns Array of users with the role
 */
export async function getUsersWithRole(roleId: string) {
  return prisma.user.findMany({
    where: {
      roleId,
    },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
      role: {
        select: {
          name: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

/**
 * Count users with a specific role
 *
 * @param roleId - Role ID
 * @returns Count of users
 */
export async function countUsersWithRole(roleId: string): Promise<number> {
  return prisma.user.count({
    where: {
      roleId,
    },
  });
}

/**
 * Bulk assign role to multiple users
 *
 * @param userIds - Array of user IDs
 * @param roleId - Role ID to assign
 * @returns Count of updated users
 */
export async function bulkAssignRole(userIds: string[], roleId: string) {
  const result = await prisma.user.updateMany({
    where: {
      id: {
        in: userIds,
      },
    },
    data: {
      roleId,
    },
  });

  // Invalidate all affected users' permission caches
  for (const userId of userIds) {
    invalidateUserPermissions(userId);
  }

  return result.count;
}

/**
 * Add permissions to a role
 *
 * @param roleId - Role ID
 * @param permissions - Permissions to add
 * @returns Updated role
 */
export async function addPermissionsToRole(roleId: string, permissions: Permission[]) {
  // Get current role permissions
  const role = await prisma.role.findUnique({
    where: { id: roleId },
    select: {
      permissions: {
        select: {
          permissionId: true,
        },
      },
    },
  });

  if (!role) {
    throw new Error("Role not found");
  }

  const existingPermissionIds = new Set(role.permissions.map((rp) => rp.permissionId));

  // Get permission IDs for the new permissions
  const permissionRecords = await prisma.permission.findMany({
    where: {
      name: {
        in: permissions as string[],
      },
    },
    select: {
      id: true,
    },
  });

  // Create junction records for new permissions only
  const newJunctionRecords = permissionRecords
    .filter((p) => !existingPermissionIds.has(p.id))
    .map((p) => ({
      permissionId: p.id,
    }));

  if (newJunctionRecords.length === 0) {
    // No new permissions to add, just return the role
    return getRoleById(roleId);
  }

  // Create new junction records
  await prisma.role.update({
    where: { id: roleId },
    data: {
      permissions: {
        create: newJunctionRecords,
      },
    },
  });

  // Invalidate all permission caches since role definitions changed
  invalidateAllPermissions();

  return getRoleById(roleId);
}

/**
 * Remove permissions from a role
 *
 * @param roleId - Role ID
 * @param permissions - Permissions to remove
 * @returns Updated role
 */
export async function removePermissionsFromRole(roleId: string, permissions: Permission[]) {
  // Get permission IDs for the permissions to remove
  const permissionRecords = await prisma.permission.findMany({
    where: {
      name: {
        in: permissions as string[],
      },
    },
    select: {
      id: true,
    },
  });

  const permissionIdsToRemove = new Set(permissionRecords.map((p) => p.id));

  // Delete junction records for these permissions
  await prisma.rolePermission.deleteMany({
    where: {
      roleId,
      permissionId: {
        in: Array.from(permissionIdsToRemove),
      },
    },
  });

  // Invalidate all permission caches since role definitions changed
  invalidateAllPermissions();

  return getRoleById(roleId);
}

/**
 * Check if a role has specific permissions
 *
 * @param roleId - Role ID
 * @param permissions - Permissions to check
 * @returns Object mapping permission to boolean
 */
export async function roleHasPermissions(
  roleId: string,
  permissions: Permission[]
): Promise<Record<Permission, boolean>> {
  const role = await prisma.role.findUnique({
    where: { id: roleId },
    select: {
      permissions: {
        select: {
          permission: {
            select: {
              name: true,
            },
          },
        },
      },
    },
  });

  if (!role) {
    throw new Error("Role not found");
  }

  const rolePermissions = new Set(role.permissions.map((rp) => rp.permission.name) as Permission[]);

  return Object.fromEntries(permissions.map((p) => [p, rolePermissions.has(p)])) as Record<
    Permission,
    boolean
  >;
}
