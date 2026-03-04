# Event Management System - Design Document

**Date:** 2026-03-02
**Author:** Bandanaiera Team
**Status:** Approved

## Overview

Migrate events data from JSON files in landing to a database-driven system managed through backoffice with full Role-Based Access Control (RBAC). Landing will consume data via public API with ISR caching.

## Current State

**Landing (apps/landing):**
- Events stored in `data/events/agenda.json` file
- Event structure: id, slug, title, date, time, location, category, attendees, status, type, image, description, organizer, registrationRequired, maxAttendees
- Status: upcoming, ongoing, completed
- Type: online, offline, hybrid
- File-based reading with `fs.readFileSync()`

**Backoffice (apps/backoffice):**
- PostgreSQL with Prisma ORM
- RBCA system with Permissions, Roles, Users
- Existing File model for uploads
- News & Service management patterns as reference

## Design Goals

1. **Centralized Management** - Events managed via backoffice UI
2. **Role-Based Access** - Granular permissions for different user roles
3. **Performance** - Landing caches data with ISR (1 hour)
4. **Audit Trail** - Track all changes to events
5. **Workflow** - Draft → Publish status, with additional status for events (Cancelled, Completed)
6. **Event-Specific Features** - Date/time, location, event type, registration info

## Architecture

```
┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
│   Landing       │◄────────┤  Backoffice API │─────────►│   PostgreSQL    │
│   (Public)      │  HTTP+  │   (Protected)   │         │   Database      │
│   Next.js ISR   │  Cache  │   RBCA          │         │   Prisma ORM    │
└─────────────────┘         └─────────────────┘         └─────────────────┘
                                      │
                                      ▼
                               Manual Sync Button
                                      │
                                      ▼
                               Revalidate Webhook
                                      │
                                      ▼
                               Landing Cache Clear
```

## Database Schema

### EventCategory

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

### Event

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

enum EventType {
  ONLINE
  OFFLINE
  HYBRID
}

enum EventStatus {
  DRAFT
  PUBLISHED
  CANCELLED
  COMPLETED
}
```

### EventActivityLog

```prisma
model EventActivityLog {
  id          String   @id @default(cuid())
  eventId     String
  event       Event    @relation(fields: [eventId], references: [id], onDelete: Cascade)
  userId      String
  action      String
  changes     Json?
  createdAt   DateTime @default(now())

  @@index([eventId])
  @@index([userId])
  @@index([createdAt])
}
```

### User Model Updates

Add relations to User model:
```prisma
  // Event Management Relations
  createdEvents      Event[]            @relation("EventCreator")
  updatedEvents      Event[]            @relation("EventUpdater")
  eventActivityLogs EventActivityLog[]
```

### File Model Updates

Add relation to File model:
```prisma
  eventsAsImage Event[] @relation("EventImage")
```

## Permissions

| Permission Name | Category | Description |
|----------------|----------|-------------|
| `events:view` | Events | View events list |
| `events:create` | Events | Create new events |
| `events:edit` | Events | Edit draft events |
| `events:delete` | Events | Delete events |
| `events:publish` | Events | Publish/unpublish events |
| `events:reorder` | Events | Change event order |
| `events-categories:manage` | Events | Manage event categories |

## API Routes

### Protected Routes (Backoffice UI)

| Method | Route | Permission | Description |
|--------|-------|------------|-------------|
| GET | `/api/events` | `events:view` | List events with filters |
| POST | `/api/events` | `events:create` | Create new event |
| GET | `/api/events/[id]` | `events:view` | Get event details |
| PUT | `/api/events/[id]` | `events:edit` | Update event |
| DELETE | `/api/events/[id]` | `events:delete` | Delete event |
| PATCH | `/api/events/[id]/status` | `events:edit` | Update status |
| GET | `/api/events/[id]/logs` | `events:view` | Get activity logs |
| GET | `/api/event-categories` | `events-categories:manage` | List categories |
| POST | `/api/event-categories` | `events-categories:manage` | Create category |
| PUT | `/api/event-categories/[id]` | `events-categories:manage` | Update category |
| DELETE | `/api/event-categories/[id]` | `events-categories:manage` | Delete category |

### Public Routes (Landing)

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/public/events` | List published events |
| GET | `/api/public/events/categories` | List visible categories |
| GET | `/api/public/events/[slug]` | Get event by slug |
| GET | `/api/public/events/upcoming` | Get upcoming events |
| GET | `/api/public/events/calendar` | Get events by month/year |

## Backoffice UI Pages

### Events Management

**Route:** `/manage/events`

