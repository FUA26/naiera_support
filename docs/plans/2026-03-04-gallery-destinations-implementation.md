# Galeri Foto & Destinasi Wisata - Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add full backoffice management for Galeri Foto and Destinasi Wisata features with database storage, RBAC permissions, API routes, and landing page integration.

**Architecture:** Backoffice manages data in PostgreSQL via Prisma with full RBAC, landing consumes via public API with ISR caching. Follows existing News/Events patterns.

**Tech Stack:** Next.js 16, Prisma, PostgreSQL, Zod, existing RBAC system, existing File upload system

---

## PHASE 1: Database Schema & Migrations

### Task 1.1: Update Prisma Schema - Add Photo Models

**Files:**
- Modify: `apps/backoffice/prisma/schema.prisma`

**Step 1: Add PhotoStatus enum**

Add after NewsStatus enum (around line 225):

```prisma
enum PhotoStatus {
  DRAFT
  PUBLISHED
  ARCHIVED
}
```

**Step 2: Add PhotoAlbum model**

Add after EventActivityLog model (around line 470):

```prisma
model PhotoAlbum {
  id          String   @id @default(cuid())
  name        String
  slug        String   @unique
  description String?
  coverImageId String? @unique
  coverImage  File?    @relation("AlbumCover", fields: [coverImageId], references: [id], onDelete: SetNull)
  order       Int      @default(0)
  photos      Photo[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([order])
}
```

**Step 3: Add PhotoTag model**

```prisma
model PhotoTag {
  id        String        @id @default(cuid())
  name      String        @unique
  slug      String        @unique
  photos    PhotoTagRelation[]
  createdAt DateTime      @default(now())
}
```

**Step 4: Add Photo model**

```prisma
model Photo {
  id          String        @id @default(cuid())
  slug        String        @unique
  title       String
  description String?

  albumId     String?
  album       PhotoAlbum?   @relation(fields: [albumId], references: [id], onDelete: SetNull)

  imageId     String
  image       File          @relation("PhotoImage", fields: [imageId], references: [id], onDelete: Restrict)

  location    String?
  photographer String?

  views       Int           @default(0)
  likes       Int           @default(0)
  isFeatured  Boolean       @default(false)
  showInMenu  Boolean       @default(true)
  order       Int           @default(0)

  status      PhotoStatus   @default(DRAFT)
  publishedAt DateTime?

  createdById String
  createdBy   User          @relation("PhotoCreator", fields: [createdById], references: [id])
  updatedById String?
  updatedBy   User?         @relation("PhotoUpdater", fields: [updatedById], references: [id])

  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt

  tags        PhotoTagRelation[]
  activityLogs PhotoActivityLog[]

  @@index([albumId])
  @@index([status])
  @@index([isFeatured])
  @@index([order])
  @@index([slug])
}
```

**Step 5: Add PhotoTagRelation model**

```prisma
model PhotoTagRelation {
  photoId String
  photo   Photo   @relation(fields: [photoId], references: [id], onDelete: Cascade)
  tagId   String
  tag     PhotoTag @relation(fields: [tagId], references: [id], onDelete: Cascade)

  @@id([photoId, tagId])
}
```

**Step 6: Add PhotoActivityLog model**

```prisma
model PhotoActivityLog {
  id        String   @id @default(cuid())
  photoId   String
  photo     Photo    @relation(fields: [photoId], references: [id], onDelete: Cascade)
  userId    String
  user      User     @relation("PhotoActivityLogs", fields: [userId], references: [id])
  action    String
  changes   Json?
  createdAt DateTime @default(now())

  @@index([photoId])
  @@index([userId])
  @@index([createdAt])
}
```

**Step 7: Update User model**

Add to User model (around line 76):

```prisma
  // Photo Management Relations
  createdPhotos      Photo[]            @relation("PhotoCreator")
  updatedPhotos      Photo[]            @relation("PhotoUpdater")
  photoActivityLogs  PhotoActivityLog[] @relation("PhotoActivityLogs")
```

**Step 8: Update File model**

Add to File model relations (around line 195):

```prisma
  albumsAsCover PhotoAlbum[] @relation("AlbumCover")
  photosAsImage Photo[] @relation("PhotoImage")
```

**Step 9: Verify and generate Prisma client**

Run: `cd apps/backoffice && pnpm prisma generate`
Expected: Prisma client generated successfully

**Step 10: Commit**

```bash
git add apps/backoffice/prisma/schema.prisma
git commit -m "feat: add Photo models to Prisma schema"
```

---

