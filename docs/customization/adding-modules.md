# Adding Modules

How to add new features and modules to the boilerplate.

## Overview

This guide walks through adding a new module using the Tasks module as a reference implementation.

## Module Structure

A complete module typically includes:

```
apps/backoffice/
├── app/(dashboard)/your-module/
│   ├── page.tsx                    # List view
│   ├── [id]/
│   │   ├── page.tsx                # Detail view
│   │   └── edit/
│   │       └── page.tsx            # Edit form
│   └── components/                 # Module-specific components
├── app/api/your-module/
│   ├── route.ts                    # List & create
│   ├── [id]/
│   │   └── route.ts                # Get, update, delete
│   └── bulk/
│       └── route.ts                # Bulk operations
├── lib/validations/your-module.ts   # Zod schemas
├── lib/services/your-module.ts      # Service layer
└── components/dashboard/            # Shared components
```

## Step-by-Step Guide

### 1. Define Database Schema

Add your models to `prisma/schema.prisma`:

```prisma
model Project {
  id          String   @id @default(cuid())
  name        String
  description String?
  status      ProjectStatus @default(PLANNING)
  startDate   DateTime?
  endDate     DateTime?
  ownerId     String
  owner       User     @relation(fields: [ownerId], references: [id])
  members     ProjectMember[]
  tasks       Task[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([ownerId])
  @@index([status])
}

model ProjectMember {
  id        String   @id @default(cuid())
  projectId String
  project   Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  role      ProjectMemberRole @default(MEMBER)
  joinedAt  DateTime @default(now())

  @@unique([projectId, userId])
  @@index([projectId])
  @@index([userId])
}

enum ProjectStatus {
  PLANNING
  ACTIVE
  ON_HOLD
  COMPLETED
  CANCELLED
}

enum ProjectMemberRole {
  OWNER
  ADMIN
  MEMBER
  VIEWER
}
```

### 2. Create Migration

```bash
pnpm --filter backoffice db:push
```

### 3. Define Permissions

Add permissions to the roles:

```typescript
// apps/backoffice/lib/rbac/permissions.ts
export const PROJECT_PERMISSIONS = [
  "PROJECT_READ_OWN",
  "PROJECT_READ_ANY",
  "PROJECT_CREATE",
  "PROJECT_UPDATE_OWN",
  "PROJECT_UPDATE_ANY",
  "PROJECT_DELETE_OWN",
  "PROJECT_DELETE_ANY",
  "PROJECT_MEMBERS_MANAGE",
] as const;
```

### 4. Create Validation Schemas

```typescript
// apps/backoffice/lib/validations/project.ts
import { z } from "zod";

export const createProjectSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(5000).optional(),
  status: z.enum(["PLANNING", "ACTIVE", "ON_HOLD", "COMPLETED", "CANCELLED"]).optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  memberIds: z.array(z.string().cuid()).default([]),
});

export const updateProjectSchema = createProjectSchema.partial();

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
```

### 5. Create Service Layer

```typescript
// apps/backoffice/lib/services/project-service.ts
import { prisma } from "@/lib/db/prisma";
import type { CreateProjectInput, UpdateProjectInput } from "@/lib/validations/project";

export async function getProjects(params: {
  page?: number;
  pageSize?: number;
  status?: string;
  search?: string;
}) {
  const { page = 1, pageSize = 20, status, search } = params;

  const where = {
    ...(status && { status }),
    ...(search && {
      OR: [
        { name: { contains: search, mode: "insensitive" as const } },
        { description: { contains: search, mode: "insensitive" as const } },
      ],
    }),
  };

  const [items, total] = await Promise.all([
    prisma.project.findMany({
      where,
      include: { owner: true, members: { include: { user: true } } },
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { createdAt: "desc" },
    }),
    prisma.project.count({ where }),
  ]);

  return { items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
}

export async function getProjectById(id: string) {
  return prisma.project.findUnique({
    where: { id },
    include: { owner: true, members: { include: { user: true } } },
  });
}

export async function createProject(userId: string, data: CreateProjectInput) {
  return prisma.project.create({
    data: {
      ...data,
      ownerId: userId,
      members: {
        create: {
          userId,
          role: "OWNER",
        },
      },
    },
    include: { owner: true, members: { include: { user: true } } },
  });
}

export async function updateProject(id: string, data: UpdateProjectInput) {
  return prisma.project.update({
    where: { id },
    data,
    include: { owner: true, members: { include: { user: true } } },
  });
}

export async function deleteProject(id: string) {
  return prisma.project.delete({
    where: { id },
  });
}
```

