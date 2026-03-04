import { Permission } from "@/lib/rbac/types";
import { z } from "zod";

export const createRoleSchema = z.object({
  name: z
    .string()
    .min(2, "Role name must be at least 2 characters")
    .max(50, "Role name must not exceed 50 characters")
    .regex(/^[A-Z_]+$/, "Role name must be uppercase letters and underscores only"),
  description: z.string().max(200, "Description must not exceed 200 characters").optional(),
  permissions: z
    .array(z.string() as z.ZodType<Permission>)
    .min(1, "Select at least one permission"),
});

export const updateRoleSchema = createRoleSchema.partial();

export const cloneRoleSchema = z.object({
  name: z
    .string()
    .min(2, "Role name must be at least 2 characters")
    .max(50, "Role name must not exceed 50 characters")
    .regex(/^[A-Z_]+$/, "Role name must be uppercase letters and underscores only"),
  sourceRoleId: z.string().min(1, "Source role is required"),
});

export type CreateRoleInput = z.infer<typeof createRoleSchema>;
export type UpdateRoleInput = z.infer<typeof updateRoleSchema>;
export type CloneRoleInput = z.infer<typeof cloneRoleSchema>;
