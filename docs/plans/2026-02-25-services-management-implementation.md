# Services Management System - Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Migrate services from JSON files to database with full backoffice RBCA management and landing API integration.

**Architecture:** Backoffice manages services in PostgreSQL via Prisma, landing consumes via public API with ISR caching. Manual sync triggers revalidation.

**Tech Stack:** Next.js 16, Prisma, PostgreSQL, Zod, next-themes, Lucide icons, existing RBCA system

---

## PHASE 1: Database Schema & Migrations

### Task 1.1: Update Prisma Schema

**Files:**
- Modify: `apps/backoffice/prisma/schema.prisma`

**Step 1: Add ServiceStatus enum**

Add after line 169 (after FileCategory enum):

```prisma
enum ServiceStatus {
  DRAFT
  PUBLISHED
  ARCHIVED
}
```

**Step 2: Add ServiceCategory model**

Add after FileCategory enum:

```prisma
model ServiceCategory {
  id          String    @id @default(cuid())
  name        String
  slug        String    @unique
  icon        String
  color       String
  bgColor     String
  showInMenu  Boolean   @default(true)
  order       Int
  services    Service[]
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  @@index([showInMenu])
  @@index([order])
}
```

**Step 3: Add Service model**

Add after ServiceCategory model:

```prisma
model Service {
  id                   String            @id @default(cuid())
  slug                 String            @unique
  icon                 String
  name                 String
  description          String
  categoryId           String
  category             ServiceCategory   @relation(fields: [categoryId], references: [id])
  badge                String?
  stats                String?
  showInMenu           Boolean           @default(true)
  order                Int               @default(0)
  isIntegrated         Boolean           @default(false)
  detailedDescription  String?
  requirements         Json?
  process              Json?
  duration             String?
  cost                 String?
  contactInfo          Json?
  faqs                 Json?
  downloadForms        Json?
  relatedServices      Json?
  status               ServiceStatus     @default(DRAFT)
  createdById          String
  createdBy            User              @relation("ServiceCreator", fields: [createdById], references: [id])
  updatedById          String?
  updatedBy            User?             @relation("ServiceUpdater", fields: [updatedById], references: [id])
  createdAt            DateTime          @default(now())
  updatedAt            DateTime          @updatedAt
  activityLogs         ServiceActivityLog[]

  @@index([categoryId])
  @@index([status])
  @@index([order])
  @@index([slug])
}
```

**Step 4: Add ServiceActivityLog model**

Add after Service model:

```prisma
model ServiceActivityLog {
  id          String   @id @default(cuid())
  serviceId   String
  service     Service  @relation(fields: [serviceId], references: [id], onDelete: Cascade)
  userId      String
  action      String
  changes     Json?
  createdAt   DateTime @default(now())
  user        User     @relation("ServiceActivityLogs", fields: [userId], references: [id])

  @@index([serviceId])
  @@index([userId])
  @@index([createdAt])
}
```

**Step 5: Update User model relations**

Add these relations inside the User model (after line 61, after avatarUrl field):

```prisma
  // Service management relations
  createdServices     Service[]         @relation("ServiceCreator")
  updatedServices     Service[]         @relation("ServiceUpdater")
  serviceActivityLogs ServiceActivityLog[] @relation("ServiceActivityLogs")
```

**Step 6: Generate Prisma client**

Run: `cd apps/backoffice && pnpm prisma generate`

Expected: Prisma client generated successfully

**Step 7: Create migration**

Run: `cd apps/backoffice && pnpm prisma migrate dev --name add_services_management`

Expected: Migration created and applied

**Step 8: Commit**

```bash
git add apps/backoffice/prisma/schema.prisma apps/backoffice/prisma/migrations/
git commit -m "feat(db): add services management schema"
```

---

### Task 1.2: Seed Permissions

**Files:**
- Modify: `apps/backoffice/prisma/seed.ts` (or create seed file if not exists)

**Step 1: Add services permissions to seed**

Find the permissions seed section and add:

```typescript
// Services permissions
const servicesPermissions = [
  { name: 'services:view', category: 'Services', description: 'View services list' },
  { name: 'services:create', category: 'Services', description: 'Create new services' },
  { name: 'services:edit', category: 'Services', description: 'Edit draft services' },
  { name: 'services:publish', category: 'Services', description: 'Publish/unpublish services' },
  { name: 'services:delete', category: 'Services', description: 'Delete services' },
  { name: 'services:reorder', category: 'Services', description: 'Change service order' },
  { name: 'categories:manage', category: 'Services', description: 'Manage service categories' },
];
```

**Step 2: Assign permissions to ADMIN role**

In the role seeding section, add services permissions to ADMIN role.

**Step 3: Run seed**

Run: `cd apps/backoffice && pnpm prisma db seed`

Expected: Permissions created successfully

**Step 4: Commit**

```bash
git add apps/backoffice/prisma/seed.ts
git commit -m "feat(seed): add services permissions"
```

---

### Task 1.3: Create Migration Script

**Files:**
- Create: `apps/backoffice/scripts/migrate-services.ts`

**Step 1: Create migration script**

```typescript
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { PrismaClient } from '@workspace/db';

const prisma = new PrismaClient();

interface ServiceCategoryData {
  id: string;
  name: string;
  icon: string;
  color: string;
  bgColor: string;
  slug: string;
  showInMenu: boolean;
  order: number;
}

interface ServiceData {
  slug: string;
  icon: string;
  name: string;
  description: string;
  categoryId: string;
  badge?: string;
  stats?: string;
  showInMenu?: boolean;
  order?: number;
  isIntegrated?: boolean;
  detailedDescription?: string;
  requirements?: string[];
  process?: string[];
  duration?: string;
  cost?: string;
  contactInfo?: {
    office: string;
    phone: string;
    email: string;
  };
  downloadForms?: Array<{
    name: string;
    url: string;
  }>;
  relatedServices?: string[];
  faqs?: Array<{
    question: string;
    answer: string;
  }>;
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function migrateServices() {
  console.log('Starting services migration...');

  // Path to landing services data
  const servicesDataPath = path.resolve(__dirname, '../../../landing/data/services');

  // 1. Migrate categories
  console.log('Migrating categories...');
  const categoriesPath = path.join(servicesDataPath, 'categories.json');
  const categoriesData: ServiceCategoryData[] = JSON.parse(fs.readFileSync(categoriesPath, 'utf8'));

  const categoryMap = new Map<string, string>();

  for (const cat of categoriesData) {
    const category = await prisma.serviceCategory.upsert({
      where: { slug: cat.slug },
      update: {
        name: cat.name,
        icon: cat.icon,
        color: cat.color,
        bgColor: cat.bgColor,
        showInMenu: cat.showInMenu,
        order: cat.order,
      },
      create: {
        name: cat.name,
        slug: cat.slug,
        icon: cat.icon,
        color: cat.color,
        bgColor: cat.bgColor,
        showInMenu: cat.showInMenu,
        order: cat.order,
      },
    });
    categoryMap.set(cat.id, category.id);
    console.log(`  - Migrated category: ${cat.name}`);
  }

  // 2. Get admin user for createdById
  const adminUser = await prisma.user.findFirst({
    where: { role: { name: 'ADMIN' } },
  });

  if (!adminUser) {
    throw new Error('No admin user found. Please create an admin user first.');
  }

  // 3. Migrate services
  console.log('\nMigrating services...');
  let totalServices = 0;

  for (const [, dbCategoryId] of categoryMap) {
    const category = categoriesData.find(c => categoryMap.get(c.id) === dbCategoryId);
    if (!category) continue;

    const servicesPath = path.join(servicesDataPath, `${category.id}.json`);

    if (!fs.existsSync(servicesPath)) {
      console.log(`  - No services file for ${category.id}, skipping...`);
      continue;
    }

    const servicesData: ServiceData[] = JSON.parse(fs.readFileSync(servicesPath, 'utf8'));

    for (const service of servicesData) {
      // Convert downloadForms to hybrid format
      const downloadForms = service.downloadForms?.map(form => ({
        type: 'url' as const,
        name: form.name,
        value: form.url,
      }));

      await prisma.service.create({
        data: {
          slug: service.slug,
          icon: service.icon,
          name: service.name,
          description: service.description,
          categoryId: dbCategoryId,
          badge: service.badge,
          stats: service.stats,
          showInMenu: service.showInMenu ?? true,
          order: service.order ?? 999,
          isIntegrated: service.isIntegrated ?? false,
          detailedDescription: service.detailedDescription,
          requirements: service.requirements,
          process: service.process,
          duration: service.duration,
          cost: service.cost,
          contactInfo: service.contactInfo,
          faqs: service.faqs,
          downloadForms,
          relatedServices: service.relatedServices,
          status: 'PUBLISHED',
          createdById: adminUser.id,
        },
      });
      totalServices++;
    }
    console.log(`  - Migrated ${servicesData.length} services for ${category.name}`);
  }

  console.log(`\n✅ Migration complete! ${totalServices} services migrated.`);
}

migrateServices()
  .catch((e) => {
    console.error('Migration failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

**Step 2: Add script to package.json**

Add to `apps/backoffice/package.json` scripts:

```json
"migrate:services": "tsx scripts/migrate-services.ts"
```

**Step 3: Install tsx if needed**

Run: `cd apps/backoffice && pnpm add -D tsx`

**Step 4: Run migration (will be done after API is ready)**

This will be run in Task 4.1

**Step 5: Commit**

```bash
git add apps/backoffice/scripts/migrate-services.ts apps/backoffice/package.json
git commit -m "feat(migrate): add services migration script"
```

---

## PHASE 2: Types & Validation

### Task 2.1: Create Service Types

**Files:**
- Create: `apps/backoffice/lib/services/types.ts`

**Step 1: Create types file**

```typescript
import { ServiceStatus } from '@workspace/db';

