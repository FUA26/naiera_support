# Services Management System - Design Document

**Date:** 2026-02-25
**Author:** Bandanaiera Team
**Status:** Approved

## Overview

Migrate services data from JSON files in landing to a database-driven system managed through backoffice with full Role-Based Access Control (RBCA). Landing will consume data via public API with caching.

## Current State

**Landing (apps/landing):**
- Services stored in `data/services/*.json` files
- 13 categories: population, health, education, economy, manpower, tourism, infrastructure, social, environment, government, ppid, disaster, multisector
- Each service has: slug, icon, name, description, detailedDescription, requirements, process, duration, cost, contactInfo, downloadForms, relatedServices, faqs
- File-based reading with `fs.readFileSync()`

**Backoffice (apps/backoffice):**
- PostgreSQL with Prisma ORM
- RBCA system with Permissions, Roles, Users
- Existing File model for uploads

## Design Goals

1. **Centralized Management** - Services managed via backoffice UI
2. **Role-Based Access** - Granular permissions for different user roles
3. **Performance** - Landing caches data with ISR (1 hour)
4. **Audit Trail** - Track all changes to services
5. **Workflow** - Draft → Publish status for content approval

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

### ServiceCategory

```prisma
model ServiceCategory {
  id          String    @id @default(cuid())
  name        String
  slug        String    @unique
  icon        String    // Lucide icon name: "Users", "Heart", "GraduationCap", etc.
  color       String    // Tailwind color: "primary", "rose", "blue", etc.
  bgColor     String    // CSS class: "bg-primary-lighter", "bg-rose-50", etc.
  showInMenu  Boolean   @default(true)
  order       Int
  services    Service[]
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  @@index([showInMenu])
  @@index([order])
}
```

### Service

```prisma
model Service {
  id                   String            @id @default(cuid())
  slug                 String            @unique
  icon                 String            // Lucide icon name
  name                 String
  description          String            // Short description for cards
  categoryId           String
  category             ServiceCategory   @relation(fields: [categoryId], references: [id])

  // Display options
  badge                String?           // e.g., "Populer", "Baru"
  stats                String?           // e.g., "8.5k", "4.2k"
  showInMenu           Boolean           @default(true)
  order                Int               @default(0)
  isIntegrated         Boolean           @default(false)  // Has working system integration

  // Rich content (JSONB for flexible schema)
  detailedDescription  String?           // Full description
  requirements         Json?             // String[] - list of requirements
  process              Json?             // String[] - step by step process
  duration             String?           // e.g., "1-3 hari kerja"
  cost                 String?           // e.g., "Mulai dari Rp 42.000/bulan"
  contactInfo          Json?             // { office: string, phone: string, email: string }
  faqs                 Json?             // [{ question: string, answer: string }]

  // Download forms (hybrid: file upload OR external URL)
  downloadForms        Json?             // [{ type: "file"|"url", name: string, value: string, fileId?: string }]

  // Related services (by slug reference)
  relatedServices      Json?             // String[] of service slugs

  // Publishing workflow
  status               ServiceStatus     @default(DRAFT)

  // Audit - who created/updated
  createdById          String
  createdBy            User              @relation("ServiceCreator", fields: [createdById], references: [id])
  updatedById          String?
  updatedBy            User?             @relation("ServiceUpdater", fields: [updatedById], references: [id])

  createdAt            DateTime          @default(now())
  updatedAt            DateTime          @updatedAt

  // Relations
  activityLogs         ServiceActivityLog[]

  @@index([categoryId])
  @@index([status])
  @@index([order])
  @@index([slug])
}

enum ServiceStatus {
  DRAFT
  PUBLISHED
  ARCHIVED
}
```

### ServiceActivityLog

```prisma
model ServiceActivityLog {
  id          String   @id @default(cuid())
  serviceId   String
  service     Service  @relation(fields: [serviceId], references: [id], onDelete: Cascade)
  userId      String
  action      String   // created, updated, published, unpublished, archived, reordered, deleted
  changes     Json?    // { before: {...}, after: {...} }
  createdAt   DateTime @default(now())

  @@index([serviceId])
  @@index([userId])
  @@index([createdAt])
}
```

### User Model Updates

Add relations to User model:

```prisma
model User {
  // ... existing fields ...
  createdServices     Service[]         @relation("ServiceCreator")
  updatedServices     Service[]         @relation("ServiceUpdater")
  serviceActivityLogs ServiceActivityLog[]
}
```

### Permissions

Add to seed data:

| Permission Name | Category | Description |
|----------------|----------|-------------|
| `services:view` | Services | View services list |
| `services:create` | Services | Create new services |
| `services:edit` | Services | Edit draft services |
| `services:publish` | Services | Publish/unpublish services |
| `services:delete` | Services | Delete services |
| `services:reorder` | Services | Change service order |
| `categories:manage` | Services | Manage service categories |

## API Routes