### 6. Create API Routes

```typescript
// apps/backoffice/app/api/projects/route.ts
import { NextRequest, NextResponse } from "next/server";
import { requireAuth, requirePermission } from "@/lib/auth/permissions";
import { createProjectSchema } from "@/lib/validations/project";
import * as projectService from "@/lib/services/project-service";

export async function GET(request: NextRequest) {
  const session = await requireAuth();
  await requirePermission(session.user.id, "PROJECT_READ_ANY");

  const { searchParams } = new URL(request.url);
  const result = await projectService.getProjects({
    page: parseInt(searchParams.get("page") || "1"),
    pageSize: parseInt(searchParams.get("pageSize") || "20"),
    status: searchParams.get("status") || undefined,
    search: searchParams.get("search") || undefined,
  });

  return NextResponse.json(result);
}

export async function POST(request: NextRequest) {
  const session = await requireAuth();
  await requirePermission(session.user.id, "PROJECT_CREATE");

  const body = await request.json();
  const data = createProjectSchema.parse(body);

  const project = await projectService.createProject(session.user.id, data);
  return NextResponse.json(project, { status: 201 });
}
```

### 7. Create Pages

```typescript
// apps/backoffice/app/(dashboard)/projects/page.tsx
import { requireAuth } from "@/lib/auth/permissions";
import { getProjects } from "@/lib/services/project-service";
import { ProjectsList } from "./projects-list";

export default async function ProjectsPage() {
  const session = await requireAuth();
  const projects = await getProjects({ page: 1, pageSize: 20 });

  return <ProjectsList initialData={projects} />;
}
```

### 8. Create UI Components

```typescript
// apps/backoffice/app/(dashboard)/projects/projects-list.tsx
"use client";

import { useQuery } from "@tanstack/react-query";
import { Button } from "@workspace/ui";

export function ProjectsList({ initialData }: { initialData: any }) {
  const { data } = useQuery({
    queryKey: ["projects"],
    queryFn: () => fetch("/api/projects").then((res) => res.json()),
    initialData,
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Projects</h1>
        <Button>Create Project</Button>
      </div>

      <div className="grid gap-4">
        {data.items.map((project: any) => (
          <div key={project.id} className="border rounded-lg p-4">
            <h3 className="font-semibold">{project.name}</h3>
            <p className="text-muted-foreground">{project.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
```

### 9. Add Navigation Item

Update the sidebar navigation:

```typescript
// apps/backoffice/components/dashboard/sidebar/sidebar-nav.tsx
export const navItems = [
  // ... existing items
  {
    title: "Projects",
    href: "/projects",
    icon: FolderKanban,
    permission: "PROJECT_READ_ANY",
  },
];
```

### 10. Add to Search (Optional)

If using global search, add your module:

```typescript
// apps/backoffice/lib/search/index.ts
export const searchIndexes = [
  // ... existing indexes
  {
    name: "projects",
    schema: projectsSearchSchema,
  },
];
```

## Module Checklist

- [ ] Define Prisma models
- [ ] Create and run migration
- [ ] Add permissions
- [ ] Create validation schemas
- [ ] Implement service layer
- [ ] Create API routes
- [ ] Build list page
- [ ] Build detail page
- [ ] Build create/edit forms
- [ ] Add navigation items
- [ ] Add activity logging
- [ ] Add tests (optional)

## Patterns to Follow

Reference the Tasks module (`apps/backoffice/app/(dashboard)/tasks/`) for:
- List view with filtering
- Detail view with tabs
- Edit forms with validation
- Activity logging
- Comments system
- Bulk operations

## See Also

- [Service Layer](/docs/patterns/service-layer) - Business logic patterns
- [API Routes](/docs/patterns/api-routes) - Endpoint patterns
- [Validation](/docs/patterns/validation) - Input validation
- [Removing Features](/docs/customization/removing-features) - Removing unused modules
