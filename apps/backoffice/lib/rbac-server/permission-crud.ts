/**
 * Permission CRUD Helper Functions
 *
 * Server-side helper functions for permission management operations.
 * These functions provide a clean API for common permission CRUD operations.
 */

import { prisma } from "@/lib/db/prisma";
import type {
  CreatePermissionInput,
  PermissionRecord,
  PermissionRecordWithUsage,
  UpdatePermissionInput,
} from "@/lib/rbac/types";
import { Prisma } from "@prisma/client";
import { invalidateAllPermissions } from "./loader";

/**
 * Get all permissions with optional filters
 *
 * @param filters - Optional filters (category, search)
 * @returns Array of permissions
 */
export async function getAllPermissions(filters?: {
  category?: string;
  search?: string;
  includeUsage?: boolean;
}): Promise<PermissionRecord[] | PermissionRecordWithUsage[]> {
  const where: {
    category?: string;
    OR?: Array<{
      name?: { contains: string; mode: string };
      description?: { contains: string; mode: string };
    }>;
  } = {};

  if (filters?.category) {
    where.category = filters.category;
  }

  if (filters?.search) {
    where.OR = [
      { name: { contains: filters.search, mode: "insensitive" } },
      { description: { contains: filters.search, mode: "insensitive" } },
    ];
  }

  const include = filters?.includeUsage
    ? {
        _count: {
          select: { rolePermissions: true },
        },
      }
    : {};

  const permissions = await prisma.permission.findMany({
    where: where as Prisma.PermissionWhereInput,
    include,
    orderBy: [{ category: "asc" }, { name: "asc" }],
  });

  return permissions as PermissionRecord[] | PermissionRecordWithUsage[];
}

/**
 * Get a single permission by ID
 *
 * @param id - Permission ID
 * @returns Permission or null if not found
 */
export async function getPermissionById(id: string): Promise<PermissionRecord | null> {
  const permission = await prisma.permission.findUnique({
    where: { id },
  });

  return permission;
}

/**
 * Get a permission by name
 *
 * @param name - Permission name
 * @returns Permission or null if not found
 */
export async function getPermissionByName(name: string): Promise<PermissionRecord | null> {
  const permission = await prisma.permission.findUnique({
    where: { name },
  });

  return permission;
}

/**
 * Create a new permission
 *
 * @param data - Permission creation data
 * @returns Created permission
 */
export async function createPermission(data: CreatePermissionInput): Promise<PermissionRecord> {
  // Check if permission with this name already exists
  const existing = await prisma.permission.findUnique({
    where: { name: data.name },
  });

  if (existing) {
    throw new Error(`Permission with name "${data.name}" already exists`);
  }

  const permission = await prisma.permission.create({
    data: {
      name: data.name,
      category: data.category,
      description: data.description || null,
    },
  });

  // Invalidate all permission caches since permission definitions changed
  invalidateAllPermissions();

  return permission;
}

/**
 * Update an existing permission
 *
 * @param id - Permission ID
 * @param data - Permission update data
 * @returns Updated permission
 */
export async function updatePermission(
  id: string,
  data: UpdatePermissionInput
): Promise<PermissionRecord> {
  // Check if permission exists
  const existing = await prisma.permission.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new Error(`Permission with ID "${id}" not found`);
  }

  // If updating name, check for conflicts
  if (data.name && data.name !== existing.name) {
    const nameConflict = await prisma.permission.findUnique({
      where: { name: data.name },
    });

    if (nameConflict) {
      throw new Error(`Permission with name "${data.name}" already exists`);
    }
  }

  const permission = await prisma.permission.update({
    where: { id },
    data: {
      name: data.name,
      category: data.category,
      description: data.description !== undefined ? data.description : existing.description,
    },
  });

  // Invalidate all permission caches since permission definitions changed
  invalidateAllPermissions();

  return permission;
}

/**
 * Delete a permission
 * WARNING: This will cascade and remove the permission from all roles
 *
 * @param id - Permission ID
 * @returns Deleted permission
 */