### Protected Routes (Backoffice UI)

All routes require authentication + specific permissions.

| Method | Route | Permission | Description |
|--------|-------|------------|-------------|
| GET | `/api/services` | `services:view` | List services with filters |
| POST | `/api/services` | `services:create` | Create new service |
| GET | `/api/services/[id]` | `services:view` | Get service details |
| PUT | `/api/services/[id]` | `services:edit` | Update service |
| DELETE | `/api/services/[id]` | `services:delete` | Delete service |
| PATCH | `/api/services/[id]/publish` | `services:publish` | Publish/unpublish |
| PATCH | `/api/services/reorder` | `services:reorder` | Bulk reorder |
| GET | `/api/categories` | `categories:manage` | List categories |
| POST | `/api/categories` | `categories:manage` | Create category |
| PUT | `/api/categories/[id]` | `categories:manage` | Update category |
| DELETE | `/api/categories/[id]` | `categories:manage` | Delete category |
| GET | `/api/services/[id]/logs` | `services:view` | Get activity logs |
| POST | `/api/sync/landing` | `services:publish` | Trigger landing revalidate |

### Public Routes (Landing)

No authentication required. Returns only PUBLISHED services.

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/public/services` | List published services |
| GET | `/api/public/services/categories` | List visible categories |
| GET | `/api/public/services/[slug]` | Get service by slug |
| GET | `/api/public/categories/[slug]` | Get category with services |
| POST | `/api/public/revalidate` | Revalidate cache (with secret) |

### Response Formats

**Service List Response:**
```json
{
  "services": [
    {
      "id": "clxxx",
      "slug": "bpjs-kesehatan",
      "icon": "Heart",
      "name": "BPJS Kesehatan",
      "description": "Pendaftaran dan informasi BPJS",
      "badge": "Populer",
      "stats": "8.5k",
      "categoryId": "health",
      "category": {
        "id": "clxxx",
        "name": "Kesehatan",
        "slug": "health"
      }
    }
  ],
  "total": 150,
  "page": 1,
  "pageSize": 20
}
```

**Service Detail Response:**
```json
{
  "id": "clxxx",
  "slug": "bpjs-kesehatan",
  "icon": "Heart",
  "name": "BPJS Kesehatan",
  "description": "Pendaftaran dan informasi BPJS",
  "detailedDescription": "...",
  "requirements": ["Fotokopi KK", "Fotokopi E-KTP"],
  "process": ["Registrasi", "Isi formulir"],
  "duration": "1-3 hari kerja",
  "cost": "Mulai dari Rp 42.000/bulan",
  "contactInfo": {
    "office": "Kantor BPJS",
    "phone": "165",
    "email": "-"
  },
  "faqs": [
    { "question": "...", "answer": "..." }
  ],
  "downloadForms": [
    { "type": "file", "name": "Formulir", "value": "https://..." }
  ],
  "category": { "id": "...", "name": "Kesehatan", "slug": "health" }
}
```

## Landing Integration

### Updated services-data.ts

```typescript
const BACKOFFICE_URL = process.env.NEXT_PUBLIC_BACKOFFICE_URL || 'http://localhost:3001';
const REVALIDATE_SECRET = process.env.REVALIDATE_SECRET;

export async function getServiceCategories(): Promise<ServiceCategory[]> {
  const res = await fetch(`${BACKOFFICE_URL}/api/public/services/categories`, {
    next: { revalidate: 3600 } // Cache 1 hour
  });
  if (!res.ok) return [];
  return res.json();
}

export async function getServicesByCategory(categoryId: string): Promise<Service[]> {
  const res = await fetch(`${BACKOFFICE_URL}/api/public/services?categoryId=${categoryId}`, {
    next: { revalidate: 3600 }
  });
  if (!res.ok) return [];
  return res.json();
}

