# Category Integration Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Integrate service categories with URL query parameters for better navigation and SEO

**Architecture:** Server-side query param reading + client-side URL sync using Next.js App Router patterns

**Tech Stack:** Next.js 16 App Router, React hooks (useSearchParams, usePathname, useRouter), TypeScript

---

## Task 1: Update Server Component to Read Query Param

**Files:**
- Modify: `apps/landing/app/layanan/page.tsx`

**Step 1: Modify page.tsx to accept searchParams**

```typescript
import { LayananPageClient } from "./layanan-page-client";
import { getServiceCategories, getAllServices } from "@/lib/services-data";

export default async function LayananPage({
  searchParams,
}: {
  searchParams: Promise<{ kategori?: string }>;
}) {
  const { kategori } = await searchParams;

  // Fetch data from directories
  const categories = await getServiceCategories();
  const allServices = await getAllServices();

  // Validate category slug - only use if valid
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

**Step 2: Verify TypeScript compiles**

Run: `cd apps/landing && npx tsc --noEmit`
Expected: No errors

**Step 3: Test manually**

Run: `pnpm dev` and visit `http://localhost:3002/layanan?kategori=kependudukan`
Expected: Page loads without errors, category param passed to client

**Step 4: Commit**

```bash
git add apps/landing/app/layanan/page.tsx
git commit -m "feat(layanan): pass initial category from searchParams to client"
```

---

## Task 2: Update Client Component Props and State

**Files:**
- Modify: `apps/landing/app/layanan/layanan-page-client.tsx`

**Step 1: Add initialCategory prop to interface**

Find the `LayananPageClientProps` interface (around line 68) and add `initialCategory`:

```typescript
interface LayananPageClientProps {
  categories: Array<{
    id: string;
    name: string;
    icon: string;
    color: string;
    bgColor: string;
    slug: string;
  }>;
  services: Array<{
    slug: string;
    icon: string;
    name: string;
    description: string;
    categoryId: string;
    badge?: string;
    stats?: string;
    isIntegrated?: boolean;
    category: {
      id: string;
      name: string;
      icon: string;
      color: string;
      bgColor: string;
      slug: string;
    };
  }>;
  initialCategory?: string | null;
}
```

**Step 2: Update component to receive initialCategory**

Find the component function signature (around line 97) and add the prop:

```typescript
export function LayananPageClient({
  categories: rawCategories,
  services: rawServices,
  initialCategory,
}: LayananPageClientProps) {
```

**Step 3: Initialize selectedCategory from initialCategory**

Find the `useState` declarations (around line 101-103) and modify:

```typescript
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(initialCategory || null);
  const [integrationFilter, setIntegrationFilter] = useState<'all' | 'integrated' | 'non-integrated'>('all');
```

**Step 4: Add useEffect to sync initialCategory changes**

Add after the state declarations (around line 104):

```typescript
  // Sync selectedCategory when initialCategory prop changes (e.g., from URL navigation)
  useEffect(() => {
    if (initialCategory !== undefined) {
      setSelectedCategory(initialCategory);
    }
  }, [initialCategory]);
```

**Step 5: Verify TypeScript compiles**

Run: `cd apps/landing && npx tsc --noEmit`
Expected: No errors

**Step 6: Commit**

```bash
git add apps/landing/app/layanan/layanan-page-client.tsx
git commit -m "feat(layanan): add initialCategory prop and sync with selectedCategory state"
```

---

## Task 3: Add URL Sync with useSearchParams and useRouter

**Files:**
- Modify: `apps/landing/app/layanan/layanan-page-client.tsx`

**Step 1: Import navigation hooks**

Add to the imports section (around line 4-5):

```typescript
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
```

**Step 2: Initialize hooks inside component**

Add after the component function signature (around line 118):

```typescript
export function LayananPageClient({
  categories: rawCategories,
  services: rawServices,
  initialCategory,
}: LayananPageClientProps) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState("");
```

**Step 3: Create updateCategory function with URL sync**

Add after the icon map section (around line 120):