export async function deletePermission(id: string): Promise<PermissionRecord> {
  // Check if permission exists
  const existing = await prisma.permission.findUnique({
    where: { id },
    include: {
      _count: {
        select: { rolePermissions: true },
      },
    },
  });

  if (!existing) {
    throw new Error(`Permission with ID "${id}" not found`);
  }

  // Check if permission is in use
  const usageCount = existing._count.rolePermissions;
  if (usageCount > 0) {
    throw new Error(
      `Cannot delete permission "${existing.name}" - it is assigned to ${usageCount} role(s). Remove it from roles first.`
    );
  }

  // Delete permission (cascade will handle RolePermission)
  const permission = await prisma.permission.delete({
    where: { id },
  });

  // Invalidate all permission caches since permission definitions changed
  invalidateAllPermissions();

  return permission;
}

/**
 * Get permissions by category
 *
 * @param category - Category name
 * @returns Array of permissions in the category
 */
export async function getPermissionsByCategory(category: string): Promise<PermissionRecord[]> {
  const permissions = await prisma.permission.findMany({
    where: { category },
    orderBy: { name: "asc" },
  });

  return permissions;
}

/**
 * Get all unique permission categories
 *
 * @returns Array of category names
 */
export async function getPermissionCategories(): Promise<string[]> {
  const permissions = await prisma.permission.findMany({
    select: { category: true },
    distinct: ["category"],
    orderBy: { category: "asc" },
  });

  return permissions.map((p) => p.category);
}

/**
 * Get unused permissions (not assigned to any role)
 *
 * @returns Array of unused permissions
 */
export async function getUnusedPermissions(): Promise<PermissionRecordWithUsage[]> {
  const permissions = await prisma.permission.findMany({
    where: {
      rolePermissions: {
        none: {},
      },
    },
    include: {
      _count: {
        select: { rolePermissions: true },
      },
    },
    orderBy: [{ category: "asc" }, { name: "asc" }],
  });

  return permissions as PermissionRecordWithUsage[];
}

/**
 * Get permission usage count (how many roles use this permission)
 *
 * @param permissionId - Permission ID
 * @returns Number of roles using this permission
 */
export async function getPermissionUsageCount(permissionId: string): Promise<number> {
  const permission = await prisma.permission.findUnique({
    where: { id: permissionId },
    select: {
      _count: {
        select: { rolePermissions: true },
      },
    },
  });

  return permission?._count.rolePermissions || 0;
}

/**
 * Batch create permissions
 *
 * @param permissions - Array of permission creation data
 * @returns Array of created permissions
 */
export async function batchCreatePermissions(
  permissions: CreatePermissionInput[]
): Promise<PermissionRecord[]> {
  const createdPermissions: PermissionRecord[] = [];

  for (const data of permissions) {
    const permission = await createPermission(data);
    createdPermissions.push(permission);
  }

  return createdPermissions;
}

/**
 * Check if a permission name is available (not in use)
 *
 * @param name - Permission name to check
 * @param excludeId - Optional permission ID to exclude from check (for updates)
 * @returns True if name is available
 */
export async function isPermissionNameAvailable(
  name: string,
  excludeId?: string
): Promise<boolean> {
  const existing = await prisma.permission.findUnique({
    where: { name },
  });

  if (!existing) {
    return true;
  }

  // If we're excluding an ID and the existing permission has that ID, it's available
  if (excludeId && existing.id === excludeId) {
    return true;
  }

  return false;
}

/**
 * Get permission statistics
 *
 * @returns Statistics about permissions
 */
export async function getPermissionStats(): Promise<{
  total: number;
  byCategory: Record<string, number>;
  unused: number;
}> {
  const [total, unused, byCategory] = await Promise.all([
    prisma.permission.count(),
    prisma.permission.count({
      where: {
        rolePermissions: {
          none: {},
        },
      },
    }),
    prisma.permission.groupBy({
      by: ["category"],
      _count: true,
    }),
  ]);

  const categoryMap: Record<string, number> = {};
  for (const cat of byCategory) {
    categoryMap[cat.category] = cat._count;
  }

  return {
    total,
    unused,
    byCategory: categoryMap,
  };
}