### Task 1.2: Update Prisma Schema - Add Destination Models

**Files:**
- Modify: `apps/backoffice/prisma/schema.prisma`

**Step 1: Add DestinationStatus enum**

Add after PhotoStatus enum:

```prisma
enum DestinationStatus {
  DRAFT
  PUBLISHED
  ARCHIVED
}
```

**Step 2: Add DestinationCategory model**

Add after PhotoActivityLog model:

```prisma
model DestinationCategory {
  id          String        @id @default(cuid())
  name        String
  slug        String        @unique
  description String?
  icon        String?
  order       Int           @default(0)
  destinations Destination[]
  facilities  DestinationFacility[]
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt

  @@index([order])
}
```

**Step 3: Add DestinationFacility model**

```prisma
model DestinationFacility {
  id             String                @id @default(cuid())
  name           String
  icon           String?
  order          Int                   @default(0)
  destinations   DestinationFacilityRelation[]
  category       DestinationCategory?  @relation(fields: [categoryId], references: [id])
  categoryId     String?
  createdAt      DateTime              @default(now())
  updatedAt      DateTime              @updatedAt

  @@index([categoryId])
  @@index([order])
}
```

**Step 4: Add Destination model**

```prisma
model Destination {
  id             String                    @id @default(cuid())
  slug           String                    @unique
  name           String
  description    String?

  categoryId     String
  category       DestinationCategory       @relation(fields: [categoryId], references: [id])

  locationAddress String?
  locationLat     Decimal?                 @db.Decimal(10, 8)
  locationLng     Decimal?                 @db.Decimal(11, 8)

  priceInfo      String?
  openHours      String?

  rating         Decimal?                  @db.Decimal(3, 2)
  reviewsCount   Int                       @default(0)

  isFeatured     Boolean                   @default(false)
  showInMenu     Boolean                   @default(true)
  order          Int                       @default(0)

  coverImageId   String?                   @unique
  coverImage     File?                     @relation("DestinationCover", fields: [coverImageId], references: [id], onDelete: SetNull)

  status         DestinationStatus         @default(DRAFT)
  publishedAt    DateTime?

  createdById    String
  createdBy      User                      @relation("DestinationCreator", fields: [createdById], references: [id])
  updatedById    String?
  updatedBy      User?                     @relation("DestinationUpdater", fields: [updatedById], references: [id])

  createdAt      DateTime                  @default(now())
  updatedAt      DateTime                  @updatedAt

  images         DestinationImage[]
  facilities     DestinationFacilityRelation[]
  relations      DestinationRelation[]
  activityLogs   DestinationActivityLog[]

  @@index([categoryId])
  @@index([status])
  @@index([isFeatured])
  @@index([order])
  @@index([slug])
}
```

**Step 5: Add DestinationImage model**

```prisma
model DestinationImage {
  id             String       @id @default(cuid())
  destinationId  String
  destination    Destination  @relation(fields: [destinationId], references: [id], onDelete: Cascade)
  imageId        String
  image          File         @relation("DestinationImage", fields: [imageId], references: [id], onDelete: Cascade)
  caption        String?
  order          Int          @default(0)
  createdAt      DateTime     @default(now())

  @@unique([destinationId, imageId, order])
  @@index([destinationId])
  @@index([order])
}
```

**Step 6: Add DestinationFacilityRelation model**

```prisma
model DestinationFacilityRelation {
  destinationId String
  destination   Destination @relation(fields: [destinationId], references: [id], onDelete: Cascade)
  facilityId    String
  facility      DestinationFacility @relation(fields: [facilityId], references: [id], onDelete: Cascade)

  @@id([destinationId, facilityId])
}
```

**Step 7: Add DestinationRelation model**

```prisma
model DestinationRelation {
  id             String       @id @default(cuid())
  destinationId  String
  destination    Destination  @relation(fields: [destinationId], references: [id], onDelete: Cascade)
  relatedType    String       // 'news' or 'event'
  relatedId      String
  createdAt      DateTime     @default(now())

  @@index([destinationId])
  @@index([relatedType, relatedId])
}
```

**Step 8: Add DestinationActivityLog model**

```prisma
model DestinationActivityLog {
  id            String       @id @default(cuid())
  destinationId String
  destination   Destination  @relation(fields: [destinationId], references: [id], onDelete: Cascade)
  userId        String
  user          User         @relation("DestinationActivityLogs", fields: [userId], references: [id])
  action        String
  changes       Json?
  createdAt     DateTime     @default(now())

  @@index([destinationId])
  @@index([userId])
  @@index([createdAt])
}
```

