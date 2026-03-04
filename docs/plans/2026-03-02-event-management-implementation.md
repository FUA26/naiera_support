# Event Management System - Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Migrate events from JSON files to database with full backoffice RBAC management and landing API integration.

**Architecture:** Backoffice manages events in PostgreSQL via Prisma, landing consumes via public API with ISR caching. Manual sync triggers revalidation.

**Tech Stack:** Next.js 16, Prisma, PostgreSQL, Zod, existing RBCA system, existing File upload system

---

## PHASE 1: Database Schema & Migrations

### Task 1.1: Update Prisma Schema - Add Event Models

**Files:**
- Modify: `apps/backoffice/prisma/schema.prisma`

**Step 1: Add EventType enum**

Add after NewsStatus enum (around line 213):

```prisma
enum EventType {
  ONLINE
  OFFLINE
  HYBRID
}
```

**Step 2: Add EventStatus enum**

```prisma
enum EventStatus {
  DRAFT
  PUBLISHED
  CANCELLED
  COMPLETED
}
```

**Step 3: Add EventCategory model**

Add after NewsActivityLog model (around line 363):

```prisma
model EventCategory {
  id          String     @id @default(cuid())
  name        String
  slug        String     @unique
  color       String     @default("primary")
  showInMenu  Boolean    @default(true)
  order       Int        @default(0)
  events      Event[]
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt

  @@index([showInMenu])
  @@index([order])
}
```

**Step 4: Add Event model**

```prisma
model Event {
  id                   String         @id @default(cuid())
  slug                 String         @unique
  title                String
  description          String?

  categoryId           String
  category             EventCategory   @relation(fields: [categoryId], references: [id])

  // Event specifics
  date                 DateTime       @db.Date
  time                 String?
  location             String?
  locationUrl          String?
  type                 EventType     @default(OFFLINE)

  // Media
  imageId              String?
  image                File?          @relation("EventImage", fields: [imageId], references: [id], onDelete: SetNull)

  // Organizer & Attendees
  organizer            String
  organizerContact     String?
  attendees            Json?

  // Registration
  registrationRequired  Boolean        @default(false)
  registrationUrl       String?
  maxAttendees         Int?

  // Display options
  featured             Boolean        @default(false)
  showInMenu           Boolean        @default(true)
  order                Int            @default(0)

  // Publishing workflow
  status               EventStatus    @default(DRAFT)

  // Audit
  createdById          String
  createdBy            User           @relation("EventCreator", fields: [createdById], references: [id])
  updatedById          String?
  updatedBy            User?          @relation("EventUpdater", fields: [updatedById], references: [id])

  createdAt            DateTime       @default(now())
  updatedAt            DateTime       @updatedAt

  activityLogs         EventActivityLog[]

  @@index([categoryId])
  @@index([status])
  @@index([type])
  @@index([featured])
  @@index([date])
  @@index([order])
  @@index([slug])
}
```

**Step 5: Add EventActivityLog model**

```prisma
model EventActivityLog {
  id          String   @id @default(cuid())
  eventId     String
  event       Event    @relation(fields: [eventId], references: [id], onDelete: Cascade)
  userId      String
  user        User     @relation("EventActivityLogs", fields: [userId], references: [id])
  action      String
  changes     Json?
  createdAt   DateTime @default(now())

  @@index([eventId])
  @@index([userId])
  @@index([createdAt])
}
```

**Step 6: Update User model**

Add relations to User model (around line 71):

```prisma
  // Event Management Relations
  createdEvents      Event[]            @relation("EventCreator")
  updatedEvents      Event[]            @relation("EventUpdater")
  eventActivityLogs EventActivityLog[]
```

**Step 7: Update File model**

Add relation to File model (around line 189):

```prisma
  eventsAsImage Event[] @relation("EventImage")
```

**Step 8: Generate Prisma client**

Run: `cd apps/backoffice && pnpm prisma generate`

**Step 9: Commit**

```bash
git add apps/backoffice/prisma/schema.prisma
git commit -m "feat: add event models to prisma schema

- Add EventType enum (ONLINE, OFFLINE, HYBRID)
- Add EventStatus enum (DRAFT, PUBLISHED, CANCELLED, COMPLETED)
- Add EventCategory model with name, slug, color, showInMenu, order
- Add Event model with date, time, location, type, registration fields
- Add EventActivityLog model for audit trail
- Update User and File models with event relations

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

### Task 1.2: Create Database Migration

**Files:**
- Create: `apps/backoffice/prisma/migrations/<timestamp>_add_events_tables/migration.sql`

**Step 1: Create migration**

Run: `cd apps/backoffice && set -a && source .env.local && set +a && pnpm prisma migrate dev --name add_events_tables`

Expected: Migration created successfully, database updated

**Step 2: Verify migration**

Check that the following tables were created:
- `EventCategory`
- `Event`
- `EventActivityLog`

**Step 3: Commit**

```bash
git add apps/backoffice/prisma/migrations
git commit -m "feat: create event tables migration

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

### Task 1.3: Seed Event Permissions

**Files:**
- Modify: `apps/backoffice/prisma/seed-permissions.ts`

**Step 1: Add event permissions after news permissions**

```typescript
// Event Management
{ name: "EVENTS_VIEW", category: "EVENTS", description: "View events" },
{ name: "EVENTS_CREATE", category: "EVENTS", description: "Create new events" },
{ name: "EVENTS_EDIT", category: "EVENTS", description: "Edit events" },
{ name: "EVENTS_DELETE", category: "EVENTS", description: "Delete events" },
{ name: "EVENTS_REORDER", category: "EVENTS", description: "Reorder events" },
{ name: "EVENT_CATEGORIES_MANAGE", category: "EVENTS", description: "Manage event categories" },
```

