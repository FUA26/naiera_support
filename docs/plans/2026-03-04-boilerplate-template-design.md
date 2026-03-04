# Boilerplate Template Branch Design

**Date:** 2026-03-04
**Status:** Approved
**Goal:** Create a well-documented template branch that serves as a standard starting point for future projects

## Overview

Transform the current project into a comprehensive boilerplate by creating a `template` branch with:
1. Complete documentation covering all patterns
2. Annotated codebase with JSDoc and pattern references
3. Example module demonstrating all patterns
4. Professional boilerplate landing page
5. Progressive path: branch → repository → generator

---

## Design Philosophy

**"A well-documented pattern library, not just code"**

Every file serves as documentation. Every pattern is explained, annotated, and demonstrated through the Tasks example module.

---

## Documentation Structure

```
docs/
├── README.md                      # Documentation index and navigation
├── getting-started/
│   ├── installation.md            # Setup, prerequisites, env config
│   ├── configuration.md           # All environment variables explained
│   └── running-locally.md         # Dev server, build, test commands
├── architecture/
│   ├── overview.md                # High-level system architecture
│   ├── monorepo-structure.md      # Folder structure explained
│   ├── technology-stack.md        # All dependencies and rationale
│   └── data-flow.md               # How data moves through the system
├── patterns/
│   ├── api-routes.md              # API route patterns (auth, permissions, validation)
│   ├── pages-permissions.md       # Page + RBAC integration patterns
│   ├── components-packages.md     # Shared component/package patterns
│   ├── database-migrations.md     # Prisma schema and migration patterns
│   ├── file-uploads.md            # File upload and CDN patterns
│   ├── validation.md              # Zod validation patterns
│   ├── revalidation.md            # ISR cache revalidation patterns
│   ├── service-layer.md           # Service layer abstraction patterns
│   └── activity-logs.md           # Activity logging patterns
├── customization/
│   ├── branding.md                # Logo, colors, names, meta tags
│   ├── adding-modules.md          # Creating new feature modules
│   ├── removing-features.md       # Safely removing unused features
│   └── package-renaming.md        # @workspace to @yourbrand
└── deployment/
    ├── docker.md                  # Docker deployment guide
    ├── vercel.md                  # Vercel deployment guide
    └── custom-server.md           # Custom VPS deployment
```

---

## Code Annotation Standards

### File Header

Every source file includes:
```typescript
/**
 * Module Name - File Purpose
 *
 * Context: What this file does in the system
 * Dependencies: What it requires
 * Side effects: What it affects
 *
 * @pattern docs/patterns/relevant-pattern.md
 * @see docs/patterns/related-pattern.md
 */
```

### Function JSDoc

```typescript
/**
 * Creates a new task with activity logging
 *
 * @param data - Task data from validated request
 * @param userId - ID of user creating the task
 * @returns Created task with relations
 *
 * @pattern docs/patterns/service-layer.md
 * @example
 * ```ts
 * const task = await createTask({
 *   title: "Fix bug",
 *   status: "TODO"
 * }, userId)
 * ```
 */
```

### Inline Comments

Explain **why**, not just **what**:
```typescript
// Use transaction to ensure task and activity log are created atomically
await prisma.$transaction([...])
```

---

## Example Module: Tasks/Tickets

### Why Tasks?

Demonstrates all key patterns:
- ✅ CRUD operations
- ✅ Status workflows (todo → in_progress → done → archived)
- ✅ User assignments (many-to-many)
- ✅ Categories (many-to-one)
- ✅ Tags (many-to-many)
- ✅ Comments/Activity log
- ✅ Priority levels
- ✅ File attachments
- ✅ Full RBAC integration
- ✅ ISR revalidation

### Module Structure

```
apps/backoffice/
├── app/api/tasks/
│   ├── route.ts                    # LIST, CREATE pattern
│   ├── [id]/route.ts               # GET, UPDATE, DELETE pattern
│   ├── [id]/status/route.ts        # Status transition pattern
│   ├── [id]/assign/route.ts        # Assignment pattern
│   ├── [id]/comments/route.ts      # Nested resource pattern
│   ├── [id]/logs/route.ts          # Activity log pattern
│   └── reorder/route.ts            # Bulk reorder pattern
├── app/(dashboard)/tasks/
│   ├── page.tsx                    # Server component pattern
│   └── tasks-client.tsx            # Client component pattern
├── prisma/
│   └── schema.prisma               # Task model with all relations
├── lib/
│   ├── validations/task.ts         # Zod schemas
│   └── services/task-service.ts    # Service layer
└── components/admin/
    ├── tasks-data-table.tsx        # Table with filters, pagination
    ├── task-dialog.tsx             # Create/edit form dialog
    ├── task-assign-dialog.tsx      # Assignment dialog
    └── task-comments-panel.tsx     # Comments panel
```

