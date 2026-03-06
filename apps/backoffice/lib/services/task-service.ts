/**
 * Task Module - Service Layer
 *
 * Service layer for task operations using Prisma database.
 * Provides CRUD operations with relation includes and activity logging.
 *
 * @pattern docs/patterns/service-layer.md
 * @pattern docs/patterns/activity-logs.md
 */

import { prisma } from "@/lib/prisma";
import type { TaskActivityAction } from "@prisma/client";

// ============================================================================
// Type Definitions
// ============================================================================

export type TaskStatus = "TODO" | "IN_PROGRESS" | "REVIEW" | "DONE" | "ARCHIVED";
export type TaskPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
  assignee?: TaskUser;
  createdBy?: TaskUser;
  tags: TaskTag[];
  commentCount: number;
  attachmentCount: number;
}

export interface TaskUser {
  id: string;
  name: string | null;
  email: string;
}

export interface TaskTag {
  id: string;
  name: string;
  color: string | null;
}

export interface TaskComment {
  id: string;
  taskId: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  author: TaskUser;
  attachment?: TaskAttachment;
}

export interface TaskAttachment {
  id: string;
  taskId?: string;
  fileName: string;
  fileUrl: string | null;
  description: string | null;
}

export interface TaskActivity {
  id: string;
  taskId: string;
  action: string;
  changes?: Record<string, unknown> | null;
  metadata?: Record<string, unknown> | null;
  createdAt: Date;
  user: TaskUser;
}

export interface TaskListParams {
  page?: number;
  pageSize?: number;
  status?: TaskStatus;
  priority?: TaskPriority;
  assigneeId?: string;
  search?: string;
  sortBy?: "createdAt" | "updatedAt" | "dueDate" | "priority" | "status";
  sortOrder?: "asc" | "desc";
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ============================================================================
// Helper Functions
// ============================================================================

function formatTask(task: any): Task {
  return {
    id: task.id,
    title: task.title,
    description: task.description,
    status: task.status,
    priority: task.priority,
    dueDate: task.dueDate,
    createdAt: task.createdAt,
    updatedAt: task.updatedAt,
    assignee: task.assignee,
    createdBy: task.createdBy,
    tags: task.tags?.map((tt: any) => tt.tag) || [],
    commentCount: task._count?.comments || 0,
    attachmentCount: task._count?.attachments || 0,
  };
}

// ============================================================================
// Service Functions
// ============================================================================

/**
 * Get paginated list of tasks with filtering and sorting
 */
export async function getTasks(
  params: TaskListParams = {}
): Promise<PaginatedResult<Task>> {
  const {
    page = 1,
    pageSize = 20,
    status,
    priority,
    assigneeId,
    search,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = params;

  const where: Record<string, unknown> = {};

  if (status) {
    where.status = status;
  }

  if (priority) {
    where.priority = priority;
  }

  if (assigneeId) {
    where.assigneeId = assigneeId;
  }

  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ];
  }

  // Get total count
  const total = await prisma.task.count({ where });

  // Get pagination info
  const skip = (page - 1) * pageSize;

  // Build orderBy
  const orderBy: Record<string, "asc" | "desc"> = {};
  orderBy[sortBy] = sortOrder;

  // Get tasks
  const tasks = await prisma.task.findMany({
    where,
    skip,
    take: pageSize,
    orderBy,
    include: {
      assignee: {
        select: { id: true, name: true, email: true },
      },
      createdBy: {
        select: { id: true, name: true, email: true },
      },
      tags: {
        include: {
          tag: true,
        },
      },
      _count: {
        select: {
          comments: true,
          attachments: true,
        },
      },
    },
  });

  const totalPages = Math.ceil(total / pageSize);

  return {
    items: tasks.map(formatTask),
    total,
    page,
    pageSize,
    totalPages,
  };
}

/**
 * Get a single task by ID
 */
export async function getTaskById(id: string): Promise<Task | null> {
  const task = await prisma.task.findUnique({
    where: { id },
    include: {
      assignee: {
        select: { id: true, name: true, email: true },
      },
      createdBy: {
        select: { id: true, name: true, email: true },
      },
      tags: {
        include: {
          tag: true,
        },
      },
      _count: {
        select: {
          comments: true,
          attachments: true,
        },
      },
    },
  });

  return task ? formatTask(task) : null;
}

/**
 * Create a new task
 */