**Step 2: Update ADMIN role**

Add to ADMIN role permissions array:

```typescript
// All events permissions
"EVENTS_VIEW",
"EVENTS_CREATE",
"EVENTS_EDIT",
"EVENTS_DELETE",
"EVENTS_REORDER",
"EVENT_CATEGORIES_MANAGE",
```

**Step 3: Run seed**

Run: `cd apps/backoffice && set -a && source .env.local && set +a && pnpm tsx prisma/seed-permissions.ts`

**Step 4: Commit**

```bash
git add apps/backoffice/prisma/seed-permissions.ts apps/backoffice/prisma/seed-roles.ts
git commit -m "feat: seed event permissions

- Add EVENTS_VIEW, EVENTS_CREATE, EVENTS_EDIT permissions
- Add EVENTS_DELETE, EVENTS_REORDER, EVENT_CATEGORIES_MANAGE permissions
- Assign all event permissions to ADMIN role

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

### Task 1.4: Create Event Migration Script

**Files:**
- Create: `scripts/migrate-events.ts`

**Step 1: Create migration script**

```typescript
#!/usr/bin/env tsx
import fs from 'fs';
import path from 'path';
import { config } from 'dotenv';
import { PrismaClient } from '@prisma/client';

// Load environment variables
config({ path: 'apps/backoffice/.env.local' });

const prisma = new PrismaClient();

async function migrateEvents() {
  console.log('Starting event migration...');

  // 1. Read existing event data
  const eventsPath = path.join(process.cwd(), 'apps/landing/data/events/agenda.json');

  if (!fs.existsSync(eventsPath)) {
    console.error('Event data file not found:', eventsPath);
    process.exit(1);
  }

  const eventsData = JSON.parse(fs.readFileSync(eventsPath, 'utf8'));
  console.log(`Found ${eventsData.length} events to migrate`);

  // 2. Extract unique categories
  const uniqueCategories = [...new Set(eventsData.map((e: any) => e.category))];
  console.log(`Found ${uniqueCategories.length} unique categories`);

  // 3. Create categories
  const categoryMap = new Map<string, string>();
  const colors = ['primary', 'blue', 'green', 'rose', 'orange', 'purple', 'cyan'];

  for (const [index, name] of uniqueCategories.entries()) {
    const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
    const color = colors[index % colors.length];

    const category = await prisma.eventCategory.upsert({
      where: { slug },
      update: {},
      create: {
        name,
        slug,
        color,
        order: index,
      },
    });

    categoryMap.set(name, category.id);
    console.log(`  - Category: ${name} (${slug})`);
  }

  // 4. Get admin user
  const adminUser = await prisma.user.findFirst({
    where: { role: { name: 'ADMIN' } },
  });

  if (!adminUser) {
    console.error('Admin user not found');
    process.exit(1);
  }

  // 5. Migrate events
  let migrated = 0;
  let skipped = 0;

  for (const event of eventsData) {
    const categoryId = categoryMap.get(event.category);

    if (!categoryId) {
      console.warn(`  - Skipping "${event.title}" - category not found: ${event.category}`);
      skipped++;
      continue;
    }

    // Check if already exists
    const existing = await prisma.event.findUnique({
      where: { slug: event.slug },
    });

    if (existing) {
      console.warn(`  - Skipping "${event.title}" - already exists`);
      skipped++;
      continue;
    }

    try {
      await prisma.event.create({
        data: {
          slug: event.slug,
          title: event.title,
          description: event.description,
          categoryId,
          date: new Date(event.date),
          time: event.time,
          location: event.location,
          type: event.type?.toUpperCase() || 'OFFLINE',
          organizer: event.organizer,
          registrationRequired: event.registrationRequired || false,
          registrationUrl: event.registrationUrl,
          maxAttendees: event.maxAttendees,
          featured: event.featured || false,
          status: 'PUBLISHED',
          createdById: adminUser.id,
          order: event.order || 0,
        },
      });

      migrated++;
      console.log(`  ✓ Migrated: "${event.title}"`);
    } catch (error) {
      console.error(`  ✗ Failed to migrate "${event.title}":`, error);
    }
  }

  console.log(`\nMigration complete:`);
  console.log(`  - Migrated: ${migrated}`);
  console.log(`  - Skipped: ${skipped}`);
  console.log(`  - Total: ${eventsData.length}`);
}

migrateEvents()
  .catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });
```

**Step 2: Commit**

```bash
git add scripts/migrate-events.ts
git commit -m "feat: add event migration script

- Migrate events from JSON to database
- Create categories dynamically from unique values
- Assign proper admin user as creator
- Skip existing events to allow re-running

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## PHASE 2: Backend API - Event Routes

### Task 2.1: Create Event Validation Schemas

**Files:**
- Create: `apps/backoffice/lib/validations/event.ts`

**Step 1: Create validation schemas**