**Step 9: Update User model**

Add to User model (after Photo relations):

```prisma
  // Destination Management Relations
  createdDestinations      Destination[]            @relation("DestinationCreator")
  updatedDestinations      Destination[]            @relation("DestinationUpdater")
  destinationActivityLogs  DestinationActivityLog[] @relation("DestinationActivityLogs")
```

**Step 10: Update File model**

Add to File model relations:

```prisma
  destinationsAsCover Destination[] @relation("DestinationCover")
  destinationImages DestinationImage[] @relation("DestinationImage")
```

**Step 11: Verify and generate Prisma client**

Run: `cd apps/backoffice && pnpm prisma generate`
Expected: Prisma client generated successfully

**Step 12: Commit**

```bash
git add apps/backoffice/prisma/schema.prisma
git commit -m "feat: add Destination models to Prisma schema"
```

---

### Task 1.3: Create Database Migration

**Files:**
- Create: `apps/backoffice/prisma/migrations/20260304000001_add_gallery_destinations/migration.sql`

**Step 1: Create migration directory**

Run: `mkdir -p apps/backoffice/prisma/migrations/20260304000001_add_gallery_destinations`

**Step 2: Write migration SQL file**

Create the migration.sql file with complete SQL from design document. Reference: docs/plans/2026-03-04-gallery-destinations-design.md

**Step 3: Run migration**

Run: `cd apps/backoffice && pnpm prisma migrate deploy`
Expected: Migration applied successfully

**Step 4: Commit**

```bash
git add apps/backoffice/prisma/migrations
git commit -m "feat: add gallery and destinations database migration"
```

---

## PHASE 2: Permissions

### Task 2.1: Add Gallery Permissions

**Files:**
- Modify: `apps/backoffice/prisma/seed-permissions.ts`

**Step 1: Add gallery permissions**

Add after Event Management permissions (around line 99):

```typescript
  // Gallery Management
  { name: "GALLERY_VIEW", category: "GALLERY", description: "View photos and albums" },
  { name: "GALLERY_CREATE", category: "GALLERY", description: "Create new photos" },
  { name: "GALLERY_EDIT", category: "GALLERY", description: "Edit photos" },
  { name: "GALLERY_DELETE", category: "GALLERY", description: "Delete photos" },
  { name: "GALLERY_PUBLISH", category: "GALLERY", description: "Publish/unpublish photos" },
  { name: "GALLERY_REORDER", category: "GALLERY", description: "Reorder photos" },
  {
    name: "GALLERY_ALBUMS_MANAGE",
    category: "GALLERY",
    description: "Manage photo albums",
  },
  {
    name: "GALLERY_TAGS_MANAGE",
    category: "GALLERY",
    description: "Manage photo tags",
  },
```

**Step 2: Run permissions seed**

Run: `cd apps/backoffice && pnpm tsx prisma/seed-permissions.ts`
Expected: Permissions seeded successfully

**Step 3: Commit**

```bash
git add apps/backoffice/prisma/seed-permissions.ts
git commit -m "feat: add gallery permissions"
```

---

### Task 2.2: Add Destination Permissions

**Files:**
- Modify: `apps/backoffice/prisma/seed-permissions.ts`

**Step 1: Add destination permissions**

Add after Gallery permissions:

```typescript
  // Destination Management
  { name: "DESTINATIONS_VIEW", category: "DESTINATIONS", description: "View destinations" },
  { name: "DESTINATIONS_CREATE", category: "DESTINATIONS", description: "Create new destinations" },
  { name: "DESTINATIONS_EDIT", category: "DESTINATIONS", description: "Edit destinations" },
  { name: "DESTINATIONS_DELETE", category: "DESTINATIONS", description: "Delete destinations" },
  { name: "DESTINATIONS_PUBLISH", category: "DESTINATIONS", description: "Publish/unpublish destinations" },
  { name: "DESTINATIONS_REORDER", category: "DESTINATIONS", description: "Reorder destinations" },
  {
    name: "DESTINATION_CATEGORIES_MANAGE",
    category: "DESTINATIONS",
    description: "Manage destination categories",
  },
  {
    name: "DESTINATION_FACILITIES_MANAGE",
    category: "DESTINATIONS",
    description: "Manage facilities",
  },
```

**Step 2: Run permissions seed**

Run: `cd apps/backoffice && pnpm tsx prisma/seed-permissions.ts`
Expected: Permissions seeded successfully

**Step 3: Commit**

```bash
git add apps/backoffice/prisma/seed-permissions.ts
git commit -m "feat: add destination permissions"
```

