# Galeri Foto & Destinasi Wisata Management Design

**Date:** 2026-03-04
**Status:** Approved
**Approach:** Separate Modules following existing News/Events patterns

## Overview

Design for integrating Galeri Foto and Destinasi Wisata features from the landing page into the backoffice for full content management.

## Requirements

### Galeri Foto
- Photo management with title, description, category (album)
- Multiple images per gallery item
- Albums for organizing photos
- Views and likes tracking
- Tags for photos
- Image upload via existing file system
- Draft/published workflow

### Destinasi Wisata
- Destination management with full details
- Image gallery per destination
- Map coordinates (lat/lng)
- Related content (link to news/events)
- Categories with icons
- Facilities/amenities
- Featured destinations
- Rating and reviews display
- Draft/published workflow

---

## Database Design

### Galeri Foto Tables

```sql
-- Photo albums (categories/collections)
CREATE TABLE photo_albums (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  cover_image_id UUID REFERENCES files(id),
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by UUID REFERENCES users(id)
);

-- Photos with album, tags, and view tracking
CREATE TABLE photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  album_id UUID REFERENCES photo_albums(id) ON DELETE SET NULL,
  image_id UUID NOT NULL REFERENCES files(id),
  location VARCHAR(255),
  photographer VARCHAR(255),
  views INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  status VARCHAR(20) DEFAULT 'draft', -- draft, published, archived
  published_at TIMESTAMP,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by UUID REFERENCES users(id)
);

-- Photo tags (many-to-many)
CREATE TABLE photo_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) UNIQUE NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL
);

CREATE TABLE photo_tag_relations (
  photo_id UUID REFERENCES photos(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES photo_tags(id) ON DELETE CASCADE,
  PRIMARY KEY (photo_id, tag_id)
);
```

### Destinasi Wisata Tables

```sql
-- Destination categories
CREATE TABLE destination_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  icon VARCHAR(50),
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Destinations
CREATE TABLE destinations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  category_id UUID REFERENCES destination_categories(id),

  -- Location
  location_address VARCHAR(255),
  location_lat DECIMAL(10, 8),
  location_lng DECIMAL(11, 8),

  -- Pricing & hours
  price_info VARCHAR(255),
  open_hours VARCHAR(100),

  -- Reviews
  rating DECIMAL(3, 2) DEFAULT 0,
  reviews_count INTEGER DEFAULT 0,

  -- Featured
  is_featured BOOLEAN DEFAULT false,
  cover_image_id UUID REFERENCES files(id),

  status VARCHAR(20) DEFAULT 'draft',
  published_at TIMESTAMP,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by UUID REFERENCES users(id)
);

-- Destination facilities (amenities)
CREATE TABLE destination_facilities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  icon VARCHAR(50)
);

CREATE TABLE destination_facility_relations (
  destination_id UUID REFERENCES destinations(id) ON DELETE CASCADE,
  facility_id UUID REFERENCES destination_facilities(id) ON DELETE CASCADE,
  PRIMARY KEY (destination_id, facility_id)
);

-- Destination images gallery
CREATE TABLE destination_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  destination_id UUID REFERENCES destinations(id) ON DELETE CASCADE,
  image_id UUID NOT NULL REFERENCES files(id),
  caption TEXT,
  order_index INTEGER DEFAULT 0
);

-- Related content (link to news/events)
CREATE TABLE destination_relations (
  destination_id UUID REFERENCES destinations(id) ON DELETE CASCADE,
  related_type VARCHAR(20), -- 'news' or 'event'
  related_id UUID,
  PRIMARY KEY (destination_id, related_type, related_id)
);
```

---

## API Design

### Galeri Foto API Routes

**Admin Routes:**
```
GET    /api/photos                    - List all photos with filters
POST   /api/photos                    - Create new photo
GET    /api/photos/:id                - Get photo by ID
PUT    /api/photos/:id                - Update photo
DELETE /api/photos/:id                - Delete photo
POST   /api/photos/:id/publish        - Publish/unpublish photo
GET    /api/photos/:id/logs           - Get photo activity logs
POST   /api/photos/reorder            - Reorder photos

GET    /api/albums                    - List albums
POST   /api/albums                    - Create album
PUT    /api/albums/:id                - Update album
DELETE /api/albums/:id                - Delete album

GET    /api/tags                      - List all tags
POST   /api/tags                      - Create tag
DELETE /api/tags/:id                  - Delete tag
```

