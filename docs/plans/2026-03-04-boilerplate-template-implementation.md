# Boilerplate Template Branch - Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Transform the current project into a well-documented boilerplate template branch with comprehensive pattern documentation and example module.

**Architecture:** Create `template` branch from main, remove business-specific modules, add Tasks example module demonstrating all patterns, create comprehensive documentation, annotate entire codebase.

**Tech Stack:** Existing stack - Next.js 16, Prisma, PostgreSQL, Zod, Turborepo, shadcn/ui

---

## PREPARATION

### Task 0.1: Create Template Branch

**Files:**
- Branch: `template`

**Step 1: Create template branch from main**

Run: `git checkout -b template`

Expected: Branch switched to 'template', based on 'main'

**Step 2: Verify branch**

Run: `git branch --show-current`

Expected: `template`

---

## PHASE 1: Remove Business Modules

### Task 1.1: Remove Docs App

**Files:**
- Delete: `apps/docs/`

**Step 1: Remove docs app directory**

Run: `rm -rf apps/docs`

**Step 2: Remove docs app from workspace**

Modify: `pnpm-workspace.yaml` - remove `'apps/docs'` if present

**Step 3: Update turbo.json**

Remove docs-related entries from `pipeline` and `tasks` if present

**Step 4: Commit**

```bash
git add apps/docs pnpm-workspace.yaml turbo.json
git commit -m "chore: remove docs app from boilerplate

Docs app removed in favor of markdown documentation.

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

### Task 1.2: Remove Services Module

**Files:**
- Delete: `apps/backoffice/app/(dashboard)/services/`
- Delete: `apps/backoffice/app/api/services/`
- Delete: `apps/backoffice/app/api/categories/`
- Delete: `apps/backoffice/app/api/public/services/`
- Delete: `apps/backoffice/components/admin/service-*.tsx`
- Delete: `apps/backoffice/lib/services/service-service.ts`

**Step 1: Remove services page and API routes**

Run:
```bash
rm -rf apps/backoffice/app/(dashboard)/services
rm -rf apps/backoffice/app/api/services
rm -rf apps/backoffice/app/api/categories
rm -rf apps/backoffice/app/api/public/services
```

**Step 2: Remove services components**

Run: `rm -f apps/backoffice/components/admin/service-*.tsx`

**Step 3: Remove services service layer**

Run: `rm -f apps/backoffice/lib/services/service-service.ts`

**Step 4: Update schema - remove Service models**

Modify: `apps/backoffice/prisma/schema.prisma`

Remove:
- `ServiceStatus` enum
- `ServiceCategory` model
- `Service` model
- `ServiceActivityLog` model
- Service relations from User model
- Services relation from File model

**Step 5: Generate Prisma client**

Run: `cd apps/backoffice && pnpm prisma generate`

**Step 6: Update sidebar**

Modify: `apps/backoffice/components/dashboard/sidebar.tsx`

Remove Services menu item.

**Step 7: Commit**

```bash
git add .
git commit -m "chore: remove services module from boilerplate

Services module removed as business-specific content.
Will be replaced with Tasks example module.

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

### Task 1.3: Remove News Module

**Files:**
- Delete: `apps/backoffice/app/(dashboard)/manage/news/`
- Delete: `apps/backoffice/app/(dashboard)/manage/news-categories/`
- Delete: `apps/backoffice/app/api/news/`
- Delete: `apps/backoffice/app/api/public/news/`
- Delete: `apps/backoffice/lib/services/news-service.ts`
- Delete: `apps/backoffice/lib/validations/news.ts`
- Delete: `apps/backoffice/components/admin/news-*.tsx`

**Step 1: Remove news directories**

Run:
```bash
rm -rf apps/backoffice/app/(dashboard)/manage/news
rm -rf apps/backoffice/app/(dashboard)/manage/news-categories
rm -rf apps/backoffice/app/api/news
rm -rf apps/backoffice/app/api/public/news
```

**Step 2: Remove news files**

Run:
```bash
rm -f apps/backoffice/lib/services/news-service.ts
rm -f apps/backoffice/lib/validations/news.ts
rm -f apps/backoffice/components/admin/news-*.tsx
```

**Step 3: Update schema - remove News models**

Modify: `apps/backoffice/prisma/schema.prisma`

Remove:
- `NewsStatus` enum
- `NewsCategory` model
- `News` model
- `NewsActivityLog` model
- News relations from User model
- News relations from File model