**Features:**
- Data table dengan kolom: Image, Title, Date, Category, Status, Type, Actions
- Filters: Category, Status, Type
- Search by title
- Row actions: Edit, Delete, Update Status
- New Event button (top right)

**Event Form:**
- **Basic Info:** Title, Slug (auto-generated), Description
- **Category:** Dropdown select
- **Date & Time:** Date picker, Time input
- **Location:** Location name, Google Maps URL
- **Event Type:** Online/Offline/Hybrid toggle
- **Organizer:** Name, Contact info
- **Registration:** Toggle required, URL input
- **Media:** Image upload
- **Display:** Featured toggle, Show in menu toggle
- **Order:** Number input
- **Status:** Draft/Published/Cancelled/Completed

### Event Categories Management

**Route:** `/manage/event-categories`

**Features:**
- List view dengan: Name, Slug, Color, Show in menu, Order, Actions
- Edit/Delete actions
- New Category button

## Landing Integration

### Updated events-data.ts

```typescript
const BACKOFFICE_URL = process.env.NEXT_PUBLIC_BACKOFFICE_URL || 'http://localhost:3001';

export async function getAllEvents(): Promise<Event[]> {
  const res = await fetch(`${BACKOFFICE_URL}/api/public/events`, {
    next: { revalidate: 3600 }
  });
  return res.json();
}

export async function getUpcomingEvents(limit?: number): Promise<Event[]> {
  const res = await fetch(`${BACKOFFICE_URL}/api/public/events/upcoming${limit ? `?limit=${limit}` : ''}`, {
    next: { revalidate: 3600 }
  });
  return res.json();
}

export async function getEventBySlug(slug: string): Promise<Event | null> {
  const res = await fetch(`${BACKOFFICE_URL}/api/public/events/${slug}`, {
    next: { revalidate: 3600 }
  });
  return res.json();
}

export async function getEventsByMonth(year: number, month: number): Promise<Event[]> {
  const res = await fetch(`${BACKOFFICE_URL}/api/public/events/calendar?year=${year}&month=${month}`, {
    next: { revalidate: 3600 }
  });
  return res.json();
}
```

## Data Migration

### Migration Strategy

1. Create new tables (Prisma migration)
2. Seed categories from unique values in `data/events/agenda.json`
3. Seed events from `data/events/agenda.json`
4. Verify data integrity
5. Update landing to use API
6. Remove old JSON files (optional, keep as backup)

### Migration Script

```typescript
// scripts/migrate-events.ts
import fs from 'fs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function migrateEvents() {
  const eventsData = JSON.parse(
    fs.readFileSync('apps/landing/data/events/agenda.json', 'utf8')
  );

  // 1. Migrate categories
  const uniqueCategories = [...new Set(eventsData.map((e: any) => e.category))];

  for (const [index, name] of uniqueCategories.entries()) {
    const slug = name.toLowerCase().replace(/\s+/g, '-');
    await prisma.eventCategory.upsert({
      where: { slug },
      update: {},
      create: { name, slug, order: index, color: 'primary' }
    });
  }

  // 2. Migrate events
  const adminUser = await prisma.user.findFirst({ where: { role: { name: 'ADMIN' } } });
  const categories = await prisma.eventCategory.findMany();

  for (const event of eventsData) {
    const category = categories.find(c => c.name === event.category);
    await prisma.event.create({
      data: {
        ...event,
        categoryId: category?.id,
        status: 'PUBLISHED',
        createdById: adminUser.id,
        date: new Date(event.date),
        type: event.type?.toUpperCase() || 'OFFLINE',
      }
    });
  }
}
```

## Environment Variables

**Backoffice (.env):**
```bash
# Existing
DATABASE_URL=...

# Add
REVALIDATE_SECRET=your-secret-key-here
LANDING_URL=http://localhost:3000
```

**Landing (.env):**
```bash
# New
NEXT_PUBLIC_BACKOFFICE_URL=http://localhost:3001
REVALIDATE_SECRET=your-secret-key-here
```

## Success Criteria

- [ ] Semua events migrated dari JSON ke database
- [ ] Backoffice UI bisa CRUD events
- [ ] RBAC permissions enforced correctly
- [ ] Landing displays events dari API
- [ ] Manual sync button clears landing cache
- [ ] Activity log tracks semua perubahan
- [ ] Draft events tidak visible di landing
- [ ] Image upload berfungsi untuk event banner
- [ ] Event categories dinamis (CRUD)
- [ ] Status update (cancel/complete) berfungsi
- [ ] Calendar/month view berfungsi
