/**
 * Task Module - Service Layer
 *
 * Demonstrates service layer patterns:
 * - CRUD operations with relation includes
 * - Activity logging
 * - Status transitions
 * - Pagination and filtering
 *
 * This is a mock service with in-memory data.
 * In production, this would interact with the database via Prisma.
 *
 * @pattern docs/patterns/service-layer.md
 * @pattern docs/patterns/activity-logs.md
 */

// Define enums locally since they're not in Prisma schema
export type TaskStatus = "TODO" | "IN_PROGRESS" | "REVIEW" | "DONE" | "ARCHIVED";
export type TaskPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

// ============================================================================
// Type Definitions
// ============================================================================

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
  taskId: string;
  fileId: string;
  fileName: string;
  fileUrl: string;
  description: string | null;
  createdAt: Date;
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
// Mock Data
// ============================================================================

// Mock users (simulating existing User records)
const mockUsers: TaskUser[] = [
  { id: "user-1", name: "Admin User", email: "admin@naiera.dev" },
  { id: "user-2", name: "John Developer", email: "john@naiera.dev" },
  { id: "user-3", name: "Sarah Designer", email: "sarah@naiera.dev" },
];

// Mock tags
const mockTags: TaskTag[] = [
  { id: "tag-1", name: "Bug", color: "#ef4444" },
  { id: "tag-2", name: "Feature", color: "#3b82f6" },
  { id: "tag-3", name: "Enhancement", color: "#10b981" },
  { id: "tag-4", name: "Documentation", color: "#f59e0b" },
  { id: "tag-5", name: "Urgent", color: "#dc2626" },
];

// Mock tasks
let mockTasks: Task[] = [
  {
    id: "task-1",
    title: "Implement user authentication",
    description: "Add OAuth2 login flow with Google and GitHub providers",
    status: "IN_PROGRESS",
    priority: "HIGH",
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    assignee: mockUsers[1]!,
    tags: [mockTags[1]!, mockTags[2]!],
    commentCount: 5,
    attachmentCount: 2,
  },
  {
    id: "task-2",
    title: "Fix responsive layout issues on mobile",
    description: "Navigation menu overlaps content on screens smaller than 640px",
    status: "TODO",
    priority: "MEDIUM",
    dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    assignee: mockUsers[2]!,
    tags: [mockTags[0]!],
    commentCount: 2,
    attachmentCount: 0,
  },
  {
    id: "task-3",
    title: "Update API documentation",
    description: "Document all new endpoints added in v2.0 release",
    status: "REVIEW",
    priority: "LOW",
    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    assignee: mockUsers[0]!,
    tags: [mockTags[3]!],
    commentCount: 1,
    attachmentCount: 1,
  },
  {
    id: "task-4",
    title: "Database migration for user preferences",
    description: "Create migration script for new user settings table",
    status: "DONE",
    priority: "HIGH",
    dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    assignee: mockUsers[1]!,
    tags: [mockTags[1]!],
    commentCount: 8,
    attachmentCount: 0,
  },
  {
    id: "task-5",
    title: "Security audit and vulnerability fixes",
    description: "Address findings from latest security scan",
    status: "TODO",
    priority: "URGENT",
    dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    assignee: mockUsers[0]!,
    tags: [mockTags[0]!, mockTags[4]!],
    commentCount: 3,
    attachmentCount: 1,
  },
  {
    id: "task-6",
    title: "Implement dark mode toggle",
    description: "Add system preference detection and manual override",
    status: "ARCHIVED",
    priority: "LOW",
    dueDate: null,
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
    assignee: mockUsers[2]!,
    tags: [mockTags[2]!],
    commentCount: 4,
    attachmentCount: 0,
  },
];

// Mock comments
let mockComments: TaskComment[] = [
  {
    id: "comment-1",
    taskId: "task-1",
    content: "I've started working on the Google OAuth integration. Need to set up the callback URL.",
    createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
    author: mockUsers[1]!,
  },
  {
    id: "comment-2",
    taskId: "task-1",
    content: "Great progress! Let me know if you need help with the GitHub provider.",
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    author: mockUsers[0]!,
  },
  {
    id: "comment-3",
    taskId: "task-2",
    content: "I've attached a screenshot showing the issue on iPhone SE.",
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    author: mockUsers[2]!,
  },
];

