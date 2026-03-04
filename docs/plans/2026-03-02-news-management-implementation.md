# News Management System - Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Migrate news from JSON files to database with full backoffice RBAC management, TipTap rich text editor, and landing API integration.

**Architecture:** Backoffice manages news in PostgreSQL via Prisma with TipTap for rich content, landing consumes via public API with ISR caching. Manual sync triggers revalidation.

**Tech Stack:** Next.js 16, Prisma, PostgreSQL, Zod, TipTap, existing RBCA system, existing File upload system

---

## PHASE 1: Database Schema & Migrations

### Task 1.1: Update Prisma Schema - Add News Models

**Files:**
- Modify: `apps/backoffice/prisma/schema.prisma`

**Step 1: Add NewsStatus enum**

Add after line 145 (after ServiceStatus enum, around line 134):

```prisma
enum NewsStatus {
  DRAFT
  PUBLISHED
  ARCHIVED
}
```

**Step 2: Add NewsCategory model**

Add after ServiceActivityLog model (around line 261):

```prisma
model NewsCategory {
  id          String     @id @default(cuid())
  name        String
  slug        String     @unique
  color       String     @default("primary")
  showInMenu  Boolean    @default(true)
  order       Int        @default(0)
  news        News[]
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt

  @@index([showInMenu])
  @@index([order])
}
```

**Step 3: Add News model**

Add after NewsCategory model:

```prisma
model News {
  id                   String         @id @default(cuid())
  slug                 String         @unique
  title                String
  excerpt              String
  content              String?        @db.Text

  categoryId           String
  category             NewsCategory   @relation(fields: [categoryId], references: [id])

  // Media
  featuredImageId      String?
  featuredImage        File?          @relation("NewsFeaturedImage", fields: [featuredImageId], references: [id], onDelete: SetNull)

  // Display options
  featured             Boolean        @default(false)
  showInMenu           Boolean        @default(true)
  order                Int            @default(0)

  // Metadata
  author               String?
  readTime             String?
  tags                 Json?
  publishedAt          DateTime?

  // Publishing workflow
  status               NewsStatus     @default(DRAFT)

  // Audit
  createdById          String
  createdBy            User           @relation("NewsCreator", fields: [createdById], references: [id])
  updatedById          String?
  updatedBy            User?          @relation("NewsUpdater", fields: [updatedById], references: [id])

  createdAt            DateTime       @default(now())
  updatedAt            DateTime       @updatedAt

  activityLogs         NewsActivityLog[]

  @@index([categoryId])
  @@index([status])
  @@index([featured])
  @@index([order])
  @@index([slug])
  @@index([publishedAt])
}
```

**Step 4: Add NewsActivityLog model**

Add after News model:

```prisma
model NewsActivityLog {
  id          String   @id @default(cuid())
  newsId      String
  news        News     @relation(fields: [newsId], references: [id], onDelete: Cascade)
  userId      String
  action      String
  changes     Json?
  createdAt   DateTime @default(now())

  @@index([newsId])
  @@index([userId])
  @@index([createdAt])
}
```

**Step 5: Update User model**

Add these relations to User model (around line 66, after Service relations):

```prisma
  // News Management Relations
  createdNews      News[]            @relation("NewsCreator")
  updatedNews      News[]            @relation("NewsUpdater")
  newsActivityLogs NewsActivityLog[] @relation("NewsActivityLogs")
```

**Step 6: Update File model**

Add relation to File model (around line 169, after users relation):

```prisma
  // News Featured Image
  newsAsFeaturedImage News[] @relation("NewsFeaturedImage")
```

**Step 7: Generate Prisma client**

Run: `pnpm --filter backoffice prisma generate`

Expected: Output showing "Generated Prisma Client" successfully

**Step 8: Commit**

```bash
git add apps/backoffice/prisma/schema.prisma
git commit -m "feat: add news models to prisma schema

- Add NewsStatus enum (DRAFT, PUBLISHED, ARCHIVED)
- Add NewsCategory model with name, slug, color, showInMenu, order
- Add News model with content, featuredImage, tags, status workflow
- Add NewsActivityLog model for audit trail
- Update User and File models with news relations

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

### Task 1.2: Create Database Migration

**Files:**
- Create: `apps/backoffice/prisma/migrations/20260302_create_news_tables/migration.sql`

**Step 1: Create migration**

Run: `pnpm --filter backoffice prisma migrate dev --name create_news_tables`

Expected: Migration created successfully, database updated

**Step 2: Verify migration**

Check that the following tables were created:
- `NewsCategory`
- `News`
- `NewsActivityLog`

**Step 3: Commit**

```bash
git add apps/backoffice/prisma/migrations
git commit -m "feat: create news tables migration

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

### Task 1.3: Seed News Permissions

**Files:**
- Modify: `apps/backoffice/prisma/seed.ts`

**Step 1: Read existing seed structure**

Read: `apps/backoffice/prisma/seed.ts` to understand the permission seeding pattern

**Step 2: Add news permissions**

Add after service permissions (around line 200+):

```typescript
// News Permissions
const newsPermissions = [
  { name: 'news:view', category: 'News', description: 'View news list' },
  { name: 'news:create', category: 'News', description: 'Create new news' },
  { name: 'news:edit', category: 'News', description: 'Edit draft news' },
  { name: 'news:publish', category: 'News', description: 'Publish/unpublish news' },
  { name: 'news:delete', category: 'News', description: 'Delete news' },
  { name: 'news:reorder', category: 'News', description: 'Change news order' },
  { name: 'news-categories:manage', category: 'News', description: 'Manage news categories' },
];

for (const permission of newsPermissions) {
  await prisma.permission.upsert({
    where: { name: permission.name },
    update: {},
    create: permission,
  });
}
```

**Step 3: Assign news permissions to ADMIN role**

After the role permissions assignment section:

```typescript
// Assign all news permissions to ADMIN role
const adminRole = await prisma.role.findUnique({ where: { name: 'ADMIN' } });
if (adminRole) {
  for (const permission of newsPermissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: adminRole.id,
          permissionId: (await prisma.permission.findUnique({ where: { name: permission.name } }))!.id,
        },
      },
      update: {},
      create: {
        roleId: adminRole.id,
        permissionId: (await prisma.permission.findUnique({ where: { name: permission.name } }))!.id,
      },
    });
  }
}
```

**Step 4: Run seed**

Run: `pnpm --filter backoffice prisma db seed`

Expected: Seed completed successfully, news permissions created

**Step 5: Commit**

```bash
git add apps/backoffice/prisma/seed.ts
git commit -m "feat: seed news permissions

- Add news:view, news:create, news:edit, news:publish permissions
- Add news:delete, news:reorder, news-categories:manage permissions
- Assign all news permissions to ADMIN role

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

### Task 1.4: Create News Migration Script

**Files:**
- Create: `scripts/migrate-news.ts`

**Step 1: Create migration script**

```typescript
#!/usr/bin/env tsx
import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@workspace/db';