---

## PHASE 3: Gallery API Routes

### Task 3.1: Create Gallery Validation Schemas

**Files:**
- Create: `apps/backoffice/lib/validations/gallery.ts`

**Step 1: Create gallery validation file**

Complete content following apps/backoffice/lib/validations/news.ts pattern:

```typescript
import { z } from 'zod';

// Album Schemas
export const albumSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
  description: z.string().optional(),
  coverImageId: z.preprocess(
    (val) => val === '' || val === null ? undefined : val,
    z.string().cuid().optional()
  ),
  order: z.number().int().min(0).default(0),
});

export const albumUpdateSchema = albumSchema.partial().extend({
  id: z.string().cuid(),
});

// Tag Schemas
export const tagSchema = z.object({
  name: z.string().min(1, 'Name is required').max(50),
  slug: z.string().min(1).max(50).regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
});

export const tagUpdateSchema = tagSchema.partial().extend({
  id: z.string().cuid(),
});

// Photo Schemas
export const photoSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  slug: z.string().min(1).max(200).regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
  description: z.string().optional(),
  albumId: z.preprocess(
    (val) => val === '' || val === null ? undefined : val,
    z.string().cuid().optional()
  ),
  imageId: z.string().cuid(),
  location: z.string().max(200).optional(),
  photographer: z.string().max(100).optional(),
  isFeatured: z.boolean().default(false),
  showInMenu: z.boolean().default(true),
  order: z.number().int().min(0).default(0),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).default('DRAFT'),
  publishedAt: z.coerce.date().optional(),
  tags: z.array(z.string()).optional(),
});

export const photoUpdateSchema = photoSchema.partial().extend({
  id: z.string().cuid(),
});

export const photoPublishSchema = z.object({
  id: z.string().cuid(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']),
});

export const photoReorderSchema = z.object({
  items: z.array(z.object({
    id: z.string().cuid(),
    order: z.number().int().min(0),
  })),
});

export const albumReorderSchema = z.object({
  items: z.array(z.object({
    id: z.string().cuid(),
    order: z.number().int().min(0),
  })),
});

// Query schemas
export const photoQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  albumId: z.string().optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).optional(),
  isFeatured: z.coerce.boolean().optional(),
  search: z.string().optional(),
  tags: z.string().optional(),
});

export const albumQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
});
```

**Step 2: Commit**

```bash
git add apps/backoffice/lib/validations/gallery.ts
git commit -m "feat: add gallery validation schemas"
```

---

### Task 3.2: Create Gallery Service

**Files:**
- Create: `apps/backoffice/lib/services/gallery-service.ts`

**Step 1: Create gallery service file**

Complete content following apps/backoffice/lib/services/news-service.ts pattern with functions:
- `getPhotosList(options)` - Paginated list with filters
- `getPhotoById(id)` - Single photo with relations
- `getPhotoBySlug(slug)` - For public API
- `createPhoto(data, userId)` - Create with activity log
- `updatePhoto(id, data, userId)` - Update with activity log
- `deletePhoto(id)` - Soft delete
- `publishPhoto(id, status, userId)` - Update status with revalidation
- `reorderPhotos(items)` - Bulk order update
- `incrementViews(id)` - For public API
- `logPhotoActivity(photoId, userId, action, changes?)` - Activity logging

And for albums:
- `getAlbumsList(options)`
- `getAlbumById(id)`
- `getAlbumBySlug(slug)`
- `createAlbum(data)`
- `updateAlbum(id, data)`
- `deleteAlbum(id)`
- `reorderAlbums(items)`

And for tags:
- `getAllTags()`
- `getTagById(id)`
- `createTag(data)`
- `deleteTag(id)`

**Step 2: Commit**

```bash
git add apps/backoffice/lib/services/gallery-service.ts
git commit -m "feat: add gallery service layer"
```

---

### Task 3.3: Create Photos API Routes

**Files:**
- Create: `apps/backoffice/app/api/photos/route.ts`
- Create: `apps/backoffice/app/api/photos/[id]/route.ts`
- Create: `apps/backoffice/app/api/photos/[id]/publish/route.ts`
- Create: `apps/backoffice/app/api/photos/[id]/logs/route.ts`
- Create: `apps/backoffice/app/api/photos/reorder/route.ts`

**Step 1: Create main photos route**

`apps/backoffice/app/api/photos/route.ts` following apps/backoffice/app/api/news/route.ts pattern:
- GET: List photos with pagination and filters, requires GALLERY_VIEW
- POST: Create photo, requires GALLERY_CREATE, triggers revalidation if published