export interface ServiceCategory {
  id: string;
  name: string;
  slug: string;
  icon: string;
  color: string;
  bgColor: string;
  showInMenu: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Service {
  id: string;
  slug: string;
  icon: string;
  name: string;
  description: string;
  categoryId: string;
  category?: ServiceCategory;
  badge?: string | null;
  stats?: string | null;
  showInMenu: boolean;
  order: number;
  isIntegrated: boolean;
  detailedDescription?: string | null;
  requirements?: string[] | null;
  process?: string[] | null;
  duration?: string | null;
  cost?: string | null;
  contactInfo?: ContactInfo | null;
  faqs?: FAQ[] | null;
  downloadForms?: DownloadForm[] | null;
  relatedServices?: string[] | null;
  status: ServiceStatus;
  createdById: string;
  updatedById?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ContactInfo {
  office: string;
  phone: string;
  email: string;
}

export interface FAQ {
  question: string;
  answer: string;
}

export interface DownloadForm {
  type: 'file' | 'url';
  name: string;
  value: string;
  fileId?: string;
}

export interface ServiceActivityLog {
  id: string;
  serviceId: string;
  userId: string;
  action: string;
  changes?: Record<string, unknown> | null;
  createdAt: Date;
}

export type ServiceActivityAction =
  | 'created'
  | 'updated'
  | 'published'
  | 'unpublished'
  | 'archived'
  | 'deleted'
  | 'reordered';
```

**Step 2: Commit**

```bash
git add apps/backoffice/lib/services/types.ts
git commit -m "feat(types): add services types"
```

---

### Task 2.2: Create Zod Validation Schemas

**Files:**
- Create: `apps/backoffice/lib/services/validations.ts`

**Step 1: Create validation schemas**

```typescript
import { z } from 'zod';

// Service Category schemas
export const serviceCategorySchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
  icon: z.string().min(1, 'Icon is required'),
  color: z.string().min(1, 'Color is required'),
  bgColor: z.string().min(1, 'Background color is required'),
  showInMenu: z.boolean().default(true),
  order: z.number().int().min(0).default(0),
});

export const serviceCategoryUpdateSchema = serviceCategorySchema.partial().extend({
  id: z.string().cuid(),
});

// Contact info schema
export const contactInfoSchema = z.object({
  office: z.string().min(1, 'Office is required'),
  phone: z.string().min(1, 'Phone is required'),
  email: z.string().email('Invalid email').optional().default('-'),
});

// FAQ schema
export const faqSchema = z.object({
  question: z.string().min(1, 'Question is required'),
  answer: z.string().min(1, 'Answer is required'),
});

// Download form schema
export const downloadFormSchema = z.object({
  type: z.enum(['file', 'url']),
  name: z.string().min(1, 'Name is required'),
  value: z.string().min(1, 'URL or file ID is required'),
  fileId: z.string().cuid().optional(),
});

// Service schemas
export const serviceSchema = z.object({
  slug: z.string().min(1).max(200).regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
  icon: z.string().min(1, 'Icon is required'),
  name: z.string().min(1, 'Name is required').max(200),
  description: z.string().min(1, 'Description is required').max(500),
  categoryId: z.string().cuid('Invalid category ID'),
  badge: z.string().max(50).optional(),
  stats: z.string().max(50).optional(),
  showInMenu: z.boolean().default(true),
  order: z.number().int().min(0).default(0),
  isIntegrated: z.boolean().default(false),
  detailedDescription: z.string().max(5000).optional(),
  requirements: z.array(z.string()).optional(),
  process: z.array(z.string()).optional(),
  duration: z.string().max(100).optional(),
  cost: z.string().max(200).optional(),
  contactInfo: contactInfoSchema.optional(),
  faqs: z.array(faqSchema).optional(),
  downloadForms: z.array(downloadFormSchema).optional(),
  relatedServices: z.array(z.string()).optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).default('DRAFT'),
});

export const serviceCreateSchema = serviceSchema.omit({ id: true, createdById: true, createdAt: true, updatedAt: true });

export const serviceUpdateSchema = serviceCreateSchema.partial().extend({
  id: z.string().cuid(),
});

// Reorder schema
export const serviceReorderSchema = z.object({
  services: z.array(z.object({
    id: z.string().cuid(),
    order: z.number().int().min(0),
  })),
});

