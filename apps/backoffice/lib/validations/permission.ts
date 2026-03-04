/**
 * Permission Validation Schemas
 *
 * Zod schemas for permission CRUD operations
 */

import { z } from "zod";

/**
 * Schema for creating a new permission
 */
export const createPermissionSchema = z.object({
  name: z
    .string()
    .min(3, "Permission name must be at least 3 characters")
    .max(100, "Permission name must not exceed 100 characters")
    .regex(
      /^[A-Z_0-9]+$/,
      "Permission name must be uppercase with underscores only (e.g., USER_READ)"
    )
    .refine(
      (val) => !val.startsWith("_") && !val.endsWith("_"),
      "Permission name cannot start or end with underscore"
    )
    .refine((val) => !val.includes("__"), "Permission name cannot contain double underscores")
    .transform((val) => val.toUpperCase()),
  category: z
    .string()
    .min(1, "Category is required")
    .max(50, "Category must not exceed 50 characters")
    .regex(
      /^[a-zA-Z0-9\s_-]+$/,
      "Category can only contain letters, numbers, spaces, hyphens, and underscores"
    ),
  description: z.string().max(500, "Description must not exceed 500 characters").optional(),
});

/**
 * Schema for updating an existing permission
 * All fields are optional
 */
export const updatePermissionSchema = createPermissionSchema.partial().extend({
  id: z.string().min(1, "Permission ID is required"),
});

/**
 * Schema for permission query parameters
 */
export const permissionQuerySchema = z.object({
  category: z.string().optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  sortBy: z.enum(["name", "category", "createdAt", "usage"]).default("name"),
  sortOrder: z.enum(["asc", "desc"]).default("asc"),
});

/**
 * Schema for batch assigning permissions to a role
 */
export const batchAssignPermissionsSchema = z.object({
  roleId: z.string().min(1, "Role ID is required"),
  permissionIds: z.array(z.string()).min(1, "At least one permission must be selected"),
});

export type CreatePermissionInput = z.infer<typeof createPermissionSchema>;
export type UpdatePermissionInput = z.infer<typeof updatePermissionSchema>;
export type PermissionQueryInput = z.infer<typeof permissionQuerySchema>;
export type BatchAssignPermissionsInput = z.infer<typeof batchAssignPermissionsSchema>;