**Step 2: Create photo by ID route**

`apps/backoffice/app/api/photos/[id]/route.ts`:
- GET: Get single photo, requires GALLERY_VIEW
- PUT: Update photo, requires GALLERY_EDIT
- DELETE: Delete photo, requires GALLERY_DELETE

**Step 3: Create publish route**

`apps/backoffice/app/api/photos/[id]/publish/route.ts` following apps/backoffice/app/api/news/[id]/publish/route.ts:
- POST: Publish/unpublish, requires GALLERY_PUBLISH, triggers revalidation

**Step 4: Create logs route**

`apps/backoffice/app/api/photos/[id]/logs/route.ts` following apps/backoffice/app/api/events/[id]/logs/route.ts:
- GET: Get activity logs, requires GALLERY_VIEW

**Step 5: Create reorder route**

`apps/backoffice/app/api/photos/reorder/route.ts` following apps/backoffice/app/api/news/reorder/route.ts:
- POST: Bulk reorder, requires GALLERY_REORDER

**Step 6: Commit**

```bash
git add apps/backoffice/app/api/photos
git commit -m "feat: add photos API routes"
```

---

### Task 3.4: Create Albums API Routes

**Files:**
- Create: `apps/backoffice/app/api/albums/route.ts`
- Create: `apps/backoffice/app/api/albums/[id]/route.ts`
- Create: `apps/backoffice/app/api/albums/reorder/route.ts`

**Step 1: Create main albums route**

`apps/backoffice/app/api/albums/route.ts`:
- GET: List albums, requires GALLERY_VIEW
- POST: Create album, requires GALLERY_ALBUMS_MANAGE

**Step 2: Create album by ID route**

`apps/backoffice/app/api/albums/[id]/route.ts`:
- GET: Get single album with photos, requires GALLERY_VIEW
- PUT: Update album, requires GALLERY_ALBUMS_MANAGE
- DELETE: Delete album, requires GALLERY_ALBUMS_MANAGE

**Step 3: Create reorder route**

`apps/backoffice/app/api/albums/reorder/route.ts`:
- POST: Bulk reorder albums, requires GALLERY_ALBUMS_MANAGE

**Step 4: Commit**

```bash
git add apps/backoffice/app/api/albums
git commit -m "feat: add albums API routes"
```

---

### Task 3.5: Create Tags API Routes

**Files:**
- Create: `apps/backoffice/app/api/tags/route.ts`
- Create: `apps/backoffice/app/api/tags/[id]/route.ts`

**Step 1: Create main tags route**

`apps/backoffice/app/api/tags/route.ts`:
- GET: List all tags, requires GALLERY_VIEW
- POST: Create tag, requires GALLERY_TAGS_MANAGE

**Step 2: Create tag by ID route**

`apps/backoffice/app/api/tags/[id]/route.ts`:
- DELETE: Delete tag, requires GALLERY_TAGS_MANAGE

**Step 3: Commit**

```bash
git add apps/backoffice/app/api/tags
git commit -m "feat: add tags API routes"
```

---

### Task 3.6: Create Public Gallery API Routes

**Files:**
- Create: `apps/backoffice/app/api/public/photos/route.ts`
- Create: `apps/backoffice/app/api/public/photos/[slug]/route.ts`
- Create: `apps/backoffice/app/api/public/albums/route.ts`
- Create: `apps/backoffice/app/api/public/albums/[slug]/route.ts`

**Step 1: Create public photos list route**

`apps/backoffice/app/api/public/photos/route.ts` following apps/backoffice/app/api/public/news/route.ts pattern:
- GET: Public list of published photos only, no auth required, ISR cache headers

**Step 2: Create public photo detail route**

`apps/backoffice/app/api/public/photos/[slug]/route.ts`:
- GET: Public photo detail by slug, increments views, no auth required

**Step 3: Create public albums list route**

`apps/backoffice/app/api/public/albums/route.ts`:
- GET: Public list of published albums, no auth required

**Step 4: Create public album detail route**

`apps/backoffice/app/api/public/albums/[slug]/route.ts`:
- GET: Public album detail with photos, no auth required

**Step 5: Commit**

```bash
git add apps/backoffice/app/api/public
git commit -m "feat: add public gallery API routes"
```

---

## PHASE 4: Destinations API Routes

### Task 4.1: Create Destination Validation Schemas

**Files:**
- Create: `apps/backoffice/lib/validations/destination.ts`

**Step 1: Create destination validation file**