export async function getServiceBySlug(slug: string): Promise<Service | null> {
  const res = await fetch(`${BACKOFFICE_URL}/api/public/services/${slug}`, {
    next: { revalidate: 3600 }
  });
  if (!res.ok) return null;
  return res.json();
}
```

### Revalidate Webhook Handler (Landing)

```typescript
// app/api/public/revalidate/route.ts
import { revalidatePath } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get('secret');
  const path = request.nextUrl.searchParams.get('path');

  if (secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ message: 'Invalid secret' }, { status: 401 });
  }

  try {
    if (path) {
      revalidatePath(path);
    } else {
      // Revalidate all service-related paths
      revalidatePath('/layanan');
      revalidatePath('/api/public/services');
    }

    return NextResponse.json({ revalidated: true });
  } catch (err) {
    return NextResponse.json({ message: 'Error revalidating' }, { status: 500 });
  }
}
```

## Backoffice UI Pages

### Services Management

**Route:** `/manage/services`

**Features:**
- Data table with columns: Icon, Name, Category, Status, Order, Actions
- Filters by: Category, Status (Draft/Published/Archived)
- Search by name
- Row actions: Edit, Delete, Publish/Unpublish
- New Service button (top right)
- Drag-drop handle for ordering

**Service Form Modal/Page:**
- Basic Info: Name, Slug (auto-generated), Icon selector, Description
- Category: Dropdown select
- Display: Badge text, Stats, Show in menu toggle, Is integrated toggle
- Content: Detailed description, Requirements (add/remove), Process steps
- Details: Duration, Cost
- Contact: Office, Phone, Email
- FAQ: Add/remove question-answer pairs
- Download Forms: Add file OR add external URL
- Related Services: Multi-select by name
- Order: Number input
- Status: Draft/Published/Archived

### Categories Management

**Route:** `/manage/service-categories`

**Features:**
- List view with: Icon, Name, Slug, Show in menu, Order, Actions
- Edit/Delete actions
- New Category button

**Category Form:**
- Name, Slug (auto-generated)
- Icon selector (Lucide icons)
- Color picker (preset Tailwind colors)
- Background color picker
- Show in menu toggle
- Order number

### Activity Log

**Route:** `/manage/services/[id]/activity`

**Features:**
- Timeline view of all changes
- Shows: User, Action, Timestamp, Changes diff
- Filters by action type

### Manual Sync

**Location:** Services list page header

**Button:** "Sync to Landing"

**Action:**
- POST to `/api/sync/landing`
- Shows success/error toast
- Landing cache invalidated

## Activity Log Actions

| Action | Description |
|--------|-------------|
| `created` | New service created |
| `updated` | Service details changed |
| `published` | Service status changed to PUBLISHED |
| `unpublished` | Service status changed to DRAFT |
| `archived` | Service status changed to ARCHIVED |
| `deleted` | Service deleted |
| `reordered` | Service order changed |

## Data Migration

### Migration Strategy

1. **Create new tables** - Run Prisma migration
2. **Seed categories** - Import from `data/services/categories.json`
3. **Seed services** - Import from all `data/services/*.json` files
4. **Verify** - Check data integrity
5. **Switch landing** - Update landing to use API
6. **Clean up** - Remove old JSON files (optional, keep as backup)

### Migration Script

```typescript
// scripts/migrate-services.ts
import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@workspace/db';

const prisma = new PrismaClient();

async function migrateServices() {
  // 1. Migrate categories
  const categoriesData = JSON.parse(
    fs.readFileSync('data/services/categories.json', 'utf8')
  );

  for (const cat of categoriesData) {
    await prisma.serviceCategory.upsert({
      where: { slug: cat.slug },
      update: cat,
      create: cat
    });
  }

  // 2. Migrate services
  const categories = await prisma.serviceCategory.findMany();
  const adminUser = await prisma.user.findFirst({ where: { role: { name: 'ADMIN' } } });

  for (const category of categories) {
    const servicesPath = `data/services/${category.id}.json`;
    if (!fs.existsSync(servicesPath)) continue;

    const servicesData = JSON.parse(fs.readFileSync(servicesPath, 'utf8'));

    for (const service of servicesData) {
      await prisma.service.create({
        data: {
          ...service,
          categoryId: category.id,
          status: 'PUBLISHED',
          createdById: adminUser.id
        }
      });
    }
  }
}

migrateServices();
```

## Environment Variables

**Backoffice (.env):**
```bash
# Existing
DATABASE_URL=...

# New
REVALIDATE_SECRET=your-secret-key-here
```

**Landing (.env):**
```bash
# New
NEXT_PUBLIC_BACKOFFICE_URL=https://backoffice.naiera.go.id
REVALIDATE_SECRET=your-secret-key-here
```

## Security Considerations

1. **Public API** - Only returns PUBLISHED services
2. **Revalidate Secret** - Shared secret between backoffice and landing
3. **RBCA** - All protected routes check permissions
4. **File Upload** - Uses existing File system with S3-compatible storage
5. **Input Validation** - Zod schemas for all inputs
6. **Rate Limiting** - Apply to public API endpoints

## Performance Considerations

1. **ISR Cache** - Landing caches for 1 hour
2. **Database Indexes** - On categoryId, status, order, slug
3. **Pagination** - Service list uses pagination
4. **Selective Fetching** - Only fetch required fields for list view

## Future Enhancements (Out of Scope)

- Preview mode for draft services
- Bulk actions (enable/disable, change category)
- Import/Export functionality
- Multi-language support
- Service analytics/views tracking
- Advanced search with filters
- Service versioning

## Success Criteria

- [ ] All services migrated from JSON to database
- [ ] Backoffice UI can CRUD services
- [ ] RBCA permissions enforced correctly
- [ ] Landing displays services from API
- [ ] Manual sync button clears landing cache
- [ ] Activity log tracks all changes
- [ ] Draft services not visible on landing
- [ ] File upload works for download forms
- [ ] External URL works for download forms
