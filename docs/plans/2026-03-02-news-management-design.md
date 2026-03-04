# News Management System - Design Document

**Date:** 2026-03-02
**Author:** Bandanaiera Team
**Status:** Approved

## Overview

Migrate news data from JSON files in landing to a database-driven system managed through backoffice with full Role-Based Access Control (RBAC). Landing will consume data via public API with caching.

## Current State

**Landing (apps/landing):**
- News stored in `data/news/articles.json` file
- Each article has: id, slug, title, excerpt, category, date, image, author, readTime, featured, tags
- File-based reading with `fs.readFileSync()`
- No rich text content (only excerpt)

**Backoffice (apps/backoffice):**
- PostgreSQL with Prisma ORM
- RBCA system with Permissions, Roles, Users
- Existing File model for uploads
- Service management pattern as reference

## Design Goals

1. **Centralized Management** - News managed via backoffice UI
2. **Role-Based Access** - Granular permissions for different user roles
3. **Performance** - Landing caches data with ISR (1 hour)
4. **Audit Trail** - Track all changes to news
5. **Workflow** - Draft → Publish status for content approval
6. **Rich Content** - TipTap editor with image upload support

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

### NewsCategory

```prisma
model NewsCategory {
  id          String     @id @default(cuid())
  name        String
  slug        String     @unique
  color       String     // Tailwind color: "primary", "rose", "blue", etc.
  showInMenu  Boolean    @default(true)
  order       Int
  news        News[]
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt

  @@index([showInMenu])
  @@index([order])
}
```

### News

```prisma
model News {
  id                   String         @id @default(cuid())
  slug                 String         @unique
  title                String
  excerpt              String         // Short description for cards
  content              String?        // Full content (rich text/HTML from TipTap)

  categoryId           String
  category             NewsCategory   @relation(fields: [categoryId], references: [id])

  // Media
  featuredImageId      String?
  featuredImage        File?          @relation(fields: [featuredImageId], references: [id])

  // Display options
  featured             Boolean        @default(false)
  showInMenu           Boolean        @default(true)
  order                Int            @default(0)

  // Metadata
  author               String?        // Author name
  readTime             String?        // e.g., "5 min read"
  tags                 Json?          // String[] - array of tags
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

enum NewsStatus {
  DRAFT
  PUBLISHED
  ARCHIVED
}
```

### NewsActivityLog

```prisma
model NewsActivityLog {
  id          String   @id @default(cuid())
  newsId      String
  news        News     @relation(fields: [newsId], references: [id], onDelete: Cascade)
  userId      String
  action      String   // created, updated, published, unpublished, archived, deleted
  changes     Json?    // { before: {...}, after: {...} }
  createdAt   DateTime @default(now())

  @@index([newsId])
  @@index([userId])
  @@index([createdAt])
}
```

### User Model Updates

```prisma
model User {
  // ... existing fields ...
  createdNews      News[]           @relation("NewsCreator")
  updatedNews      News[]           @relation("NewsUpdater")
  newsActivityLogs NewsActivityLog[]
}
```

## Permissions

| Permission Name | Category | Description |
|----------------|----------|-------------|
| `news:view` | News | View news list |
| `news:create` | News | Create new news |
| `news:edit` | News | Edit draft news |
| `news:publish` | News | Publish/unpublish news |
| `news:delete` | News | Delete news |
| `news:reorder` | News | Change news order |
| `news-categories:manage` | News | Manage news categories |

## API Routes

### Protected Routes (Backoffice UI)