Following gallery validation pattern with schemas for:
- `destinationCategorySchema`
- `destinationFacilitySchema`
- `destinationSchema` (with location coordinates, facilities array, related content)
- `destinationUpdateSchema`
- `destinationPublishSchema`
- `destinationReorderSchema`
- `destinationQuerySchema`
- `destinationImageSchema` (for adding images to gallery)

**Step 2: Commit**

```bash
git add apps/backoffice/lib/validations/destination.ts
git commit -m "feat: add destination validation schemas"
```

---

### Task 4.2: Create Destination Service

**Files:**
- Create: `apps/backoffice/lib/services/destination-service.ts`

**Step 1: Create destination service file**

Following gallery service pattern with functions for:
- Destinations: `getDestinationsList`, `getDestinationById`, `getDestinationBySlug`, `createDestination`, `updateDestination`, `deleteDestination`, `publishDestination`, `reorderDestinations`, `getFeaturedDestinations`
- Categories: `getDestinationCategories`, `createDestinationCategory`, `updateDestinationCategory`, `deleteDestinationCategory`
- Facilities: `getAllFacilities`, `createFacility`, `updateFacility`, `deleteFacility`
- Images: `getDestinationImages`, `addDestinationImage`, `removeDestinationImage`, `reorderDestinationImages`
- Related: `addRelatedContent`, `removeRelatedContent`
- Activity logging

**Step 2: Commit**

```bash
git add apps/backoffice/lib/services/destination-service.ts
git commit -m "feat: add destination service layer"
```

---

### Task 4.3: Create Destinations API Routes

**Files:**
- Create: `apps/backoffice/app/api/destinations/route.ts`
- Create: `apps/backoffice/app/api/destinations/[id]/route.ts`
- Create: `apps/backoffice/app/api/destinations/[id]/publish/route.ts`
- Create: `apps/backoffice/app/api/destinations/[id]/logs/route.ts`
- Create: `apps/backoffice/app/api/destinations/[id]/images/route.ts`
- Create: `apps/backoffice/app/api/destinations/[id]/images/[imageId]/route.ts`
- Create: `apps/backoffice/app/api/destinations/reorder/route.ts`

**Step 1: Create main destinations route**

Following photos API pattern with DESTINATIONS_* permissions

**Step 2: Create destination by ID route**

Following photos by ID pattern

**Step 3: Create publish route**

Following photos publish pattern

**Step 4: Create logs route**

Following events logs pattern

**Step 5: Create images routes**

For managing destination image gallery

**Step 6: Create reorder route**

Following photos reorder pattern

**Step 7: Commit**

```bash
git add apps/backoffice/app/api/destinations
git commit -m "feat: add destinations API routes"
```

---

### Task 4.4: Create Destination Categories API Routes

**Files:**
- Create: `apps/backoffice/app/api/destination-categories/route.ts`
- Create: `apps/backoffice/app/api/destination-categories/[id]/route.ts`

**Step 1: Create categories routes**

Following albums API pattern with DESTINATION_CATEGORIES_MANAGE permission

**Step 2: Commit**

```bash
git add apps/backoffice/app/api/destination-categories
git commit -m "feat: add destination categories API routes"
```

---

### Task 4.5: Create Facilities API Routes

**Files:**
- Create: `apps/backoffice/app/api/facilities/route.ts`
- Create: `apps/backoffice/app/api/facilities/[id]/route.ts`

**Step 1: Create facilities routes**

Following tags API pattern with DESTINATION_FACILITIES_MANAGE permission

**Step 2: Commit**

```bash
git add apps/backoffice/app/api/facilities
git commit -m "feat: add facilities API routes"
```

---

### Task 4.6: Create Public Destinations API Routes

**Files:**
- Create: `apps/backoffice/app/api/public/destinations/route.ts`
- Create: `apps/backoffice/app/api/public/destinations/[slug]/route.ts`
- Create: `apps/backoffice/app/api/public/destinations/categories/route.ts`
- Create: `apps/backoffice/app/api/public/destinations/featured/route.ts`

**Step 1: Create public destinations routes**

Following public photos API pattern

**Step 2: Commit**

```bash
git add apps/backoffice/app/api/public/destinations
git commit -m "feat: add public destinations API routes"
```

---

## PHASE 5: Backoffice UI - Photos Management

### Task 5.1: Create Photos Data Table Component

**Files:**
- Create: `apps/backoffice/components/admin/photos-data-table.tsx`
- Create: `apps/backoffice/components/admin/photo-dialog.tsx`
- Create: `apps/backoffice/components/admin/photos-table-actions.tsx`

