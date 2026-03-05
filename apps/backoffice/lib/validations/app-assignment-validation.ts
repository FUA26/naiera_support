/**
 * App Assignment - Validation Schemas
 *
 * Zod schemas for app assignment and access request operations.
 * Validations for:
 * - Direct app assignment (admin assigns user to app)
 * - Access requests (user requests access to app)
 * - Request status updates (approve/reject requests)
 */

import { z } from "zod";

/**
 * Schema for assigning a user to an app
 * Used by admins to directly assign app access
 */
export const assignAppSchema = z.object({
  appId: z.string().cuid("Invalid app ID format"),
  userId: z.string().cuid("Invalid user ID format").optional(),
});

/**
 * Schema for creating an app access request
 * Used by users to request access to an app
 */
export const accessRequestSchema = z.object({
  appId: z.string().cuid("Invalid app ID format"),
  reason: z.string().max(500, "Reason must be less than 500 characters").optional(),
});

/**
 * Schema for updating access request status
 * Used by admins to approve or reject requests
 */
export const updateRequestSchema = z.object({
  status: z.enum(["APPROVED", "REJECTED"], {
    errorMap: () => ({ message: "Status must be either APPROVED or REJECTED" }),
  }),
  reason: z.string().max(500, "Reason must be less than 500 characters").optional(),
});

/**
 * Schema for removing app assignment
 * Used to revoke user access to an app
 */
export const removeAppAssignmentSchema = z.object({
  appId: z.string().cuid("Invalid app ID format"),
  userId: z.string().cuid("Invalid user ID format").optional(),
});

/**
 * Schema for querying/filtering access requests
 */
export const accessRequestQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  status: z.enum(["PENDING", "APPROVED", "REJECTED"]).optional(),
  appId: z.string().cuid().optional(),
  userId: z.string().cuid().optional(),
  sortBy: z.enum(["createdAt", "updatedAt"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

// Export TypeScript types
export type AssignAppInput = z.infer<typeof assignAppSchema>;
export type AccessRequestInput = z.infer<typeof accessRequestSchema>;
export type UpdateRequestInput = z.infer<typeof updateRequestSchema>;
export type RemoveAppAssignmentInput = z.infer<typeof removeAppAssignmentSchema>;
export type AccessRequestQueryInput = z.infer<typeof accessRequestQuerySchema>;