| Method | Route | Permission | Description |
|--------|-------|------------|-------------|
| GET | `/api/news` | `news:view` | List news with filters |
| POST | `/api/news` | `news:create` | Create new news |
| GET | `/api/news/[id]` | `news:view` | Get news details |
| PUT | `/api/news/[id]` | `news:edit` | Update news |
| DELETE | `/api/news/[id]` | `news:delete` | Delete news |
| PATCH | `/api/news/[id]/publish` | `news:publish` | Publish/unpublish |
| PATCH | `/api/news/reorder` | `news:reorder` | Bulk reorder |
| GET | `/api/news-categories` | `news-categories:manage` | List categories |
| POST | `/api/news-categories` | `news-categories:manage` | Create category |
| PUT | `/api/news-categories/[id]` | `news-categories:manage` | Update category |
| DELETE | `/api/news-categories/[id]` | `news-categories:manage` | Delete category |
| GET | `/api/news/[id]/logs` | `news:view` | Get activity logs |
| POST | `/api/sync/landing` | `news:publish` | Trigger landing revalidate |

### Public Routes (Landing)

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/public/news` | List published news |
| GET | `/api/public/news/categories` | List visible categories |
| GET | `/api/public/news/[slug]` | Get news by slug |
| GET | `/api/public/categories/[slug]/news` | Get news by category |
| POST | `/api/public/revalidate` | Revalidate cache (with secret) |

## Backoffice UI Pages

### News Management

**Route:** `/manage/news`

**Features:**
- Data table with columns: Featured Image, Title, Category, Status, Published Date, Actions
- Filters by: Category, Status (Draft/Published/Archived), Featured
- Search by title
- Row actions: Edit, Delete, Publish/Unpublish
- New News button (top right)
- Drag-drop handle for ordering

**News Form Modal/Page:**
- **Basic Info:** Title, Slug (auto-generated), Excerpt
- **Category:** Dropdown select
- **Content:** TipTap rich text editor with image upload
- **Featured Image:** File upload
- **Display:** Featured toggle, Show in menu toggle
- **Metadata:** Author, Read time, Tags (add/remove tags)
- **Publishing:** Published date (auto-set on publish), Order, Status

### News Categories Management

**Route:** `/manage/news-categories`

**Features:**
- List view with: Name, Slug, Color, Show in menu, Order, Actions
- Edit/Delete actions
- New Category button

**Category Form:**
- Name, Slug (auto-generated)
- Color picker (preset Tailwind colors)
- Show in menu toggle
- Order number

### Activity Log

**Route:** `/manage/news/[id]/activity`

**Features:**
- Timeline view of all changes
- Shows: User, Action, Timestamp, Changes diff
- Filters by action type

## Landing Integration

### Updated news-data.ts

```typescript
const BACKOFFICE_URL = process.env.NEXT_PUBLIC_BACKOFFICE_URL || 'http://localhost:3001';

export async function getAllNews(): Promise<NewsArticle[]> {
  const res = await fetch(`${BACKOFFICE_URL}/api/public/news`, {
    next: { revalidate: 3600 } // Cache 1 hour
  });
  if (!res.ok) return [];
  return res.json();
}

export async function getFeaturedNews(): Promise<NewsArticle[]> {
  const res = await fetch(`${BACKOFFICE_URL}/api/public/news?featured=true`, {
    next: { revalidate: 3600 }
  });
  if (!res.ok) return [];
  return res.json();
}

export async function getNewsBySlug(slug: string): Promise<NewsArticle | null> {
  const res = await fetch(`${BACKOFFICE_URL}/api/public/news/${slug}`, {
    next: { revalidate: 3600 }
  });
  if (!res.ok) return null;
  return res.json();
}

export async function getNewsCategories(): Promise<string[]> {
  const res = await fetch(`${BACKOFFICE_URL}/api/public/news/categories`, {
    next: { revalidate: 3600 }
  });
  if (!res.ok) return [];
  const categories = await res.json();
  return categories.map((c: any) => c.name);
}
```

### Revalidate Webhook Handler (Landing)

Update existing `/api/public/revalidate` route to include news paths:

```typescript
revalidatePath('/informasi-publik/berita-terkini');
revalidatePath('/api/public/news');
```

## Data Migration

### Migration Strategy

1. **Create new tables** - Run Prisma migration
2. **Seed categories** - Extract unique categories from articles.json
3. **Seed news** - Import from `data/news/articles.json`
4. **Verify** - Check data integrity
5. **Switch landing** - Update landing to use API
6. **Clean up** - Remove old JSON files (optional, keep as backup)

### Migration Script

```typescript
// scripts/migrate-news.ts
import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@workspace/db';