// Query schemas
export const serviceQuerySchema = z.object({
  categoryId: z.string().optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export type ServiceCategoryInput = z.infer<typeof serviceCategorySchema>;
export type ServiceInput = z.infer<typeof serviceCreateSchema>;
export type ServiceUpdateInput = z.infer<typeof serviceUpdateSchema>;
export type ServiceReorderInput = z.infer<typeof serviceReorderSchema>;
export type ServiceQueryInput = z.infer<typeof serviceQuerySchema>;
```

**Step 2: Commit**

```bash
git add apps/backoffice/lib/services/validations.ts
git commit -m "feat(validation): add services validation schemas"
```

---

## PHASE 3: API Routes - Services

### Task 3.1: Create GET /api/services (List)

**Files:**
- Create: `apps/backoffice/app/api/services/route.ts`

**Step 1: Create services list route**

```typescript
import { auth } from '@/lib/auth/config';
import { prisma } from '@/lib/db/prisma';
import { serviceQuerySchema } from '@/lib/services/validations';
import { NextResponse } from 'next/server';
import { z } from 'zod';

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Check services:view permission
  const hasPermission = session.user.permissions?.includes('services:view');
  if (!hasPermission) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const query = serviceQuerySchema.parse(Object.fromEntries(searchParams));

    const where: Record<string, unknown> = {};

    if (query.categoryId) {
      where.categoryId = query.categoryId;
    }

    if (query.status) {
      where.status = query.status;
    }

    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [services, total] = await Promise.all([
      prisma.service.findMany({
        where,
        include: {
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
      }),
      prisma.service.count({ where }),
    ]);

    return NextResponse.json({
      services,
      total,
      page: query.page,
      pageSize: query.pageSize,
      totalPages: Math.ceil(total / query.pageSize),
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid query', details: error.errors }, { status: 400 });
    }
    console.error('Error fetching services:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

**Step 2: Test locally (after implementation)**

Run: `curl http://localhost:3001/api/services -H "Cookie: <session>"`

Expected: JSON response with services array

**Step 3: Commit**

```bash
git add apps/backoffice/app/api/services/route.ts
git commit -m "feat(api): add services list endpoint"
```

---

### Task 3.2: Create POST /api/services (Create)

**Files:**
- Modify: `apps/backoffice/app/api/services/route.ts`

**Step 1: Add POST handler**

Add to the same route.ts file:

```typescript
import { serviceCreateSchema } from '@/lib/services/validations';

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Check services:create permission
  const hasPermission = session.user.permissions?.includes('services:create');
  if (!hasPermission) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const data = serviceCreateSchema.parse(body);

    // Check if category exists
    const category = await prisma.serviceCategory.findUnique({
      where: { id: data.categoryId },
    });

    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    // Check if slug is unique
    const existing = await prisma.service.findUnique({
      where: { slug: data.slug },
    });

    if (existing) {
      return NextResponse.json({ error: 'Slug already exists' }, { status: 409 });
    }

    const service = await prisma.service.create({
      data: {
        ...data,
        createdById: session.user.id,
      },
      include: {
        category: true,
      },
    });

    // Create activity log
    await prisma.serviceActivityLog.create({
      data: {
        serviceId: service.id,
        userId: session.user.id,
        action: 'created',
        changes: { after: service },
      },
    });

    return NextResponse.json(service, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: error.errors }, { status: 400 });
    }
    console.error('Error creating service:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

**Step 2: Commit**

```bash
git add apps/backoffice/app/api/services/route.ts
git commit -m "feat(api): add service create endpoint"
```

---

### Task 3.3: Create GET /api/services/[id]

**Files:**
- Create: `apps/backoffice/app/api/services/[id]/route.ts`

**Step 1: Create service detail route**

```typescript
import { auth } from '@/lib/auth/config';
import { prisma } from '@/lib/db/prisma';
import { NextResponse } from 'next/server';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Check services:view permission
  const hasPermission = session.user.permissions?.includes('services:view');
  if (!hasPermission) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const { id } = await params;

    const service = await prisma.service.findUnique({
      where: { id },
      include: {
        category: true,
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
      },
    });

    if (!service) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 });
    }

    return NextResponse.json(service);
  } catch (error) {
    console.error('Error fetching service:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

**Step 2: Commit**

```bash
git add apps/backoffice/app/api/services/[id]/route.ts
git commit -m "feat(api): add service detail endpoint"
```

---

### Task 3.4: Create PUT /api/services/[id] (Update)

**Files:**
- Modify: `apps/backoffice/app/api/services/[id]/route.ts`

**Step 1: Add PUT handler**

Add to the same route.ts file:

```typescript
import { serviceUpdateSchema } from '@/lib/services/validations';
import { z } from 'zod';

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Check services:edit permission
  const hasPermission = session.user.permissions?.includes('services:edit');
  if (!hasPermission) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const { id } = await params;
    const body = await req.json();
    const data = serviceUpdateSchema.parse(body);

    // Get existing service
    const existing = await prisma.service.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 });
    }

    // Check slug uniqueness if changed
    if (data.slug && data.slug !== existing.slug) {
      const slugExists = await prisma.service.findUnique({
        where: { slug: data.slug },
      });
      if (slugExists) {
        return NextResponse.json({ error: 'Slug already exists' }, { status: 409 });
      }
    }

    // Update service
    const service = await prisma.service.update({
      where: { id },
      data: {
        ...data,
        updatedById: session.user.id,
      },
      include: {
        category: true,
      },
    });

    // Create activity log
    await prisma.serviceActivityLog.create({
      data: {
        serviceId: service.id,
        userId: session.user.id,
        action: 'updated',
        changes: {
          before: existing,
          after: service,
        },
      },
    });

    return NextResponse.json(service);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: error.errors }, { status: 400 });
    }
    console.error('Error updating service:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

**Step 2: Commit**

```bash
git add apps/backoffice/app/api/services/[id]/route.ts
git commit -m "feat(api): add service update endpoint"
```

---

### Task 3.5: Create DELETE /api/services/[id]

**Files:**
- Modify: `apps/backoffice/app/api/services/[id]/route.ts`

**Step 1: Add DELETE handler**

Add to the same route.ts file:

```typescript
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Check services:delete permission
  const hasPermission = session.user.permissions?.includes('services:delete');
  if (!hasPermission) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const { id } = await params;

    const existing = await prisma.service.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 });
    }

    await prisma.service.delete({
      where: { id },
    });

    // Create activity log (before cascade delete)
    await prisma.serviceActivityLog.create({
      data: {
        serviceId: id,
        userId: session.user.id,
        action: 'deleted',
        changes: { before: existing },
      },
    });

    return NextResponse.json({ message: 'Service deleted' });
  } catch (error) {
    console.error('Error deleting service:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

**Step 2: Commit**

```bash
git add apps/backoffice/app/api/services/[id]/route.ts
git commit -m "feat(api): add service delete endpoint"
```

---

### Task 3.6: Create PATCH /api/services/[id]/publish

**Files:**
- Create: `apps/backoffice/app/api/services/[id]/publish/route.ts`

**Step 1: Create publish route**

```typescript
import { auth } from '@/lib/auth/config';
import { prisma } from '@/lib/db/prisma';
import { NextResponse } from 'next/server';
import { z } from 'zod';

const publishSchema = z.object({
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']),
});

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Check services:publish permission
  const hasPermission = session.user.permissions?.includes('services:publish');
  if (!hasPermission) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const { id } = await params;
    const body = await req.json();
    const { status } = publishSchema.parse(body);

    const existing = await prisma.service.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 });
    }

    const service = await prisma.service.update({
      where: { id },
      data: {
        status,
        updatedById: session.user.id,
      },
      include: {
        category: true,
      },
    });

    // Create activity log
    const action = status === 'PUBLISHED' ? 'published' :
                   status === 'ARCHIVED' ? 'archived' : 'unpublished';

    await prisma.serviceActivityLog.create({
      data: {
        serviceId: service.id,
        userId: session.user.id,
        action,
        changes: {
          before: { status: existing.status },
          after: { status: service.status },
        },
      },
    });

    return NextResponse.json(service);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: error.errors }, { status: 400 });
    }
    console.error('Error updating service status:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

**Step 2: Commit**

```bash
git add apps/backoffice/app/api/services/[id]/publish/route.ts
git commit -m "feat(api): add service publish endpoint"
```

---

### Task 3.7: Create PATCH /api/services/reorder

**Files:**
- Create: `apps/backoffice/app/api/services/reorder/route.ts`

**Step 1: Create reorder route**

```typescript
import { auth } from '@/lib/auth/config';
import { prisma } from '@/lib/db/prisma';
import { serviceReorderSchema } from '@/lib/services/validations';
import { NextResponse } from 'next/server';
import { z } from 'zod';

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Check services:reorder permission
  const hasPermission = session.user.permissions?.includes('services:reorder');
  if (!hasPermission) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { services } = serviceReorderSchema.parse(body);

    // Update all services in a transaction
    await prisma.$transaction(
      services.map(({ id, order }) =>
        prisma.service.update({
          where: { id },
          data: { order },
        })
      )
    );

    // Create activity log for each service
    for (const { id, order } of services) {
      await prisma.serviceActivityLog.create({
        data: {
          serviceId: id,
          userId: session.user.id,
          action: 'reordered',
          changes: { after: { order } },
        },
      });
    }

    return NextResponse.json({ message: 'Services reordered successfully' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: error.errors }, { status: 400 });
    }
    console.error('Error reordering services:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

**Step 2: Commit**

```bash
git add apps/backoffice/app/api/services/reorder/route.ts
git commit -m "feat(api): add services reorder endpoint"
```

---

### Task 3.8: Create GET /api/services/[id]/logs

**Files:**
- Create: `apps/backoffice/app/api/services/[id]/logs/route.ts`

**Step 1: Create activity logs route**

```typescript
import { auth } from '@/lib/auth/config';
import { prisma } from '@/lib/db/prisma';
import { NextResponse } from 'next/server';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Check services:view permission
  const hasPermission = session.user.permissions?.includes('services:view');
  if (!hasPermission) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const action = searchParams.get('action');

    const where: Record<string, unknown> = { serviceId: id };
    if (action) {
      where.action = action;
    }

    const logs = await prisma.serviceActivityLog.findMany({
      where,
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
      take: 100,
    });

    return NextResponse.json({ logs });
  } catch (error) {
    console.error('Error fetching activity logs:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

**Step 2: Commit**

```bash
git add apps/backoffice/app/api/services/[id]/logs/route.ts
git commit -m "feat(api): add service activity logs endpoint"
```

---

## PHASE 4: API Routes - Categories

### Task 4.1: Create GET /api/categories

**Files:**
- Create: `apps/backoffice/app/api/categories/route.ts`

**Step 1: Create categories list route**

```typescript
import { auth } from '@/lib/auth/config';
import { prisma } from '@/lib/db/prisma';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Check categories:manage permission
  const hasPermission = session.user.permissions?.includes('categories:manage');
  if (!hasPermission) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const categories = await prisma.serviceCategory.findMany({
      orderBy: { order: 'asc' },
      include: {
        _count: {
          select: { services: true },
        },
      },
    });

    return NextResponse.json({ categories });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

**Step 2: Commit**

```bash
git add apps/backoffice/app/api/categories/route.ts
git commit -m "feat(api): add categories list endpoint"
```

---

### Task 4.2: Create POST /api/categories

**Files:**
- Modify: `apps/backoffice/app/api/categories/route.ts`

**Step 1: Add POST handler**

Add to the same route.ts file:

```typescript
import { serviceCategorySchema } from '@/lib/services/validations';
import { z } from 'zod';

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Check categories:manage permission
  const hasPermission = session.user.permissions?.includes('categories:manage');
  if (!hasPermission) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const data = serviceCategorySchema.parse(body);

    // Check if slug is unique
    const existing = await prisma.serviceCategory.findUnique({
      where: { slug: data.slug },
    });

    if (existing) {
      return NextResponse.json({ error: 'Slug already exists' }, { status: 409 });
    }

    const category = await prisma.serviceCategory.create({
      data,
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: error.errors }, { status: 400 });
    }
    console.error('Error creating category:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

**Step 2: Commit**

```bash
git add apps/backoffice/app/api/categories/route.ts
git commit -m "feat(api): add category create endpoint"
```

---

### Task 4.3: Create PUT & DELETE /api/categories/[id]

**Files:**
- Create: `apps/backoffice/app/api/categories/[id]/route.ts`

**Step 1: Create category detail route**

```typescript
import { auth } from '@/lib/auth/config';
import { prisma } from '@/lib/db/prisma';
import { serviceCategoryUpdateSchema } from '@/lib/services/validations';
import { NextResponse } from 'next/server';
import { z } from 'zod';

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const hasPermission = session.user.permissions?.includes('categories:manage');
  if (!hasPermission) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const { id } = await params;
    const body = await req.json();
    const data = serviceCategoryUpdateSchema.parse(body);

    const existing = await prisma.serviceCategory.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    // Check slug uniqueness if changed
    if (data.slug && data.slug !== existing.slug) {
      const slugExists = await prisma.serviceCategory.findUnique({
        where: { slug: data.slug },
      });
      if (slugExists) {
        return NextResponse.json({ error: 'Slug already exists' }, { status: 409 });
      }
    }

    const category = await prisma.serviceCategory.update({
      where: { id },
      data: {
        name: data.name,
        slug: data.slug,
        icon: data.icon,
        color: data.color,
        bgColor: data.bgColor,
        showInMenu: data.showInMenu,
        order: data.order,
      },
    });

    return NextResponse.json(category);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: error.errors }, { status: 400 });
    }
    console.error('Error updating category:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const hasPermission = session.user.permissions?.includes('categories:manage');
  if (!hasPermission) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const { id } = await params;

    // Check if category has services
    const servicesCount = await prisma.service.count({
      where: { categoryId: id },
    });

    if (servicesCount > 0) {
      return NextResponse.json(
        { error: 'Cannot delete category with services. Please move or delete services first.' },
        { status: 400 }
      );
    }

    await prisma.serviceCategory.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Category deleted' });
  } catch (error) {
    console.error('Error deleting category:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

**Step 2: Commit**

```bash
git add apps/backoffice/app/api/categories/[id]/route.ts
git commit -m "feat(api): add category update and delete endpoints"
```

---

## PHASE 5: Public API (for Landing)

### Task 5.1: Create GET /api/public/services

**Files:**
- Create: `apps/backoffice/app/api/public/services/route.ts`

**Step 1: Create public services route**

```typescript
import { prisma } from '@/lib/db/prisma';
import { NextResponse } from 'next/server';
import { z } from 'zod';

const publicQuerySchema = z.object({
  categoryId: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

// CORS headers for public API
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = publicQuerySchema.parse(Object.fromEntries(searchParams));

    const where: Record<string, unknown> = {
      status: 'PUBLISHED',
      showInMenu: true,
    };

    if (query.categoryId) {
      where.categoryId = query.categoryId;
    }

    const [services, total] = await Promise.all([
      prisma.service.findMany({
        where,
        select: {
          id: true,
          slug: true,
          icon: true,
          name: true,
          description: true,
          badge: true,
          stats: true,
          order: true,
          isIntegrated: true,
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
        orderBy: [{ order: 'asc' }, { name: 'asc' }],
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
      }),
      prisma.service.count({ where }),
    ]);

    return NextResponse.json(
      {
        services,
        total,
        page: query.page,
        pageSize: query.pageSize,
        totalPages: Math.ceil(total / query.pageSize),
      },
      { headers: corsHeaders }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid query', details: error.errors },
        { status: 400, headers: corsHeaders }
      );
    }
    console.error('Error fetching public services:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: corsHeaders }
    );
  }
}
```

**Step 2: Commit**

```bash
git add apps/backoffice/app/api/public/services/route.ts
git commit -m "feat(api): add public services endpoint"
```

---

### Task 5.2: Create GET /api/public/services/[slug]

**Files:**
- Create: `apps/backoffice/app/api/public/services/[slug]/route.ts`

**Step 1: Create public service detail route**

```typescript
import { prisma } from '@/lib/db/prisma';
import { NextResponse } from 'next/server';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const service = await prisma.service.findUnique({
      where: {
        slug,
        status: 'PUBLISHED',
      },
      select: {
        id: true,
        slug: true,
        icon: true,
        name: true,
        description: true,
        detailedDescription: true,
        badge: true,
        stats: true,
        isIntegrated: true,
        requirements: true,
        process: true,
        duration: true,
        cost: true,
        contactInfo: true,
        faqs: true,
        downloadForms: true,
        relatedServices: true,
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
            icon: true,
            color: true,
          },
        },
      },
    });

    if (!service) {
      return NextResponse.json(
        { error: 'Service not found' },
        { status: 404, headers: corsHeaders }
      );
    }

    return NextResponse.json(service, { headers: corsHeaders });
  } catch (error) {
    console.error('Error fetching public service:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: corsHeaders }
    );
  }
}
```

**Step 2: Commit**

```bash
git add apps/backoffice/app/api/public/services/[slug]/route.ts
git commit -m "feat(api): add public service detail endpoint"
```

---

### Task 5.3: Create GET /api/public/services/categories

**Files:**
- Create: `apps/backoffice/app/api/public/services/categories/route.ts`

**Step 1: Create public categories route**

```typescript
import { prisma } from '@/lib/db/prisma';
import { NextResponse } from 'next/server';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function GET() {
  try {
    const categories = await prisma.serviceCategory.findMany({
      where: { showInMenu: true },
      select: {
        id: true,
        name: true,
        slug: true,
        icon: true,
        color: true,
        bgColor: true,
        order: true,
      },
      orderBy: { order: 'asc' },
    });

    return NextResponse.json({ categories }, { headers: corsHeaders });
  } catch (error) {
    console.error('Error fetching public categories:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: corsHeaders }
    );
  }
}
```

**Step 2: Commit**

```bash
git add apps/backoffice/app/api/public/services/categories/route.ts
git commit -m "feat(api): add public categories endpoint"
```

---

### Task 5.4: Create POST /api/public/revalidate

**Files:**
- Create: `apps/backoffice/app/api/public/revalidate/route.ts`

**Step 1: Create revalidate endpoint**

```typescript
import { prisma } from '@/lib/db/prisma';
import { NextResponse } from 'next/server';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const secret = searchParams.get('secret');

    // Validate secret
    if (secret !== process.env.REVALIDATE_SECRET) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401, headers: corsHeaders }
      );
    }

    const body = await req.json().catch(() => ({}));
    const path = body.path;

    // Trigger revalidation on landing
    const landingUrl = process.env.LANDING_URL || 'http://localhost:3002';
    const revalidateUrl = new URL('/api/revalidate', landingUrl);
    revalidateUrl.searchParams.set('secret', process.env.REVALIDATE_SECRET || '');
    if (path) {
      revalidateUrl.searchParams.set('path', path);
    }

    const response = await fetch(revalidateUrl.toString(), {
      method: 'POST',
    });

    if (!response.ok) {
      throw new Error('Revalidation failed');
    }

    return NextResponse.json(
      { revalidated: true, message: 'Cache invalidated successfully' },
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error('Error triggering revalidation:', error);
    return NextResponse.json(
      { error: 'Failed to trigger revalidation' },
      { status: 500, headers: corsHeaders }
    );
  }
}
```

**Step 2: Commit**

```bash
git add apps/backoffice/app/api/public/revalidate/route.ts
git commit -m "feat(api): add revalidation endpoint"
```

---

## PHASE 6: Run Migration

### Task 6.1: Run Services Migration

**Step 1: Ensure Prisma migrations are applied**

Run: `cd apps/backoffice && pnpm prisma migrate deploy`

Expected: Migrations applied successfully

**Step 2: Run the migration script**

Run: `cd apps/backoffice && pnpm migrate:services`

Expected: Migration complete with count of services migrated

**Step 3: Verify data in database**

Run: `cd apps/backoffice && pnpm prisma studio`

Check: ServiceCategory and Service tables have data

**Step 4: Commit**

No commit needed - data migration, not code

---

## PHASE 7: Landing Integration

### Task 7.1: Update Landing services-data.ts

**Files:**
- Modify: `apps/landing/lib/services-data.ts`

**Step 1: Replace file contents**

```typescript
// Types for service data structure
export interface ServiceCategory {
  id: string;
  name: string;
  slug: string;
  icon: string;
  color: string;
  bgColor: string;
  showInMenu: boolean;
  order: number;
}

export interface Service {
  slug: string;
  icon: string;
  name: string;
  description: string;
  badge?: string | null;
  stats?: string | null;
  isIntegrated: boolean;
  order: number;
  detailedDescription?: string | null;
  requirements?: string[] | null;
  process?: string[] | null;
  duration?: string | null;
  cost?: string | null;
  contactInfo?: {
    office: string;
    phone: string;
    email: string;
  } | null;
  downloadForms?: Array<{
    type: 'file' | 'url';
    name: string;
    value: string;
  }> | null;
  relatedServices?: string[] | null;
  faqs?: Array<{
    question: string;
    answer: string;
  }> | null;
  category: {
    id: string;
    name: string;
    slug: string;
  };
}

export interface ServiceWithCategory extends Service {
  category: ServiceCategory;
}

const BACKOFFICE_URL = process.env.NEXT_PUBLIC_BACKOFFICE_URL || 'http://localhost:3001';

/**
 * Fetch all service categories from backoffice API
 */
export async function getServiceCategories(): Promise<ServiceCategory[]> {
  try {
    const res = await fetch(`${BACKOFFICE_URL}/api/public/services/categories`, {
      next: { revalidate: 3600 }, // Cache 1 hour
    });

    if (!res.ok) {
      console.error('Error loading service categories:', res.statusText);
      return [];
    }

    const data = await res.json();
    return data.categories || [];
  } catch (error) {
    console.error('Error loading service categories:', error);
    return [];
  }
}

/**
 * Fetch only visible service categories (showInMenu: true)
 */
export async function getVisibleServiceCategories(): Promise<ServiceCategory[]> {
  try {
    const categories = await getServiceCategories();
    return categories.filter(cat => cat.showInMenu);
  } catch (error) {
    console.error('Error loading visible service categories:', error);
    return [];
  }
}

/**
 * Fetch visible service categories with their services
 */
export async function getVisibleServicesGroupedByCategory(): Promise<Array<ServiceCategory & { services: Service[] }>> {
  try {
    const categories = await getVisibleServiceCategories();
    const categoriesWithServices = await Promise.all(
      categories.map(async (category) => {
        const services = await getServicesByCategory(category.id);
        return {
          ...category,
          services,
        };
      })
    );
    return categoriesWithServices;
  } catch (error) {
    console.error('Error loading visible services grouped by category:', error);
    return [];
  }
}

/**
 * Fetch services for a specific category by ID
 */
export async function getServicesByCategory(categoryId: string): Promise<Service[]> {
  try {
    const res = await fetch(`${BACKOFFICE_URL}/api/public/services?categoryId=${categoryId}`, {
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      console.error(`Error loading services for category ${categoryId}:`, res.statusText);
      return [];
    }

    const data = await res.json();
    return data.services || [];
  } catch (error) {
    console.error(`Error loading services for category ${categoryId}:`, error);
    return [];
  }
}

/**
 * Fetch all services across all categories with their category information
 */
export async function getAllServices(): Promise<ServiceWithCategory[]> {
  try {
    const res = await fetch(`${BACKOFFICE_URL}/api/public/services`, {
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      console.error('Error loading all services:', res.statusText);
      return [];
    }

    const data = await res.json();
    return data.services || [];
  } catch (error) {
    console.error('Error loading all services:', error);
    return [];
  }
}

/**
 * Get a single service by slug
 */
export async function getServiceBySlug(slug: string): Promise<ServiceWithCategory | null> {
  try {
    const res = await fetch(`${BACKOFFICE_URL}/api/public/services/${slug}`, {
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      console.error(`Error loading service ${slug}:`, res.statusText);
      return null;
    }

    return await res.json();
  } catch (error) {
    console.error(`Error loading service ${slug}:`, error);
    return null;
  }
}

/**
 * Get category by slug
 */
export async function getCategoryBySlug(slug: string): Promise<ServiceCategory | null> {
  try {
    const categories = await getServiceCategories();
    return categories.find(category => category.slug === slug) || null;
  } catch (error) {
    console.error(`Error loading category ${slug}:`, error);
    return null;
  }
}

/**
 * Get integrated services (isIntegrated: true)
 */
export async function getIntegratedServices(): Promise<ServiceWithCategory[]> {
  try {
    const allServices = await getAllServices();
    return allServices.filter(service => service.isIntegrated === true);
  } catch (error) {
    console.error('Error loading integrated services:', error);
    return [];
  }
}

/**
 * Get non-integrated services (isIntegrated: false)
 */
export async function getNonIntegratedServices(): Promise<ServiceWithCategory[]> {
  try {
    const allServices = await getAllServices();
    return allServices.filter(service => service.isIntegrated === false);
  } catch (error) {
    console.error('Error loading non-integrated services:', error);
    return [];
  }
}

/**
 * Get services grouped by category (all categories)
 */
export async function getServicesGroupedByCategory(): Promise<Array<ServiceCategory & { services: Service[] }>> {
  try {
    const categories = await getServiceCategories();
    const categoriesWithServices = await Promise.all(
      categories.map(async (category) => {
        const services = await getServicesByCategory(category.id);
        return {
          ...category,
          services,
        };
      })
    );
    return categoriesWithServices;
  } catch (error) {
    console.error('Error loading services grouped by category:', error);
    return [];
  }
}
```

**Step 2: Commit**

```bash
git add apps/landing/lib/services-data.ts
git commit -m "feat(landing): update services to use backoffice API"
```

---

### Task 7.2: Create Landing Revalidate Endpoint

**Files:**
- Create: `apps/landing/app/api/revalidate/route.ts`

**Step 1: Create revalidate handler**

```typescript
import { revalidatePath } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get('secret');
  const path = request.nextUrl.searchParams.get('path');

  // Validate secret
  if (secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ message: 'Invalid secret' }, { status: 401 });
  }

  try {
    if (path) {
      revalidatePath(path);
    } else {
      // Revalidate all service-related paths
      revalidatePath('/layanan');
    }

    return NextResponse.json({
      revalidated: true,
      now: Date.now(),
      path: path || '/layanan',
    });
  } catch (err) {
    return NextResponse.json(
      { message: 'Error revalidating', error: String(err) },
      { status: 500 }
    );
  }
}
```

**Step 2: Commit**

```bash
git add apps/landing/app/api/revalidate/route.ts
git commit -m "feat(landing): add revalidate endpoint"
```

---

### Task 7.3: Add Environment Variables

**Files:**
- Modify: `apps/landing/.env.local` (create if not exists)
- Modify: `apps/backoffice/.env.local`

**Step 1: Add to landing .env.local**

```bash
# Backoffice API URL
NEXT_PUBLIC_BACKOFFICE_URL=http://localhost:3001

# Revalidate secret (must match backoffice)
REVALIDATE_SECRET=your-secret-key-here-change-in-production
```

**Step 2: Add to backoffice .env.local**

```bash
# Revalidate secret (must match landing)
REVALIDATE_SECRET=your-secret-key-here-change-in-production

# Landing URL for revalidation
LANDING_URL=http://localhost:3002
```

**Step 3: Add to .env.example files**

Add these variables to both `.env.example` files for documentation.

**Step 4: Commit**

```bash
git add apps/landing/.env.local apps/backoffice/.env.local apps/landing/.env.example apps/backoffice/.env.example
git commit -m "feat(env): add services API environment variables"
```

---

## PHASE 8: Backoffice UI - Services List Page

### Task 8.1: Create Services List Page

**Files:**
- Create: `apps/backoffice/app/(dashboard)/manage/services/page.tsx`
- Create: `apps/backoffice/components/services/services-table.tsx`
- Create: `apps/backoffice/components/services/service-filters.tsx`

**Step 1: Create services page**

```typescript
import { Suspense } from 'react';
import { prisma } from '@/lib/db/prisma';
import { ServicesTable } from '@/components/services/services-table';
import { ServiceFilters } from '@/components/services/service-filters';

export const dynamic = 'force-dynamic';

export default async function ServicesPage({
  searchParams,
}: {
  searchParams: Promise<{ categoryId?: string; status?: string; search?: string; page?: string }>;
}) {
  const params = await searchParams;

  // Fetch categories for filter
  const categories = await prisma.serviceCategory.findMany({
    orderBy: { order: 'asc' },
    select: {
      id: true,
      name: true,
      slug: true,
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Services</h1>
          <p className="text-muted-foreground">
            Manage public services and categories
          </p>
        </div>
      </div>

      <ServiceFilters categories={categories} />

      <Suspense fallback={<ServicesTable.Skeleton />}>
        <ServicesTable searchParams={params} categories={categories} />
      </Suspense>
    </div>
  );
}
```

**Step 2: Create services table component**

```typescript
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MoreHorizontal, Edit, Trash2, Eye, EyeOff, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { toast } from 'sonner';

interface Service {
  id: string;
  slug: string;
  icon: string;
  name: string;
  description: string;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  order: number;
  category: {
    id: string;
    name: string;
    slug: string;
  };
}

interface ServicesTableProps {
  services: Service[];
  total: number;
  page: number;
  pageSize: number;
  categories: Array<{ id: string; name: string; slug: string }>;
}

export function ServicesTable({ services, total, page, pageSize, categories }: ServicesTableProps) {
  const router = useRouter();
  const [publishing, setPublishing] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const handlePublish = async (id: string, currentStatus: string) => {
    setPublishing(id);
    try {
      const newStatus = currentStatus === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED';
      const res = await fetch(`/api/services/${id}/publish`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) throw new Error('Failed to update status');

      toast.success(`Service ${newStatus === 'PUBLISHED' ? 'published' : 'unpublished'}`);
      router.refresh();
    } catch (error) {
      toast.error('Failed to update service status');
    } finally {
      setPublishing(null);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;

    setDeleting(id);
    try {
      const res = await fetch(`/api/services/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');

      toast.success('Service deleted');
      router.refresh();
    } catch (error) {
      toast.error('Failed to delete service');
    } finally {
      setDeleting(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      PUBLISHED: 'default',
      DRAFT: 'secondary',
      ARCHIVED: 'outline',
    } as const;

    const labels = {
      PUBLISHED: 'Published',
      DRAFT: 'Draft',
      ARCHIVED: 'Archived',
    };

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'secondary'}>
        {labels[status as keyof typeof labels]}
      </Badge>
    );
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[40px]"></TableHead>
            <TableHead>Icon</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Order</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {services.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="h-24 text-center">
                No services found. Create your first service to get started.
              </TableCell>
            </TableRow>
          ) : (
            services.map((service) => (
              <TableRow key={service.id}>
                <TableCell>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="cursor-grab active:cursor-grabbing">
                          <GripVertical className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>Drag to reorder</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </TableCell>
                <TableCell>
                  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10">
                    <span className="text-xs">{service.icon.slice(0, 2)}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium">{service.name}</span>
                    <span className="text-sm text-muted-foreground">{service.description}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{service.category.name}</Badge>
                </TableCell>
                <TableCell>{getStatusBadge(service.status)}</TableCell>
                <TableCell>{service.order}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/manage/services/${service.id}`}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handlePublish(service.id, service.status)}
                        disabled={publishing === service.id}
                      >
                        {service.status === 'PUBLISHED' ? (
                          <>
                            <EyeOff className="mr-2 h-4 w-4" />
                            Unpublish
                          </>
                        ) : (
                          <>
                            <Eye className="mr-2 h-4 w-4" />
                            Publish
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => handleDelete(service.id, service.name)}
                        disabled={deleting === service.id}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}

ServicesTable.Skeleton = function ServicesTableSkeleton() {
  return (
    <div className="space-y-3">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="h-16 animate-pulse rounded-md bg-muted" />
      ))}
    </div>
  );
};
```

**Step 3: Create server component wrapper for table**

```typescript
// Add to page.tsx or create separate file for data fetching
import { prisma } from '@/lib/db/prisma';

async function getServices(params: {
  categoryId?: string;
  status?: string;
  search?: string;
  page?: string;
}) {
  const where: Record<string, unknown> = {};

  if (params.categoryId) {
    where.categoryId = params.categoryId;
  }

  if (params.status) {
    where.status = params.status;
  }

  if (params.search) {
    where.OR = [
      { name: { contains: params.search, mode: 'insensitive' } },
      { description: { contains: params.search, mode: 'insensitive' } },
    ];
  }

  const page = Number(params.page) || 1;
  const pageSize = 20;

  const [services, total] = await Promise.all([
    prisma.service.findMany({
      where,
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
      orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.service.count({ where }),
  ]);

  return { services, total, page, pageSize };
}
```

**Step 4: Commit**

```bash
git add apps/backoffice/app/\(dashboard\)/manage/services/page.tsx
git add apps/backoffice/components/services/services-table.tsx
git commit -m "feat(ui): add services list page"
```

---

### Task 8.2: Create Service Filters Component

**Files:**
- Create: `apps/backoffice/components/services/service-filters.tsx`

**Step 1: Create filters component**

```typescript
'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Search, X } from 'lucide-react';
import { useState } from 'react';

interface ServiceFiltersProps {
  categories: Array<{ id: string; name: string; slug: string }>;
}

export function ServiceFilters({ categories }: ServiceFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchValue, setSearchValue] = useState(searchParams.get('search') || '');

  const updateParams = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete('page'); // Reset to page 1
    router.push(`?${params.toString()}`);
  };

  const clearFilters = () => {
    router.push('/manage/services');
    setSearchValue('');
  };

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search services..."
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              updateParams('search', searchValue);
            }
          }}
          className="pl-9"
        />
      </div>

      <Select
        value={searchParams.get('categoryId') || 'all'}
        onValueChange={(value) => updateParams('categoryId', value === 'all' ? '' : value)}
      >
        <SelectTrigger className="w-full sm:w-[200px]">
          <SelectValue placeholder="All Categories" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Categories</SelectItem>
          {categories.map((cat) => (
            <SelectItem key={cat.id} value={cat.id}>
              {cat.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={searchParams.get('status') || 'all'}
        onValueChange={(value) => updateParams('status', value === 'all' ? '' : value)}
      >
        <SelectTrigger className="w-full sm:w-[150px]">
          <SelectValue placeholder="All Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          <SelectItem value="PUBLISHED">Published</SelectItem>
          <SelectItem value="DRAFT">Draft</SelectItem>
          <SelectItem value="ARCHIVED">Archived</SelectItem>
        </SelectContent>
      </Select>

      {(searchParams.get('search') || searchParams.get('categoryId') || searchParams.get('status')) && (
        <Button variant="ghost" size="icon" onClick={clearFilters}>
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add apps/backoffice/components/services/service-filters.tsx
git commit -m "feat(ui): add service filters component"
```

---

## PHASE 9: Backoffice UI - Service Form

### Task 9.1: Create Service Form Component

**Files:**
- Create: `apps/backoffice/components/services/service-form.tsx`
- Create: `apps/backoffice/app/(dashboard)/manage/services/new/page.tsx`
- Create: `apps/backoffice/app/(dashboard)/manage/services/[id]/page.tsx`

**Step 1: Create service form component**

```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Plus, Trash2 } from 'lucide-react';
import { serviceCreateSchema, serviceUpdateSchema, type ServiceInput } from '@/lib/services/validations';

interface ServiceFormProps {
  categories: Array<{ id: string; name: string }>;
  initialData?: Partial<ServiceInput>;
  serviceId?: string;
}

const iconOptions = [
  'Users', 'Heart', 'GraduationCap', 'Briefcase', 'Building2',
  'Palmtree', 'TreePine', 'Landmark', 'FileSearch', 'ShieldAlert',
  'Stethoscope', 'Baby', 'Car', 'Train', 'Plane',
];

export function ServiceForm({ categories, initialData, serviceId }: ServiceFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ServiceInput>({
    resolver: zodResolver(serviceId ? serviceUpdateSchema : serviceCreateSchema),
    defaultValues: {
      slug: initialData?.slug || '',
      icon: initialData?.icon || 'Users',
      name: initialData?.name || '',
      description: initialData?.description || '',
      categoryId: initialData?.categoryId || '',
      badge: initialData?.badge || '',
      stats: initialData?.stats || '',
      showInMenu: initialData?.showInMenu ?? true,
      order: initialData?.order ?? 0,
      isIntegrated: initialData?.isIntegrated ?? false,
      detailedDescription: initialData?.detailedDescription || '',
      requirements: initialData?.requirements || [],
      process: initialData?.process || [],
      duration: initialData?.duration || '',
      cost: initialData?.cost || '',
      contactInfo: initialData?.contactInfo || { office: '', phone: '', email: '' },
      faqs: initialData?.faqs || [],
      downloadForms: initialData?.downloadForms || [],
      relatedServices: initialData?.relatedServices || [],
      status: initialData?.status || 'DRAFT',
    },
  });

  const watchedRequirements = form.watch('requirements') || [];
  const watchedProcess = form.watch('process') || [];
  const watchedFaqs = form.watch('faqs') || [];
  const watchedDownloadForms = form.watch('downloadForms') || [];

  const onSubmit = async (data: ServiceInput) => {
    setIsSubmitting(true);
    try {
      const url = serviceId ? `/api/services/${serviceId}` : '/api/services';
      const method = serviceId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to save service');
      }

      toast.success(serviceId ? 'Service updated' : 'Service created');
      router.push('/manage/services');
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to save service');
    } finally {
      setIsSubmitting(false);
    }
  };

  const addArrayItem = (field: 'requirements' | 'process') => {
    const current = form.getValues(field) || [];
    form.setValue(field, [...current, '']);
  };

  const removeArrayItem = (field: 'requirements' | 'process', index: number) => {
    const current = form.getValues(field) || [];
    form.setValue(field, current.filter((_, i) => i !== index));
  };

  const addFAQ = () => {
    const current = form.getValues('faqs') || [];
    form.setValue('faqs', [...current, { question: '', answer: '' }]);
  };

  const removeFAQ = (index: number) => {
    const current = form.getValues('faqs') || [];
    form.setValue('faqs', current.filter((_, i) => i !== index));
  };

  const addDownloadForm = () => {
    const current = form.getValues('downloadForms') || [];
    form.setValue('downloadForms', [...current, { type: 'url', name: '', value: '' }]);
  };

  const removeDownloadForm = (index: number) => {
    const current = form.getValues('downloadForms') || [];
    form.setValue('downloadForms', current.filter((_, i) => i !== index));
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>Basic service details for display</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., BPJS Kesehatan" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Slug</FormLabel>
                    <FormControl>
                      <Input placeholder="bpjs-kesehatan" {...field} />
                    </FormControl>
                    <FormDescription>URL-friendly identifier</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <FormField
                control={form.control}
                name="icon"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Icon</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select icon" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {iconOptions.map((icon) => (
                          <SelectItem key={icon} value={icon}>
                            {icon}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="order"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Order</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Short Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Brief description for service cards"
                      className="resize-none"
                      rows={2}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="badge"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Badge</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Populer, Baru" {...field} />
                    </FormControl>
                    <FormDescription>Optional badge text</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="stats"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stats</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 8.5k" {...field} />
                    </FormControl>
                    <FormDescription>Display statistics</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex gap-4">
              <FormField
                control={form.control}
                name="showInMenu"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>Show in Menu</FormLabel>
                      <FormDescription>Display in public menu</FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isIntegrated"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>Integrated</FormLabel>
                      <FormDescription>Has working system integration</FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Detailed Content */}
        <Card>
          <CardHeader>
            <CardTitle>Detailed Content</CardTitle>
            <CardDescription>Additional information for service detail page</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="detailedDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Detailed Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Full service description"
                      className="resize-none"
                      rows={4}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duration</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 1-3 hari kerja" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="cost"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cost</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Mulai dari Rp 42.000/bulan" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Requirements */}
        <Card>
          <CardHeader>
            <CardTitle>Requirements</CardTitle>
            <CardDescription>Documents needed for this service</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {watchedRequirements.map((_, index) => (
              <div key={index} className="flex gap-2">
                <FormField
                  control={form.control}
                  name={`requirements.${index}` as const}
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormControl>
                        <Input placeholder={`Requirement ${index + 1}`} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeArrayItem('requirements', index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => addArrayItem('requirements')}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Requirement
            </Button>
          </CardContent>
        </Card>

        {/* Process */}
        <Card>
          <CardHeader>
            <CardTitle>Process Steps</CardTitle>
            <CardDescription>Step by step process</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {watchedProcess.map((_, index) => (
              <div key={index} className="flex gap-2">
                <FormField
                  control={form.control}
                  name={`process.${index}` as const}
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormControl>
                        <Input placeholder={`Step ${index + 1}`} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeArrayItem('process', index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => addArrayItem('process')}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Step
            </Button>
          </CardContent>
        </Card>

        {/* Contact Info */}
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="contactInfo.office"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Office</FormLabel>
                  <FormControl>
                    <Input placeholder="Office name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="contactInfo.phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone</FormLabel>
                  <FormControl>
                    <Input placeholder="Phone number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="contactInfo.email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="Email address" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* FAQs */}
        <Card>
          <CardHeader>
            <CardTitle>FAQs</CardTitle>
            <CardDescription>Frequently asked questions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {watchedFaqs.map((_, index) => (
              <div key={index} className="space-y-2 rounded-lg border p-4">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">FAQ {index + 1}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeFAQ(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <FormField
                  control={form.control}
                  name={`faqs.${index}.question` as const}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Question</FormLabel>
                      <FormControl>
                        <Input placeholder="Question" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`faqs.${index}.answer` as const}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Answer</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Answer" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addFAQ}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add FAQ
            </Button>
          </CardContent>
        </Card>

        {/* Download Forms */}
        <Card>
          <CardHeader>
            <CardTitle>Download Forms</CardTitle>
            <CardDescription>Forms users can download</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {watchedDownloadForms.map((_, index) => (
              <div key={index} className="space-y-2 rounded-lg border p-4">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Form {index + 1}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeDownloadForm(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <FormField
                  control={form.control}
                  name={`downloadForms.${index}.type` as const}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="file">File Upload</SelectItem>
                          <SelectItem value="url">External URL</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`downloadForms.${index}.name` as const}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Form Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Registration Form" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`downloadForms.${index}.value` as const}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {watchedDownloadForms[index]?.type === 'file' ? 'File ID' : 'URL'}
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder={
                            watchedDownloadForms[index]?.type === 'file'
                              ? 'File ID from upload'
                              : 'https://example.com/form.pdf'
                          }
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addDownloadForm}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Download Form
            </Button>
          </CardContent>
        </Card>

        {/* Status */}
        {serviceId && (
          <Card>
            <CardHeader>
              <CardTitle>Publishing Status</CardTitle>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="DRAFT">Draft</SelectItem>
                        <SelectItem value="PUBLISHED">Published</SelectItem>
                        <SelectItem value="ARCHIVED">Archived</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : serviceId ? 'Update Service' : 'Create Service'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
```

**Step 2: Create new service page**

```typescript
import { prisma } from '@/lib/db/prisma';
import { ServiceForm } from '@/components/services/service-form';
import { redirect } from 'next/navigation';

export default async function NewServicePage() {
  const categories = await prisma.serviceCategory.findMany({
    orderBy: { order: 'asc' },
    select: {
      id: true,
      name: true,
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">New Service</h1>
        <p className="text-muted-foreground">
          Create a new public service
        </p>
      </div>

      <ServiceForm categories={categories} />
    </div>
  );
}
```

**Step 3: Create edit service page**

```typescript
import { prisma } from '@/lib/db/prisma';
import { ServiceForm } from '@/components/services/service-form';
import { notFound } from 'next/navigation';

export default async function EditServicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [service, categories] = await Promise.all([
    prisma.service.findUnique({
      where: { id },
    }),
    prisma.serviceCategory.findMany({
      orderBy: { order: 'asc' },
      select: {
        id: true,
        name: true,
      },
    }),
  ]);

  if (!service) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Edit Service</h1>
        <p className="text-muted-foreground">
          Edit service: {service.name}
        </p>
      </div>

      <ServiceForm
        categories={categories}
        initialData={service}
        serviceId={service.id}
      />
    </div>
  );
}
```

**Step 4: Commit**

```bash
git add apps/backoffice/components/services/service-form.tsx
git add apps/backoffice/app/\(dashboard\)/manage/services/new/page.tsx
git add apps/backoffice/app/\(dashboard\)/manage/services/\[id\]/page.tsx
git commit -m "feat(ui): add service form and pages"
```

---

## PHASE 10: Sync Button & Testing

### Task 10.1: Add Sync to Landing Button

**Files:**
- Modify: `apps/backoffice/components/services/services-table.tsx`
- Modify: `apps/backoffice/app/(dashboard)/manage/services/page.tsx`

**Step 1: Add sync button to services page header**

```typescript
// Add to page.tsx
import { SyncButton } from '@/components/services/sync-button';

// In the return JSX, after the h1/div:
<SyncButton />
```

**Step 2: Create sync button component**

```typescript
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

export function SyncButton() {
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      const res = await fetch('/api/sync/landing', {
        method: 'POST',
      });

      if (!res.ok) {
        throw new Error('Sync failed');
      }

      toast.success('Landing cache invalidated successfully');
    } catch (error) {
      toast.error('Failed to sync with landing');
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleSync}
      disabled={isSyncing}
    >
      <RefreshCw className={`mr-2 h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
      Sync to Landing
    </Button>
  );
}
```

**Step 3: Create sync API route**

```typescript
// apps/backoffice/app/api/sync/landing/route.ts
import { auth } from '@/lib/auth/config';
import { prisma } from '@/lib/db/prisma';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Check services:publish permission (same as publish)
  const hasPermission = session.user.permissions?.includes('services:publish');
  if (!hasPermission) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const landingUrl = process.env.LANDING_URL || 'http://localhost:3002';
    const revalidateUrl = new URL('/api/public/revalidate', landingUrl);

    const response = await fetch(revalidateUrl.toString(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        secret: process.env.REVALIDATE_SECRET,
      }),
    });

    if (!response.ok) {
      throw new Error('Revalidation failed');
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error syncing to landing:', error);
    return NextResponse.json(
      { error: 'Failed to sync with landing' },
      { status: 500 }
    );
  }
}
```

**Step 4: Commit**

```bash
git add apps/backoffice/components/services/sync-button.tsx
git add apps/backoffice/app/api/sync/landing/route.ts
git add apps/backoffice/app/\(dashboard\)/manage/services/page.tsx
git commit -m "feat(ui): add sync to landing button"
```

---

### Task 10.2: End-to-End Testing

**Step 1: Verify database migration**

Run: `cd apps/backoffice && pnpm prisma studio`

Check: ServiceCategory and Service tables have data

**Step 2: Test public API**

```bash
# Test categories
curl http://localhost:3001/api/public/services/categories