export async function createTask(
  data: Omit<Task, "id" | "createdAt" | "updatedAt" | "commentCount" | "attachmentCount" | "assignee" | "createdBy" | "tags"> & {
    createdById: string;
    assigneeId?: string | null;
    tagIds?: string[];
  }
): Promise<Task> {
  const assigneeId = data.assigneeId === "unassigned" ? null : data.assigneeId;

  const task = await prisma.task.create({
    data: {
      title: data.title,
      description: data.description,
      status: data.status,
      priority: data.priority,
      dueDate: data.dueDate,
      assigneeId,
      createdById: data.createdById,
      tags: {
        create: data.tagIds?.map((tagId) => ({
          tagId,
        })) || [],
      },
    },
    include: {
      assignee: {
        select: { id: true, name: true, email: true },
      },
      createdBy: {
        select: { id: true, name: true, email: true },
      },
      tags: {
        include: {
          tag: true,
        },
      },
      _count: {
        select: {
          comments: true,
          attachments: true,
        },
      },
    },
  });

  // Log activity
  await prisma.taskActivity.create({
    data: {
      taskId: task.id,
      action: "CREATED",
      userId: data.createdById,
    },
  });

  return formatTask(task);
}

/**
 * Update an existing task
 */
export async function updateTask(
  id: string,
  data: Partial<Omit<Task, "id" | "createdAt" | "updatedAt" | "assignee" | "createdBy" | "tags" | "commentCount" | "attachmentCount">> & {
    userId?: string;
    assigneeId?: string | null;
    tagIds?: string[];
  }
): Promise<Task | null> {
  const existing = await prisma.task.findUnique({
    where: { id },
  });

  if (!existing) return null;

  const updateData: Record<string, unknown> = {};
  const activities: TaskActivityAction[] = [];

  if (data.title !== undefined) {
    updateData.title = data.title;
  }
  if (data.description !== undefined) {
    updateData.description = data.description;
  }
  if (data.status !== undefined && data.status !== existing.status) {
    updateData.status = data.status;
    activities.push("STATUS_CHANGED");
  }
  if (data.priority !== undefined && data.priority !== existing.priority) {
    updateData.priority = data.priority;
    activities.push("PRIORITY_CHANGED");
  }
  if (data.dueDate !== undefined) {
    updateData.dueDate = data.dueDate;
    if (data.dueDate !== existing.dueDate) {
      activities.push("DUE_DATE_CHANGED");
    }
  }
  if (data.assigneeId !== undefined) {
    const newAssigneeId = data.assigneeId === "unassigned" ? null : data.assigneeId;
    updateData.assigneeId = newAssigneeId;
    if (newAssigneeId !== existing.assigneeId) {
      activities.push(newAssigneeId ? "ASSIGNED" : "UNASSIGNED");
    }
  }

  // Handle tags update
  if (data.tagIds !== undefined) {
    // Delete existing tag relations
    await prisma.taskTaskTag.deleteMany({
      where: { taskId: id },
    });

    // Create new tag relations
    if (data.tagIds.length > 0) {
      await prisma.taskTaskTag.createMany({
        data: data.tagIds.map((tagId) => ({
          taskId: id,
          tagId,
        })),
      });
    }
  }

  // Update task
  const updated = await prisma.task.update({
    where: { id },
    data: updateData,
    include: {
      assignee: {
        select: { id: true, name: true, email: true },
      },
      createdBy: {
        select: { id: true, name: true, email: true },
      },
      tags: {
        include: {
          tag: true,
        },
      },
      _count: {
        select: {
          comments: true,
          attachments: true,
        },
      },
    },
  });

  // Log activities
  const userId = data.userId || existing.createdById;
  for (const action of activities) {
    const changes = action === "STATUS_CHANGED"
      ? { from: existing.status, to: data.status }
      : action === "PRIORITY_CHANGED"
      ? { from: existing.priority, to: data.priority }
      : action === "ASSIGNED" || action === "UNASSIGNED"
      ? { from: existing.assigneeId ?? null, to: data.assigneeId ?? null }
      : null;

    await prisma.taskActivity.create({
      data: {
        taskId: id,
        action,
        userId,
        changes: changes as any,
      },
    });
  }

  // If no specific activity but fields changed, log generic UPDATE
  if (activities.length === 0 && Object.keys(updateData).length > 0) {
    await prisma.taskActivity.create({
      data: {
        taskId: id,
        action: "UPDATED",
        userId,
      },
    });
  }

  return formatTask(updated);
}

/**
 * Delete a task
 */
export async function deleteTask(id: string): Promise<boolean> {
  const existing = await prisma.task.findUnique({
    where: { id },
  });

  if (!existing) return false;

  await prisma.task.delete({
    where: { id },
  });

  return true;
}

/**
 * Bulk update task status
 */