---

## Database Schema (Tasks)

```prisma
// Status workflow
enum TaskStatus {
  TODO
  IN_PROGRESS
  REVIEW
  DONE
  ARCHIVED
}

// Priority levels
enum TaskPriority {
  LOW
  MEDIUM
  HIGH
  URGENT
}

// Task categories
model TaskCategory {
  id        String   @id @default(cuid())
  name      String
  slug      String   @unique
  color     String   @default("primary")
  order     Int      @default(0)
  tasks     Task[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

// Tags for tasks
model TaskTag {
  id        String           @id @default(cuid())
  name      String           @unique
  slug      String           @unique
  tasks     TaskTagRelation[]
  createdAt DateTime         @default(now())
}

// Tasks
model Task {
  id          String      @id @default(cuid())
  slug        String      @unique
  title       String
  description String?

  categoryId  String?
  category    TaskCategory? @relation(fields: [categoryId], references: [id])

  status      TaskStatus  @default(TODO)
  priority    TaskPriority @default(MEDIUM)

  dueDate     DateTime?
  completedAt DateTime?

  // Assignments (many users can be assigned)
  assignees   TaskAssignment[]

  // Attachments
  attachments TaskAttachment[]

  // Tracking
  views       Int         @default(0)

  // Audit
  createdById String
  createdBy   User        @relation("TaskCreator", fields: [createdById], references: [id])
  updatedById String?
  updatedBy   User?       @relation("TaskUpdater", fields: [updatedById], references: [id])

  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt

  tags        TaskTagRelation[]
  comments    TaskComment[]
  activityLogs TaskActivityLog[]

  @@index([categoryId])
  @@index([status])
  @@index([priority])
  @@index([dueDate])
  @@index([slug])
}

// Many-to-many: Task ↔ User assignments
model TaskAssignment {
  taskId String
  task   Task   @relation(fields: [taskId], references: [id], onDelete: Cascade)
  userId String
  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)
  assignedAt DateTime @default(now())

  @@id([taskId, userId])
}

// Many-to-many: Task ↔ Tag
model TaskTagRelation {
  taskId String
  task   Task   @relation(fields: [taskId], references: [id], onDelete: Cascade)
  tagId  String
  tag    TaskTag @relation(fields: [tagId], references: [id], onDelete: Cascade)

  @@id([taskId, tagId])
}

// File attachments
model TaskAttachment {
  id        String   @id @default(cuid())
  taskId    String
  task      Task     @relation(fields: [taskId], references: [id], onDelete: Cascade)
  fileId    String
  file      File     @relation(fields: [fileId], references: [id], onDelete: Cascade)
  fileName  String
  createdAt DateTime @default(now())

  @@index([taskId])
}

// Comments
model TaskComment {
  id        String   @id @default(cuid())
  taskId    String
  task      Task     @relation(fields: [taskId], references: [id], onDelete: Cascade)
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  content   String   @db.Text
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([taskId])
}

// Activity log
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

---

## Permissions (Tasks)

Add to `prisma/seed-permissions.ts`:

```typescript
// Task Management
{ name: "TASKS_VIEW", category: "TASKS", description: "View tasks" },
{ name: "TASKS_CREATE", category: "TASKS", description: "Create new tasks" },
{ name: "TASKS_EDIT", category: "TASKS", description: "Edit tasks" },
{ name: "TASKS_DELETE", category: "TASKS", description: "Delete tasks" },
{ name: "TASKS_ASSIGN", category: "TASKS", description: "Assign users to tasks" },
{ name: "TASKS_COMMENT", category: "TASKS", description: "Add comments to tasks" },
{ name: "TASKS_REORDER", category: "TASKS", description: "Reorder tasks" },
{ name: "TASK_CATEGORIES_MANAGE", category: "TASKS", description: "Manage task categories" },
{ name: "TASKS_DELETE_ANY", category: "TASKS", description: "Delete any task (not just own)" },
```

---

## Landing Page (Boilerplate)

### Sections

1. **Hero**
   - Title: "YourBrand"
   - Subtitle: "Enterprise Next.js Boilerplate"
   - CTA: "Get Started" / "View Docs"

2. **Features**
   - Auth & RBAC
   - File Uploads
   - ISR Caching
   - Activity Logging
   - Responsive UI
   - Type Safe

3. **Architecture**
   - Visual diagram of monorepo structure
   - Tech stack badges

4. **Quick Start**
   ```bash
   git clone your-repo
   cd project
   pnpm install
   pnpm dev
   ```

5. **Pattern Docs**
   - Links to all pattern guides
   - "See Tasks module for live examples"

6. **CTA**
   - GitHub link
   - Documentation link

---

## What Gets Cleaned Up

### Removed Entirely
- ❌ `apps/docs/` - Replaced with markdown docs
- ❌ Analytics dashboards
- ❌ Services management module
- ❌ News management module
- ❌ Events management module
- ❌ Gallery management module
- ❌ Destinations management module

### Replaced
- 🔄 Landing page → Boilerplate landing
- 🔄 Business modules → Tasks example module

### Kept & Documented
- ✅ Auth system (users, sessions, verification)
- ✅ RBAC system (roles, permissions, caching)
- ✅ File upload system (storage, CDN, orphan cleanup)
- ✅ System settings (site config, branding)
- ✅ Shared packages (ui, api, utils, types, hooks, logger)
- ✅ Backoffice UI framework (layouts, sidebar, components)

---

## Progressive Roadmap

### Phase 1: Template Branch (Current)
- Create `template` branch
- Clean up unnecessary modules
- Add Tasks example module
- Create all documentation
- Annotate codebase
- **Deliverable:** Well-documented branch

### Phase 2: Template Repository
- Fork/cleanup to separate repository
- Remove project-specific git history
- Professional README
- Contributing guidelines
- License
- **Deliverable:** Standalone template repo

### Phase 3: Project Generator
- CLI tool (e.g., `npx create-yourbrand-app`)
- Interactive prompts
- Select features to include
- Scaffold new projects
- **Deliverable:** `create-yourbrand-app` package

---

## Success Criteria

1. **Documentation**
   - Every pattern documented with examples
   - Every file annotated with purpose
   - New developer can onboard in < 1 hour

2. **Code Quality**
   - No unused/undocumented code
   - All patterns demonstrated in Tasks module
   - Consistent naming and structure

3. **Usability**
   - Can start new project in < 5 minutes
   - Clear customization path
   - Working example out of the box

---

## File Tree (Template Branch)

```
bandanaiera-template/
├── apps/
│   ├── backoffice/              # Admin dashboard
│   │   ├── app/
│   │   │   ├── (auth)/          # Auth pages
│   │   │   ├── (dashboard)/     # Main dashboard
│   │   │   │   ├── dashboard/   # Dashboard home
│   │   │   │   ├── users/       # User management
│   │   │   │   ├── roles/       # Role management
│   │   │   │   ├── files/       # File management
│   │   │   │   ├── settings/    # System settings
│   │   │   │   └── tasks/       # EXAMPLE MODULE
│   │   │   ├── api/             # API routes
│   │   │   └── (support)/       # Support pages
│   │   ├── components/
│   │   │   ├── admin/           # Admin-specific components
│   │   │   ├── dashboard/       # Layout components
│   │   │   ├── ui/              # Shared UI (shadcn)
│   │   │   └── file-upload/     # File upload components
│   │   ├── lib/
│   │   │   ├── auth/            # Auth configuration
│   │   │   ├── db/              # Database client
│   │   │   ├── services/        # Service layer
│   │   │   ├── validations/     # Zod schemas
│   │   │   └── rbac-client/     # Client-side RBAC
│   │   └── prisma/
│   │       ├── schema.prisma    # Database schema
│   │       └── seed-permissions.ts
│   └── landing/                 # Boilerplate landing
│       ├── app/
│       │   ├── page.tsx         # Hero
│       │   ├── features/        # Features showcase
│       │   ├── quick-start/     # Setup commands
│       │   └── architecture/    # Architecture diagram
│       └── components/
│           └── landing/         # Landing components
├── packages/
│   ├── ui/                      # Shared UI components
│   ├── api/                     # API client
│   ├── utils/                   # Utilities
│   ├── types/                   # TypeScript types
│   ├── hooks/                   # React hooks
│   ├── logger/                  # Logging utility
│   ├── eslint-config/           # ESLint config
│   ├── tailwind-config/         # Tailwind config
│   └── typescript-config/       # TypeScript config
├── docs/                        # DOCUMENTATION
│   ├── README.md
│   ├── getting-started/
│   ├── architecture/
│   ├── patterns/
│   ├── customization/
│   └── deployment/
├── .env.example
├── package.json
├── pnpm-workspace.yaml
├── turbo.json
├── tsconfig.json
├── README.md                    # Main README
└── BOILERPLATE.md              # Boilerplate overview
```

---

## Implementation Order

1. Create `template` branch
2. Remove business modules (Services, News, Events, Gallery, Destinations)
3. Remove docs app
4. Create Tasks example module (database → API → UI)
5. Create boilerplate landing page
6. Write all documentation files
7. Annotate all code files
8. Test complete flow
9. Finalize and push branch