**Step 1: Create photos table component**

Following `apps/backoffice/components/admin/news-data-table.tsx` pattern with columns: thumbnail, title, album, status, views, likes, date, actions

**Step 2: Create photo dialog component**

Tabbed interface for creating/editing photos with: Basic info, Image upload, Album selection, Tags

**Step 3: Create table actions component**

Action buttons for edit, delete, publish, view logs

**Step 4: Commit**

```bash
git add apps/backoffice/components/admin/photos-*.tsx
git add apps/backoffice/components/admin/photo-dialog.tsx
git commit -m "feat: add photos management components"
```

---

### Task 5.2: Create Photos Page

**Files:**
- Create: `apps/backoffice/app/(dashboard)/manage/photos/page.tsx`
- Create: `apps/backoffice/app/(dashboard)/manage/photos/photos-client.tsx`

**Step 1: Create photos page**

Server component that fetches initial data

**Step 2: Create photos client component**

Client component with table, filters, search, bulk actions

**Step 3: Update sidebar navigation**

Add "Galeri Foto" menu item with Photos submenu

**Step 4: Commit**

```bash
git add apps/backoffice/app/(dashboard)/manage/photos
git add apps/backoffice/components/dashboard/sidebar.tsx
git commit -m "feat: add photos management page"
```

---

### Task 5.3: Create Albums Management

**Files:**
- Create: `apps/backoffice/app/(dashboard)/manage/albums/page.tsx`
- Create: `apps/backoffice/app/(dashboard)/manage/albums/albums-client.tsx`
- Create: `apps/backoffice/components/admin/album-dialog.tsx`

**Step 1: Create albums page and client**

Following categories pattern

**Step 2: Create album dialog**

For create/edit albums

**Step 3: Update sidebar**

Add Albums submenu under Galeri Foto

**Step 4: Commit**

```bash
git add apps/backoffice/app/(dashboard)/manage/albums
git add apps/backoffice/components/admin/album-dialog.tsx
git add apps/backoffice/components/dashboard/sidebar.tsx
git commit -m "feat: add albums management page"
```

---

## PHASE 6: Backoffice UI - Destinations Management

### Task 6.1: Create Destinations Data Table Component

**Files:**
- Create: `apps/backoffice/components/admin/destinations-data-table.tsx`
- Create: `apps/backoffice/components/admin/destination-dialog.tsx`
- Create: `apps/backoffice/components/admin/destinations-table-actions.tsx`

**Step 1: Create destinations table component**

Following photos table pattern with columns: thumbnail, name, category, location, rating, status, featured badge, actions

**Step 2: Create destination dialog component**

Comprehensive tabbed interface: Basic, Location (with map), Info, Facilities, Gallery, Related

**Step 3: Create table actions component**

Actions for edit, delete, publish, toggle featured, view logs

**Step 4: Commit**

```bash
git add apps/backoffice/components/admin/destinations-*.tsx
git add apps/backoffice/components/admin/destination-dialog.tsx
git commit -m "feat: add destinations management components"
```

---

### Task 6.2: Create Destinations Page

**Files:**
- Create: `apps/backoffice/app/(dashboard)/manage/destinations/page.tsx`
- Create: `apps/backoffice/app/(dashboard)/manage/destinations/destinations-client.tsx`

**Step 1: Create destinations page and client**

Following photos page pattern with filters for category, status, featured

**Step 2: Update sidebar**

Add "Destinasi Wisata" menu item

**Step 3: Commit**

```bash
git add apps/backoffice/app/(dashboard)/manage/destinations
git add apps/backoffice/components/dashboard/sidebar.tsx
git commit -m "feat: add destinations management page"
```

---

### Task 6.3: Create Destination Categories Page

**Files:**
- Create: `apps/backoffice/app/(dashboard)/manage/destination-categories/page.tsx`
- Create: `apps/backoffice/app/(dashboard)/manage/destination-categories/categories-client.tsx`
- Create: `apps/backoffice/components/admin/destination-category-dialog.tsx`

**Step 1: Create categories page**

Following albums pattern with icon picker

**Step 2: Create category dialog**

With icon selection from Lucide icons

**Step 3: Update sidebar**

Add submenu under Destinasi Wisata

**Step 4: Commit**

```bash
git add apps/backoffice/app/(dashboard)/manage/destination-categories
git add apps/backoffice/components/admin/destination-category-dialog.tsx
git add apps/backoffice/components/dashboard/sidebar.tsx
git commit -m "feat: add destination categories management page"
```

---