export async function bulkUpdateStatus(
  taskIds: string[],
  status: TaskStatus
): Promise<boolean> {
  const result = await prisma.task.updateMany({
    where: {
      id: { in: taskIds },
    },
    data: {
      status,
    },
  });

  return result.count > 0;
}

/**
 * Bulk delete tasks
 */
export async function bulkDeleteTasks(taskIds: string[]): Promise<number> {
  const result = await prisma.task.deleteMany({
    where: { id: { in: taskIds } },
  });

  return result.count;
}

/**
 * Get comments for a task
 */
export async function getTaskComments(taskId: string): Promise<TaskComment[]> {
  const comments = await prisma.taskComment.findMany({
    where: { taskId },
    include: {
      author: {
        select: { id: true, name: true, email: true },
      },
      attachment: {
        include: {
          file: true,
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  return comments.map((comment) => ({
    id: comment.id,
    taskId: comment.taskId,
    content: comment.content,
    createdAt: comment.createdAt,
    updatedAt: comment.updatedAt,
    author: comment.author,
    attachment: comment.attachment ? {
      id: comment.attachment.id,
      fileName: comment.attachment.fileName,
      fileUrl: comment.attachment.file?.cdnUrl || null,
      description: comment.attachment.description,
    } : undefined,
  }));
}

/**
 * Add a comment to a task
 */
export async function addTaskComment(
  taskId: string,
  content: string,
  authorId: string,
  attachmentId?: string
): Promise<TaskComment> {
  const comment = await prisma.taskComment.create({
    data: {
      taskId,
      content,
      authorId,
      attachmentId,
    },
    include: {
      author: {
        select: { id: true, name: true, email: true },
      },
      attachment: {
        include: {
          file: true,
        },
      },
    },
  });

  // Log activity
  await prisma.taskActivity.create({
    data: {
      taskId,
      action: "COMMENT_ADDED",
      userId: authorId,
    },
  });

  return {
    id: comment.id,
    taskId: comment.taskId,
    content: comment.content,
    createdAt: comment.createdAt,
    updatedAt: comment.updatedAt,
    author: comment.author,
    attachment: comment.attachment ? {
      id: comment.attachment.id,
      fileName: comment.attachment.fileName,
      fileUrl: comment.attachment.file?.cdnUrl || null,
      description: comment.attachment.description,
    } : undefined,
  };
}

/**
 * Get activity log for a task
 */
export async function getTaskActivity(taskId: string): Promise<TaskActivity[]> {
  const activities = await prisma.taskActivity.findMany({
    where: { taskId },
    include: {
      user: {
        select: { id: true, name: true, email: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return activities.map((activity) => ({
    id: activity.id,
    taskId: activity.taskId,
    action: activity.action,
    changes: activity.changes as Record<string, unknown> | null,
    metadata: activity.metadata as Record<string, unknown> | null,
    createdAt: activity.createdAt,
    user: activity.user,
  }));
}

/**
 * Get all available tags
 */
export async function getTags(): Promise<TaskTag[]> {
  const tags = await prisma.taskTag.findMany({
    orderBy: { name: "asc" },
  });

  return tags.map((tag) => ({
    id: tag.id,
    name: tag.name,
    color: tag.color,
  }));
}

/**
 * Get all available users for assignment
 */
export async function getAssignableUsers(): Promise<TaskUser[]> {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
    },
    orderBy: { name: "asc" },
  });

  return users;
}

/**
 * Get task statistics
 */
export async function getTaskStats(): Promise<{
  total: number;
  byStatus: Record<TaskStatus, number>;
  byPriority: Record<TaskPriority, number>;
  overdue: number;
}> {
  const tasks = await prisma.task.findMany({
    select: {
      status: true,
      priority: true,
      dueDate: true,
    },
  });

  const byStatus: Record<TaskStatus, number> = {
    TODO: 0,
    IN_PROGRESS: 0,
    REVIEW: 0,
    DONE: 0,
    ARCHIVED: 0,
  };

  const byPriority: Record<TaskPriority, number> = {
    LOW: 0,
    MEDIUM: 0,
    HIGH: 0,
    URGENT: 0,
  };

  let overdue = 0;
  const now = new Date();

  for (const task of tasks) {
    // Count by status
    if (task.status !== "DONE" && task.status !== "ARCHIVED") {
      byStatus[task.status]++;
    }

    // Count by priority
    byPriority[task.priority]++;

    // Count overdue
    if (task.dueDate && task.dueDate < now && task.status !== "DONE" && task.status !== "ARCHIVED") {
      overdue++;
    }
  }

  return {
    total: tasks.length,
    byStatus,
    byPriority,
    overdue,
  };
}
