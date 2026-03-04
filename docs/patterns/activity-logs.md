# Activity Logs Pattern

How to implement activity logging for audit trails.

## When to Use

Use activity logging when you need to:
- Track user actions for compliance
- Debug issues by reviewing history
- Implement audit trails
- Monitor system activity
- Provide activity feeds

## Architecture

```
┌─────────────────────────────────────────┐
│         Activity Logging Flow           │
│                                         │
│  User Action → Service Layer → Log     │
│      (Create, Update, Delete)           │
│                                         │
│  Log → Database → Activity Feed         │
│                                         │
└─────────────────────────────────────────┘
```

## Implementation Steps

### 1. Define Activity Schema

```prisma
// prisma/schema.prisma
model ActivityLog {
  id          String   @id @default(cuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id])
  action      String   // CREATED, UPDATED, DELETED, etc.
  entityType  String?  // User, Task, Post, etc.
  entityId    String?  // ID of the affected entity
  changes     Json?    // { from: "old", to: "new" }
  metadata    Json?    // Additional context
  ipAddress   String?
  userAgent   String?
  createdAt   DateTime @default(now())

  @@index([userId])
  @@index([entityType, entityId])
  @@index([createdAt])
}
```

### 2. Create Activity Logger

```typescript
// apps/backoffice/lib/activity-logs/logger.ts
import { prisma } from "@/lib/db/prisma";
import type { ActivityLog } from "@prisma/client";

interface LogActivityParams {
  userId: string;
  action: string;
  entityType?: string;
  entityId?: string;
  changes?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}

export async function logActivity(params: LogActivityParams): Promise<ActivityLog> {
  return prisma.activityLog.create({
    data: {
      userId: params.userId,
      action: params.action,
      entityType: params.entityType,
      entityId: params.entityId,
      changes: params.changes,
      metadata: params.metadata,
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
    },
  });
}

export async function logEntityChange(
  userId: string,
  action: string,
  entityType: string,
  entityId: string,
  changes?: Record<string, unknown>
): Promise<ActivityLog> {
  return logActivity({
    userId,
    action,
    entityType,
    entityId,
    changes,
  });
}
```

### 3. Integrate with Service Layer

```typescript
// apps/backoffice/lib/services/user-service.ts
import { logEntityChange } from "@/lib/activity-logs/logger";
import { hash } from "bcrypt";

export async function createUser(data: CreateUserData) {
  const hashedPassword = data.password
    ? await hash(data.password, 10)
    : null;

  const user = await prisma.user.create({
    data: {
      email: data.email,
      name: data.name,
      roleId: data.roleId,
      ...(hashedPassword && { password: hashedPassword }),
    },
    include: { role: true },
  });

  // Log activity
  await logEntityChange(
    data.createdBy || user.id,
    "USER_CREATED",
    "user",
    user.id,
    { email: user.email, name: user.name }
  );

  return user;
}

export async function updateUser(id: string, data: UpdateUserData, updatedBy: string) {
  const existing = await prisma.user.findUnique({ where: { id } });
  if (!existing) throw new Error("User not found");

  const changes: Record<string, unknown> = {};

  // Track changes
  if (data.name && data.name !== existing.name) {
    changes.name = { from: existing.name, to: data.name };
  }
  if (data.email && data.email !== existing.email) {
    changes.email = { from: existing.email, to: data.email };
  }
  if (data.roleId && data.roleId !== existing.roleId) {
    changes.roleId = { from: existing.roleId, to: data.roleId };
  }

  const user = await prisma.user.update({
    where: { id },
    data: {
      ...(data.name && { name: data.name }),
      ...(data.email && { email: data.email }),
      ...(data.roleId && { roleId: data.roleId }),
      ...(data.password && { password: await hash(data.password, 10) }),
    },
    include: { role: true },
  });

  // Log activity if there are changes
  if (Object.keys(changes).length > 0) {
    await logEntityChange(updatedBy, "USER_UPDATED", "user", id, changes);
  }

  return user;
}

export async function deleteUser(id: string, deletedBy: string) {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) throw new Error("User not found");

  await prisma.user.delete({ where: { id } });

  // Log activity
  await logEntityChange(deletedBy, "USER_DELETED", "user", id, {
    email: user.email,
    name: user.name,
  });
}
```

### 4. Create Activity Query Service

