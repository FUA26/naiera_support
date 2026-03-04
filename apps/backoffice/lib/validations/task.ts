/**
 * Task Module - Validation Schemas
 *
 * Zod schemas for task-related operations.
 * Demonstrates validation patterns for:
 * - Entity CRUD operations
 * - Status transitions
 * - Many-to-many relationships
 * - Nested resources (comments, attachments)
 *
 * @pattern docs/patterns/validation.md
 */

import { z } from "zod";

/**
 * Task status enum matching TaskStatus in Prisma schema
 * Although Tasks are not stored in DB for this demo,
 * we use the enum types that would be used in production
 */
export const taskStatusEnum = z.enum([
  "TODO",
  "IN_PROGRESS",
  "REVIEW",
  "DONE",
  "ARCHIVED",
]);

export type TaskStatus = z.infer<typeof taskStatusEnum>;

/**
 * Task priority enum
 */
export const taskPriorityEnum = z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]);

export type TaskPriority = z.infer<typeof taskPriorityEnum>;

/**
 * Base task schema for form validation
 */
export const taskSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title must be less than 200 characters"),
  description: z.string().max(2000, "Description must be less than 2000 characters").optional(),
  status: taskStatusEnum.default("TODO"),
  priority: taskPriorityEnum.default("MEDIUM"),
  dueDate: z.coerce.date().optional(),
  assigneeId: z.string().optional(), // User ID - demonstrates relation to existing User model
  tagIds: z.array(z.string()).default([]), // Demonstrates many-to-many relationship pattern
});

/**
 * Schema for creating a new task
 */
export const createTaskSchema = taskSchema.extend({
  title: z.string().min(1, "Title is required").max(200),
});

/**
 * Schema for updating an existing task
 * All fields are optional for partial updates
 */
export const updateTaskSchema = taskSchema.partial();

/**
 * Schema for bulk status update
 */
export const bulkUpdateTaskStatusSchema = z.object({
  taskIds: z.array(z.string()).min(1, "Select at least one task"),
  status: taskStatusEnum,
});

/**
 * Schema for bulk delete
 */
export const bulkDeleteTasksSchema = z.object({
  taskIds: z.array(z.string()).min(1, "Select at least one task"),
});

/**
 * Task comment schema
 * Demonstrates nested resource validation
 */
export const taskCommentSchema = z.object({
  content: z.string().min(1, "Comment is required").max(2000),
  attachmentId: z.string().optional(), // File ID from existing File model
});

/**
 * Task attachment schema
 */
export const taskAttachmentSchema = z.object({
  fileId: z.string().min(1, "File is required"),
  description: z.string().max(500).optional(),
});

/**
 * Task query/filter schema
 * Used for listing and searching tasks
 */
export const taskQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  status: taskStatusEnum.optional(),
  priority: taskPriorityEnum.optional(),
  assigneeId: z.string().optional(),
  search: z.string().optional(),
  sortBy: z.enum(["createdAt", "updatedAt", "dueDate", "priority", "status"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

/**
 * Tag schema for task categorization
 */
export const taskTagSchema = z.object({
  name: z.string().min(1, "Tag name is required").max(50),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, "Color must be a valid hex color").optional(),
});

/**
 * Task activity log schema
 * Demonstrates activity tracking pattern
 */
export const taskActivitySchema = z.object({
  taskId: z.string().min(1, "Task ID is required"),
  action: z.enum([
    "CREATED",
    "UPDATED",
    "STATUS_CHANGED",
    "ASSIGNED",
    "COMMENT_ADDED",
    "ATTACHMENT_ADDED",
    "DELETED",
  ]),
  changes: z.record(z.any()).optional(),
  metadata: z.record(z.any()).optional(),
});

// Export TypeScript types
export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type BulkUpdateTaskStatusInput = z.infer<typeof bulkUpdateTaskStatusSchema>;
export type BulkDeleteTasksInput = z.infer<typeof bulkDeleteTasksSchema>;
export type TaskCommentInput = z.infer<typeof taskCommentSchema>;
export type TaskAttachmentInput = z.infer<typeof taskAttachmentSchema>;
export type TaskQueryInput = z.infer<typeof taskQuerySchema>;
export type TaskTagInput = z.infer<typeof taskTagSchema>;
export type TaskActivityInput = z.infer<typeof taskActivitySchema>;
