# API Routes Pattern

Standard patterns for creating and managing API routes in the boilerplate.

## When to Use

Use API routes when you need to:
- Handle form submissions from client components
- Provide data for client-side fetching
- Implement webhooks or third-party integrations
- Handle file uploads with presigned URLs

## Architecture

```
┌─────────────────────────────────────────┐
│              API Route                   │
│  ┌───────────────────────────────────┐  │
│  │  1. Authentication Check         │  │
│  │  2. Permission Check             │  │
│  │  3. Input Validation (Zod)       │  │
│  │  4. Business Logic (Service)     │  │
│  │  5. Response Formatting          │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

## Implementation Steps

### 1. Create Validation Schema

First, define the input validation schema:

```typescript
// apps/backoffice/lib/validations/user.ts
import { z } from "zod";

export const createUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2).max(100),
  roleId: z.string().cuid(),
});

export const updateUserSchema = createUserSchema.partial();

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
```

### 2. Create Service Layer

Implement business logic in the service layer:

```typescript
// apps/backoffice/lib/services/user-service.ts
import { prisma } from "@/lib/db/prisma";
import type { CreateUserInput, UpdateUserInput } from "@/lib/validations/user";

export async function getUsers(params: {
  page?: number;
  pageSize?: number;
  search?: string;
}) {
  const { page = 1, pageSize = 20, search } = params;

  const where = search
    ? {
        OR: [
          { name: { contains: search, mode: "insensitive" as const } },
          { email: { contains: search, mode: "insensitive" as const } },
        ],
      }
    : {};

  const [items, total] = await Promise.all([
    prisma.user.findMany({
      where,
      include: { role: true },
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { createdAt: "desc" },
    }),
    prisma.user.count({ where }),
  ]);

  return {
    items,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

export async function createUser(data: CreateUserInput) {
  return prisma.user.create({
    data,
    include: { role: true },
  });
}

export async function updateUser(id: string, data: UpdateUserInput) {
  return prisma.user.update({
    where: { id },
    data,
    include: { role: true },
  });
}

export async function deleteUser(id: string) {
  return prisma.user.delete({
    where: { id },
  });
}
```

### 3. Create API Route

Implement the API route with auth, permissions, and validation:

```typescript
// apps/backoffice/app/api/users/route.ts
import { NextRequest, NextResponse } from "next/server";
import { requireAuth, requirePermission } from "@/lib/auth/permissions";
import { createUserSchema } from "@/lib/validations/user";
import { createUser, getUsers } from "@/lib/services/user-service";

// GET /api/users - List users
export async function GET(request: NextRequest) {
  try {
    // 1. Authentication
    const session = await requireAuth();

    // 2. Permission check
    await requirePermission(session.user.id, "USER_READ_ANY");

    // 3. Parse query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "20");
    const search = searchParams.get("search") || undefined;

    // 4. Call service layer
    const result = await getUsers({ page, pageSize, search });

    // 5. Return response
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: error.message.includes("Unauthorized") ? 401 : 403 }
      );
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/users - Create user
export async function POST(request: NextRequest) {
  try {
    // 1. Authentication
    const session = await requireAuth();

    // 2. Permission check
    await requirePermission(session.user.id, "USER_CREATE");

    // 3. Validate input
    const body = await request.json();
    const validatedData = createUserSchema.parse(body);

    // 4. Call service layer
    const user = await createUser(validatedData);

    // 5. Return response
    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: error.message.includes("Unauthorized") ? 401 : 400 }
      );
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
```

### 4. Create Single Item Route

For individual item operations:

```typescript
// apps/backoffice/app/api/users/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { requireAuth, requirePermission } from "@/lib/auth/permissions";
import { updateUserSchema } from "@/lib/validations/user";
import { getUserById, updateUser, deleteUser } from "@/lib/services/user-service";

// GET /api/users/[id] - Get single user
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAuth();
    await requirePermission(session.user.id, "USER_READ_ANY");

    const user = await getUserById(params.id);
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PATCH /api/users/[id] - Update user
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAuth();
    await requirePermission(session.user.id, "USER_UPDATE_ANY");

    const body = await request.json();
    const validatedData = updateUserSchema.parse(body);

    const user = await updateUser(params.id, validatedData);
    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/users/[id] - Delete user
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAuth();
    await requirePermission(session.user.id, "USER_DELETE_ANY");

    await deleteUser(params.id);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
```

## Examples from Tasks Module

The Tasks module demonstrates these patterns:

```
apps/backoffice/app/api/tasks/
├── route.ts              # List and create tasks
├── [id]/
│   ├── route.ts          # Get, update, delete task
│   ├── comments/
│   │   └── route.ts      # Task comments
│   └── activity/
│       └── route.ts      # Task activity log
├── bulk/
│   └── route.ts          # Bulk operations
└── public/
    └── route.ts          # Public task list
```

## Variations

### Public Routes (No Auth)

```typescript
export async function GET(request: NextRequest) {
  // No auth required
  const items = await getPublicItems();
  return NextResponse.json(items);
}
```

### Optional Auth

```typescript
export async function GET(request: NextRequest) {
  const session = await auth(); // May be null
  const items = await getItems(session?.user?.id);
  return NextResponse.json(items);
}
```

### File Upload Routes

See [File Uploads Pattern](/docs/patterns/file-uploads)

### Bulk Operations

```typescript
// apps/backoffice/app/api/users/bulk/route.ts
export async function POST(request: NextRequest) {
  const session = await requireAuth();
  await requirePermission(session.user.id, "USER_UPDATE_ANY");

  const { ids, action, data } = await request.json();

  const results = await Promise.allSettled(
    ids.map(id => updateUser(id, data))
  );

  return NextResponse.json({
    success: results.filter(r => r.status === 'fulfilled').length,
    failed: results.filter(r => r.status === 'rejected').length,
  });
}
```

## Error Handling

Standard error response format:

```typescript
// Validation error (400)
return NextResponse.json(
  {
    error: "Validation failed",
    details: error.errors, // Zod errors
  },
  { status: 400 }
);

// Unauthorized (401)
return NextResponse.json(
  { error: "Authentication required" },
  { status: 401 }
);

// Forbidden (403)
return NextResponse.json(
  { error: "Insufficient permissions" },
  { status: 403 }
);

// Not found (404)
return NextResponse.json(
  { error: "Resource not found" },
  { status: 404 }
);

// Server error (500)
return NextResponse.json(
  { error: "Internal server error" },
  { status: 500 }
);
```

## Revalidation

After mutations, revalidate cached paths:

```typescript
import { revalidatePath } from "next/cache";

export async function POST(request: NextRequest) {
  // ... create/update logic

  // Revalidate cache
  revalidatePath("/users");
  revalidatePath(`/users/${id}`);

  return NextResponse.json(result);
}
```

## See Also

- [Service Layer](/docs/patterns/service-layer) - Business logic abstraction
- [Validation](/docs/patterns/validation) - Zod validation patterns
- [Pages + Permissions](/docs/patterns/pages-permissions) - Page-level protection