## PHASE 7: Landing Page Integration

### Task 7.1: Create Gallery Data Fetching

**Files:**
- Create: `apps/landing/lib/gallery-data.ts`
- Modify: `apps/landing/app/informasi-publik/galeri-foto/page.tsx`
- Modify: `apps/landing/app/informasi-publik/galeri-foto/galeri-foto-client.tsx`

**Step 1: Create gallery data file**

Following `apps/landing/lib/news-data.ts` pattern:
- `getPublishedPhotos(options)`
- `getPhotoBySlug(slug)`
- `getPublishedAlbums()`
- `getAlbumBySlug(slug)`

**Step 2: Update galeri-foto page**

Convert to server component that fetches data from API

**Step 3: Update galeri-foto client**

Keep existing UI, just replace hardcoded data with props

**Step 4: Commit**

```bash
git add apps/landing/lib/gallery-data.ts
git add apps/landing/app/informasi-publik/galeri-foto
git commit -m "feat: integrate gallery API in landing page"
```

---

### Task 7.2: Create Destinations Data Fetching

**Files:**
- Create: `apps/landing/lib/destinations-data.ts`
- Modify: `apps/landing/app/informasi-publik/destinasi-wisata/page.tsx`
- Modify: `apps/landing/app/informasi-publik/destinasi-wisata/destinasi-client.tsx`
- Create: `apps/landing/app/informasi-publik/destinasi-wisata/[slug]/page.tsx`
- Create: `apps/landing/app/informasi-publik/destinasi-wisata/[slug]/destinasi-detail-client.tsx`

**Step 1: Create destinations data file**

Following gallery data pattern:
- `getPublishedDestinations(options)`
- `getDestinationBySlug(slug)`
- `getDestinationCategories()`
- `getFeaturedDestinations()`

**Step 2: Update destinations page**

Convert to server component

**Step 3: Create destination detail page**

New dynamic route for individual destinations

**Step 4: Commit**

```bash
git add apps/landing/lib/destinations-data.ts
git add apps/landing/app/informasi-publik/destinasi-wisata
git commit -m "feat: integrate destinations API in landing page"
```

---

### Task 7.3: Update Revalidation

**Files:**
- Modify: `apps/landing/app/api/revalidate/route.ts`
- Modify: `apps/backoffice/lib/services/gallery-service.ts`
- Modify: `apps/backoffice/lib/services/destination-service.ts`

**Step 1: Update landing revalidation endpoint**

Add 'gallery' and 'destinations' to revalidation tags

**Step 2: Update backoffice services**

Trigger revalidation on publish for both features

**Step 3: Commit**

```bash
git add apps/landing/app/api/revalidate/route.ts
git add apps/backoffice/lib/services/gallery-service.ts
git add apps/backoffice/lib/services/destination-service.ts
git commit -m "feat: add revalidation for gallery and destinations"
```

---

## PHASE 8: Testing & Finalization

### Task 8.1: Manual Testing

**Step 1: Test Gallery**
- Create album
- Upload photo
- Add tags
- Publish photo
- Verify on landing page
- Test filters and search

**Step 2: Test Destinations**
- Create category
- Create facility
- Create destination with all fields
- Add gallery images
- Link to news/event
- Publish and verify on landing page

**Step 3: Test Permissions**
- Test each role's access

**Step 4: Fix any bugs found**

---

### Task 8.2: Final Commit

**Step 1: Review all changes**

Run: `git status`

**Step 2: Create summary commit if needed**

```bash
git add .
git commit -m "feat: complete gallery and destinations integration"
```

---

## Implementation Order Summary

1. **Database** (Tasks 1.1-1.3): Schema → Migration
2. **Permissions** (Tasks 2.1-2.2): Gallery → Destinations
3. **Gallery API** (Tasks 3.1-3.6): Validation → Service → Routes → Public
4. **Destinations API** (Tasks 4.1-4.6): Validation → Service → Routes → Public
5. **Backoffice Gallery** (Tasks 5.1-5.3): Table → Page → Albums
6. **Backoffice Destinations** (Tasks 6.1-6.3): Table → Page → Categories
7. **Landing Integration** (Tasks 7.1-7.3): Gallery → Destinations → Revalidation
8. **Testing** (Tasks 8.1-8.2): Manual tests → Final fixes

---

## References

- Design doc: `docs/plans/2026-03-04-gallery-destinations-design.md`
- News implementation: `docs/plans/2026-03-02-news-management-implementation.md`
- Event implementation: `docs/plans/2026-03-02-event-management-implementation.md`