```typescript
  // Update category and sync with URL
  const updateCategory = (slug: string | null) => {
    setSelectedCategory(slug);

    // Update URL query param
    const params = new URLSearchParams(searchParams.toString());
    if (slug) {
      params.set('kategori', slug);
    } else {
      params.delete('kategori');
    }

    // Build new URL, preserve search param if exists
    const newUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname;
    router.replace(newUrl, { scroll: false });
  };
```

**Step 4: Update category button onClick handlers**

Find the category buttons section (around line 186-201) and change `setSelectedCategory` to `updateCategory`:

```typescript
              <button
                onClick={() => updateCategory(null)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                  selectedCategory === null
                    ? "bg-primary text-white shadow-md"
                    : "bg-muted text-foreground hover:bg-muted/80"
                }`}
              >
                Semua Layanan
              </button>
              {categories.map((cat) => {
                const Icon = cat.icon;
                return (
                  <button
                    key={cat.slug}
                    onClick={() => updateCategory(cat.slug)}
                    className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all ${
                      selectedCategory === cat.slug
                        ? "bg-primary text-white shadow-md"
                        : "bg-muted text-foreground hover:bg-muted/80"
                    }`}
                  >
```

**Step 5: Verify TypeScript compiles**

Run: `cd apps/landing && npx tsc --noEmit`
Expected: No errors

**Step 6: Test manually**

Run: `pnpm dev` and:
1. Visit `http://localhost:3002/layanan`
2. Click a category button
3. Verify URL changes to `/layanan?kategori=xxx`

**Step 7: Commit**

```bash
git add apps/landing/app/layanan/layanan-page-client.tsx
git commit -m "feat(layanan): sync category filter with URL query param"
```

---

## Task 4: Add Search to URL Sync

**Files:**
- Modify: `apps/landing/app/layanan/layanan-page-client.tsx`

**Step 1: Create updateSearch function with URL sync**

Add after the `updateCategory` function:

```typescript
  // Update search query and sync with URL
  const updateSearch = (value: string) => {
    setSearchQuery(value);

    // Update URL query param
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set('search', value);
    } else {
      params.delete('search');
    }

    // Preserve kategori param if exists
    const newUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname;
    router.replace(newUrl, { scroll: false });
  };
```

**Step 2: Update search input onChange handler**

Find the search input (around line 161-167) and change `setSearchQuery` to `updateSearch`:

```typescript
              <Search className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <Input
                type="text"
                placeholder="Cari layanan..."
                value={searchQuery}
                onChange={(e) => updateSearch(e.target.value)}
                className="h-14 rounded-xl border-0 bg-white pl-12 text-slate-800 shadow-lg placeholder:text-slate-400"
              />
```

**Step 3: Sync searchQuery from URL on mount**

Add to the useEffect section (after the initialCategory effect):

```typescript
  // Sync searchQuery from URL on mount
  useEffect(() => {
    const searchParam = searchParams.get('search');
    if (searchParam !== null) {
      setSearchQuery(searchParam);
    }
  }, [searchParams]);
```

**Step 4: Verify TypeScript compiles**

Run: `cd apps/landing && npx tsc --noEmit`
Expected: No errors

**Step 5: Test manually**

Run: `pnpm dev` and:
1. Type in search box
2. Verify URL shows `?search=xxx`
3. Try combining search + category

**Step 6: Commit**

```bash
git add apps/landing/app/layanan/layanan-page-client.tsx
git commit -m "feat(layanan): sync search query with URL param"
```

---

## Task 5: Update Breadcrumb with Category

**Files:**
- Modify: `apps/landing/app/layanan/layanan-page-client.tsx`

**Step 1: Update breadcrumb to show category**

Find the breadcrumb section (around line 142-148) and modify:

```typescript
            {/* Breadcrumb */}
            <nav className="text-primary-light mb-6 flex items-center gap-2 text-sm">
              <Link href="/" className="hover:text-white">
                Beranda
              </Link>
              <span>/</span>
              <Link
                href="/layanan"
                className={selectedCategory ? "hover:text-white" : "text-white"}
                onClick={(e) => {
                  if (selectedCategory) {
                    e.preventDefault();
                    updateCategory(null);
                  }
                }}
              >
                Layanan
              </Link>
              {selectedCategory && (
                <>
                  <span>/</span>
                  <span className="text-white">
                    {categories.find((c) => c.slug === selectedCategory)?.name || selectedCategory}
                  </span>
                </>
              )}
            </nav>
```

**Step 2: Update results count text**

Find the results count section (around line 254-261) and modify to show category name:

```typescript
            {/* Results Count */}
            <p className="text-muted-foreground mb-6 text-sm">
              Menampilkan {filteredServices.length} layanan
              {selectedCategory &&
                ` dalam kategori "${
                  categories.find((c) => c.slug === selectedCategory)?.name || selectedCategory
                }"`
              }
              {searchQuery && ` untuk "${searchQuery}"`}
            </p>
```

**Step 3: Verify TypeScript compiles**

Run: `cd apps/landing && npx tsc --noEmit`
Expected: No errors

**Step 4: Test manually**

Run: `pnpm dev` and:
1. Visit `http://localhost:3002/layanan?kategori=kependudukan`
2. Verify breadcrumb shows `Beranda / Layanan / Kependudukan`
3. Click "Layanan" in breadcrumb - should clear category filter

**Step 5: Commit**

```bash
git add apps/landing/app/layanan/layanan-page-client.tsx
git commit -m "feat(layanan): show selected category in breadcrumb"
```

---

## Task 6: Handle Invalid Category Slug

**Files:**
- Modify: `apps/landing/app/layanan/layanan-page-client.tsx`

**Step 1: Add useEffect to handle invalid category slug**

Add after the other useEffects:

```typescript
  // Handle invalid category slug - redirect to clean URL if slug doesn't exist
  useEffect(() => {
    const categoryParam = searchParams.get('kategori');
    if (categoryParam && !categories.find((c) => c.slug === categoryParam)) {
      // Invalid slug, remove kategori param from URL
      const params = new URLSearchParams(searchParams.toString());
      params.delete('kategori');
      const newUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname;
      router.replace(newUrl);
    }
  }, [searchParams, categories, pathname, router]);
```

**Step 2: Verify TypeScript compiles**

Run: `cd apps/landing && npx tsc --noEmit`
Expected: No errors

**Step 3: Test manually**

Run: `pnpm dev` and:
1. Visit `http://localhost:3002/layanan?kategori=invalid-slug`
2. Verify it redirects to `/layanan` (or `/layanan?search=...` if search param exists)

**Step 4: Commit**

```bash
git add apps/landing/app/layanan/layanan-page-client.tsx
git commit -m "feat(layanan): redirect to clean URL on invalid category slug"
```

---

## Task 7: Final Testing and Verification

**Step 1: Run all manual tests**

1. Open `/layanan` → Shows all services
2. Open `/layanan?kategori=kependudukan` → Filtered to that category, breadcrumb shows category
3. Open `/layanan?kategori=invalid` → Redirects to `/layanan`
4. Click category button → URL updates
5. Type in search → URL shows `?search=`
6. Combine category + search → Both params in URL
7. Click back button → State restores correctly
8. Click "Layanan" in breadcrumb → Category filter clears

**Step 2: Verify no TypeScript errors**

Run: `cd apps/landing && npx tsc --noEmit`
Expected: No errors

**Step 3: Build succeeds**

Run: `cd apps/landing && pnpm build`
Expected: Build succeeds without errors

**Step 4: Final commit**

```bash
git add .
git commit -m "feat(layanan): complete category integration with URL query params"
```

---

## Summary

This implementation:
- Adds URL query param support for category filtering (`?kategori=xxx`)
- Syncs search query with URL (`?search=xxx`)
- Updates breadcrumb to show selected category
- Handles invalid category slugs gracefully
- Preserves existing UI/UX patterns

All changes follow the existing codebase patterns and use Next.js App Router conventions.