**Public Routes:**
```
GET    /api/public/photos             - Published photos with pagination
GET    /api/public/photos/:slug       - Photo detail by slug
GET    /api/public/albums             - Published albums
GET    /api/public/albums/:slug       - Album detail with photos
```

### Destinasi Wisata API Routes

**Admin Routes:**
```
GET    /api/destinations              - List all destinations
POST   /api/destinations              - Create destination
GET    /api/destinations/:id          - Get destination by ID
PUT    /api/destinations/:id          - Update destination
DELETE /api/destinations/:id          - Delete destination
POST   /api/destinations/:id/publish  - Publish/unpublish
GET    /api/destinations/:id/logs     - Activity logs
POST   /api/destinations/reorder      - Reorder destinations

GET    /api/destination-categories    - List categories
POST   /api/destination-categories    - Create category
PUT    /api/destination-categories/:id - Update category
DELETE /api/destination-categories/:id - Delete category

GET    /api/destinations/:id/images   - Get destination images
POST   /api/destinations/:id/images   - Add image to gallery
DELETE /api/destinations/:id/images/:imageId - Remove image

GET    /api/facilities                - List facilities
POST   /api/facilities                - Create facility
```

**Public Routes:**
```
GET    /api/public/destinations       - Published destinations
GET    /api/public/destinations/:slug - Destination detail by slug
GET    /api/public/destinations/categories - Categories list
GET    /api/public/destinations/featured - Featured destinations
```

---

## Backoffice UI Design

### Navigation Menu Updates

```
📁 Informasi Publik
  ├── 📰 Berita (existing)
  ├── 📅 Agenda (existing)
  ├── 🖼️ Galeri Foto (new)
  └── 🗺️ Destinasi Wisata (new)
```

### Pages Structure

**Galeri Foto:**
- `/manage/photos` - Photos list with filters, search, bulk actions
- `/manage/albums` - Albums/categories management

**Destinasi Wisata:**
- `/manage/destinations` - Destinations list with filters
- `/manage/destination-categories` - Categories management

### Dialog Components

- `PhotoDialog` - Photo create/edit with image, album, tags, location
- `AlbumDialog` - Album create/edit
- `TagSelector` - Multi-select with tag creation
- `DestinationDialog` - Tabbed form for destinations
- `FacilityDialog` - Facility create/edit with icon picker

---

## Permissions Design

### New Permissions

**Galeri Foto:**
- `view_photos` - View photos and albums
- `manage_photos` - Create, edit, delete photos
- `publish_photos` - Publish and unpublish photos
- `manage_albums` - Manage photo albums
- `manage_tags` - Manage photo tags

**Destinasi Wisata:**
- `view_destinations` - View destinations
- `manage_destinations` - Create, edit, delete destinations
- `publish_destinations` - Publish and unpublish destinations
- `manage_destination_categories` - Manage destination categories
- `manage_facilities` - Manage facilities

### Default Role Assignments

| Role | Galeri Foto | Destinasi Wisata |
|------|-------------|------------------|
| Admin | All | All |
| Editor | view, manage_photos, manage_albums | view, manage_destinations |
| Author | view, manage_photos | view, manage_destinations |
| Viewer | view_photos | view_destinations |

---

## Landing Page Integration

### Data Fetching Pattern

Create shared data functions:
```typescript
// apps/landing/lib/gallery-data.ts
export async function getPublishedPhotos(options?: {
  category?: string
  limit?: number
})

// apps/landing/lib/destinations-data.ts
export async function getPublishedDestinations(options?: {
  category?: string
  featured?: boolean
})
```

### Revalidation

Add to existing revalidation endpoint:
```typescript
await revalidatePath('/informasi-publik/galeri-foto')
await revalidatePath('/informasi-publik/destinasi-wisata')
```

---

## Testing Strategy

1. **Database** - Verify schema, constraints, cascade deletes
2. **API** - Test all CRUD operations, permissions, revalidation
3. **UI** - Test backoffice forms, dialogs, tables
4. **Integration** - Verify landing page displays data correctly
5. **Permissions** - Test access per role

---

## Implementation Order

1. Database migrations
2. Permission seeds
3. API routes (photos, albums, tags)
4. API routes (destinations, categories, facilities)
5. Backoffice UI components
6. Backoffice pages
7. Landing page data fetching
8. Revalidation updates
9. Testing and bug fixes