**Step 4: Generate Prisma client**

Run: `cd apps/backoffice && pnpm prisma generate`

**Step 5: Update permissions**

Modify: `apps/backoffice/prisma/seed-permissions.ts`

Remove all NEWS_* permissions.

**Step 6: Update sidebar**

Modify: `apps/backoffice/components/dashboard/sidebar.tsx`

Remove News menu items.

**Step 7: Commit**

```bash
git add .
git commit -m "chore: remove news module from boilerplate

News module removed as business-specific content.
Will be replaced with Tasks example module.

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

### Task 1.4: Remove Events Module

**Files:**
- Delete: `apps/backoffice/app/(dashboard)/manage/events/`
- Delete: `apps/backoffice/app/(dashboard)/manage/event-categories/`
- Delete: `apps/backoffice/app/api/events/`
- Delete: `apps/backoffice/app/api/public/events/`
- Delete: `apps/backoffice/lib/services/event-service.ts`
- Delete: `apps/backoffice/lib/validations/event.ts`
- Delete: `apps/backoffice/components/admin/event-*.tsx`

**Step 1: Remove events directories**

Run:
```bash
rm -rf apps/backoffice/app/(dashboard)/manage/events
rm -rf apps/backoffice/app/(dashboard)/manage/event-categories
rm -rf apps/backoffice/app/api/events
rm -rf apps/backoffice/app/api/public/events
```

**Step 2: Remove events files**

Run:
```bash
rm -f apps/backoffice/lib/services/event-service.ts
rm -f apps/backoffice/lib/validations/event.ts
rm -f apps/backoffice/components/admin/event-*.tsx
```

**Step 3: Update schema - remove Event models**

Modify: `apps/backoffice/prisma/schema.prisma`

Remove:
- `EventType` enum
- `EventStatus` enum
- `EventCategory` model
- `Event` model
- `EventActivityLog` model
- Event relations from User model
- Event relations from File model

**Step 4: Generate Prisma client**

Run: `cd apps/backoffice && pnpm prisma generate`

**Step 5: Update permissions**

Modify: `apps/backoffice/prisma/seed-permissions.ts`

Remove all EVENT_* permissions.

**Step 6: Update sidebar**

Modify: `apps/backoffice/components/dashboard/sidebar.tsx`

Remove Events menu items.

**Step 7: Commit**

```bash
git add .
git commit -m "chore: remove events module from boilerplate

Events module removed as business-specific content.
Will be replaced with Tasks example module.

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

### Task 1.5: Remove Gallery & Destinations (if implemented)

**Note:** These may not be implemented yet. Skip if they don't exist.

**Files:**
- Check existence first: `ls apps/backoffice/app/(dashboard)/manage/`

**Step 1: Check if modules exist**

Run: `ls apps/backoffice/app/(dashboard)/manage/ | grep -E '(photo|album|destination|gallery)'`

**Step 2: Remove if exists**

If any results, remove those directories similarly to previous tasks.

**Step 3: Update schema and permissions if needed**

**Step 4: Commit**

```bash
git add .
git commit -m "chore: remove gallery and destinations modules from boilerplate

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## PHASE 2: Add Tasks Example Module

### Task 2.1: Add Task Models to Prisma Schema

**Files:**
- Modify: `apps/backoffice/prisma/schema.prisma`

**Step 1: Add TaskStatus enum**

Add after all other enums:

```prisma
enum TaskStatus {
  TODO
  IN_PROGRESS
  REVIEW
  DONE
  ARCHIVED
}