const prisma = new PrismaClient();

async function migrateNews() {
  // 1. Migrate categories (extract from unique categories in articles)
  const articlesData = JSON.parse(
    fs.readFileSync('data/news/articles.json', 'utf8')
  );

  const uniqueCategories = [...new Set(articlesData.map((a: any) => a.category))];

  for (const [index, name] of uniqueCategories.entries()) {
    const slug = name.toLowerCase().replace(/\s+/g, '-');
    await prisma.newsCategory.upsert({
      where: { slug },
      update: {},
      create: { name, slug, order: index, color: 'primary' }
    });
  }

  // 2. Migrate news articles
  const adminUser = await prisma.user.findFirst({ where: { role: { name: 'ADMIN' } } });
  const categories = await prisma.newsCategory.findMany();

  for (const article of articlesData) {
    const category = categories.find(c => c.name === article.category);
    await prisma.news.create({
      data: {
        slug: article.slug,
        title: article.title,
        excerpt: article.excerpt,
        categoryId: category?.id || categories[0].id,
        featured: article.featured,
        author: article.author,
        readTime: article.readTime,
        tags: article.tags,
        status: 'PUBLISHED',
        publishedAt: new Date(article.date),
        createdById: adminUser.id
      }
    });
  }
}

migrateNews();
```

## Environment Variables

**Backoffice (.env):**
```bash
# Existing
DATABASE_URL=...

# Add
REVALIDATE_SECRET=your-secret-key-here
```

**Landing (.env):**
```bash
# New
NEXT_PUBLIC_BACKOFFICE_URL=https://backoffice.naiera.go.id
REVALIDATE_SECRET=your-secret-key-here
```

## TipTap Integration

**Editor Setup:**
- Use existing TipTap extension pattern from backoffice
- Add image upload extension
- Store content as HTML/JSON in database
- Image uploads use existing File system
- XSS protection: sanitize HTML before saving

## Security Considerations

1. **Public API** - Only returns PUBLISHED news
2. **Revalidate Secret** - Shared secret between backoffice and landing
3. **RBAC** - All protected routes check permissions
4. **File Upload** - Uses existing File system with S3-compatible storage
5. **Input Validation** - Zod schemas for all inputs
6. **XSS Protection** - Sanitize HTML from TipTap before save
7. **Rate Limiting** - Apply to public API endpoints

## Performance Considerations

1. **ISR Cache** - Landing caches for 1 hour
2. **Database Indexes** - On categoryId, status, featured, order, slug, publishedAt
3. **Pagination** - News list uses pagination
4. **Selective Fetching** - Only fetch required fields for list view
5. **Image Optimization** - Use Next.js Image component

## Activity Log Actions

| Action | Description |
|--------|-------------|
| `created` | New news created |
| `updated` | News details changed |
| `published` | News status changed to PUBLISHED |
| `unpublished` | News status changed to DRAFT |
| `archived` | News status changed to ARCHIVED |
| `deleted` | News deleted |
| `reordered` | News order changed |

## Success Criteria

- [ ] All news migrated from JSON to database
- [ ] Backoffice UI can CRUD news
- [ ] RBAC permissions enforced correctly
- [ ] Landing displays news from API
- [ ] Manual sync button clears landing cache
- [ ] Activity log tracks all changes
- [ ] Draft news not visible on landing
- [ ] Featured image upload works
- [ ] TipTap editor with image upload works
- [ ] Categories are dynamic (CRUD)