const prisma = new PrismaClient();

async function migrateNews() {
  console.log('Starting news migration...');

  // 1. Read existing news data
  const newsPath = path.join(process.cwd(), 'apps/landing/data/news/articles.json');

  if (!fs.existsSync(newsPath)) {
    console.error('News data file not found:', newsPath);
    process.exit(1);
  }

  const articlesData = JSON.parse(fs.readFileSync(newsPath, 'utf8'));
  console.log(`Found ${articlesData.length} articles to migrate`);

  // 2. Extract unique categories
  const uniqueCategories = [...new Set(articlesData.map((a: any) => a.category))];
  console.log(`Found ${uniqueCategories.length} unique categories`);

  // 3. Create categories
  const categoryMap = new Map<string, string>();
  const colors = ['primary', 'blue', 'green', 'rose', 'orange', 'purple', 'cyan'];

  for (const [index, name] of uniqueCategories.entries()) {
    const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
    const color = colors[index % colors.length];

    const category = await prisma.newsCategory.upsert({
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

  // 5. Migrate articles
  let migrated = 0;
  let skipped = 0;

  for (const article of articlesData) {
    const categoryId = categoryMap.get(article.category);

    if (!categoryId) {
      console.warn(`  - Skipping "${article.title}" - category not found: ${article.category}`);
      skipped++;
      continue;
    }

    // Check if already exists
    const existing = await prisma.news.findUnique({
      where: { slug: article.slug },
    });

    if (existing) {
      console.warn(`  - Skipping "${article.title}" - already exists`);
      skipped++;
      continue;
    }

    try {
      await prisma.news.create({
        data: {
          slug: article.slug,
          title: article.title,
          excerpt: article.excerpt,
          categoryId,
          featured: article.featured || false,
          author: article.author,
          readTime: article.readTime,
          tags: article.tags || [],
          status: 'PUBLISHED',
          publishedAt: new Date(article.date),
          createdById: adminUser.id,
          order: article.order || 0,
        },
      });

      migrated++;
      console.log(`  ✓ Migrated: "${article.title}"`);
    } catch (error) {
      console.error(`  ✗ Failed to migrate "${article.title}":`, error);
    }
  }

  console.log(`\nMigration complete:`);
  console.log(`  - Migrated: ${migrated}`);
  console.log(`  - Skipped: ${skipped}`);
  console.log(`  - Total: ${articlesData.length}`);
}

migrateNews()
  .catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });
```

**Step 2: Make script executable**

Run: `chmod +x scripts/migrate-news.ts`

**Step 3: Run migration script**

Run: `pnpm tsx scripts/migrate-news.ts`

Expected: Migration complete with statistics

**Step 4: Verify migration**

Run: `pnpm --filter backoffice prisma studio` or check database directly

**Step 5: Commit**

```bash
git add scripts/migrate-news.ts
git commit -m "feat: add news migration script

- Migrate articles from JSON to database
- Create categories dynamically from unique values
- Assign proper admin user as creator
- Skip existing articles to allow re-running

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## PHASE 2: Backend API - News Routes

### Task 2.1: Create News Validation Schemas

**Files:**
- Create: `apps/backoffice/lib/validations/news.ts`

**Step 1: Create validation schemas**

```typescript
import { z } from 'zod';

// News Category Schemas
export const newsCategorySchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
  color: z.string().default('primary'),
  showInMenu: z.boolean().default(true),
  order: z.number().int().min(0).default(0),
});

export const newsCategoryUpdateSchema = newsCategorySchema.partial().extend({
  id: z.string().cuid(),
});

// News Schemas
export const newsSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  slug: z.string().min(1).max(200).regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
  excerpt: z.string().min(1, 'Excerpt is required').max(500),
  content: z.string().optional(),
  categoryId: z.string().cuid(),
  featuredImageId: z.string().cuid().optional(),
  featured: z.boolean().default(false),
  showInMenu: z.boolean().default(true),
  order: z.number().int().min(0).default(0),
  author: z.string().max(100).optional(),
  readTime: z.string().max(50).optional(),
  tags: z.array(z.string()).optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).default('DRAFT'),
  publishedAt: z.coerce.date().optional(),
});

export const newsUpdateSchema = newsSchema.partial().extend({
  id: z.string().cuid(),
});

export const newsPublishSchema = z.object({
  id: z.string().cuid(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']),
});

export const newsReorderSchema = z.object({
  items: z.array(z.object({
    id: z.string().cuid(),
    order: z.number().int().min(0),
  })),
});

// Query schemas
export const newsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  categoryId: z.string().optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).optional(),
  featured: z.coerce.boolean().optional(),
  search: z.string().optional(),
});
```

**Step 2: Commit**

```bash
git add apps/backoffice/lib/validations/news.ts
git commit -m "feat: add news validation schemas

- News category schemas (create, update)
- News schemas (create, update, publish, reorder)
- Query parameter schemas for filtering

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

### Task 2.2: Create News Service Layer

**Files:**
- Create: `apps/backoffice/lib/services/news-service.ts`

**Step 1: Create news service**

```typescript
import { prisma, Prisma } from '@workspace/db';
import { NewsStatus } from '@prisma/client';
import { newsActivityLog } from '@/lib/utils/activity-logger';

export interface NewsListOptions {
  page?: number;
  pageSize?: number;
  categoryId?: string;
  status?: NewsStatus;
  featured?: boolean;
  search?: string;
}

export interface PaginatedNews<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

const NEWS_INCLUDE = {
  category: true,
  featuredImage: true,
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

export async function getNewsList(options: NewsListOptions = {}): Promise<PaginatedNews<any>> {
  const { page = 1, pageSize = 20, categoryId, status, featured, search } = options;

  const where: Prisma.NewsWhereInput = {};

  if (categoryId) {
    where.categoryId = categoryId;
  }

  if (status) {
    where.status = status;
  }

  if (featured !== undefined) {
    where.featured = featured;
  }

  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { excerpt: { contains: search, mode: 'insensitive' } },
    ];
  }

  const [items, total] = await Promise.all([
    prisma.news.findMany({
      where,
      include: NEWS_INCLUDE,
      orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.news.count({ where }),
  ]);

  return {
    items,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

export async function getNewsById(id: string) {
  return prisma.news.findUnique({
    where: { id },
    include: NEWS_INCLUDE,
  });
}

export async function getNewsBySlug(slug: string) {
  return prisma.news.findUnique({
    where: { slug },
    include: NEWS_INCLUDE,
  });
}

export async function createNews(data: any, userId: string) {
  const news = await prisma.news.create({
    data: {
      ...data,
      createdById: userId,
      publishedAt: data.status === 'PUBLISHED' ? new Date() : null,
    },
    include: NEWS_INCLUDE,
  });

  await newsActivityLog(news.id, userId, 'created', { data });

  return news;
}

export async function updateNews(id: string, data: any, userId: string) {
  const existing = await getNewsById(id);
  if (!existing) {
    throw new Error('News not found');
  }

  const updates: any = { ...data };

  // Set publishedAt when publishing
  if (data.status === 'PUBLISHED' && existing.status !== 'PUBLISHED') {
    updates.publishedAt = new Date();
  }

  const news = await prisma.news.update({
    where: { id },
    data: {
      ...updates,
      updatedById: userId,
    },
    include: NEWS_INCLUDE,
  });

  await newsActivityLog(id, userId, 'updated', {
    before: existing,
    after: news,
  });

  return news;
}

export async function deleteNews(id: string, userId: string) {
  const existing = await getNewsById(id);
  if (!existing) {
    throw new Error('News not found');
  }

  await newsActivityLog(id, userId, 'deleted', { before: existing });

  await prisma.news.delete({
    where: { id },
  });

  return existing;
}

export async function publishNews(id: string, status: NewsStatus, userId: string) {
  const existing = await getNewsById(id);
  if (!existing) {
    throw new Error('News not found');
  }

  const news = await prisma.news.update({
    where: { id },
    data: {
      status,
      publishedAt: status === 'PUBLISHED' ? new Date() : null,
      updatedById: userId,
    },
    include: NEWS_INCLUDE,
  });

  const action = status === 'PUBLISHED' ? 'published' : status === 'ARCHIVED' ? 'archived' : 'unpublished';
  await newsActivityLog(id, userId, action, { before: existing, after: news });

  return news;
}

export async function reorderNews(items: Array<{ id: string; order: number }>, userId: string) {
  const updates = items.map(({ id, order }) =>
    prisma.news.update({
      where: { id },
      data: { order },
    })
  );

  await prisma.$transaction(updates);

  await newsActivityLog(items[0].id, userId, 'reordered', { items });

  return true;
}

// News Categories
export async function getNewsCategories() {
  return prisma.newsCategory.findMany({
    orderBy: [{ order: 'asc' }, { name: 'asc' }],
    include: {
      _count: {
        select: { news: true },
      },
    },
  });
}

export async function getVisibleNewsCategories() {
  return prisma.newsCategory.findMany({
    where: { showInMenu: true },
    orderBy: [{ order: 'asc' }, { name: 'asc' }],
  });
}

export async function createNewsCategory(data: any) {
  return prisma.newsCategory.create({
    data,
  });
}

export async function updateNewsCategory(id: string, data: any) {
  return prisma.newsCategory.update({
    where: { id },
    data,
  });
}

export async function deleteNewsCategory(id: string) {
  // Check if category has news
  const count = await prisma.news.count({
    where: { categoryId: id },
  });

  if (count > 0) {
    throw new Error('Cannot delete category with existing news');
  }

  return prisma.newsCategory.delete({
    where: { id },
  });
}

// Activity Logs
export async function getNewsActivityLogs(newsId: string) {
  return prisma.newsActivityLog.findMany({
    where: { newsId },
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
```

**Step 2: Update activity logger**

Read: `apps/backoffice/lib/utils/activity-logger.ts`

Add news activity log function:

```typescript
export async function newsActivityLog(newsId: string, userId: string, action: string, changes?: any) {
  return prisma.newsActivityLog.create({
    data: {
      newsId,
      userId,
      action,
      changes,
    },
  });
}
```

**Step 3: Commit**

```bash
git add apps/backoffice/lib/services/news-service.ts apps/backoffice/lib/utils/activity-logger.ts
git commit -m "feat: add news service layer

- CRUD operations for news and categories
- Activity logging for audit trail
- Pagination and filtering support
- Publish workflow with auto-set publishedAt

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

### Task 2.3: Create News API Routes

**Files:**
- Create: `apps/backoffice/app/api/news/route.ts`
- Create: `apps/backoffice/app/api/news/[id]/route.ts`
- Create: `apps/backoffice/app/api/news/[id]/publish/route.ts`
- Create: `apps/backoffice/app/api/news/[id]/logs/route.ts`
- Create: `apps/backoffice/app/api/news/reorder/route.ts`

**Step 1: Create GET/POST /api/news**

Create: `apps/backoffice/app/api/news/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { requirePermission } from '@/lib/auth/permissions';
import { newsQuerySchema, newsSchema } from '@/lib/validations/news';
import {
  getNewsList,
  createNews,
  getNewsCategories,
} from '@/lib/services/news-service';

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await requirePermission(session.user.id, 'news:view');

  const searchParams = request.nextUrl.searchParams;
  const query = newsQuerySchema.parse(Object.fromEntries(searchParams));

  const result = await getNewsList(query);
  return NextResponse.json(result);
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await requirePermission(session.user.id, 'news:create');

  const body = await request.json();
  const data = newsSchema.parse(body);

  const news = await createNews(data, session.user.id);
  return NextResponse.json(news, { status: 201 });
}
```

**Step 2: Create PUT/DELETE /api/news/[id]**

Create: `apps/backoffice/app/api/news/[id]/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { requirePermission } from '@/lib/auth/permissions';
import { newsUpdateSchema } from '@/lib/validations/news';
import {
  getNewsById,
  updateNews,
  deleteNews,
} from '@/lib/services/news-service';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await requirePermission(session.user.id, 'news:view');

  const { id } = await params;
  const news = await getNewsById(id);

  if (!news) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  return NextResponse.json(news);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await requirePermission(session.user.id, 'news:edit');

  const { id } = await params;
  const body = await request.json();
  const data = newsUpdateSchema.parse({ ...body, id });

  const news = await updateNews(id, data, session.user.id);
  return NextResponse.json(news);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await requirePermission(session.user.id, 'news:delete');

  const { id } = await params;
  const news = await deleteNews(id, session.user.id);
  return NextResponse.json(news);
}
```

**Step 3: Create PATCH /api/news/[id]/publish**

Create: `apps/backoffice/app/api/news/[id]/publish/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { requirePermission } from '@/lib/auth/permissions';
import { newsPublishSchema } from '@/lib/validations/news';
import { publishNews } from '@/lib/services/news-service';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await requirePermission(session.user.id, 'news:publish');

  const { id } = await params;
  const body = await request.json();
  const { status } = newsPublishSchema.parse({ ...body, id });

  const news = await publishNews(id, status, session.user.id);
  return NextResponse.json(news);
}
```

**Step 4: Create GET /api/news/[id]/logs**

Create: `apps/backoffice/app/api/news/[id]/logs/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { requirePermission } from '@/lib/auth/permissions';
import { getNewsActivityLogs } from '@/lib/services/news-service';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await requirePermission(session.user.id, 'news:view');

  const { id } = await params;
  const logs = await getNewsActivityLogs(id);
  return NextResponse.json(logs);
}
```

**Step 5: Create PATCH /api/news/reorder**

Create: `apps/backoffice/app/api/news/reorder/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { requirePermission } from '@/lib/auth/permissions';
import { newsReorderSchema } from '@/lib/validations/news';
import { reorderNews } from '@/lib/services/news-service';

export async function PATCH(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await requirePermission(session.user.id, 'news:reorder');

  const body = await request.json();
  const { items } = newsReorderSchema.parse(body);

  await reorderNews(items, session.user.id);
  return NextResponse.json({ success: true });
}
```

**Step 6: Commit**

```bash
git add apps/backoffice/app/api/news
git commit -m "feat: add news API routes

- GET/POST /api/news - list and create news
- GET/PUT/DELETE /api/news/[id] - CRUD operations
- PATCH /api/news/[id]/publish - publish workflow
- GET /api/news/[id]/logs - activity logs
- PATCH /api/news/reorder - bulk reorder

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

### Task 2.4: Create News Category API Routes

**Files:**
- Create: `apps/backoffice/app/api/news-categories/route.ts`
- Create: `apps/backoffice/app/api/news-categories/[id]/route.ts`

**Step 1: Create GET/POST /api/news-categories**

Create: `apps/backoffice/app/api/news-categories/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { requirePermission } from '@/lib/auth/permissions';
import { newsCategorySchema } from '@/lib/validations/news';
import {
  getNewsCategories,
  createNewsCategory,
} from '@/lib/services/news-service';

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await requirePermission(session.user.id, 'news-categories:manage');

  const categories = await getNewsCategories();
  return NextResponse.json(categories);
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await requirePermission(session.user.id, 'news-categories:manage');

  const body = await request.json();
  const data = newsCategorySchema.parse(body);

  const category = await createNewsCategory(data);
  return NextResponse.json(category, { status: 201 });
}
```

**Step 2: Create PUT/DELETE /api/news-categories/[id]**

Create: `apps/backoffice/app/api/news-categories/[id]/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { requirePermission } from '@/lib/auth/permissions';
import { newsCategoryUpdateSchema } from '@/lib/validations/news';
import {
  updateNewsCategory,
  deleteNewsCategory,
} from '@/lib/services/news-service';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await requirePermission(session.user.id, 'news-categories:manage');

  const { id } = await params;
  const body = await request.json();
  const data = newsCategoryUpdateSchema.parse({ ...body, id });

  const category = await updateNewsCategory(id, data);
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

  await requirePermission(session.user.id, 'news-categories:manage');

  const { id } = await params;

  try {
    await deleteNewsCategory(id);
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
git add apps/backoffice/app/api/news-categories
git commit -m "feat: add news category API routes

- GET/POST /api/news-categories - list and create
- PUT/DELETE /api/news-categories/[id] - update and delete
- Validation for non-empty categories

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## PHASE 3: Public API for Landing

### Task 3.1: Create Public News API Routes

**Files:**
- Create: `apps/backoffice/app/api/public/news/route.ts`
- Create: `apps/backoffice/app/api/public/news/[slug]/route.ts`
- Create: `apps/backoffice/app/api/public/news/categories/route.ts`

**Step 1: Create GET /api/public/news**

Create: `apps/backoffice/app/api/public/news/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@workspace/db';
import { z } from 'zod';

const querySchema = z.object({
  featured: z.coerce.boolean().optional(),
  category: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = querySchema.parse(Object.fromEntries(searchParams));

    const where: any = {
      status: 'PUBLISHED',
      showInMenu: true,
    };

    if (query.featured) {
      where.featured = true;
    }

    if (query.category) {
      const category = await prisma.newsCategory.findUnique({
        where: { slug: query.category },
      });
      if (category) {
        where.categoryId = category.id;
      } else {
        return NextResponse.json({ items: [], total: 0, page: 1, pageSize: query.pageSize });
      }
    }

    const [items, total] = await Promise.all([
      prisma.news.findMany({
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
          featuredImage: {
            select: {
              id: true,
              cdnUrl: true,
            },
          },
        },
        orderBy: [
          { featured: 'desc' },
          { publishedAt: 'desc' },
        ],
        skip: query.limit ? undefined : (query.page - 1) * query.pageSize,
        take: query.limit || query.pageSize,
      }),
      prisma.news.count({ where }),
    ]);

    // Transform to match existing NewsArticle interface
    const transformed = items.map((item) => ({
      id: item.id,
      slug: item.slug,
      title: item.title,
      excerpt: item.excerpt,
      content: item.content,
      category: item.category.name,
      categorySlug: item.category.slug,
      categoryColor: item.category.color,
      date: item.publishedAt?.toISOString() || item.createdAt.toISOString(),
      image: item.featuredImage?.cdnUrl || null,
      author: item.author,
      readTime: item.readTime,
      featured: item.featured,
      tags: item.tags as string[] || [],
    }));

    return NextResponse.json({
      items: transformed,
      total,
      page: query.page,
      pageSize: query.pageSize,
      totalPages: Math.ceil(total / query.pageSize),
    });
  } catch (error) {
    console.error('Public news API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch news' },
      { status: 500 }
    );
  }
}
```

**Step 2: Create GET /api/public/news/[slug]**

Create: `apps/backoffice/app/api/public/news/[slug]/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@workspace/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const news = await prisma.news.findFirst({
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
        featuredImage: {
          select: {
            id: true,
            cdnUrl: true,
          },
        },
      },
    });

    if (!news) {
      return NextResponse.json(
        { error: 'Not found' },
        { status: 404 }
      );
    }

    // Transform to match existing NewsArticle interface
    const transformed = {
      id: news.id,
      slug: news.slug,
      title: news.title,
      excerpt: news.excerpt,
      content: news.content,
      category: news.category.name,
      categorySlug: news.category.slug,
      categoryColor: news.category.color,
      date: news.publishedAt?.toISOString() || news.createdAt.toISOString(),
      image: news.featuredImage?.cdnUrl || null,
      author: news.author,
      readTime: news.readTime,
      featured: news.featured,
      tags: news.tags as string[] || [],
    };

    return NextResponse.json(transformed);
  } catch (error) {
    console.error('Public news detail API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch news' },
      { status: 500 }
    );
  }
}
```

**Step 3: Create GET /api/public/news/categories**

Create: `apps/backoffice/app/api/public/news/categories/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@workspace/db';

export async function GET(request: NextRequest) {
  try {
    const categories = await prisma.newsCategory.findMany({
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
    console.error('Public news categories API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}
```

**Step 4: Commit**

```bash
git add apps/backoffice/app/api/public/news
git commit -m "feat: add public news API routes

- GET /api/public/news - list published news with filters
- GET /api/public/news/[slug] - get single news by slug
- GET /api/public/news/categories - list visible categories
- Transform responses to match landing interface

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## PHASE 4: Landing Integration

### Task 4.1: Update Landing News Data Layer

**Files:**
- Modify: `apps/landing/lib/news-data.ts`

**Step 1: Replace file-based with API-based**

Replace entire file content:

```typescript
// Types for news data structure
export interface NewsArticle {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content?: string;
  category: string;
  categorySlug?: string;
  categoryColor?: string;
  date: string;
  image: string | null;
  author: string | null;
  readTime: string | null;
  featured: boolean;
  tags: string[];
}

const BACKOFFICE_URL = process.env.NEXT_PUBLIC_BACKOFFICE_URL || 'http://localhost:3001';

/**
 * Fetch all news articles
 */
export async function getAllNews(): Promise<NewsArticle[]> {
  try {
    const res = await fetch(`${BACKOFFICE_URL}/api/public/news`, {
      next: { revalidate: 3600 } // Cache 1 hour
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.items || [];
  } catch (error) {
    console.error('Error loading news articles:', error);
    return [];
  }
}

/**
 * Fetch featured news articles
 */
export async function getFeaturedNews(): Promise<NewsArticle[]> {
  try {
    const res = await fetch(`${BACKOFFICE_URL}/api/public/news?featured=true`, {
      next: { revalidate: 3600 }
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.items || [];
  } catch (error) {
    console.error('Error loading featured news:', error);
    return [];
  }
}

/**
 * Fetch recent news articles (limit)
 */
export async function getRecentNews(limit: number = 6): Promise<NewsArticle[]> {
  try {
    const res = await fetch(`${BACKOFFICE_URL}/api/public/news?limit=${limit}`, {
      next: { revalidate: 3600 }
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.items || [];
  } catch (error) {
    console.error('Error loading recent news:', error);
    return [];
  }
}

/**
 * Fetch news by category
 */
export async function getNewsByCategory(category: string): Promise<NewsArticle[]> {
  try {
    const res = await fetch(`${BACKOFFICE_URL}/api/public/news?category=${category}`, {
      next: { revalidate: 3600 }
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.items || [];
  } catch (error) {
    console.error(`Error loading news for category ${category}:`, error);
    return [];
  }
}

/**
 * Fetch a single news article by slug
 */
export async function getNewsBySlug(slug: string): Promise<NewsArticle | null> {
  try {
    const res = await fetch(`${BACKOFFICE_URL}/api/public/news/${slug}`, {
      next: { revalidate: 3600 }
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    console.error(`Error loading news article ${slug}:`, error);
    return null;
  }
}

/**
 * Get all unique news categories
 */
export async function getNewsCategories(): Promise<string[]> {
  try {
    const res = await fetch(`${BACKOFFICE_URL}/api/public/news/categories`, {
      next: { revalidate: 3600 }
    });
    if (!res.ok) return [];
    const categories = await res.json();
    return categories.map((c: any) => c.name);
  } catch (error) {
    console.error('Error loading news categories:', error);
    return [];
  }
}

/**
 * Get categories with full details
 */
export async function getNewsCategoriesWithDetails(): Promise<Array<{
  id: string;
  name: string;
  slug: string;
  color: string;
  order: number;
}>> {
  try {
    const res = await fetch(`${BACKOFFICE_URL}/api/public/news/categories`, {
      next: { revalidate: 3600 }
    });
    if (!res.ok) return [];
    return await res.json();
  } catch (error) {
    console.error('Error loading news categories:', error);
    return [];
  }
}
```

**Step 2: Commit**

```bash
git add apps/landing/lib/news-data.ts
git commit -m "feat: update news data layer to use API

- Replace fs.readFileSync with fetch to backoffice API
- Add ISR caching (1 hour) for all news data
- Maintain backward compatibility with existing interfaces
- Add new getNewsCategoriesWithDetails function

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

### Task 4.2: Add Revalidate Support for News

**Files:**
- Modify: `apps/backoffice/app/api/public/revalidate/route.ts` (or create if doesn't exist)

**Step 1: Check existing revalidate route**

Check if `apps/backoffice/app/api/public/revalidate/route.ts` exists

**Step 2: Add news paths to revalidate**

If exists, add news paths to the revalidate logic:

```typescript
// In the revalidate logic, add:
revalidatePath('/informasi-publik/berita-terkini');
revalidatePath('/api/public/news');
```

If doesn't exist, create the route:

```typescript
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
      // Revalidate all news-related paths
      revalidatePath('/informasi-publik/berita-terkini');
      revalidatePath('/api/public/news');
    }

    return NextResponse.json({ revalidated: true });
  } catch (err) {
    return NextResponse.json({ message: 'Error revalidating' }, { status: 500 });
  }
}
```

**Step 3: Update publish endpoint to trigger revalidate**

Modify: `apps/backoffice/app/api/news/[id]/publish/route.ts`

Add revalidation after publish:

```typescript
import { revalidatePath } from 'next/cache';

// After successful publish/update, add:
if (status === 'PUBLISHED') {
  // Trigger landing revalidation
  const revalidateSecret = process.env.REVALIDATE_SECRET;
  const landingUrl = process.env.LANDING_URL || 'http://localhost:3000';

  try {
    await fetch(`${landingUrl}/api/revalidate?secret=${revalidateSecret}`, {
      method: 'POST',
    });
  } catch (error) {
    console.error('Failed to revalidate landing:', error);
    // Don't fail the request if revalidation fails
  }

  // Also revalidate locally
  revalidatePath('/api/public/news');
  revalidatePath('/informasi-publik/berita-terkini');
}
```

**Step 4: Commit**

```bash
git add apps/backoffice/app/api/public/revalidate apps/backoffice/app/api/news/[id]/publish/route.ts
git commit -m "feat: add news revalidation on publish

- Add news paths to revalidate endpoint
- Trigger landing revalidation when news is published
- Add REVALIDATE_SECRET to environment requirements

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## PHASE 5: Backoffice UI Components

### Task 5.1: Create News Categories Management Page

**Files:**
- Create: `apps/backoffice/app/manage/news-categories/page.tsx`
- Create: `apps/backoffice/components/manage/news-categories-table.tsx`
- Create: `apps/backoffice/components/manage/news-category-form.tsx`

**Step 1: Create news categories table component**

Create: `apps/backoffice/components/manage/news-categories-table.tsx`

```typescript
'use client';

import { useState } from 'react';
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { ArrowUpDown, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { NewsCategory } from '@prisma/client';

interface NewsCategoriesTableProps {
  categories: Array<NewsCategory & { _count?: { news: number } }>;
  onDelete: (id: string) => void;
  onEdit: (category: NewsCategory) => void;
}

export function NewsCategoriesTable({
  categories,
  onDelete,
  onEdit,
}: NewsCategoriesTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; id: string | null; name: string }>({
    open: false,
    id: null,
    name: '',
  });

  const columns: ColumnDef<NewsCategory & { _count?: { news: number } }>[] = [
    {
      accessorKey: 'name',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => row.getValue('name'),
    },
    {
      accessorKey: 'slug',
      header: 'Slug',
      cell: ({ row }) => (
        <code className="text-xs bg-muted px-2 py-1 rounded">
          {row.getValue('slug')}
        </code>
      ),
    },
    {
      accessorKey: 'color',
      header: 'Color',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <div className={`w-4 h-4 rounded bg-${row.getValue('color')}`} />
          {row.getValue('color')}
        </div>
      ),
    },
    {
      accessorKey: 'showInMenu',
      header: 'Visible',
      cell: ({ row }) => (row.getValue('showInMenu') ? 'Yes' : 'No'),
    },
    {
      accessorKey: 'order',
      header: 'Order',
      cell: ({ row }) => row.getValue('order'),
    },
    {
      accessorKey: '_count.news',
      header: 'News',
      cell: ({ row }) => row.original._count?.news || 0,
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(row.original)}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() =>
                setDeleteDialog({
                  open: true,
                  id: row.original.id,
                  name: row.original.name,
                })
              }
              className="text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  const table = useReactTable({
    data: categories,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
    },
  });

  const handleDelete = () => {
    if (deleteDialog.id) {
      onDelete(deleteDialog.id);
      setDeleteDialog({ open: false, id: null, name: '' });
    }
  };

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No categories found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Category</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{deleteDialog.name}&quot;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialog({ open: false, id: null, name: '' })}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
```

**Step 2: Create news category form component**

Create: `apps/backoffice/components/manage/news-category-form.tsx`

```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { newsCategorySchema } from '@/lib/validations/news';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { NewsCategory } from '@prisma/client';

const COLORS = [
  { value: 'primary', label: 'Primary', class: 'bg-primary' },
  { value: 'blue', label: 'Blue', class: 'bg-blue-500' },
  { value: 'green', label: 'Green', class: 'bg-green-500' },
  { value: 'rose', label: 'Rose', class: 'bg-rose-500' },
  { value: 'orange', label: 'Orange', class: 'bg-orange-500' },
  { value: 'purple', label: 'Purple', class: 'bg-purple-500' },
  { value: 'cyan', label: 'Cyan', class: 'bg-cyan-500' },
];

interface NewsCategoryFormProps {
  open: boolean;
  onClose: () => void;
  category?: NewsCategory | null;
}

export function NewsCategoryForm({ open, onClose, category }: NewsCategoryFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm({
    resolver: zodResolver(newsCategorySchema),
    defaultValues: {
      name: category?.name || '',
      slug: category?.slug || '',
      color: category?.color || 'primary',
      showInMenu: category?.showInMenu ?? true,
      order: category?.order || 0,
    },
  });

  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      const url = category
        ? `/api/news-categories/${category.id}`
        : '/api/news-categories';
      const method = category ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save category');
      }

      toast.success(category ? 'Category updated successfully' : 'Category created successfully');
      router.refresh();
      onClose();
      form.reset();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to save category');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{category ? 'Edit Category' : 'New Category'}</DialogTitle>
          <DialogDescription>
            {category ? 'Update the category details.' : 'Create a new news category.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Pemerintahan" {...field} />
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
                    <Input placeholder="pemerintahan" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Color</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select color" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {COLORS.map((color) => (
                        <SelectItem key={color.value} value={color.value}>
                          <div className="flex items-center gap-2">
                            <div className={`w-4 h-4 rounded ${color.class}`} />
                            {color.label}
                          </div>
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
                    <Input type="number" {...field} onChange={(e) => field.onChange(parseInt(e.target.value) || 0)} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="showInMenu"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Show in Menu</FormLabel>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : category ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
```

**Step 3: Create categories management page**

Create: `apps/backoffice/app/manage/news-categories/page.tsx`

```typescript
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@workspace/db';
import { NewsCategoriesTable } from '@/components/manage/news-categories-table';
import { NewsCategoryForm } from '@/components/manage/news-category-form';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { requirePermission } from '@/lib/auth/permissions';

export default async function NewsCategoriesPage() {
  const session = await auth();
  if (!session?.user) {
    redirect('/login');
  }

  await requirePermission(session.user.id, 'news-categories:manage');

  const categories = await prisma.newsCategory.findMany({
    include: {
      _count: {
        select: { news: true },
      },
    },
    orderBy: [{ order: 'asc' }, { name: 'asc' }],
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">News Categories</h1>
          <p className="text-muted-foreground">
            Manage news categories for the website
          </p>
        </div>
        <NewsCategoryFormTrigger />
      </div>

      <NewsCategoriesTable
        categories={categories}
        onDelete={async (id) => {
          'use server';
          const response = await fetch(`/api/news-categories/${id}`, {
            method: 'DELETE',
          });
          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to delete category');
          }
          redirect('/manage/news-categories');
        }}
        onEdit={async (category) => {
          'use server';
          // This would open the edit form
          // For now, we'll use client-side state
        }}
      />
    </div>
  );
}

function NewsCategoryFormTrigger() {
  return (
    <NewsCategoryForm>
      <Button>
        <Plus className="mr-2 h-4 w-4" />
        New Category
      </Button>
    </NewsCategoryForm>
  );
}
```

**Step 4: Commit**

```bash
git add apps/backoffice/app/manage/news-categories apps/backoffice/components/manage/news-categories-table.tsx apps/backoffice/components/manage/news-category-form.tsx
git commit -m "feat: add news categories management page

- Table component with sorting, filtering, actions
- Form component with color picker, order, visibility
- Full CRUD operations for news categories
- Delete validation for non-empty categories

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

### Task 5.2: Create News Management Page

**Files:**
- Create: `apps/backoffice/app/manage/news/page.tsx`
- Create: `apps/backoffice/components/manage/news-table.tsx`

**Step 1: Create news table component**

Create: `apps/backoffice/components/manage/news-table.tsx`

This is a large component - follow the service table pattern with:
- Columns: featured image, title, category, status, published date, actions
- Filters: category, status, featured
- Search by title
- Row actions: edit, delete, publish/unpublish

```typescript
'use client';

import { useState } from 'react';
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { ArrowUpDown, MoreHorizontal, Pencil, Trash2, Eye, EyeOff } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { NewsStatus, News } from '@prisma/client';

interface NewsTableProps {
  initialData: {
    items: Array<News & {
      category: { id: string; name: string; slug: string };
      featuredImage: { id: string; cdnUrl: string } | null;
    }>;
    total: number;
    page: number;
    pageSize: number;
  };
}

export function NewsTable({ initialData }: NewsTableProps) {
  const router = useRouter();
  const [data, setData] = useState(initialData.items);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState('');

  const columns: ColumnDef<News & {
    category: { id: string; name: string; slug: string };
    featuredImage: { id: string; cdnUrl: string } | null;
  }>[] = [
    {
      accessorKey: 'featuredImage',
      header: 'Image',
      cell: ({ row }) => {
        const image = row.getValue('featuredImage') as { cdnUrl: string } | null;
        return image ? (
          <div className="relative h-12 w-12 rounded overflow-hidden bg-muted">
            <Image src={image.cdnUrl} alt="" fill className="object-cover" />
          </div>
        ) : (
          <div className="h-12 w-12 rounded bg-muted flex items-center justify-center text-xs text-muted-foreground">
            No img
          </div>
        );
      },
    },
    {
      accessorKey: 'title',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Title
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const title = row.getValue('title') as string;
        const featured = row.original.featured;
        return (
          <div className="max-w-[300px]">
            <div className="font-medium truncate">{title}</div>
            {featured && (
              <Badge variant="secondary" className="mt-1">Featured</Badge>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: 'category.name',
      header: 'Category',
      cell: ({ row }) => row.original.category.name,
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.getValue('status') as NewsStatus;
        return (
          <Badge
            variant={
              status === 'PUBLISHED'
                ? 'default'
                : status === 'DRAFT'
                ? 'secondary'
                : 'outline'
            }
          >
            {status.toLowerCase()}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'publishedAt',
      header: 'Published',
      cell: ({ row }) => {
        const date = row.getValue('publishedAt') as Date | null;
        return date ? new Date(date).toLocaleDateString() : '-';
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => router.push(`/manage/news/${row.original.id}`)}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handlePublish(row.original.id, row.original.status)}
            >
              {row.original.status === 'PUBLISHED' ? (
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
            <DropdownMenuItem
              onClick={() => handleDelete(row.original.id)}
              className="text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
  });

  const handlePublish = async (id: string, currentStatus: NewsStatus) => {
    const newStatus = currentStatus === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED';
    try {
      const response = await fetch(`/api/news/${id}/publish`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) throw new Error('Failed to update status');

      toast.success(`News ${newStatus.toLowerCase()}`);
      router.refresh();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this news?')) return;

    try {
      const response = await fetch(`/api/news/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete');

      toast.success('News deleted');
      router.refresh();
    } catch (error) {
      toast.error('Failed to delete');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <input
          placeholder="Search news..."
          value={globalFilter ?? ''}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="max-w-sm flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No news found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
```

**Step 2: Create news management page**

Create: `apps/backoffice/app/manage/news/page.tsx`

```typescript
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@workspace/db';
import { NewsTable } from '@/components/manage/news-table';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { requirePermission } from '@/lib/auth/permissions';

export default async function NewsPage() {
  const session = await auth();
  if (!session?.user) {
    redirect('/login');
  }

  await requirePermission(session.user.id, 'news:view');

  const news = await prisma.news.findMany({
    include: {
      category: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
      featuredImage: {
        select: {
          id: true,
          cdnUrl: true,
        },
      },
    },
    orderBy: [
      { featured: 'desc' },
      { createdAt: 'desc' },
    ],
    take: 50,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">News</h1>
          <p className="text-muted-foreground">
            Manage news articles for the website
          </p>
        </div>
        <Button asChild>
          <a href="/manage/news/new">
            <Plus className="mr-2 h-4 w-4" />
            New News
          </a>
        </Button>
      </div>

      <NewsTable initialData={{ items: news, total: news.length, page: 1, pageSize: 50 }} />
    </div>
  );
}
```

**Step 3: Commit**

```bash
git add apps/backoffice/app/manage/news apps/backoffice/components/manage/news-table.tsx
git commit -m "feat: add news management page

- Table with featured images, title, category, status, dates
- Search and filter functionality
- Publish/unpublish, edit, delete actions
- New news button linking to create page

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

### Task 5.3: Create News Form Page

**Files:**
- Create: `apps/backoffice/app/manage/news/new/page.tsx`
- Create: `apps/backoffice/app/manage/news/[id]/page.tsx`
- Create: `apps/backoffice/components/manage/news-form.tsx`

**Step 1: Create news form component with TipTap**

Create: `apps/backoffice/components/manage/news-form.tsx`

This is a large component with TipTap integration:

```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { newsSchema } from '@/lib/validations/news';
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
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FileUpload } from '@/components/ui/file-upload';
import { TipTapEditor } from '@/components/ui/tiptap-editor';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { News, NewsCategory } from '@prisma/client';

interface NewsFormProps {
  news?: News & {
    category: NewsCategory;
    featuredImage?: { id: string; cdnUrl: string } | null;
  };
  categories: NewsCategory[];
}

export function NewsForm({ news, categories }: NewsFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tags, setTags] = useState<string[]>(news?.tags as string[] || []);
  const [tagInput, setTagInput] = useState('');

  const form = useForm({
    resolver: zodResolver(newsSchema),
    defaultValues: {
      title: news?.title || '',
      slug: news?.slug || '',
      excerpt: news?.excerpt || '',
      content: news?.content || '',
      categoryId: news?.categoryId || '',
      featuredImageId: news?.featuredImage?.id || '',
      featured: news?.featured || false,
      showInMenu: news?.showInMenu ?? true,
      order: news?.order || 0,
      author: news?.author || '',
      readTime: news?.readTime || '',
      status: news?.status || 'DRAFT',
    },
  });

  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      const url = news ? `/api/news/${news.id}` : '/api/news';
      const method = news ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          tags,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save news');
      }

      toast.success(news ? 'News updated successfully' : 'News created successfully');
      router.push('/manage/news');
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to save news');
    } finally {
      setIsSubmitting(false);
    }
  };

  const addTag = () => {
    const tag = tagInput.trim();
    if (tag && !tags.includes(tag)) {
      setTags([...tags, tag]);
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input placeholder="Enter news title" {...field} />
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
                  <Input placeholder="news-url-slug" {...field} />
                </FormControl>
                <FormDescription>
                  URL-friendly version of the title
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="excerpt"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Excerpt</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Brief summary for the news card"
                  rows={3}
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Short description shown in news cards (max 500 characters)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Content</FormLabel>
              <FormControl>
                <TipTapEditor
                  content={field.value || ''}
                  onChange={field.onChange}
                  placeholder="Write the full news content here..."
                />
              </FormControl>
              <FormDescription>
                Full article content with rich text formatting
              </FormDescription>
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
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
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
          name="featuredImageId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Featured Image</FormLabel>
              <FormControl>
                <FileUpload
                  value={field.value}
                  onChange={field.onChange}
                  accept="image/*"
                  folder="news"
                />
              </FormControl>
              <FormDescription>
                Main image displayed in news cards and detail page
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="author"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Author</FormLabel>
                <FormControl>
                  <Input placeholder="Author name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="readTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Read Time</FormLabel>
                <FormControl>
                  <Input placeholder="5 min read" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div>
          <FormLabel>Tags</FormLabel>
          <FormDescription>Add relevant tags for the news</FormDescription>
          <div className="flex gap-2 mt-2">
            <Input
              placeholder="Add a tag"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addTag();
                }
              }}
            />
            <Button type="button" variant="outline" onClick={addTag}>
              Add
            </Button>
          </div>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="ml-2 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
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

          <FormField
            control={form.control}
            name="order"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Order</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="space-y-4 pt-6">
            <FormField
              control={form.control}
              name="featured"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel>Featured</FormLabel>
                    <FormDescription>Show in featured section</FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="showInMenu"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel>Visible</FormLabel>
                    <FormDescription>Show on website</FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="flex gap-4">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : news ? 'Update' : 'Create'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  );
}
```

**Step 2: Create new news page**

Create: `apps/backoffice/app/manage/news/new/page.tsx`

```typescript
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@workspace/db';
import { NewsForm } from '@/components/manage/news-form';
import { requirePermission } from '@/lib/auth/permissions';

export default async function NewNewsPage() {
  const session = await auth();
  if (!session?.user) {
    redirect('/login');
  }

  await requirePermission(session.user.id, 'news:create');

  const categories = await prisma.newsCategory.findMany({
    orderBy: [{ order: 'asc' }, { name: 'asc' }],
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">New News</h1>
        <p className="text-muted-foreground">
          Create a new news article
        </p>
      </div>

      <NewsForm categories={categories} />
    </div>
  );
}
```

**Step 3: Create edit news page**

Create: `apps/backoffice/app/manage/news/[id]/page.tsx`

```typescript
import { auth } from '@/lib/auth';
import { redirect, notFound } from 'next/navigation';
import { prisma } from '@workspace/db';
import { NewsForm } from '@/components/manage/news-form';
import { requirePermission } from '@/lib/auth/permissions';

export default async function EditNewsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user) {
    redirect('/login');
  }

  await requirePermission(session.user.id, 'news:edit');

  const { id } = await params;

  const news = await prisma.news.findUnique({
    where: { id },
    include: {
      category: true,
      featuredImage: {
        select: {
          id: true,
          cdnUrl: true,
        },
      },
    },
  });

  if (!news) {
    notFound();
  }

  const categories = await prisma.newsCategory.findMany({
    orderBy: [{ order: 'asc' }, { name: 'asc' }],
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Edit News</h1>
        <p className="text-muted-foreground">
          Update news article: {news.title}
        </p>
      </div>

      <NewsForm news={news} categories={categories} />
    </div>
  );
}
```

**Step 4: Commit**

```bash
git add apps/backoffice/app/manage/news/new apps/backoffice/app/manage/news/[id] apps/backoffice/components/manage/news-form.tsx
git commit -m "feat: add news form pages

- Create new news page with TipTap editor
- Edit news page with pre-filled data
- Form with featured image upload, tags, categories
- Status workflow (draft, published, archived)
- Visibility and featured toggles

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

### Task 5.4: Update Navigation

**Files:**
- Modify: `apps/backoffice/components/sidebar-nav.tsx` (or equivalent navigation file)

**Step 1: Add news management links**

Add to sidebar navigation:

```typescript
{
  title: 'News Management',
  items: [
    {
      title: 'News',
      href: '/manage/news',
      icon: Newspaper,
    },
    {
      title: 'News Categories',
      href: '/manage/news-categories',
      icon: FolderOpen,
    },
  ],
},
```

**Step 2: Commit**

```bash
git add apps/backoffice/components/sidebar-nav.tsx
git commit -m "feat: add news management links to navigation

- Add News and News Categories links to sidebar
- Use appropriate icons for visual clarity

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## PHASE 6: Environment Variables & Testing

### Task 6.1: Update Environment Files

**Files:**
- Modify: `apps/backoffice/.env.example`
- Modify: `apps/landing/.env.example`

**Step 1: Add to backoffice .env.example**

```bash
# Revalidation secret for landing cache
REVALIDATE_SECRET=your-secret-key-here

# Landing URL for revalidation
LANDING_URL=http://localhost:3000
```

**Step 2: Add to landing .env.example**

```bash
# Backoffice API URL for public endpoints
NEXT_PUBLIC_BACKOFFICE_URL=http://localhost:3001

# Revalidation secret
REVALIDATE_SECRET=your-secret-key-here
```

**Step 3: Commit**

```bash
git add apps/backoffice/.env.example apps/landing/.env.example
git commit -m "feat: add environment variables for news integration

- Add REVALIDATE_SECRET for cache invalidation
- Add LANDING_URL for backoffice to trigger revalidation
- Add NEXT_PUBLIC_BACKOFFICE_URL for landing to fetch data

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

### Task 6.2: Run Migration Script

**Step 1: Run migration script**

```bash
pnpm tsx scripts/migrate-news.ts
```

Expected: Migration statistics displayed

**Step 2: Verify data**

Check database to ensure news and categories were created

**Step 3: Commit (no changes, just verification)**

---

## PHASE 7: Final Testing & Documentation

### Task 7.1: Manual Testing Checklist

**Step 1: Test backoffice news management**

- [ ] Login as admin user
- [ ] Navigate to /manage/news
- [ ] Verify news list displays migrated articles
- [ ] Create a new news article
- [ ] Upload featured image
- [ ] Use TipTap editor with text formatting
- [ ] Upload image in editor
- [ ] Add tags
- [ ] Save as draft
- [ ] Publish the article
- [ ] Edit published article
- [ ] Unpublish article
- [ ] Delete article

**Step 2: Test categories management**

- [ ] Navigate to /manage/news-categories
- [ ] Create new category
- [ ] Edit category name and color
- [ ] Try to delete category with news (should fail)
- [ ] Reorder categories

**Step 3: Test landing integration**

- [ ] Navigate to /informasi-publik/berita-terkini
- [ ] Verify news displays from API
- [ ] Click on news article to view detail
- [ ] Verify content displays with formatting
- [ ] Verify featured images display
- [ ] Check categories filter works

**Step 4: Test permissions**

- [ ] Create non-admin user with limited permissions
- [ ] Verify user cannot access news management without permissions
- [ ] Grant specific permissions and verify access

**Step 5: Test cache revalidation**

- [ ] Publish news from backoffice
- [ ] Check landing page updates (or wait for cache expiry)
- [ ] Test manual sync button if implemented

---

### Task 7.2: Update Documentation

**Files:**
- Modify: `README.md` or project docs

**Step 1: Add news management section to docs**

```markdown
## News Management

News articles are managed through the backoffice at `/manage/news`.

### Features

- Rich text editing with TipTap
- Featured image upload
- Category management
- Tag support
- Publishing workflow (Draft → Published → Archived)
- Activity logging

### API

- **Protected API** (backoffice): `/api/news/*`
- **Public API** (landing): `/api/public/news/*`

### Creating News

1. Navigate to `/manage/news`
2. Click "New News"
3. Fill in title, slug (auto-generated), excerpt
4. Add content with TipTap editor
5. Upload featured image
6. Select category
7. Add tags and metadata
8. Set status and publish
```

**Step 2: Commit**

```bash
git add README.md
git commit -m "docs: add news management documentation

- Overview of news management features
- API endpoints reference
- How-to guide for creating news

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Summary

This implementation plan covers:

1. **Database** - Prisma models, migrations, seeding
2. **Backend API** - Protected routes for CRUD, public routes for landing
3. **Landing Integration** - API consumption, ISR caching, revalidation
4. **Backoffice UI** - Tables, forms, TipTap editor, permissions
5. **Environment** - Configuration for cross-app communication
6. **Testing** - Manual testing checklist

**Total Phases:** 7
**Total Tasks:** ~30
**Estimated Implementation Time:** 8-12 hours