```typescript
// apps/backoffice/lib/services/activity-service.ts
import { prisma } from "@/lib/db/prisma";

export interface ActivityListParams {
  page?: number;
  pageSize?: number;
  userId?: string;
  entityType?: string;
  entityId?: string;
  action?: string;
  startDate?: Date;
  endDate?: Date;
}

export async function getActivities(params: ActivityListParams) {
  const {
    page = 1,
    pageSize = 50,
    userId,
    entityType,
    entityId,
    action,
    startDate,
    endDate,
  } = params;

  const where = {
    ...(userId && { userId }),
    ...(entityType && { entityType }),
    ...(entityId && { entityId }),
    ...(action && { action }),
    ...(startDate || endDate
      ? {
          createdAt: {
            ...(startDate && { gte: startDate }),
            ...(endDate && { lte: endDate }),
          },
        }
      : {}),
  };

  const [items, total] = await Promise.all([
    prisma.activityLog.findMany({
      where,
      include: {
        user: {
          select: { id: true, name: true, email: true, avatarId: true },
        },
      },
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { createdAt: "desc" },
    }),
    prisma.activityLog.count({ where }),
  ]);

  return {
    items,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

export async function getEntityActivity(
  entityType: string,
  entityId: string
) {
  return prisma.activityLog.findMany({
    where: { entityType, entityId },
    include: {
      user: {
        select: { id: true, name: true, email: true, avatarId: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}
```

### 5. Create API Route

```typescript
// apps/backoffice/app/api/activities/route.ts
import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/permissions";
import { getActivities } from "@/lib/services/activity-service";

export async function GET(request: NextRequest) {
  const session = await requireAuth();

  const { searchParams } = new URL(request.url);
  const result = await getActivities({
    page: parseInt(searchParams.get("page") || "1"),
    pageSize: parseInt(searchParams.get("pageSize") || "50"),
    userId: searchParams.get("userId") || undefined,
    entityType: searchParams.get("entityType") || undefined,
    entityId: searchParams.get("entityId") || undefined,
    action: searchParams.get("action") || undefined,
  });

  return NextResponse.json(result);
}
```

### 6. Display Activity Feed

```typescript
// apps/backoffice/components/activities/activity-feed.tsx
"use client";

import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";

interface ActivityFeedProps {
  entityType: string;
  entityId: string;
}

export function ActivityFeed({ entityType, entityId }: ActivityFeedProps) {
  const { data: activities } = useQuery({
    queryKey: ["activities", entityType, entityId],
    queryFn: () =>
      fetch(`/api/activities?entityType=${entityType}&entityId=${entityId}`).then(
        (res) => res.json()
      ),
  });

  return (
    <div className="space-y-4">
      {activities?.items.map((activity) => (
        <div key={activity.id} className="flex gap-3 text-sm">
          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
            {activity.user.name?.[0] || "?"}
          </div>
          <div className="flex-1">
            <p>
              <span className="font-medium">{activity.user.name}</span>
              <span className="text-muted-foreground">
                {" "}
                {formatAction(activity.action)}
              </span>
            </p>
            <p className="text-muted-foreground text-xs">
              {formatDistanceToNow(new Date(activity.createdAt), {
                addSuffix: true,
              })}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

function formatAction(action: string): string {
  switch (action) {
    case "USER_CREATED":
      return "created this user";
    case "USER_UPDATED":
      return "updated this user";
    case "USER_DELETED":
      return "deleted this user";
    default:
      return action.toLowerCase().replace(/_/g, " ");
  }
}
```

## Activity Types

### Standard Actions

```typescript
export const ActivityActions = {
  // User actions
  USER_CREATED: "USER_CREATED",
  USER_UPDATED: "USER_UPDATED",
  USER_DELETED: "USER_DELETED",

  // Content actions
  CONTENT_CREATED: "CONTENT_CREATED",
  CONTENT_UPDATED: "CONTENT_UPDATED",
  CONTENT_PUBLISHED: "CONTENT_PUBLISHED",
  CONTENT_DELETED: "CONTENT_DELETED",

  // Settings actions
  SETTINGS_UPDATED: "SETTINGS_UPDATED",
  PERMISSIONS_CHANGED: "PERMISSIONS_CHANGED",

  // Authentication
  LOGIN: "LOGIN",
  LOGOUT: "LOGOUT",
  PASSWORD_CHANGED: "PASSWORD_CHANGED",
} as const;
```

### Change Tracking

Track specific field changes:

```typescript
const changes = {
  status: {
    from: "TODO",
    to: "IN_PROGRESS",
  },
  assignee: {
    from: "John Doe",
    to: "Jane Smith",
  },
};
```

### Metadata

Add additional context:

```typescript
await logActivity({
  userId: session.user.id,
  action: "BULK_UPDATE",
  entityType: "task",
  changes: {
    status: { to: "DONE" },
  },
  metadata: {
    affectedCount: 10,
    reason: "Project completed",
  },
});
```

## Best Practices

1. **Log All Mutations**: Log create, update, delete operations
2. **Meaningful Actions**: Use clear action names
3. **Track Changes**: Record before/after values
4. **Include Context**: Add metadata for important operations
5. **Query Efficiently**: Index frequently queried fields
6. **Retention Policy**: Archive old logs periodically
7. **Privacy**: Consider PII in activity logs

## See Also

- [Service Layer](/docs/patterns/service-layer) - Integrating with services
- [API Routes](/docs/patterns/api-routes) - Creating activity endpoints
- [Database Migrations](/docs/patterns/database-migrations) - Activity schema
