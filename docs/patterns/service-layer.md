# Service Layer Pattern

How to use the service layer abstraction for business logic.

## When to Use

Use the service layer when you need to:
- Separate business logic from API routes
- Reuse logic across multiple endpoints
- Test business logic independently
- Maintain complex operations
- Implement caching strategies

## Architecture

```
┌─────────────────────────────────────────┐
│         Service Layer Abstraction      │
│                                         │
│  API Route → Service Layer → Prisma    │
│     (Handler)   (Business)     (Data)  │
│                                         │
└─────────────────────────────────────────┘
```

## Implementation Steps

### 1. Create Service File

Create service files in `lib/services/`:

```typescript
// apps/backoffice/lib/services/user-service.ts

// Type definitions
export interface UserListParams {
  page?: number;
  pageSize?: number;
  search?: string;
  roleId?: string;
  status?: "active" | "inactive";
}

export interface CreateUserData {
  email: string;
  name: string;
  roleId: string;
  password?: string;
}

export interface UpdateUserData {
  email?: string;
  name?: string;
  roleId?: string;
  password?: string;
}

// Service functions
export async function getUsers(params: UserListParams) {
  const { page = 1, pageSize = 20, search, roleId, status } = params;

  const where = {
    ...(search && {
      OR: [
        { name: { contains: search, mode: "insensitive" as const } },
        { email: { contains: search, mode: "insensitive" as const } },
      ],
    }),
    ...(roleId && { roleId }),
    ...(status && { status }),
  };

  const [items, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        role: { select: { id: true, name: true } },
        status: true,
        createdAt: true,
        updatedAt: true,
      },
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

export async function getUserById(id: string) {
  return prisma.user.findUnique({
    where: { id },
    include: {
      role: {
        include: { permissions: true },
      },
    },
  });
}

export async function createUser(data: CreateUserData) {
  const hashedPassword = data.password
    ? await hash(data.password, 10)
    : null;

  return prisma.user.create({
    data: {
      email: data.email,
      name: data.name,
      roleId: data.roleId,
      ...(hashedPassword && { password: hashedPassword }),
    },
    include: { role: true },
  });
}

export async function updateUser(id: string, data: UpdateUserData) {
  const updateData: any = { ...data };

  if (data.password) {
    updateData.password = await hash(data.password, 10);
  }

  return prisma.user.update({
    where: { id },
    data: updateData,
    include: { role: true },
  });
}

export async function deleteUser(id: string) {
  return prisma.user.delete({
    where: { id },
  });
}

export async function getUserStats() {
  const [total, active, inactive] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { status: "active" } }),
    prisma.user.count({ where: { status: "inactive" } }),
  ]);

  return { total, active, inactive };
}
```

### 2. Use in API Routes

Consume the service layer in API routes:

```typescript
// apps/backoffice/app/api/users/route.ts
import { NextRequest, NextResponse } from "next/server";
import { requireAuth, requirePermission } from "@/lib/auth/permissions";
import { createUserSchema } from "@/lib/validations/user";
import { getUsers, createUser } from "@/lib/services/user-service";

export async function GET(request: NextRequest) {
  const session = await requireAuth();
  await requirePermission(session.user.id, "USER_READ_ANY");

  const { searchParams } = new URL(request.url);
  const result = await getUsers({
    page: parseInt(searchParams.get("page") || "1"),
    pageSize: parseInt(searchParams.get("pageSize") || "20"),
    search: searchParams.get("search") || undefined,
    roleId: searchParams.get("roleId") || undefined,
  });

  return NextResponse.json(result);
}

export async function POST(request: NextRequest) {
  const session = await requireAuth();
  await requirePermission(session.user.id, "USER_CREATE");

  const body = await request.json();
  const data = createUserSchema.parse(body);

  const user = await createUser(data);
  return NextResponse.json(user, { status: 201 });
}
```

### 3. Use in Server Components

Use services in server components:

```typescript
// apps/backoffice/app/(dashboard)/users/page.tsx
import { requireAuth } from "@/lib/auth/permissions";
import { getUsers, getUserStats } from "@/lib/services/user-service";
import { UsersList } from "./users-list";

export default async function UsersPage() {
  await requireAuth();

  const [users, stats] = await Promise.all([
    getUsers({ page: 1, pageSize: 20 }),
    getUserStats(),
  ]);

  return <UsersList users={users} stats={stats} />;
}
```

### 4. Activity Logging Integration

Add activity logging to service functions:

```typescript
// apps/backoffice/lib/services/user-service.ts
import { logActivity } from "@/lib/activity-logs/logger";

export async function updateUser(id: string, data: UpdateUserData) {
  const existing = await prisma.user.findUnique({ where: { id } });
  if (!existing) throw new Error("User not found");

  const changes: Record<string, unknown> = {};
  if (data.name && data.name !== existing.name) {
    changes.name = { from: existing.name, to: data.name };
  }
  if (data.roleId && data.roleId !== existing.roleId) {
    changes.role = { from: existing.roleId, to: data.roleId };
  }

  const user = await prisma.user.update({
    where: { id },
    data,
    include: { role: true },
  });

  // Log activity
  await logActivity({
    action: "USER_UPDATED",
    entityType: "user",
    entityId: id,
    changes,
  });

  return user;
}
```

## Examples from Tasks Module

The Tasks module demonstrates the service layer pattern:

```
apps/backoffice/lib/services/
└── task-service.ts
    ├── Type definitions
    ├── Mock data
    ├── CRUD operations
    ├── Bulk operations
    ├── Comments
    ├── Activity logging
    └── Statistics
```

Key patterns from the Tasks module:

1. **Clear Type Definitions**: Export all types for reuse
2. **Pagination Support**: Consistent pagination across services
3. **Filtering**: Standard filter parameters
4. **Activity Logging**: Track all mutations
5. **Bulk Operations**: Efficient batch updates

## Service Layer Patterns

### Pagination Pattern

```typescript
export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export async function getPaginatedData<T>(
  params: { page?: number; pageSize?: number },
  query: (skip: number, take: number) => Promise<T[]>
): Promise<PaginatedResult<T>> {
  const { page = 1, pageSize = 20 } = params;
  const skip = (page - 1) * pageSize;

  const [items, total] = await Promise.all([
    query(skip, pageSize),
    prisma.model.count(),
  ]);

  return {
    items,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}
```

### Transaction Pattern

```typescript
export async function transferOwnership(
  fromUserId: string,
  toUserId: string,
  entityId: string
) {
  return prisma.$transaction(async (tx) => {
    // Update entity
    const entity = await tx.entity.update({
      where: { id: entityId },
      data: { ownerId: toUserId },
    });

    // Log activity
    await tx.activityLog.create({
      data: {
        action: "OWNERSHIP_TRANSFERRED",
        entityType: "entity",
        entityId,
        changes: { from: fromUserId, to: toUserId },
      },
    });

    // Send notification
    await tx.notification.create({
      data: {
        userId: toUserId,
        type: "ENTITY_RECEIVED",
        entityId,
      },
    });

    return entity;
  });
}
```

### Cache Pattern

```typescript
export async function getCachedUser(id: string) {
  const cacheKey = `user:${id}`;

  // Check cache
  const cached = await cache.get(cacheKey);
  if (cached) return JSON.parse(cached);

  // Fetch from DB
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) return null;

  // Set cache
  await cache.set(cacheKey, JSON.stringify(user), 3600);

  return user;
}

export async function invalidateUserCache(id: string) {
  await cache.del(`user:${id}`);
}
```

### Soft Delete Pattern

```typescript
export async function softDeleteUser(id: string) {
  return prisma.user.update({
    where: { id },
    data: {
      deletedAt: new Date(),
      status: "inactive",
    },
  });
}

export async function restoreUser(id: string) {
  return prisma.user.update({
    where: { id },
    data: {
      deletedAt: null,
      status: "active",
    },
  });
}
```

## Testing Services

Test services independently:

```typescript
// __tests__/services/user-service.test.ts
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { getUsers, createUser } from "@/lib/services/user-service";
import { prisma } from "@/lib/db/prisma";

describe("User Service", () => {
  beforeEach(async () => {
    await prisma.user.deleteMany();
  });

  afterEach(async () => {
    await prisma.user.deleteMany();
  });

  it("should return paginated users", async () => {
    // Create test data
    await createUser({ email: "test@example.com", name: "Test", roleId: "role-1" });
    await createUser({ email: "test2@example.com", name: "Test2", roleId: "role-1" });

    // Test service
    const result = await getUsers({ page: 1, pageSize: 10 });

    expect(result.items).toHaveLength(2);
    expect(result.total).toBe(2);
    expect(result.totalPages).toBe(1);
  });
});
```

## Best Practices

1. **Single Responsibility**: Each service handles one entity
2. **Validation**: Validate inputs in service layer
3. **Error Handling**: Throw meaningful errors
4. **Type Safety**: Export all types
5. **Transactions**: Use transactions for multi-step operations
6. **Logging**: Log important operations
7. **Testing**: Services should be easily testable

## See Also

- [API Routes](/docs/patterns/api-routes) - Using services in API routes
- [Activity Logs](/docs/patterns/activity-logs) - Logging service operations
- [Validation](/docs/patterns/validation) - Validating service inputs