enum TaskPriority {
  LOW
  MEDIUM
  HIGH
  URGENT
}
```

**Step 2: Add TaskCategory model**

```prisma
model TaskCategory {
  id        String   @id @default(cuid())
  name      String
  slug      String   @unique
  color     String   @default("primary")
  showInMenu Boolean  @default(true)
  order     Int      @default(0)
  tasks     Task[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([showInMenu])
  @@index([order])
}
```

**Step 3: Add TaskTag model**

```prisma
model TaskTag {
  id        String           @id @default(cuid())
  name      String           @unique
  slug      String           @unique
  tasks     TaskTagRelation[]
  createdAt DateTime         @default(now())
}
```

**Step 4: Add Task model**

```prisma
model Task {
  id          String      @id @default(cuid())
  slug        String      @unique
  title       String
  description String?     @db.Text

  categoryId  String?
  category    TaskCategory? @relation(fields: [categoryId], references: [id], onDelete: SetNull)

  status      TaskStatus  @default(TODO)
  priority    TaskPriority @default(MEDIUM)

  dueDate     DateTime?   @db.Date
  completedAt DateTime?

  views       Int         @default(0)
  isFeatured  Boolean     @default(false)
  showInMenu  Boolean     @default(true)
  order       Int         @default(0)

  createdById String
  createdBy   User        @relation("TaskCreator", fields: [createdById], references: [id])
  updatedById String?
  updatedBy   User?       @relation("TaskUpdater", fields: [updatedById], references: [id])

  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt

  assignees   TaskAssignment[]
  tags        TaskTagRelation[]
  attachments TaskAttachment[]
  comments    TaskComment[]
  activityLogs TaskActivityLog[]

  @@index([categoryId])
  @@index([status])
  @@index([priority])
  @@index([dueDate])
  @@index([isFeatured])
  @@index([order])
  @@index([slug])
}
```

**Step 5: Add TaskAssignment model**

```prisma
model TaskAssignment {
  taskId       String   @default(cuid())
  task         Task     @relation(fields: [taskId], references: [id], onDelete: Cascade)
  userId       String
  user         User     @relation("TaskAssignments", fields: [userId], references: [id], onDelete: Cascade)
  assignedAt   DateTime @default(now())

  @@id([taskId, userId])
  @@index([userId])
}
```

**Step 6: Add TaskTagRelation model**

```prisma
model TaskTagRelation {
  taskId String
  task   Task   @relation(fields: [taskId], references: [id], onDelete: Cascade)
  tagId  String
  tag    TaskTag @relation(fields: [tagId], references: [id], onDelete: Cascade)

  @@id([taskId, tagId])
}
```

**Step 7: Add TaskAttachment model**

```prisma
model TaskAttachment {
  id        String   @id @default(cuid())
  taskId    String
  task      Task     @relation(fields: [taskId], references: [id], onDelete: Cascade)
  fileId    String
  file      File     @relation("TaskAttachments", fields: [fileId], references: [id], onDelete: Cascade)
  fileName  String
  createdAt DateTime @default(now())

  @@index([taskId])
}
```

**Step 8: Add TaskComment model**

```prisma
model TaskComment {
  id        String   @id @default(cuid())
  taskId    String
  task      Task     @relation(fields: [taskId], references: [id], onDelete: Cascade)
  userId    String
  user      User     @relation("TaskComments", fields: [userId], references: [id])
  content   String   @db.Text
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([taskId])
  @@index([userId])
}
```

**Step 9: Add TaskActivityLog model**

```prisma
model TaskActivityLog {
  id        String   @id @default(cuid())
  taskId    String
  task      Task     @relation(fields: [taskId], references: [id], onDelete: Cascade)
  userId    String
  user      User     @relation("TaskActivityLogs", fields: [userId], references: [id])
  action    String
  changes   Json?
  createdAt DateTime @default(now())

  @@index([taskId])
  @@index([userId])
  @@index([createdAt])
}
```

**Step 10: Update User model**

Add to User model (after existing relations):

```prisma
  // Task Management Relations
  createdTasks      Task[]            @relation("TaskCreator")
  updatedTasks      Task[]            @relation("TaskUpdater")
  taskAssignments   TaskAssignment[]  @relation("TaskAssignments")
  taskComments      TaskComment[]     @relation("TaskComments")
  taskActivityLogs  TaskActivityLog[] @relation("TaskActivityLogs")
```

**Step 11: Update File model**

Add to File model relations:

```prisma
  taskAttachments TaskAttachment[] @relation("TaskAttachments")
```

**Step 12: Generate Prisma client**

Run: `cd apps/backoffice && pnpm prisma generate`

**Step 13: Commit**

```bash
git add apps/backoffice/prisma/schema.prisma
git commit -m "feat: add Task models to Prisma schema

- Add TaskStatus enum (TODO, IN_PROGRESS, REVIEW, DONE, ARCHIVED)
- Add TaskPriority enum (LOW, MEDIUM, HIGH, URGENT)
- Add TaskCategory model for organizing tasks
- Add TaskTag model for flexible tagging
- Add Task model with status, priority, due dates
- Add TaskAssignment for user assignments (many-to-many)
- Add TaskAttachment for file uploads
- Add TaskComment for discussion threads
- Add TaskActivityLog for audit trail
- Update User and File models with task relations

This module demonstrates all boilerplate patterns:
- CRUD operations
- Status workflows
- Many-to-many relationships (users, tags)
- Categories
- File attachments
- Comments
- Activity logging
- Full RBAC integration

@pattern docs/patterns/database-migrations.md

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

### Task 2.2: Create Database Migration

**Files:**
- Create: `apps/backoffice/prisma/migrations/<timestamp>_add_tasks_module/migration.sql`

**Step 1: Create migration**

Run: `cd apps/backoffice && set -a && source .env.local && set +a && pnpm prisma migrate dev --name add_tasks_module`

Expected: Migration created and applied successfully

**Step 2: Verify migration**

Check that all task tables were created:
- `TaskCategory`
- `TaskTag`
- `Task`
- `TaskAssignment`
- `TaskTagRelation`
- `TaskAttachment`
- `TaskComment`
- `TaskActivityLog`

**Step 3: Commit**

```bash
git add apps/backoffice/prisma/migrations
git commit -m "feat: add tasks module database migration

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

### Task 2.3: Add Task Permissions

**Files:**
- Modify: `apps/backoffice/prisma/seed-permissions.ts`

**Step 1: Add task permissions**

Add after existing permissions:

```typescript
  // Task Management
  { name: "TASKS_VIEW", category: "TASKS", description: "View tasks" },
  { name: "TASKS_CREATE", category: "TASKS", description: "Create new tasks" },
  { name: "TASKS_EDIT", category: "TASKS", description: "Edit tasks" },
  { name: "TASKS_DELETE", category: "TASKS", description: "Delete tasks" },
  { name: "TASKS_ASSIGN", category: "TASKS", description: "Assign users to tasks" },
  { name: "TASKS_COMMENT", category: "TASKS", description: "Add comments to tasks" },
  { name: "TASKS_REORDER", category: "TASKS", description: "Reorder tasks" },
  {
    name: "TASK_CATEGORIES_MANAGE",
    category: "TASKS",
    description: "Manage task categories",
  },
```

**Step 2: Seed permissions**

Run: `cd apps/backoffice && pnpm tsx prisma/seed-permissions.ts`

Expected: Task permissions seeded successfully

**Step 3: Commit**

```bash
git add apps/backoffice/prisma/seed-permissions.ts
git commit -m "feat: add task management permissions

Permissions added:
- TASKS_VIEW - View tasks
- TASKS_CREATE - Create new tasks
- TASKS_EDIT - Edit tasks
- TASKS_DELETE - Delete tasks
- TASKS_ASSIGN - Assign users to tasks
- TASKS_COMMENT - Add comments
- TASKS_REORDER - Reorder tasks
- TASK_CATEGORIES_MANAGE - Manage categories

@pattern docs/patterns/pages-permissions.md

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

### Task 2.4: Create Task Validation Schemas

**Files:**
- Create: `apps/backoffice/lib/validations/task.ts`

**Step 1: Create task validation file**

Create complete file following existing validation patterns:

```typescript
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

import { z } from 'zod';

// Category Schemas
export const taskCategorySchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/),
  color: z.string().default('primary'),
  showInMenu: z.boolean().default(true),
  order: z.number().int().min(0).default(0),
});

// Tag Schemas
export const taskTagSchema = z.object({
  name: z.string().min(1).max(50),
  slug: z.string().min(1).max(50).regex(/^[a-z0-9-]+$/),
});

// Task Schemas
export const taskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  slug: z.string().min(1).max(200).regex(/^[a-z0-9-]+$/),
  description: z.string().optional(),
  categoryId: z.string().cuid().optional(),
  status: z.enum(['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE', 'ARCHIVED']).default('TODO'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
  dueDate: z.coerce.date().optional(),
  isFeatured: z.boolean().default(false),
  showInMenu: z.boolean().default(true),
  order: z.number().int().min(0).default(0),
  assigneeIds: z.array(z.string().cuid()).optional(),
  tagIds: z.array(z.string().cuid()).optional(),
});

export const taskUpdateSchema = taskSchema.partial().extend({
  id: z.string().cuid(),
});

export const taskStatusSchema = z.object({
  id: z.string().cuid(),
  status: z.enum(['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE', 'ARCHIVED']),
});

export const taskAssignSchema = z.object({
  id: z.string().cuid(),
  assigneeIds: z.array(z.string().cuid()),
});

export const taskReorderSchema = z.object({
  items: z.array(z.object({
    id: z.string().cuid(),
    order: z.number().int().min(0),
  })),
});

// Comment Schemas
export const taskCommentSchema = z.object({
  content: z.string().min(1, 'Comment is required'),
});

// Query schemas
export const taskQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  categoryId: z.string().optional(),
  status: z.enum(['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE', 'ARCHIVED']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
  assigneeId: z.string().optional(),
  isFeatured: z.coerce.boolean().optional(),
  search: z.string().optional(),
});
```

**Step 2: Commit**

```bash
git add apps/backoffice/lib/validations/task.ts
git commit -m "feat: add task validation schemas

Demonstrates Zod validation patterns for:
- Entity CRUD with nested relations
- Status transitions
- Bulk operations (reorder, assign)
- Query parameters with filters

@pattern docs/patterns/validation.md

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

### Task 2.5: Create Task Service Layer

**Files:**
- Create: `apps/backoffice/lib/services/task-service.ts`

**Step 1: Create task service file**

Create complete service layer following existing patterns with functions:
- `getTasksList(options)` - Paginated list with filters
- `getTaskById(id)` - Single task with relations
- `getTaskBySlug(slug)` - For public API
- `createTask(data, userId)` - Create with activity log
- `updateTask(id, data, userId)` - Update with activity log
- `deleteTask(id)` - Soft delete
- `updateTaskStatus(id, status, userId)` - Status transition with logging
- `assignTask(id, userIds, userId)` - User assignment
- `reorderTasks(items)` - Bulk order update
- `addComment(taskId, content, userId)` - Add comment
- `addAttachment(taskId, fileId, fileName)` - Add attachment
- `logTaskActivity(taskId, userId, action, changes?)` - Activity logging
- `getTaskCategories()` - Categories list
- `createTaskCategory(data)` - Create category
- `getAllTags()` - All tags
- `createTag(data)` - Create tag

**Step 2: Commit**

```bash
git add apps/backoffice/lib/services/task-service.ts
git commit -m "feat: add task service layer

Demonstrates service layer patterns:
- CRUD operations with relation includes
- Activity logging
- Status transitions
- Many-to-many handling (assignees, tags)
- Nested resources (comments, attachments)
- Pagination and filtering

@pattern docs/patterns/service-layer.md
@pattern docs/patterns/activity-logs.md

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

### Task 2.6: Create Tasks API Routes

**Files:**
- Create: `apps/backoffice/app/api/tasks/route.ts`
- Create: `apps/backoffice/app/api/tasks/[id]/route.ts`
- Create: `apps/backoffice/app/api/tasks/[id]/status/route.ts`
- Create: `apps/backoffice/app/api/tasks/[id]/assign/route.ts`
- Create: `apps/backoffice/app/api/tasks/[id]/comments/route.ts`
- Create: `apps/backoffice/app/api/tasks/[id]/attachments/route.ts`
- Create: `apps/backoffice/app/api/tasks/[id]/logs/route.ts`
- Create: `apps/backoffice/app/api/tasks/reorder/route.ts`

**Step 1: Create main tasks route**

Following existing API route patterns with auth check, permission validation, Zod validation.

**Step 2: Create task by ID route**

GET, PUT, DELETE operations.

**Step 3: Create status transition route**

Status update with activity logging.

**Step 4: Create assignment route**

Many-to-many user assignment.

**Step 5: Create comments route**

Nested resource for task comments.

**Step 6: Create attachments route**

Nested resource for file attachments.

**Step 7: Create logs route**

Activity log retrieval.

**Step 8: Create reorder route**

Bulk reorder operation.

**Step 9: Commit**

```bash
git add apps/backoffice/app/api/tasks
git commit -m "feat: add tasks API routes

Demonstrates API route patterns:
- Main CRUD with LIST, CREATE
- Individual resource operations
- Status transition endpoints
- Nested resources (comments, attachments)
- Many-to-many assignment
- Activity log retrieval
- Bulk reorder operations

@pattern docs/patterns/api-routes.md

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

### Task 2.7: Create Task Categories API

**Files:**
- Create: `apps/backoffice/app/api/task-categories/route.ts`
- Create: `apps/backoffice/app/api/task-categories/[id]/route.ts`

**Step 1: Create categories routes**

Following category API patterns.

**Step 2: Commit**

```bash
git add apps/backoffice/app/api/task-categories
git commit -m "feat: add task categories API

Category CRUD operations pattern.

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

### Task 2.8: Create Task Tags API

**Files:**
- Create: `apps/backoffice/app/api/tags/route.ts`
- Create: `apps/backoffice/app/api/tags/[id]/route.ts`

**Step 1: Create tags routes**

Tag CRUD operations.

**Step 2: Commit**

```bash
git add apps/backoffice/app/api/tags
git commit -m "feat: add task tags API

Tag CRUD operations pattern.

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

### Task 2.9: Create Tasks UI Components

**Files:**
- Create: `apps/backoffice/components/admin/tasks-data-table.tsx`
- Create: `apps/backoffice/components/admin/task-dialog.tsx`
- Create: `apps/backoffice/components/admin/task-assign-dialog.tsx`
- Create: `apps/backoffice/components/admin/task-comments-panel.tsx`

**Step 1: Create tasks data table**

Following existing table component patterns with columns for title, status, priority, assignees, due date, actions.

**Step 2: Create task dialog**

Tabbed form for create/edit: Basic, Details, Assignees, Tags.

**Step 3: Create assign dialog**

User selection dialog for task assignment.

**Step 4: Create comments panel**

Threaded comments display and input.

**Step 5: Commit**

```bash
git add apps/backoffice/components/admin/task-*.tsx
git commit -m "feat: add tasks UI components

Demonstrates component patterns:
- Data table with filters and pagination
- Multi-tab form dialog
- User assignment selector
- Comments panel with thread

@pattern docs/patterns/components-packages.md

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

### Task 2.10: Create Tasks Page

**Files:**
- Create: `apps/backoffice/app/(dashboard)/tasks/page.tsx`
- Create: `apps/backoffice/app/(dashboard)/tasks/tasks-client.tsx`
- Modify: `apps/backoffice/components/dashboard/sidebar.tsx`

**Step 1: Create tasks page**

Server component for data fetching.

**Step 2: Create tasks client**

Client component with table, filters, and actions.

**Step 3: Update sidebar**

Add Tasks menu item.

**Step 4: Commit**

```bash
git add apps/backoffice/app/(dashboard)/tasks
git add apps/backoffice/components/dashboard/sidebar.tsx
git commit -m "feat: add tasks management page

Demonstrates page creation pattern:
- Server component for data fetching
- Client component for interactivity
- Sidebar menu integration

@pattern docs/patterns/pages-permissions.md

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## PHASE 3: Create Boilerplate Landing Page

### Task 3.1: Replace Landing Page Content

**Files:**
- Modify: `apps/landing/app/page.tsx`
- Create: `apps/landing/components/landing/hero-section.tsx`
- Create: `apps/landing/components/landing/features-section.tsx`
- Create: `apps/landing/components/landing/quickstart-section.tsx`
- Create: `apps/landing/components/landing/architecture-section.tsx`
- Create: `apps/landing/components/landing/cta-section.tsx`

**Step 1: Create hero section component**

```typescript
/**
 * Landing Page - Hero Section
 *
 * Main hero for boilerplate landing page.
 * Replace 'YourBrand' with actual brand name.
 *
 * @pattern docs/patterns/components-packages.md
 */

"use client";

import Link from "next/link";
import { ArrowRight, Github } from "lucide-react";

export function HeroSection() {
  return (
    <section className="bg-gradient-to-br from-primary to-primary-hover py-20 text-white">
      <div className="container mx-auto max-w-6xl px-4">
        <div className="text-center">
          <h1 className="mb-4 text-5xl font-bold">YourBrand</h1>
          <p className="mb-8 text-xl text-primary-lighter">
            Enterprise Next.js Boilerplate
          </p>
          <div className="flex justify-center gap-4">
            <Link
              href="/quick-start"
              className="flex items-center gap-2 rounded-lg bg-white px-6 py-3 font-semibold text-primary transition-colors hover:bg-gray-100"
            >
              Get Started
              <ArrowRight size={18} />
            </Link>
            <Link
              href="https://github.com/yourusername/yourbrand"
              className="flex items-center gap-2 rounded-lg border-2 border-white px-6 py-3 font-semibold transition-colors hover:bg-white/10"
            >
              <Github size={18} />
              GitHub
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
```

**Step 2: Create other sections**

Similar patterns for features, quickstart, architecture, CTA sections.

**Step 3: Update main page**

Use the new components.

**Step 4: Remove business-specific content**

Delete all business-related landing pages and components.

**Step 5: Commit**

```bash
git add apps/landing
git commit -m "feat: replace landing with boilerplate landing

- Add professional boilerplate landing page
- Hero, Features, Quick Start, Architecture, CTA sections
- Remove all business-specific content

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## PHASE 4: Create Documentation

### Task 4.1: Create Documentation Structure

**Files:**
- Create: `docs/README.md`
- Create: `docs/getting-started/installation.md`
- Create: `docs/getting-started/configuration.md`
- Create: `docs/getting-started/running-locally.md`

**Step 1: Create docs index**

Create `docs/README.md` with navigation to all docs.

**Step 2: Create getting started guides**

Installation, configuration, running guides.

**Step 3: Commit**

```bash
git add docs
git commit -m "docs: add getting started documentation

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

### Task 4.2: Create Architecture Documentation

**Files:**
- Create: `docs/architecture/overview.md`
- Create: `docs/architecture/monorepo-structure.md`
- Create: `docs/architecture/technology-stack.md`
- Create: `docs/architecture/data-flow.md`

**Step 1: Create architecture docs**

Comprehensive documentation of system architecture.

**Step 2: Commit**

```bash
git add docs/architecture
git commit -m "docs: add architecture documentation

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

### Task 4.3: Create Pattern Documentation

**Files:**
- Create: `docs/patterns/api-routes.md`
- Create: `docs/patterns/pages-permissions.md`
- Create: `docs/patterns/components-packages.md`
- Create: `docs/patterns/database-migrations.md`
- Create: `docs/patterns/file-uploads.md`
- Create: `docs/patterns/validation.md`
- Create: `docs/patterns/revalidation.md`
- Create: `docs/patterns/service-layer.md`
- Create: `docs/patterns/activity-logs.md`

**Step 1: Create pattern guides**

Each pattern document includes:
- When to use
- Architecture diagram
- Implementation steps
- Complete example from Tasks module
- Common variations
- See also references

**Step 2: Commit**

```bash
git add docs/patterns
git commit -m "docs: add pattern documentation

Complete pattern guides:
- API routes with auth, permissions, validation
- Pages and RBAC integration
- Component and package patterns
- Database migrations with Prisma
- File uploads and CDN
- Zod validation patterns
- ISR cache revalidation
- Service layer abstraction
- Activity logging

Each pattern references Tasks module as live example.

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

### Task 4.4: Create Customization Documentation

**Files:**
- Create: `docs/customization/branding.md`
- Create: `docs/customization/adding-modules.md`
- Create: `docs/customization/removing-features.md`
- Create: `docs/customization/package-renaming.md`

**Step 1: Create customization guides**

Step-by-step guides for customizing the boilerplate.

**Step 2: Commit**

```bash
git add docs/customization
git commit -m "docs: add customization documentation

Guides for branding, adding modules, removing features, renaming packages.

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

### Task 4.5: Create Deployment Documentation

**Files:**
- Create: `docs/deployment/docker.md`
- Create: `docs/deployment/vercel.md`
- Create: `docs/deployment/custom-server.md`

**Step 1: Create deployment guides**

Deployment instructions for various platforms.

**Step 2: Commit**

```bash
git add docs/deployment
git commit -m "docs: add deployment documentation

Docker, Vercel, and custom server deployment guides.

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

### Task 4.6: Create Main Boilerplate Document

**Files:**
- Create: `BOILERPLATE.md`

**Step 1: Create BOILERPLATE.md**

Main document explaining the boilerplate, its purpose, and quick links to all documentation.

**Step 2: Update main README**

Update root README.md to point to boilerplate documentation.

**Step 3: Commit**

```bash
git add BOILERPLATE.md README.md
git commit -m "docs: add main boilerplate documentation

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## PHASE 5: Annotate Codebase

### Task 5.1: Annotate Auth Module Files

**Files:**
- Modify: `apps/backoffice/lib/auth/*.ts`
- Modify: `apps/backoffice/app/(auth)/*.tsx`

**Step 1: Add file headers and JSDoc**

Add documentation headers to all auth-related files.

**Step 2: Add inline comments**

Explain key auth concepts.

**Step 3: Commit**

```bash
git add apps/backoffice/lib/auth apps/backoffice/app/(auth)
git commit -m "docs: annotate auth module with documentation

Add file headers, JSDoc, and inline comments explaining auth patterns.

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

### Task 5.2: Annotate RBAC Module Files

**Files:**
- Modify: `apps/backoffice/lib/rbac-*.ts`
- Modify: `apps/backoffice/lib/auth/permissions.ts`

**Step 1: Add RBAC documentation**

Explain permission checking, caching, and client-side usage.

**Step 2: Commit**

```bash
git add apps/backoffice/lib/rbac-*.ts apps/backoffice/lib/auth/permissions.ts
git commit -m "docs: annotate RBAC module with documentation

Explain permission system, caching strategy, and usage patterns.

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

### Task 5.3: Annotate File Upload Module

**Files:**
- Modify: `apps/backoffice/lib/file-upload/*.ts`
- Modify: `apps/backoffice/components/file-upload/*.tsx`

**Step 1: Add upload documentation**

Explain file handling, CDN integration, orphan cleanup.

**Step 2: Commit**

```bash
git add apps/backoffice/lib/file-upload apps/backoffice/components/file-upload
git commit -m "docs: annotate file upload module with documentation

Explain upload flow, storage, CDN, and cleanup patterns.

@pattern docs/patterns/file-uploads.md

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

### Task 5.4: Annotate Tasks Module Files

**Files:**
- Modify: All Tasks module files created in Phase 2

**Step 1: Add comprehensive documentation**

Each file gets full annotation with pattern references.

**Step 2: Commit**

```bash
git add apps/backoffice/app/api/tasks
git add apps/backoffice/app/(dashboard)/tasks
git add apps/backoffice/lib/services/task-service.ts
git add apps/backoffice/lib/validations/task.ts
git add apps/backoffice/components/admin/task-*.tsx
git commit -m "docs: annotate tasks module with comprehensive documentation

Every file includes:
- File header explaining purpose
- Pattern references
- JSDoc for all functions
- Inline comments for complex logic

This module serves as the primary example for all boilerplate patterns.

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

### Task 5.5: Annotate Shared Packages

**Files:**
- Modify: `packages/ui/src/**/*.tsx`
- Modify: `packages/api/src/**/*.ts`
- Modify: `packages/utils/src/**/*.ts`
- Modify: `packages/types/src/**/*.ts`
- Modify: `packages/hooks/src/**/*.ts`
- Modify: `packages/logger/src/**/*.ts`

**Step 1: Add package documentation**

Each package gets README and inline documentation.

**Step 2: Commit**

```bash
git add packages
git commit -m "docs: annotate shared packages with documentation

Add documentation to all shared packages explaining:
- Purpose and usage
- Export patterns
- Integration with apps

@pattern docs/patterns/components-packages.md

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## PHASE 6: Finalization

### Task 6.1: Update Environment Example

**Files:**
- Modify: `.env.example`

**Step 1: Update env example**

Ensure all required environment variables are documented with comments.

**Step 2: Commit**

```bash
git add .env.example
git commit -m "docs: update environment example with documentation

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

### Task 6.2: Create Verification Checklist

**Files:**
- Create: `docs/VERIFICATION.md`

**Step 1: Create verification checklist**

List of all things to verify before using the boilerplate.

**Step 2: Commit**

```bash
git add docs/VERIFICATION.md
git commit -m "docs: add boilerplate verification checklist

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

### Task 6.3: Final Review and Cleanup

**Files:**
- Various

**Step 1: Review all files**

Check for:
- No business-specific content remaining
- All placeholder branding applied
- Documentation is complete
- Code is annotated

**Step 2: Clean up unused files**

Remove any leftover files from removed modules.

**Step 3: Final commit**

```bash
git add .
git commit -m "chore: final boilerplate template cleanup

- Remove all business-specific content
- Apply placeholder branding throughout
- Complete documentation
- Annotate all code

Boilerplate template branch ready for use.

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

### Task 6.4: Push Template Branch

**Step 1: Push branch**

Run: `git push -u origin template`

**Step 2: Verify on remote**

Check that branch exists on GitHub/GitLab.

---

## Implementation Order Summary

1. **Preparation**: Create template branch
2. **Phase 1**: Remove all business modules (Services, News, Events, Gallery, Destinations)
3. **Phase 2**: Add Tasks example module (DB → API → UI)
4. **Phase 3**: Create boilerplate landing page
5. **Phase 4**: Create all documentation
6. **Phase 5**: Annotate entire codebase
7. **Phase 6**: Final cleanup and push

**Total estimated tasks**: ~60 tasks

---

## References

- Design doc: `docs/plans/2026-03-04-boilerplate-template-design.md`
- Tasks module: Demonstrates all boilerplate patterns
- Pattern docs: `docs/patterns/*.md`
