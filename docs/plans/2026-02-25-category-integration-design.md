# Category Integration Design

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:writing-plans to create implementation plan after this design.

**Goal:** Integrate service categories with URL query parameters for better navigation and SEO

**Architecture:** Server-side query param reading + client-side URL sync using Next.js App Router patterns

**Tech Stack:** Next.js 16, React hooks, TypeScript

---

## Requirements

Group services by category (population, health, education, economy, etc.) with URL-based filtering:
- URL sync dengan filter - saat tombol kategori diklik, URL berubah
- Handle query param - buka `/layanan?kategori=xxx` langsung filter
- Breadcrumb kategori - tampilkan kategori yang dipilih

---

## URL Structure

```
/layanan                                    → Semua layanan
/layanan?kategori=kependudukan              → Filter kategori
/layanan?search=ktp                         → Search saja
/layanan?kategori=kependudukan&search=ktp   → Kombinasi
```

---

## Files to Modify

### 1. `apps/landing/app/layanan/page.tsx` (Server Component)

Read query param and pass initial state to client:

```typescript
export default async function LayananPage({
  searchParams,
}: {
  searchParams: Promise<{ kategori?: string }>;
}) {
  const { kategori } = await searchParams;

  const categories = await getServiceCategories();
  const allServices = await getAllServices();

  // Validate category slug
  const initialCategory = categories.find(c => c.slug === kategori)?.slug || null;

  return (
    <LayananPageClient
      categories={categories}
      services={allServices}
      initialCategory={initialCategory}
    />
  );
}
```

### 2. `apps/landing/app/layanan/layanan-page-client.tsx` (Client Component)

- Add `useSearchParams` and `usePathname` from `next/navigation`
- Initialize `selectedCategory` from `initialCategory` prop
- Update URL when filter changes
- Update breadcrumb to show selected category

Key changes:
```typescript
import { useSearchParams, usePathname, useRouter } from 'next/navigation';

// Update URL when category changes
const updateCategory = (slug: string | null) => {
  const params = new URLSearchParams(searchParams.toString());
  if (slug) {
    params.set('kategori', slug);
  } else {
    params.delete('kategori');
  }
  router.replace(`${pathname}?${params.toString()}`, { scroll: false });
};
```

### 3. `apps/landing/lib/services-data.ts`

No changes needed - `getCategoryBySlug()` already exists.

---

## UI Changes

### Breadcrumb
- Default: `Beranda / Layanan`
- With category: `Beranda / Layanan / Kependudukan`

### Category Filter Buttons
- Click updates URL query param
- Active state based on selected category

### Search
- Adds `?search=` query param
- Works in combination with category filter

---

## Error Handling

| Case | Behavior |
|------|----------|
| Invalid category slug | Fallback to all services, clear query param |
| Empty results | Show "No services in this category" message |
| API error | Show error state, render page anyway |

---

## Testing Checklist

- [ ] Open `/layanan?kategori=kependudukan` → filtered results
- [ ] Open `/layanan?kategori=invalid` → fallback to all
- [ ] Click category button → URL changes
- [ ] Search + category combination → both filters active
- [ ] Breadcrumb shows category name when selected
- [ ] Back button works correctly