// Mock activities
let mockActivities: TaskActivity[] = [
  {
    id: "activity-1",
    taskId: "task-1",
    action: "CREATED",
    changes: null,
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    user: mockUsers[0]!,
  },
  {
    id: "activity-2",
    taskId: "task-1",
    action: "ASSIGNED",
    changes: { assignee: "John Developer" },
    createdAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000),
    user: mockUsers[0]!,
  },
  {
    id: "activity-3",
    taskId: "task-1",
    action: "STATUS_CHANGED",
    changes: { from: "TODO", to: "IN_PROGRESS" },
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    user: mockUsers[1]!,
  },
];

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

  // Simulate async database call
  await new Promise((resolve) => setTimeout(resolve, 100));

  // Filter tasks
  let filtered = [...mockTasks];

  if (status) {
    filtered = filtered.filter((t) => t.status === status);
  }

  if (priority) {
    filtered = filtered.filter((t) => t.priority === priority);
  }

  if (assigneeId) {
    filtered = filtered.filter((t) => t.assignee?.id === assigneeId);
  }

  if (search) {
    const searchLower = search.toLowerCase();
    filtered = filtered.filter(
      (t) =>
        t.title.toLowerCase().includes(searchLower) ||
        t.description?.toLowerCase().includes(searchLower)
    );
  }

  // Sort tasks
  filtered.sort((a, b) => {
    let aVal: number, bVal: number;

    switch (sortBy) {
      case "status":
        const statusOrder = { TODO: 0, IN_PROGRESS: 1, REVIEW: 2, DONE: 3, ARCHIVED: 4 };
        aVal = statusOrder[a.status];
        bVal = statusOrder[b.status];
        break;
      case "priority":
        const priorityOrder = { URGENT: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
        aVal = priorityOrder[a.priority];
        bVal = priorityOrder[b.priority];
        break;
      case "dueDate":
        aVal = a.dueDate ? a.dueDate.getTime() : 0;
        bVal = b.dueDate ? b.dueDate.getTime() : 0;
        break;
      case "updatedAt":
        aVal = a.updatedAt.getTime();
        bVal = b.updatedAt.getTime();
        break;
      default:
        aVal = a.createdAt.getTime();
        bVal = b.createdAt.getTime();
    }

    if (sortOrder === "asc") {
      return aVal > bVal ? 1 : -1;
    }
    return aVal < bVal ? 1 : -1;
  });

  // Paginate
  const total = filtered.length;
  const totalPages = Math.ceil(total / pageSize);
  const start = (page - 1) * pageSize;
  const items = filtered.slice(start, start + pageSize);

  return {
    items,
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
  await new Promise((resolve) => setTimeout(resolve, 50));

  const task = mockTasks.find((t) => t.id === id);
  return task || null;
}

/**
 * Create a new task
 */
export async function createTask(
  data: Omit<Task, "id" | "createdAt" | "updatedAt" | "commentCount" | "attachmentCount" | "assignee" | "tags"> & {
    assigneeId?: string;
    tagIds?: string[];
  }
): Promise<Task> {
  await new Promise((resolve) => setTimeout(resolve, 100));

  const newTask: Task = {
    id: `task-${Date.now()}`,
    title: data.title,
    description: data.description ?? null,
    status: data.status,
    priority: data.priority,
    dueDate: data.dueDate,
    createdAt: new Date(),
    updatedAt: new Date(),
    assignee: data.assigneeId ? mockUsers.find((u) => u.id === data.assigneeId) : undefined,
    tags: data.tagIds
      ? data.tagIds.map((tagId) => mockTags.find((t) => t.id === tagId)).filter(Boolean) as TaskTag[]
      : [],
    commentCount: 0,
    attachmentCount: 0,
  };

  mockTasks.unshift(newTask);

  // Log activity
  await logActivity(newTask.id, "CREATED", null, mockUsers[0]!);

  return newTask;
}

/**
 * Update an existing task
 */
export async function updateTask(
  id: string,
  data: Partial<Omit<Task, "id" | "createdAt" | "updatedAt" | "assignee" | "tags" | "commentCount" | "attachmentCount">> & {
    assigneeId?: string;
    tagIds?: string[];
  }
): Promise<Task | null> {
  await new Promise((resolve) => setTimeout(resolve, 100));

  const index = mockTasks.findIndex((t) => t.id === id);
  if (index === -1) return null;

  const existing = mockTasks[index]!;
  const changes: Record<string, unknown> = {};

  // Track changes for activity log (only if existing is defined)
  if (data.status && data.status !== existing.status) {
    changes.status = { from: existing.status, to: data.status };
  }
  if (data.priority && data.priority !== existing.priority) {
    changes.priority = { from: existing.priority, to: data.priority };
  }
  if (data.assigneeId !== undefined) {
    const newAssignee = data.assigneeId
      ? mockUsers.find((u) => u.id === data.assigneeId)
      : undefined;
    changes.assignee = {
      from: existing.assignee?.name || "Unassigned",
      to: newAssignee?.name || "Unassigned",
    };
  }

  const updated: Task = {
    ...existing,
    title: data.title ?? existing.title,
    description: data.description ?? existing.description,
    status: data.status ?? existing.status,
    priority: data.priority ?? existing.priority,
    dueDate: data.dueDate ?? existing.dueDate,
    updatedAt: new Date(),
    assignee: data.assigneeId !== undefined
      ? mockUsers.find((u) => u.id === data.assigneeId) ?? existing.assignee
      : existing.assignee,
    tags: data.tagIds
      ? data.tagIds.map((tagId) => mockTags.find((t) => t.id === tagId)!).filter(Boolean) as TaskTag[]
      : existing.tags,
    commentCount: existing.commentCount,
    attachmentCount: existing.attachmentCount,
  };

  mockTasks[index] = updated;

  // Log activity if there are changes
  if (Object.keys(changes).length > 0) {
    await logActivity(id, "UPDATED", changes, mockUsers[0]!);
  }

  return updated;
}

/**
 * Delete a task
 */
export async function deleteTask(id: string): Promise<boolean> {
  await new Promise((resolve) => setTimeout(resolve, 100));

  const index = mockTasks.findIndex((t) => t.id === id);
  if (index === -1) return false;

  mockTasks.splice(index, 1);

  // Remove related comments
  mockComments = mockComments.filter((c) => c.taskId !== id);

  // Log activity
  await logActivity(id, "DELETED", null, mockUsers[0]!);

  return true;
}

/**
 * Bulk update task status
 */
export async function bulkUpdateStatus(
  taskIds: string[],
  status: TaskStatus
): Promise<boolean> {
  await new Promise((resolve) => setTimeout(resolve, 100));

  let updated = 0;

  for (const id of taskIds) {
    const task = mockTasks.find((t) => t.id === id);
    if (task && task.status !== status) {
      task.status = status;
      task.updatedAt = new Date();

      await logActivity(
        id,
        "STATUS_CHANGED",
        { from: task.status, to: status },
        mockUsers[0]!
      );

      updated++;
    }
  }

  return updated > 0;
}

/**
 * Bulk delete tasks
 */
export async function bulkDeleteTasks(taskIds: string[]): Promise<number> {
  await new Promise((resolve) => setTimeout(resolve, 100));

  let deleted = 0;

  for (const id of taskIds) {
    const index = mockTasks.findIndex((t) => t.id === id);
    if (index !== -1) {
      mockTasks.splice(index, 1);
      mockComments = mockComments.filter((c) => c.taskId !== id);
      deleted++;
    }
  }

  return deleted;
}

/**
 * Get comments for a task
 */
export async function getTaskComments(taskId: string): Promise<TaskComment[]> {
  await new Promise((resolve) => setTimeout(resolve, 50));

  return mockComments
    .filter((c) => c.taskId === taskId)
    .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
}

/**
 * Add a comment to a task
 */
export async function addTaskComment(
  taskId: string,
  content: string,
  authorId: string
): Promise<TaskComment> {
  await new Promise((resolve) => setTimeout(resolve, 100));

  const author = mockUsers.find((u) => u.id === authorId) || mockUsers[0]!;
  const task = mockTasks.find((t) => t.id === taskId);

  if (!task) throw new Error("Task not found");

  const newComment: TaskComment = {
    id: `comment-${Date.now()}`,
    taskId,
    content,
    createdAt: new Date(),
    updatedAt: new Date(),
    author,
  };

  mockComments.push(newComment);
  task.commentCount++;

  // Log activity
  await logActivity(taskId, "COMMENT_ADDED", null, author);

  return newComment;
}

/**
 * Get activity log for a task
 */
export async function getTaskActivity(taskId: string): Promise<TaskActivity[]> {
  await new Promise((resolve) => setTimeout(resolve, 50));

  return mockActivities
    .filter((a) => a.taskId === taskId)
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

/**
 * Get all available tags
 */
export async function getTags(): Promise<TaskTag[]> {
  await new Promise((resolve) => setTimeout(resolve, 50));

  return mockTags;
}

/**
 * Get all available users for assignment
 */
export async function getAssignableUsers(): Promise<TaskUser[]> {
  await new Promise((resolve) => setTimeout(resolve, 50));

  return mockUsers;
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
  await new Promise((resolve) => setTimeout(resolve, 50));

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

  for (const task of mockTasks) {
    if (task.status !== "DONE" && task.status !== "ARCHIVED") {
      byStatus[task.status]++;
    }

    byPriority[task.priority]++;

    if (task.dueDate && task.dueDate < now && task.status !== "DONE" && task.status !== "ARCHIVED") {
      overdue++;
    }
  }

  return {
    total: mockTasks.length,
    byStatus,
    byPriority,
    overdue,
  };
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Log task activity
 */
async function logActivity(
  taskId: string,
  action: string,
  changes: Record<string, unknown> | null,
  user: TaskUser
): Promise<void> {
  const activity: TaskActivity = {
    id: `activity-${Date.now()}-${Math.random()}`,
    taskId,
    action,
    changes,
    createdAt: new Date(),
    user,
  };

  mockActivities.unshift(activity);
}