```typescript
import { z } from 'zod';

// Event Category Schemas
export const eventCategorySchema = z.object({
  name: z.string().min(1).max(100),
  slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
  color: z.string().default('primary'),
  showInMenu: z.boolean().default(true),
  order: z.number().int().min(0).default(0),
});

export const eventCategoryUpdateSchema = eventCategorySchema.partial().extend({
  id: z.string().cuid(),
});

// Event Schemas
export const eventSchema = z.object({
  title: z.string().min(1).max(200),
  slug: z.string().min(1).max(200).regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
  description: z.string().optional(),
  categoryId: z.string().cuid(),
  date: z.coerce.date(),
  time: z.string().optional(),
  location: z.string().optional(),
  locationUrl: z.string().url().optional(),
  type: z.enum(['ONLINE', 'OFFLINE', 'HYBRID']).default('OFFLINE'),
  imageId: z.string().cuid().optional(),
  organizer: z.string().min(1).max(100),
  organizerContact: z.string().optional(),
  attendees: z.array(z.string()).optional(),
  registrationRequired: z.boolean().default(false),
  registrationUrl: z.string().url().optional(),
  maxAttendees: z.number().int().min(1).optional(),
  featured: z.boolean().default(false),
  showInMenu: z.boolean().default(true),
  order: z.number().int().min(0).default(0),
  status: z.enum(['DRAFT', 'PUBLISHED', 'CANCELLED', 'COMPLETED']).default('DRAFT'),
});

export const eventUpdateSchema = eventSchema.partial().extend({
  id: z.string().cuid(),
});

export const eventStatusSchema = z.object({
  id: z.string().cuid(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'CANCELLED', 'COMPLETED']),
});

export const eventReorderSchema = z.object({
  items: z.array(z.object({
    id: z.string().cuid(),
    order: z.number().int().min(0),
  })),
});

// Query schemas
export const eventQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  categoryId: z.string().optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'CANCELLED', 'COMPLETED']).optional(),
  type: z.enum(['ONLINE', 'OFFLINE', 'HYBRID']).optional(),
  featured: z.coerce.boolean().optional(),
  search: z.string().optional(),
});
```

**Step 2: Commit**

```bash
git add apps/backoffice/lib/validations/event.ts
git commit -m "feat: add event validation schemas

- Event category schemas (create, update)
- Event schemas with date, time, location, type, registration
- Query parameter schemas for filtering

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

### Task 2.2: Create Event Service Layer

**Files:**
- Create: `apps/backoffice/lib/services/event-service.ts`

**Step 1: Create event service**

```typescript
import { prisma, Prisma } from '@/lib/db/prisma';
import { EventStatus, EventType } from '@prisma/client';

export interface EventListOptions {
  page?: number;
  pageSize?: number;
  categoryId?: string;
  status?: EventStatus;
  type?: EventType;
  featured?: boolean;
  search?: string;
}

export interface PaginatedEvents<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

const EVENT_INCLUDE = {
  category: true,
  image: true,
  createdBy: {
    select: {
      id: true,
      name: true,
      email: true,
    },
  },
  updatedBy: {
    select: {
      id: true,
      name: true,
      email: true,
    },
  },
} as const;