# Test services list
curl http://localhost:3001/api/public/services

# Test service detail
curl http://localhost:3001/api/public/services/bpjs-kesehatan
```

Expected: JSON responses with services data

**Step 3: Test landing page**

Open: http://localhost:3002/layanan

Expected: Services displayed from backoffice API

**Step 4: Test backoffice pages**

1. Open: http://localhost:3001/manage/services
2. Create a new service
3. Edit the service
4. Publish the service
5. Click "Sync to Landing"
6. Check landing page - new service should appear

**Step 5: Test permissions**

1. Create a non-admin user without services permissions
2. Login as that user
3. Try to access /manage/services
4. Should see unauthorized/forbidden

---

## Success Criteria Checklist

- [ ] All services migrated from JSON to database
- [ ] Backoffice UI can CRUD services
- [ ] RBCA permissions enforced correctly
- [ ] Landing displays services from API
- [ ] Manual sync button clears landing cache
- [ ] Activity log tracks all changes
- [ ] Draft services not visible on landing
- [ ] File upload works for download forms
- [ ] External URL works for download forms

---

## Notes

- This implementation assumes existing UI components (Button, Input, etc.) are available
- The File upload integration for downloadForms is simplified - fileId is stored but full upload UI would need separate file management component
- Drag-drop ordering UI is not fully implemented - only the API endpoint is ready
- Categories management UI is not fully implemented in this plan - can be added similarly to services