export async function getEventsList(options: EventListOptions = {}): Promise<PaginatedEvents<any>> {
  const { page = 1, pageSize = 20, categoryId, status, type, featured, search } = options;

  const where: Prisma.EventWhereInput = {};

  if (categoryId) {
    where.categoryId = categoryId;
  }

  if (status) {
    where.status = status;
  }

  if (type) {
    where.type = type;
  }

  if (featured !== undefined) {
    where.featured = featured;
  }

  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ];
  }

  const [items, total] = await Promise.all([
    prisma.event.findMany({
      where,
      include: EVENT_INCLUDE,
      orderBy: [
        { featured: 'desc' },
        { date: 'asc' },
        { order: 'asc' },
      ],
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.event.count({ where }),
  ]);

  return {
    items,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

export async function getEventById(id: string) {
  return prisma.event.findUnique({
    where: { id },
    include: EVENT_INCLUDE,
  });
}

export async function getEventBySlug(slug: string) {
  return prisma.event.findUnique({
    where: { slug },
    include: EVENT_INCLUDE,
  });
}

export async function createEvent(data: any, userId: string) {
  const event = await prisma.event.create({
    data: {
      ...data,
      createdById: userId,
    },
    include: EVENT_INCLUDE,
  });

  await eventActivityLog(event.id, userId, 'created', { data });

  return event;
}

export async function updateEvent(id: string, data: any, userId: string) {
  const existing = await getEventById(id);
  if (!existing) {
    throw new Error('Event not found');
  }

  const event = await prisma.event.update({
    where: { id },
    data: {
      ...data,
      updatedById: userId,
    },
    include: EVENT_INCLUDE,
  });

  await eventActivityLog(id, userId, 'updated', {
    before: existing,
    after: event,
  });

  return event;
}

export async function deleteEvent(id: string, userId: string) {
  const existing = await getEventById(id);
  if (!existing) {
    throw new Error('Event not found');
  }

  await eventActivityLog(id, userId, 'deleted', { before: existing });

  await prisma.event.delete({
    where: { id },
  });

  return existing;
}

export async function updateEventStatus(id: string, status: EventStatus, userId: string) {
  const existing = await getEventById(id);
  if (!existing) {
    throw new Error('Event not found');
  }

  const event = await prisma.event.update({
    where: { id },
    data: {
      status,
      updatedById: userId,
    },
    include: EVENT_INCLUDE,
  });

  const action = status === 'PUBLISHED' ? 'published' : status === 'CANCELLED' ? 'cancelled' : 'completed';
  await eventActivityLog(id, userId, action, { before: existing, after: event });

  return event;
}

export async function reorderEvents(items: Array<{ id: string; order: number }>, userId: string) {
  const updates = items.map(({ id, order }) =>
    prisma.event.update({
      where: { id },
      data: { order },
    })
  );

  await prisma.$transaction(updates);

  await eventActivityLog(items[0].id, userId, 'reordered', { items });

  return true;
}

// Event Categories
export async function getEventCategories() {
  return prisma.eventCategory.findMany({
    orderBy: [{ order: 'asc' }, { name: 'asc' }],
    include: {
      _count: {
        select: { events: true },
      },
    },
  });
}

export async function createEventCategory(data: any) {
  return prisma.eventCategory.create({
    data,
  });
}

export function updateEventCategory(id: string, data: any) {
  return prisma.eventCategory.update({
    where: { id },
    data,
  });
}

export async function deleteEventCategory(id: string) {
  const count = await prisma.event.count({
    where: { categoryId: id },
  });

  if (count > 0) {
    throw new Error('Cannot delete category with existing events');
  }

  return prisma.eventCategory.delete({
    where: { id },
  });
}

// Activity Logs
export async function getEventActivityLogs(eventId: string) {
  return prisma.eventActivityLog.findMany({
    where: { eventId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}

// Activity log helper
async function eventActivityLog(eventId: string, userId: string, action: string, changes?: any) {
  return prisma.eventActivityLog.create({
    data: {
      eventId,
      userId,
      action,
      changes,
    },
  });
}
```

**Step 2: Commit**

```bash
git add apps/backoffice/lib/services/event-service.ts
git commit -m "feat: add event service layer

- CRUD operations for events and categories
- Activity logging for audit trail
- Pagination and filtering support
- Status update workflow

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

### Task 2.3: Create Event API Routes

**Files:**
- Create: `apps/backoffice/app/api/events/route.ts`
- Create: `apps/backoffice/app/api/events/[id]/route.ts`
- Create: `apps/backoffice/app/api/events/[id]/status/route.ts`
- Create: `apps/backoffice/app/api/events/[id]/logs/route.ts`
- Create: `apps/backoffice/app/api/events/reorder/route.ts`

**Step 1: Create GET/POST /api/events**

Create: `apps/backoffice/app/api/events/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { requirePermission } from '@/lib/auth/permissions';
import { eventQuerySchema, eventSchema } from '@/lib/validations/event';
import {
  getEventsList,
  createEvent,
} from '@/lib/services/event-service';

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await requirePermission(session.user.id, 'EVENTS_VIEW');

  const searchParams = request.nextUrl.searchParams;
  const query = eventQuerySchema.parse(Object.fromEntries(searchParams));

  const result = await getEventsList(query);
  return NextResponse.json(result);
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await requirePermission(session.user.id, 'EVENTS_CREATE');

  const body = await request.json();
  const data = eventSchema.parse(body);

  const event = await createEvent(data, session.user.id);
  return NextResponse.json(event, { status: 201 });
}
```

**Step 2: Create GET/PUT/DELETE /api/events/[id]**

Create: `apps/backoffice/app/api/events/[id]/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { requirePermission } from '@/lib/auth/permissions';
import { eventUpdateSchema } from '@/lib/validations/event';
import {
  getEventById,
  updateEvent,
  deleteEvent,
} from '@/lib/services/event-service';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await requirePermission(session.user.id, 'EVENTS_VIEW');

  const { id } = await params;
  const event = await getEventById(id);

  if (!event) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  return NextResponse.json(event);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await requirePermission(session.user.id, 'EVENTS_EDIT');

  const { id } = await params;
  const body = await request.json();
  const data = eventUpdateSchema.parse({ ...body, id });

  const event = await updateEvent(id, data, session.user.id);
  return NextResponse.json(event);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await requirePermission(session.user.id, 'EVENTS_DELETE');

  const { id } = await params;
  const event = await deleteEvent(id, session.user.id);
  return NextResponse.json(event);
}
```

**Step 3: Create PATCH /api/events/[id]/status**

Create: `apps/backoffice/app/api/events/[id]/status/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { requirePermission } from '@/lib/auth/permissions';
import { eventStatusSchema } from '@/lib/validations/event';
import { updateEventStatus } from '@/lib/services/event-service';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await requirePermission(session.user.id, 'EVENTS_EDIT');

  const { id } = await params;
  const body = await request.json();
  const { status } = eventStatusSchema.parse({ ...body, id });

  const event = await updateEventStatus(id, status, session.user.id);
  return NextResponse.json(event);
}
```

**Step 4: Create GET /api/events/[id]/logs**

Create: `apps/backoffice/app/api/events/[id]/logs/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { requirePermission } from '@/lib/auth/permissions';
import { getEventActivityLogs } from '@/lib/services/event-service';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await requirePermission(session.user.id, 'EVENTS_VIEW');

  const { id } = await params;
  const logs = await getEventActivityLogs(id);
  return NextResponse.json(logs);
}
```

**Step 5: Create PATCH /api/events/reorder**

Create: `apps/backoffice/app/api/events/reorder/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { requirePermission } from '@/lib/auth/permissions';
import { eventReorderSchema } from '@/lib/validations/event';
import { reorderEvents } from '@/lib/services/event-service';

export async function PATCH(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await requirePermission(session.user.id, 'EVENTS_REORDER');

  const body = await request.json();
  const { items } = eventReorderSchema.parse(body);

  await reorderEvents(items, session.user.id);
  return NextResponse.json({ success: true });
}
```

**Step 6: Commit**

```bash
git add apps/backoffice/app/api/events
git commit -m "feat: add event API routes

- GET/POST /api/events - list and create events
- GET/PUT/DELETE /api/events/[id] - CRUD operations
- PATCH /api/events/[id]/status - update status
- GET /api/events/[id]/logs - activity logs
- PATCH /api/events/reorder - bulk reorder

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

### Task 2.4: Create Event Category API Routes

**Files:**
- Create: `apps/backoffice/app/api/event-categories/route.ts`
- Create: `apps/backoffice/app/api/event-categories/[id]/route.ts`

**Step 1: Create GET/POST /api/event-categories**

Create: `apps/backoffice/app/api/event-categories/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { requirePermission } from '@/lib/auth/permissions';
import { eventCategorySchema } from '@/lib/validations/event';
import {
  getEventCategories,
  createEventCategory,
} from '@/lib/services/event-service';

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await requirePermission(session.user.id, 'EVENT_CATEGORIES_MANAGE');

  const categories = await getEventCategories();
  return NextResponse.json(categories);
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await requirePermission(session.user.id, 'EVENT_CATEGORIES_MANAGE');

  const body = await request.json();
  const data = eventCategorySchema.parse(body);

  const category = await createEventCategory(data);
  return NextResponse.json(category, { status: 201 });
}
```

**Step 2: Create PUT/DELETE /api/event-categories/[id]**

Create: `apps/backoffice/app/api/event-categories/[id]/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { requirePermission } from '@/lib/auth/permissions';
import { eventCategoryUpdateSchema } from '@/lib/validations/event';
import {
  updateEventCategory,
  deleteEventCategory,
} from '@/lib/services/event-service';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await requirePermission(session.user.id, 'EVENT_CATEGORIES_MANAGE');

  const { id } = await params;
  const body = await request.json();
  const data = eventCategoryUpdateSchema.parse({ ...body, id });

  const category = await updateEventCategory(id, data);
  return NextResponse.json(category);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await requirePermission(session.user.id, 'EVENT_CATEGORIES_MANAGE');

  const { id } = await params;

  try {
    await deleteEventCategory(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete' },
      { status: 400 }
    );
  }
}
```

**Step 3: Commit**

```bash
git add apps/backoffice/app/api/event-categories
git commit -m "feat: add event category API routes

- GET/POST /api/event-categories - list and create
- PUT/DELETE /api/event-categories/[id] - update and delete
- Validation for non-empty categories

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## PHASE 3: Public API for Landing

### Task 3.1: Create Public Event API Routes

**Files:**
- Create: `apps/backoffice/app/api/public/events/route.ts`
- Create: `apps/backoffice/app/api/public/events/[slug]/route.ts`
- Create: `apps/backoffice/app/api/public/events/categories/route.ts`
- Create: `apps/backoffice/app/api/public/events/upcoming/route.ts`
- Create: `apps/backoffice/app/api/public/events/calendar/route.ts`

**Step 1: Create GET /api/public/events**

Create: `apps/backoffice/app/api/public/events/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

const querySchema = {
  featured: false,
  category: '',
  type: '',
  limit: 0,
  page: 1,
  pageSize: 20,
};

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const featured = searchParams.get('featured') === 'true';
    const category = searchParams.get('category') || undefined;
    const type = searchParams.get('type') || undefined;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined;
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '20');

    const where: any = {
      status: 'PUBLISHED',
      showInMenu: true,
    };

    if (featured) {
      where.featured = true;
    }

    if (category) {
      const cat = await prisma.eventCategory.findUnique({
        where: { slug: category },
      });
      if (cat) {
        where.categoryId = cat.id;
      } else {
        return NextResponse.json({
          items: [],
          total: 0,
          page: 1,
          pageSize,
          totalPages: 0,
        });
      }
    }

    if (type) {
      where.type = type;
    }

    const [items, total] = await Promise.all([
      prisma.event.findMany({
        where,
        include: {
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
              color: true,
            },
          },
          image: {
            select: {
              id: true,
              cdnUrl: true,
            },
          },
        },
        orderBy: [
          { featured: 'desc' },
          { date: 'asc' },
          { order: 'asc' },
        ],
        skip: limit ? undefined : (page - 1) * pageSize,
        take: limit || pageSize,
      }),
      prisma.event.count({ where }),
    ]);

    const transformed = items.map((item) => ({
      id: item.id,
      slug: item.slug,
      title: item.title,
      description: item.description,
      category: item.category.name,
      categorySlug: item.category.slug,
      categoryColor: item.category.color,
      date: item.date.toISOString(),
      time: item.time,
      location: item.location,
      locationUrl: item.locationUrl,
      type: item.type,
      image: item.image?.cdnUrl || null,
      organizer: item.organizer,
      organizerContact: item.organizerContact,
      registrationRequired: item.registrationRequired,
      registrationUrl: item.registrationUrl,
      maxAttendees: item.maxAttendees,
      featured: item.featured,
    }));

    return NextResponse.json({
      items: transformed,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (error) {
    console.error('Public events API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch events' },
      { status: 500 }
    );
  }
}
```

**Step 2: Create GET /api/public/events/[slug]**

Create: `apps/backoffice/app/api/public/events/[slug]/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const event = await prisma.event.findFirst({
      where: {
        slug,
        status: 'PUBLISHED',
        showInMenu: true,
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
            color: true,
          },
        },
        image: {
          select: {
            id: true,
            cdnUrl: true,
          },
        },
      },
    });

    if (!event) {
      return NextResponse.json(
        { error: 'Not found' },
        { status: 404 }
      );
    }

    const transformed = {
      id: event.id,
      slug: event.slug,
      title: event.title,
      description: event.description,
      category: event.category.name,
      categorySlug: event.category.slug,
      categoryColor: event.category.color,
      date: event.date.toISOString(),
      time: event.time,
      location: event.location,
      locationUrl: event.locationUrl,
      type: event.type,
      image: event.image?.cdnUrl || null,
      organizer: event.organizer,
      organizerContact: event.organizerContact,
      registrationRequired: event.registrationRequired,
      registrationUrl: event.registrationUrl,
      maxAttendees: event.maxAttendees,
      featured: event.featured,
    };

    return NextResponse.json(transformed);
  } catch (error) {
    console.error('Public event detail API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch event' },
      { status: 500 }
    );
  }
}
```

**Step 3: Create GET /api/public/events/categories**

Create: `apps/backoffice/app/api/public/events/categories/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function GET(request: NextRequest) {
  try {
    const categories = await prisma.eventCategory.findMany({
      where: {
        showInMenu: true,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        color: true,
        order: true,
      },
      orderBy: [
        { order: 'asc' },
        { name: 'asc' },
      ],
    });

    return NextResponse.json(categories);
  } catch (error) {
    console.error('Public event categories API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}
```

**Step 4: Create GET /api/public/events/upcoming**

Create: `apps/backoffice/app/api/public/events/upcoming/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function GET(request: NextRequest) {
  try {
    const limit = request.nextUrl.searchParams.get('limit');
    const now = new Date();

    const events = await prisma.event.findMany({
      where: {
        status: 'PUBLISHED',
        showInMenu: true,
        date: { gte: now },
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
            color: true,
          },
        },
        image: {
          select: {
            id: true,
            cdnUrl: true,
          },
        },
      },
      orderBy: [{ date: 'asc' }, { featured: 'desc' }],
      take: limit ? parseInt(limit) : undefined,
    });

    const transformed = events.map((item) => ({
      id: item.id,
      slug: item.slug,
      title: item.title,
      description: item.description,
      category: item.category.name,
      categorySlug: item.category.slug,
      categoryColor: item.category.color,
      date: item.date.toISOString(),
      time: item.time,
      location: item.location,
      type: item.type,
      image: item.image?.cdnUrl || null,
      organizer: item.organizer,
      registrationRequired: item.registrationRequired,
      registrationUrl: item.registrationUrl,
      featured: item.featured,
    }));

    return NextResponse.json(transformed);
  } catch (error) {
    console.error('Public upcoming events API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch upcoming events' },
      { status: 500 }
    );
  }
}
```

**Step 5: Create GET /api/public/events/calendar**

Create: `apps/backoffice/app/api/public/events/calendar/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function GET(request: NextRequest) {
  try {
    const year = request.nextUrl.searchParams.get('year');
    const month = request.nextUrl.searchParams.get('month');

    if (!year || !month) {
      return NextResponse.json(
        { error: 'Year and month parameters required' },
        { status: 400 }
      );
    }

    const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
    const endDate = new Date(parseInt(year), parseInt(month), 0, 23:59:59);

    const events = await prisma.event.findMany({
      where: {
        status: 'PUBLISHED',
        showInMenu: true,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
            color: true,
          },
        },
        image: {
          select: {
            id: true,
            cdnUrl: true,
          },
        },
      },
      orderBy: [{ date: 'asc' }, { time: 'asc' }],
    });

    const transformed = events.map((item) => ({
      id: item.id,
      slug: item.slug,
      title: item.title,
      description: item.description,
      category: item.category.name,
      categorySlug: item.category.slug,
      categoryColor: item.category.color,
      date: item.date.toISOString(),
      time: item.time,
      location: item.location,
      type: item.type,
      image: item.image?.cdnUrl || null,
      organizer: item.organizer,
      registrationRequired: item.registrationRequired,
      registrationUrl: item.registrationUrl,
      featured: item.featured,
    }));

    return NextResponse.json(transformed);
  } catch (error) {
    console.error('Public event calendar API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch events for calendar' },
      { status: 500 }
    );
  }
}
```

**Step 6: Commit**

```bash
git add apps/backoffice/app/api/public/events
git commit -m "feat: add public event API routes

- GET /api/public/events - list published events with filters
- GET /api/public/events/[slug] - get single event by slug
- GET /api/public/events/categories - list visible categories
- GET /api/public/events/upcoming - get upcoming events
- GET /api/public/events/calendar - get events by month
- Transform responses to match landing interface

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## PHASE 4: Landing Integration

### Task 4.1: Update Landing Events Data Layer

**Files:**
- Modify: `apps/landing/lib/events-data.ts`

**Step 1: Replace file-based with API-based**

Replace entire file content:

```typescript
// Types for events data structure
export interface Event {
  id: string;
  slug: string;
  title: string;
  description?: string;
  category: string;
  categorySlug?: string;
  categoryColor?: string;
  date: string;
  time?: string;
  location?: string;
  locationUrl?: string;
  type: 'ONLINE' | 'OFFLINE' | 'HYBRID';
  image?: string | null;
  organizer: string;
  organizerContact?: string;
  attendees?: string[];
  status: 'upcoming' | 'ongoing' | 'completed';
  registrationRequired: boolean;
  registrationUrl?: string;
  maxAttendees?: number | null;
  featured: boolean;
}

const BACKOFFICE_URL = process.env.NEXT_PUBLIC_BACKOFFICE_URL || 'http://localhost:3001';

/**
 * Fetch all events
 */
export async function getAllEvents(): Promise<Event[]> {
  try {
    const res = await fetch(`${BACKOFFICE_URL}/api/public/events`, {
      next: { revalidate: 3600 } // Cache 1 hour
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.items || [];
  } catch (error) {
    console.error('Error loading events:', error);
    return [];
  }
}

/**
 * Fetch upcoming events
 */
export async function getUpcomingEvents(limit?: number): Promise<Event[]> {
  try {
    const res = await fetch(`${BACKOFFICE_URL}/api/public/events/upcoming${limit ? `?limit=${limit}` : ''}`, {
      next: { revalidate: 3600 }
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data || [];
  } catch (error) {
    console.error('Error loading upcoming events:', error);
    return [];
  }
}

/**
 * Fetch events by status
 */
export async function getEventsByStatus(status: 'upcoming' | 'ongoing' | 'completed'): Promise<Event[]> {
  try {
    const res = await fetch(`${BACKOFFICE_URL}/api/public/events?status=${status.toUpperCase()}`, {
      next: { revalidate: 3600 }
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.items || [];
  } catch (error) {
    console.error(`Error loading events with status ${status}:`, error);
    return [];
  }
}

/**
 * Fetch events by category
 */
export async function getEventsByCategory(category: string): Promise<Event[]> {
  try {
    const res = await fetch(`${BACKOFFICE_URL}/api/public/events?category=${category}`, {
      next: { revalidate: 3600 }
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.items || [];
  } catch (error) {
    console.error(`Error loading events for category ${category}:`, error);
    return [];
  }
}

/**
 * Fetch a single event by slug
 */
export async function getEventBySlug(slug: string): Promise<Event | null> {
  try {
    const res = await fetch(`${BACKOFFICE_URL}/api/public/events/${slug}`, {
      next: { revalidate: 3600 }
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    console.error(`Error loading event ${slug}:`, error);
    return null;
  }
}

/**
 * Fetch events for a specific month
 */
export async function getEventsByMonth(year: number, month: number): Promise<Event[]> {
  try {
    const res = await fetch(`${BACKOFFICE_URL}/api/public/events/calendar?year=${year}&month=${month}`, {
      next: { revalidate: 3600 }
    });
    if (!res.ok) return [];
    return await res.json();
  } catch (error) {
    console.error(`Error loading events for ${year}-${month}:`, error);
    return [];
  }
}

/**
 * Get all unique event categories
 */
export async function getEventCategories(): Promise<string[]> {
  try {
    const res = await fetch(`${BACKOFFICE_URL}/api/public/events/categories`, {
      next: { revalidate: 3600 }
    });
    if (!res.ok) return [];
    const categories = await res.json();
    return categories.map((c: any) => c.name);
  } catch (error) {
    console.error('Error loading event categories:', error);
    return [];
  }
}

/**
 * Get event days for calendar widget
 */
export async function getEventDays(year: number, month: number): Promise<number[]> {
  try {
    const events = await getEventsByMonth(year, month);
    return events.map(event => new Date(event.date).getDate());
  } catch (error) {
    console.error(`Error loading event days for ${year}-${month}:`, error);
    return [];
  }
}
```

**Step 2: Commit**

```bash
git add apps/landing/lib/events-data.ts
git commit -m "feat: update events data layer to use API

- Replace fs.readFileSync with fetch to backoffice API
- Add ISR caching (1 hour) for all event data
- Maintain backward compatibility with existing interfaces
- Add calendar support for month view

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

### Task 4.2: Add Revalidate Support for Events

**Files:**
- Modify: `apps/backoffice/app/api/public/revalidate/route.ts`

**Step 1: Add events paths to revalidate**

Update existing revalidate route to include events:

```typescript
// In the revalidate logic, add:
revalidatePath('/informasi-publik/agenda-kegiatan');
revalidatePath('/api/public/events');
```

**Step 2: Update status endpoint to trigger revalidation**

Modify the status update logic in event service or API to trigger revalidation on publish.

**Step 3: Commit**

```bash
git add apps/backoffice/app/api/public/revalidate/route.ts
git commit -m "feat: add events revalidation on publish

- Add events paths to revalidate endpoint
- Trigger landing revalidation when events are published

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## PHASE 5: Backoffice UI Components

### Task 5.1: Create Event Categories Management Page

**Files:**
- Create: `apps/backoffice/app/(dashboard)/manage/event-categories/page.tsx`
- Create: `apps/backoffice/app/(dashboard)/manage/event-categories/event-categories-client.tsx`

**Step 1: Create event categories page**

Create: `apps/backoffice/app/(dashboard)/manage/event-categories/page.tsx`

```typescript
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db/prisma';
import { ProtectedRoute } from '@/components/rbac/ProtectedRoute';
import { EventCategoriesClient } from './event-categories-client';

async function getEventCategories() {
  return prisma.eventCategory.findMany({
    include: {
      _count: {
        select: { events: true },
      },
    },
    orderBy: [{ order: 'asc' }, { name: 'asc' }],
  });
}

function EventCategoriesContent() {
  const categories = getEventCategories();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Event Categories</h1>
          <p className="text-muted-foreground">
            Manage event categories for the website
          </p>
        </div>
      </div>

      <EventCategoriesClient categoriesPromise={categories} />
    </div>
  );
}

export default function EventCategoriesPage() {
  return (
    <ProtectedRoute permissions={["EVENT_CATEGORIES_MANAGE"]}>
      <EventCategoriesContent />
    </ProtectedRoute>
  );
}
```

**Step 2: Create client component**

Create: `apps/backoffice/app/(dashboard)/manage/event-categories/event-categories-client.tsx`

Similar to news categories client but for events.

**Step 3: Commit**

```bash
git add apps/backoffice/app/(dashboard)/manage/event-categories
git commit -m "feat: add event categories management UI

- List view with color, showInMenu, order, actions
- Form component with color picker
- Full CRUD operations for event categories

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

### Task 5.2: Create Events Management Page

**Files:**
- Create: `apps/backoffice/app/(dashboard)/manage/events/page.tsx`
- Create: `apps/backoffice/app/(dashboard)/manage/events/events-client.tsx`

**Step 1: Create events page**

Create: `apps/backoffice/app/(dashboard)/manage/events/page.tsx`

```typescript
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db/prisma';
import { ProtectedRoute } from '@/components/rbacProtectedRoute';
import { EventsClient } from './events-client';

async function getEvents() {
  return prisma.event.findMany({
    include: {
      category: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
      image: {
        select: {
          id: true,
          cdnUrl: true,
        },
      },
    },
    orderBy: [
      { featured: 'desc' },
      { date: 'asc' },
      { order: 'asc' },
    ],
    take: 50,
  });
}

async function getCategories() {
  return prisma.eventCategory.findMany({
    orderBy: [{ order: 'asc' }, { name: 'asc' }],
  });
}

function EventsContent() {
  const events = getEvents();
  const categories = getCategories();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Events</h1>
          <p className="text-muted-foreground">
            Manage events for the website
          </p>
        </div>
        <EventsClient.CreateButton />
      </div>

      <EventsClient eventsPromise={events} categoriesPromise={categories} />
    </div  );
}

export default function EventsPage() {
  return (
    <ProtectedRoute permissions={["EVENTS_VIEW"]}>
      <EventsContent />
    </ProtectedRoute>
  );
}
```

**Step 2: Create events client component**

Create: `apps/backoffice/app/(dashboard)/manage/events/events-client.tsx`

Similar to news client but with event-specific fields:
- Date picker for event date
- Time input
- Location and location URL fields
- Type selector (Online/Offline/Hybrid)
- Registration toggle and URL input
- Organizer and contact fields
- Status dropdown (Draft/Published/Cancelled/Completed)

**Step 3: Commit**

```bash
git add apps/backoffice/app/(dashboard)/manage/events
git commit -m "feat: add events management UI

- Table with date, category, status, type, actions
- Form with event-specific fields (date, time, location, type, registration)
- Create/edit dialogs with full CRUD operations
- Status update actions

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

### Task 5.3: Update Navigation

**Files:**
- Modify: `apps/backoffice/components/dashboard/sidebar.tsx`

**Step 1: Add event navigation links**

Add to imports:
```typescript
import {
  // ... existing imports
  Newspaper,
  FolderKanban,
  Calendar,
  // ... rest
} from "lucide-react";
```

Add to navItems after News items:
```typescript
{ href: "/manage/news", label: "News", icon: Newspaper, permission: "NEWS_VIEW" },
{ href: "/manage/news-categories", label: "News Categories", icon: FolderKanban, permission: "NEWS_CATEGORIES_MANAGE" },
{ href: "/manage/events", label: "Events", icon: Calendar, permission: "EVENTS_VIEW" },
{ href: "/manage/event-categories", label: "Event Categories", icon: FolderKanban, permission: "EVENT_CATEGORIES_MANAGE" },
```

**Step 2: Commit**

```bash
git add apps/backoffice/components/dashboard/sidebar.tsx
git commit -m "feat: add event management links to navigation

- Add Events and Event Categories links to sidebar
- Use appropriate icons (Calendar, FolderKanban)
- Apply permission checks for access control

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## PHASE 6: Environment Variables & Testing

### Task 6.1: Update Environment Files

**Files:**
- Modify: `apps/backoffice/.env.example`
- Modify: `apps/landing/.env.local`

**Step 1: Add REVALIDATE_SECRET to backoffice .env.example** (if not exists)

**Step 2: Update landing .env.local**

```bash
NEXT_PUBLIC_BACKOFFICE_URL=http://localhost:3001
REVALIDATE_SECRET=shared-secret-here
LANDING_REVALIDATE_SECRET=shared-secret-here
```

**Step 3: Commit**

```bash
git add apps/backoffice/.env.example apps/landing/.env.local
git commit -m "feat: add environment variables for event integration

- Document REVALIDATE_SECRET for cache invalidation
- Add NEXT_PUBLIC_BACKOFFICE_URL for landing to fetch data

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

### Task 6.2: Run Migration and Verify Data

**Step 1: Run migration script**

Run: `pnpm tsx scripts/migrate-events.ts`

Expected: Migration statistics displayed

**Step 2: Verify data**

Check database to ensure events and categories were created correctly

---

## PHASE 7: Final Testing & Documentation

### Task 7.1: Manual Testing Checklist

- [ ] Login as admin user
- [ ] Navigate to `/manage/event-categories`
- [ ] Create a new event category
- [ ] Navigate to `/manage/events`
- [ ] Create a new event with:
  - Set date and time
  - Add location and Google Maps URL
  - Set event type (online/offline/hybrid)
  - Add organizer info
  - Enable registration and add WA link
  - Upload event image
  - Set as featured
- [ ] Publish the event
- [ ] Edit event to update status to Cancelled/Completed
- [ ] Verify event appears on landing `/informasi-publik/agenda-kegiatan`
- [ ] Test calendar view
- [ ] Test category filter
- [ ] Test status update

### Task 7.2: Update Documentation

**Files:**
- Modify: `README.md` or project docs

Add section:
```markdown
## Event Management

Events are managed through the backoffice at `/manage/events`.

### Features

- Rich text editing with TipTap
- Featured image upload
- Category management
- Event type (online/offline/hybrid)
- Registration management (info only)
- Publishing workflow (Draft → Published → Cancelled/Completed)
- Activity logging
```

---

## Summary

This implementation plan covers:

1. **Database** - Prisma models, migrations, seeding
2. **Backend API** - Protected routes for CRUD, public routes for landing
3. **Landing** - API consumption, ISR caching, revalidation
4. **Backoffice UI** - Tables, forms, permissions
5. **Navigation** - Sidebar links
6. **Environment** - Configuration for cross-app communication
7. **Testing** - Manual testing checklist

**Total Phases:** 7
**Total Tasks:** ~22
